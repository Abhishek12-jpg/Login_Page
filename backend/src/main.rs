use actix_cors::Cors;
use actix_web::{
    web,
    App,
    HttpRequest,
    HttpResponse,
    HttpServer,
    Responder,
};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use jsonwebtoken::{
    decode,
    encode,
    Algorithm,
    DecodingKey,
    EncodingKey,
    Header,
    Validation,
};
use chrono::{Utc, Duration};

#[derive(Deserialize)]
struct RegisterData {
    name: String,
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct LoginData {
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct StatusData {
    status: String,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: i32,
    role: String,
    exp: usize,
}

#[derive(Serialize)]
struct User {
    id: i32,
    name: String,
    email: String,
    status: String,
}


// =========================
// DATABASE SETUP
// =========================

fn setup_database() {
    let connection = Connection::open("users.db").unwrap();

    connection.execute(
        "
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            admin_id INTEGER
        )
        ",
        [],
    ).unwrap();

    let mut statement = connection
        .prepare("PRAGMA table_info(users)")
        .unwrap();

    let columns = statement
        .query_map([], |row| {
            let name: String = row.get(1)?;
            Ok(name)
        })
        .unwrap();

    let mut status_exists = false;

    for column in columns {
        if let Ok(name) = column {
            if name == "status" {
                status_exists = true;
                break;
            }
        }
    }

    if !status_exists {
        connection.execute(
            "
            ALTER TABLE users
            ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
            ",
            [],
        ).unwrap();

        println!("Status column added to users table");
    }
}


// =========================
// REGISTER
// =========================

async fn register(data: web::Json<RegisterData>) -> impl Responder {
    println!("Register request received");

    let connection = Connection::open("users.db").unwrap();

    let result = connection.execute(
        "
        INSERT INTO users
        (name, email, password, role, admin_id, status)
        VALUES (?1, ?2, ?3, 'user', 1, 'active')
        ",
        (
            &data.name,
            &data.email,
            &data.password,
        ),
    );

    match result {
        Ok(_) => {
            println!("User registered: {}", data.email);

            HttpResponse::Ok().json(
                serde_json::json!({
                    "message": "Account created successfully"
                })
            )
        }

        Err(error) => {
            println!("Registration error: {}", error);

            HttpResponse::BadRequest().json(
                serde_json::json!({
                    "message": "Email already exists"
                })
            )
        }
    }
}


// =========================
// LOGIN
// =========================

async fn login(data: web::Json<LoginData>) -> impl Responder {
    println!("Login request received");

    let connection = Connection::open("users.db").unwrap();

    let mut statement = connection
        .prepare(
            "
            SELECT id, role, status
            FROM users
            WHERE email = ?1
            AND password = ?2
            "
        )
        .unwrap();

    let result = statement.query_row(
        (&data.email, &data.password),
        |row| {
            let id: i32 = row.get(0)?;
            let role: String = row.get(1)?;
            let status: String = row.get(2)?;

            Ok((id, role, status))
        },
    );

    match result {

        Ok((user_id, role, status)) => {

            if status == "disabled" {
                println!(
                    "Disabled user attempted login: {}",
                    data.email
                );

                return HttpResponse::Forbidden().json(
                    serde_json::json!({
                        "message": "Your account has been disabled by the administrator"
                    })
                );
            }

            println!("Login successful: {}", data.email);

            let expiration = Utc::now()
                .checked_add_signed(Duration::hours(24))
                .unwrap()
                .timestamp() as usize;

            let claims = Claims {
                sub: user_id,
                role: role.clone(),
                exp: expiration,
            };

            let secret = b"my_super_secret_key";

            let token = encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret(secret),
            ).unwrap();

            HttpResponse::Ok().json(
                serde_json::json!({
                    "message": "Login successful",
                    "token": token,
                    "role": role
                })
            )
        }

        Err(_) => {

            println!("Login failed: {}", data.email);

            HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Invalid email or password"
                })
            )
        }
    }
}


// =========================
// GET USERS UNDER ADMIN
// =========================

async fn get_admin_users(req: HttpRequest) -> impl Responder {

    let authorization = match req.headers().get("Authorization") {

        Some(value) => match value.to_str() {

            Ok(value) => value,

            Err(_) => {
                return HttpResponse::Unauthorized().json(
                    serde_json::json!({
                        "message": "Invalid authorization"
                    })
                );
            }
        },

        None => {
            return HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Authorization token required"
                })
            );
        }
    };


    let token = authorization
        .strip_prefix("Bearer ")
        .unwrap_or("");


    if token.is_empty() {
        return HttpResponse::Unauthorized().json(
            serde_json::json!({
                "message": "Invalid token"
            })
        );
    }


    let secret = b"my_super_secret_key";


    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret),
        &Validation::new(Algorithm::HS256),
    );


    let claims = match token_data {

        Ok(data) => data.claims,

        Err(_) => {
            return HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Invalid or expired token"
                })
            );
        }
    };


    if claims.role != "admin" {
        return HttpResponse::Forbidden().json(
            serde_json::json!({
                "message": "Admin access required"
            })
        );
    }


    let admin_id = claims.sub;

    let connection = Connection::open("users.db").unwrap();


    let mut statement = connection
        .prepare(
            "
            SELECT id, name, email, status
            FROM users
            WHERE admin_id = ?1
            AND role = 'user'
            "
        )
        .unwrap();


    let users = statement
        .query_map([admin_id], |row| {

            Ok(User {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                status: row.get(3)?,
            })

        })
        .unwrap();


    let mut user_list = Vec::new();


    for user in users {

        if let Ok(user) = user {
            user_list.push(user);
        }

    }


    HttpResponse::Ok().json(user_list)
}


// =========================
// ENABLE / DISABLE USER
// =========================

async fn update_user_status(
    req: HttpRequest,
    path: web::Path<i32>,
    data: web::Json<StatusData>,
) -> impl Responder {

    let user_id = path.into_inner();


    let authorization = match req.headers().get("Authorization") {

        Some(value) => match value.to_str() {

            Ok(value) => value,

            Err(_) => {
                return HttpResponse::Unauthorized().json(
                    serde_json::json!({
                        "message": "Invalid authorization"
                    })
                );
            }
        },

        None => {
            return HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Authorization token required"
                })
            );
        }
    };


    let token = authorization
        .strip_prefix("Bearer ")
        .unwrap_or("");


    if token.is_empty() {
        return HttpResponse::Unauthorized().json(
            serde_json::json!({
                "message": "Invalid token"
            })
        );
    }


    let secret = b"my_super_secret_key";


    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret),
        &Validation::new(Algorithm::HS256),
    );


    let claims = match token_data {

        Ok(data) => data.claims,

        Err(_) => {
            return HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Invalid or expired token"
                })
            );
        }
    };


    if claims.role != "admin" {
        return HttpResponse::Forbidden().json(
            serde_json::json!({
                "message": "Admin access required"
            })
        );
    }


    if data.status != "active" && data.status != "disabled" {

        return HttpResponse::BadRequest().json(
            serde_json::json!({
                "message": "Status must be active or disabled"
            })
        );
    }


    let connection = Connection::open("users.db").unwrap();


    let result = connection.execute(
        "
        UPDATE users
        SET status = ?1
        WHERE id = ?2
        AND admin_id = ?3
        AND role = 'user'
        ",
        (
            &data.status,
            user_id,
            claims.sub,
        ),
    );


    match result {

        Ok(rows) => {

            if rows == 0 {

                return HttpResponse::NotFound().json(
                    serde_json::json!({
                        "message": "User not found"
                    })
                );
            }


            println!(
                "User {} status changed to {}",
                user_id,
                data.status
            );


            HttpResponse::Ok().json(
                serde_json::json!({
                    "message": "User status updated successfully",
                    "status": data.status
                })
            )
        }


        Err(error) => {

            println!("Status update error: {}", error);

            HttpResponse::InternalServerError().json(
                serde_json::json!({
                    "message": "Unable to update user status"
                })
            )
        }
    }
}


// =========================
// DELETE USER
// =========================

async fn delete_user(
    req: HttpRequest,
    path: web::Path<i32>,
) -> impl Responder {

    let user_id = path.into_inner();


    let authorization = match req.headers().get("Authorization") {

        Some(value) => match value.to_str() {

            Ok(value) => value,

            Err(_) => {
                return HttpResponse::Unauthorized().json(
                    serde_json::json!({
                        "message": "Invalid authorization"
                    })
                );
            }
        },

        None => {
            return HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Authorization token required"
                })
            );
        }
    };


    let token = authorization
        .strip_prefix("Bearer ")
        .unwrap_or("");


    if token.is_empty() {
        return HttpResponse::Unauthorized().json(
            serde_json::json!({
                "message": "Invalid token"
            })
        );
    }


    let secret = b"my_super_secret_key";


    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret),
        &Validation::new(Algorithm::HS256),
    );


    let claims = match token_data {

        Ok(data) => data.claims,

        Err(_) => {
            return HttpResponse::Unauthorized().json(
                serde_json::json!({
                    "message": "Invalid or expired token"
                })
            );
        }
    };


    if claims.role != "admin" {
        return HttpResponse::Forbidden().json(
            serde_json::json!({
                "message": "Admin access required"
            })
        );
    }


    let connection = Connection::open("users.db").unwrap();


    let result = connection.execute(
        "
        DELETE FROM users
        WHERE id = ?1
        AND admin_id = ?2
        AND role = 'user'
        ",
        (
            user_id,
            claims.sub,
        ),
    );


    match result {

        Ok(rows) => {

            if rows == 0 {

                return HttpResponse::NotFound().json(
                    serde_json::json!({
                        "message": "User not found"
                    })
                );
            }


            println!("User {} deleted", user_id);


            HttpResponse::Ok().json(
                serde_json::json!({
                    "message": "User deleted successfully"
                })
            )
        }


        Err(error) => {

            println!("Delete user error: {}", error);

            HttpResponse::InternalServerError().json(
                serde_json::json!({
                    "message": "Unable to delete user"
                })
            )
        }
    }
}


// =========================
// CREATE DEFAULT ADMIN
// =========================

fn create_admin() {

    let connection = Connection::open("users.db").unwrap();


    let count: i32 = connection
        .query_row(
            "SELECT COUNT(*) FROM users WHERE role = 'admin'",
            [],
            |row| row.get(0),
        )
        .unwrap();


    if count == 0 {

        connection.execute(
            "
            INSERT INTO users
            (name, email, password, role, admin_id, status)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ",
            (
                "Admin",
                "admin@gmail.com",
                "admin123",
                "admin",
                Option::<i32>::None,
                "active",
            ),
        ).unwrap();


        println!("=================================");
        println!("Default admin created");
        println!("Email: admin@gmail.com");
        println!("Password: admin123");
        println!("=================================");

    } else {

        println!("Admin already exists");

    }
}


// =========================
// MAIN
// =========================

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    println!("=================================");
    println!("Rust backend starting...");
    println!("=================================");


    setup_database();
    create_admin();


    HttpServer::new(|| {

        let cors = Cors::permissive();


        App::new()
            .wrap(cors)

            .route(
                "/register",
                web::post().to(register)
            )

            .route(
                "/login",
                web::post().to(login)
            )

            .route(
                "/admin/users",
                web::get().to(get_admin_users)
            )

            .route(
                "/admin/users/{id}/status",
                web::put().to(update_user_status)
            )

            .route(
                "/admin/users/{id}",
                web::delete().to(delete_user)
            )

    })

    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
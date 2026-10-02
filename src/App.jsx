import { useState } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import "./App.css";
import Home from "./Home";


// =========================
// LOGIN PAGE
// =========================

function Login() {

    const navigate = useNavigate();

    const [page, setPage] = useState("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [name, setName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);


    // =========================
    // LOGIN
    // =========================

    async function handleLogin(event) {

        event.preventDefault();

        try {

            const response = await fetch(
                "http://127.0.0.1:8080/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("token", data.token);

                if (data.role === "admin") {

                    navigate("/login/admin");

                } else {

                    navigate("/login/home");

                }

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);

            alert("Unable to connect to server");

        }
    }


    // =========================
    // SIGNUP
    // =========================

    async function handleSignup(event) {

        event.preventDefault();

        try {

            const response = await fetch(
                "http://127.0.0.1:8080/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: signupEmail,
                        password: signupPassword
                    })
                }
            );

            const data = await response.json();

            alert(data.message);

            if (response.ok) {

                setPage("login");

            }

        } catch (error) {

            console.log(error);

            alert("Unable to connect to server");

        }
    }


    // =========================
    // SIGNUP PAGE
    // =========================

    if (page === "signup") {

        return (

            <div className="login-container signup-page">

                <div className="login-box">

                    <h1>Create Account</h1>

                    <p className="subtitle">
                        Join us and create your account
                    </p>

                    <form onSubmit={handleSignup}>

                        <label>Full Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                        />

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={signupEmail}
                            onChange={(event) =>
                                setSignupEmail(event.target.value)
                            }
                        />

                        <label>Password</label>

                        <div className="password-container">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={signupPassword}
                                onChange={(event) =>
                                    setSignupPassword(
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                        <button
                            className="login-button"
                            type="submit"
                        >
                            Create Account
                        </button>

                    </form>

                    <p className="signup">

                        Already have an account?

                        <a
                            href="#"
                            onClick={(event) => {

                                event.preventDefault();

                                setPage("login");

                            }}
                        >
                            {" "}Login
                        </a>

                    </p>

                </div>

            </div>
        );
    }


    // =========================
    // LOGIN PAGE
    // =========================

    return (

        <div className="login-container">

            <div className="login-box">

                <h1>Welcome Back</h1>

                <p className="subtitle">
                    Login to your account
                </p>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                    />

                    <label>Password</label>

                    <div className="password-container">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>

                    </div>

                    <div className="options">

                        <label className="remember">

                            <input type="checkbox" />

                            Remember me

                        </label>

                        <a href="#">
                            Forgot password?
                        </a>

                    </div>

                    <button
                        className="login-button"
                        type="submit"
                    >
                        Login
                    </button>

                </form>

                <p className="signup">

                    Don't have an account?

                    <a
                        href="#"
                        onClick={(event) => {

                            event.preventDefault();

                            setPage("signup");

                        }}
                    >
                        {" "}Create account
                    </a>

                </p>

            </div>

        </div>
    );
}


// =========================
// ADMIN PAGE
// =========================

function Admin() {

    const navigate = useNavigate();

    const [activePage, setActivePage] = useState("dashboard");

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);


    // =========================
    // LOAD USERS
    // =========================

    async function loadUsers() {

        const token = localStorage.getItem("token");

        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8080/admin/users",
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setUsers(data);

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);

            alert("Unable to connect to server");

        } finally {

            setLoading(false);

        }
    }


    // =========================
    // SHOW USERS
    // =========================

    function showUsers() {

        setActivePage("users");

        loadUsers();

    }


    // =========================
    // VIEW USER
    // =========================

    function viewUser(user) {

        setSelectedUser(user);

    }


    // =========================
    // CLOSE USER DETAILS
    // =========================

    function closeUserDetails() {

        setSelectedUser(null);

    }


    // =========================
    // ENABLE / DISABLE USER
    // =========================

    async function changeUserStatus(user) {

        const newStatus =
            user.status === "active"
                ? "disabled"
                : "active";

        const action =
            newStatus === "disabled"
                ? "disable"
                : "enable";


        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.name}?`
        );


        if (!confirmed) {
            return;
        }


        const token = localStorage.getItem("token");


        try {

            const response = await fetch(
                `http://127.0.0.1:8080/admin/users/${user.id}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert(
                    newStatus === "disabled"
                        ? "User disabled successfully"
                        : "User enabled successfully"
                );

                loadUsers();

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);

            alert("Unable to connect to server");

        }
    }


    // =========================
    // DELETE USER
    // =========================

    async function deleteUser(user) {

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${user.name}?`
        );


        if (!confirmed) {
            return;
        }


        const token = localStorage.getItem("token");


        try {

            const response = await fetch(
                `http://127.0.0.1:8080/admin/users/${user.id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert("User deleted successfully");

                loadUsers();


                if (
                    selectedUser &&
                    selectedUser.id === user.id
                ) {
                    setSelectedUser(null);
                }

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);

            alert("Unable to connect to server");

        }
    }


    // =========================
    // LOGOUT
    // =========================

    function handleLogout() {

        localStorage.removeItem("token");

        navigate("/login");

    }


    // =========================
    // SEARCH
    // =========================

    const filteredUsers = users.filter((user) =>

        user.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        user.email
            .toLowerCase()
            .includes(search.toLowerCase())

    );


    // =========================
    // ADMIN UI
    // =========================

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                backgroundColor: "#f7f7f5",
                fontFamily: "Arial, sans-serif"
            }}
        >

            {/* SIDEBAR */}

            <div
                style={{
                    width: "240px",
                    minHeight: "100vh",
                    backgroundColor: "#222222",
                    color: "#ffffff",
                    padding: "30px 20px",
                    boxSizing: "border-box"
                }}
            >

                <h2
                    style={{
                        marginBottom: "45px",
                        color: "#ffffff"
                    }}
                >
                    Admin
                </h2>


                {/* DASHBOARD */}

                <button
                    onClick={() =>
                        setActivePage("dashboard")
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        textAlign: "left",
                        backgroundColor:
                            activePage === "dashboard"
                                ? "#444444"
                                : "transparent",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontSize: "15px"
                    }}
                >
                    Dashboard
                </button>


                {/* USERS */}

                <button
                    onClick={showUsers}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        textAlign: "left",
                        backgroundColor:
                            activePage === "users"
                                ? "#444444"
                                : "transparent",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontSize: "15px"
                    }}
                >
                    Users
                </button>


                {/* SETTINGS */}

                <button
                    onClick={() =>
                        setActivePage("settings")
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        textAlign: "left",
                        backgroundColor:
                            activePage === "settings"
                                ? "#444444"
                                : "transparent",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontSize: "15px"
                    }}
                >
                    Settings
                </button>


                {/* LOGOUT */}

                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "30px",
                        textAlign: "left",
                        backgroundColor: "#ffffff",
                        color: "#222222",
                        border: "none",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontSize: "15px"
                    }}
                >
                    Logout
                </button>

            </div>


            {/* MAIN CONTENT */}

            <div
                style={{
                    flex: 1,
                    padding: "50px",
                    boxSizing: "border-box"
                }}
            >


                {/* DASHBOARD */}

                {activePage === "dashboard" && (

                    <div>

                        <h1
                            style={{
                                color: "#222222"
                            }}
                        >
                            Welcome, Admin
                        </h1>

                        <p
                            style={{
                                color: "#777777",
                                marginBottom: "35px"
                            }}
                        >
                            Welcome to your admin dashboard.
                        </p>


                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                padding: "30px",
                                borderRadius: "15px",
                                border: "1px solid #e5e5e5"
                            }}
                        >

                            <h2
                                style={{
                                    color: "#222222"
                                }}
                            >
                                Dashboard
                            </h2>

                            <p
                                style={{
                                    color: "#888888"
                                }}
                            >
                                Use the sidebar to manage your
                                users and settings.
                            </p>

                        </div>

                    </div>
                )}


                {/* USERS */}

                {activePage === "users" && (

                    <div>

                        <h1
                            style={{
                                color: "#222222",
                                marginBottom: "10px"
                            }}
                        >
                            Users
                        </h1>

                        <p
                            style={{
                                color: "#777777",
                                marginBottom: "30px"
                            }}
                        >
                            Users under you
                        </p>


                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                padding: "30px",
                                borderRadius: "15px",
                                border: "1px solid #e5e5e5"
                            }}
                        >

                            <h2
                                style={{
                                    color: "#222222",
                                    marginTop: 0
                                }}
                            >
                                Users Under Me
                            </h2>


                            {/* SEARCH */}

                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                style={{
                                    width: "100%",
                                    maxWidth: "400px",
                                    padding: "12px 15px",
                                    marginBottom: "25px",
                                    border: "1px solid #dddddd",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    color: "#222222"
                                }}
                            />


                            {/* LOADING */}

                            {loading && (

                                <p
                                    style={{
                                        color: "#777777"
                                    }}
                                >
                                    Loading users...
                                </p>

                            )}


                            {/* NO USERS */}

                            {!loading &&
                                filteredUsers.length === 0 && (

                                    <p
                                        style={{
                                            color: "#777777"
                                        }}
                                    >
                                        No users found.
                                    </p>

                            )}


                            {/* USER LIST */}

                            {!loading &&
                                filteredUsers.length > 0 && (

                                    <div>

                                        {filteredUsers.map((user) => (

                                            <div
                                                key={user.id}
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    padding: "18px 0",
                                                    borderBottom:
                                                        "1px solid #eeeeee"
                                                }}
                                            >

                                                <div>

                                                    <h3
                                                        style={{
                                                            margin:
                                                                "0 0 5px",
                                                            color: "#222222"
                                                        }}
                                                    >
                                                        {user.name}
                                                    </h3>

                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            color: "#888888"
                                                        }}
                                                    >
                                                        {user.email}
                                                    </p>

                                                </div>


                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px"
                                                    }}
                                                >

                                                    {/* STATUS */}

                                                    <span
                                                        style={{
                                                            fontSize: "13px",
                                                            fontWeight: "500",
                                                            color:
                                                                user.status ===
                                                                "active"
                                                                    ? "#16a34a"
                                                                    : "#dc2626"
                                                        }}
                                                    >
                                                        {user.status ===
                                                        "active"
                                                            ? "● Active"
                                                            : "● Disabled"}
                                                    </span>


                                                    {/* VIEW BUTTON */}

                                                    <button
                                                        onClick={() =>
                                                            viewUser(user)
                                                        }
                                                        style={{
                                                            padding:
                                                                "8px 16px",
                                                            backgroundColor:
                                                                "#222222",
                                                            color: "#ffffff",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        View
                                                    </button>


                                                    {/* ENABLE / DISABLE */}

                                                    <button
                                                        onClick={() =>
                                                            changeUserStatus(
                                                                user
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "8px 14px",
                                                            backgroundColor:
                                                                user.status ===
                                                                "active"
                                                                    ? "#dc2626"
                                                                    : "#16a34a",
                                                            color: "#ffffff",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        {user.status ===
                                                        "active"
                                                            ? "Disable"
                                                            : "Enable"}
                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        onClick={() =>
                                                            deleteUser(user)
                                                        }
                                                        style={{
                                                            padding:
                                                                "8px 14px",
                                                            backgroundColor:
                                                                "#991b1b",
                                                            color: "#ffffff",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                        </div>

                    </div>
                )}


                {/* SETTINGS */}

                {activePage === "settings" && (

                    <div>

                        <h1
                            style={{
                                color: "#222222"
                            }}
                        >
                            Settings
                        </h1>

                        <p
                            style={{
                                color: "#777777"
                            }}
                        >
                            Admin settings will be available here.
                        </p>

                    </div>

                )}

            </div>


            {/* USER DETAILS POPUP */}

            {selectedUser && (

                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000
                    }}
                >

                    <div
                        style={{
                            width: "420px",
                            maxWidth: "90%",
                            backgroundColor: "#ffffff",
                            borderRadius: "15px",
                            padding: "30px",
                            boxSizing: "border-box",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.15)"
                        }}
                    >

                        <h2
                            style={{
                                marginTop: 0,
                                color: "#222222"
                            }}
                        >
                            User Details
                        </h2>


                        <div
                            style={{
                                marginTop: "25px"
                            }}
                        >

                            <p
                                style={{
                                    color: "#888888",
                                    marginBottom: "5px"
                                }}
                            >
                                Name
                            </p>

                            <p
                                style={{
                                    color: "#222222",
                                    fontSize: "17px",
                                    marginTop: 0
                                }}
                            >
                                {selectedUser.name}
                            </p>


                            <p
                                style={{
                                    color: "#888888",
                                    marginBottom: "5px"
                                }}
                            >
                                Email
                            </p>

                            <p
                                style={{
                                    color: "#222222",
                                    fontSize: "17px",
                                    marginTop: 0
                                }}
                            >
                                {selectedUser.email}
                            </p>


                            <p
                                style={{
                                    color: "#888888",
                                    marginBottom: "5px"
                                }}
                            >
                                Role
                            </p>

                            <p
                                style={{
                                    color: "#222222",
                                    fontSize: "17px",
                                    marginTop: 0
                                }}
                            >
                                User
                            </p>


                            <p
                                style={{
                                    color: "#888888",
                                    marginBottom: "5px"
                                }}
                            >
                                User ID
                            </p>

                            <p
                                style={{
                                    color: "#222222",
                                    fontSize: "17px",
                                    marginTop: 0
                                }}
                            >
                                {selectedUser.id}
                            </p>


                            {/* STATUS */}

                            <p
                                style={{
                                    color: "#888888",
                                    marginBottom: "5px"
                                }}
                            >
                                Status
                            </p>

                            <p
                                style={{
                                    color:
                                        selectedUser.status ===
                                        "active"
                                            ? "#16a34a"
                                            : "#dc2626",
                                    fontSize: "17px",
                                    marginTop: 0,
                                    fontWeight: "500"
                                }}
                            >
                                {selectedUser.status ===
                                "active"
                                    ? "● Active"
                                    : "● Disabled"}
                            </p>

                        </div>


                        {/* CLOSE */}

                        <button
                            onClick={closeUserDetails}
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "20px",
                                backgroundColor: "#222222",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}


// =========================
// NORMAL USER HOME
// =========================

function ProtectedHome() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    function handleLogout() {

        localStorage.removeItem("token");

        navigate("/login");

    }


    return (
        <Home onLogout={handleLogout} />
    );
}


// =========================
// APP
// =========================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/login/home"
                    element={<ProtectedHome />}
                />

                <Route
                    path="/login/admin"
                    element={<Admin />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;
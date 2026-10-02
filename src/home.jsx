function Home({ onLogout }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "#f7f7f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Arial, sans-serif",
                padding: "30px",
                boxSizing: "border-box"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "850px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "20px",
                    padding: "55px",
                    textAlign: "center",
                    boxSizing: "border-box"
                }}
            >

                {/* Welcome */}
                <p
                    style={{
                        fontSize: "14px",
                        color: "#888888",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        marginBottom: "12px"
                    }}
                >
                    Welcome
                </p>

                <h1
                    style={{
                        fontSize: "42px",
                        fontWeight: "500",
                        color: "#222222",
                        margin: "0 0 15px"
                    }}
                >
                    Welcome Home
                </h1>

                <p
                    style={{
                        fontSize: "17px",
                        color: "#777777",
                        marginBottom: "45px"
                    }}
                >
                    You have successfully logged in.
                </p>


                {/* Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "18px",
                        marginBottom: "40px"
                    }}
                >

                    <div
                        style={{
                            padding: "25px",
                            border: "1px solid #eeeeee",
                            borderRadius: "14px",
                            backgroundColor: "#fafafa"
                        }}
                    >
                        <h3
                            style={{
                                color: "#222222",
                                fontSize: "18px",
                                fontWeight: "500"
                            }}
                        >
                            Dashboard
                        </h3>

                        <p
                            style={{
                                color: "#888888",
                                fontSize: "14px"
                            }}
                        >
                            View your dashboard
                        </p>
                    </div>


                    <div
                        style={{
                            padding: "25px",
                            border: "1px solid #eeeeee",
                            borderRadius: "14px",
                            backgroundColor: "#fafafa"
                        }}
                    >
                        <h3
                            style={{
                                color: "#222222",
                                fontSize: "18px",
                                fontWeight: "500"
                            }}
                        >
                            Profile
                        </h3>

                        <p
                            style={{
                                color: "#888888",
                                fontSize: "14px"
                            }}
                        >
                            Manage your profile
                        </p>
                    </div>


                    <div
                        style={{
                            padding: "25px",
                            border: "1px solid #eeeeee",
                            borderRadius: "14px",
                            backgroundColor: "#fafafa"
                        }}
                    >
                        <h3
                            style={{
                                color: "#222222",
                                fontSize: "18px",
                                fontWeight: "500"
                            }}
                        >
                            Settings
                        </h3>

                        <p
                            style={{
                                color: "#888888",
                                fontSize: "14px"
                            }}
                        >
                            Manage your settings
                        </p>
                    </div>

                </div>


                {/* Logout */}
                <button
                    onClick={onLogout}
                    style={{
                        padding: "12px 30px",
                        backgroundColor: "#222222",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>

            </div>
        </div>
    );
}

export default Home;
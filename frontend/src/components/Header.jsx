// src/components/Header.jsx
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.json";

const Header = () => {
  const { logout, user } = useAuth();

  // Asumsi kita punya state user data di AuthContext
  const userName = user ? user.full_name : "Admin";

  return (
    <header className="main-header">
      <div className="app-title-display">
        <span className="app-name">{config.appName}</span>
      </div>
      <div className="user-profile">
        <span>Halo, {userName}</span>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

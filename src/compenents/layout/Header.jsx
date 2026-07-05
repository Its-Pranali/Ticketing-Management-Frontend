import React, { useState, useRef, useEffect } from "react";
import { Search, BookOpen, Moon, Sun, Globe, Bell, ChevronDown, Layout, User, Settings, LogOut, Menu } from "lucide-react";
import { LuPanelLeftClose } from "react-icons/lu";
import { FaUser } from "react-icons/fa";
import { Link } from 'react-router-dom';
import "../../../public/assets/css/HeaderStyle.css";
import { useAuth } from "../../context/AuthContext";

function Header({ isSidebarCollapsed, setIsSidebarCollapsed, activePage = "Dashboard" }) {
  const { user } = useAuth();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDarkMode]);

  const langRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: "New order received (#12940)", time: "5 mins ago", read: false },
    { id: 2, text: "Server resources exceeded 85%", time: "12 mins ago", read: false },
    { id: 3, text: "Alex Johnson updated Overview", time: "1 hr ago", read: false },
    { id: 4, text: "Monthly report is ready to view", time: "2 hrs ago", read: true }
  ];

  return (
    <header className="header-container">
      <div className="header-left">
        <button className="sidebar-toggle-trigger" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} aria-label="Toggle Sidebar" >
          {/* <Layout size={20} className="toggle-icon-svg" /> */}
          <LuPanelLeftClose size={16} className="toggle-icon-svg" />
        </button>
        <div className="header-page-title-group">
          {/* <span className="page-title-icon-wrapper">
            <Layout size={16} />
          </span> */}
          <h1 className="header-page-title">{activePage}</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="header-action-wrapper">
          <button className="header-icon-btn" title="Search">
            <Search size={18} />
          </button>
        </div>

        <div className="header-action-wrapper">
          <button className="header-icon-btn" title={isDarkMode ? "Light Mode" : "Dark Mode"} onClick={() => setIsDarkMode(!isDarkMode)} >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>


        <div className="header-action-wrapper" ref={langRef}>
          <button className={`header-icon-btn lang-select-btn ${isLangDropdownOpen ? "active" : ""}`} onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} >
            <Globe size={18} />
            <span className="lang-text">EN</span>
            <ChevronDown size={14} className="dropdown-caret" />
          </button>

          {isLangDropdownOpen && (
            <div className="dropdown-menu-card lang-dropdown">
              <button className="dropdown-menu-item active">English (EN)</button>
              <button className="dropdown-menu-item"> தமிழ் (தமி)</button>
            </div>
          )}
        </div>


        <div className="header-action-wrapper" ref={notifRef}>
          <button className={`header-icon-btn notif-btn ${isNotifDropdownOpen ? "active" : ""}`} onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)} >
            <Bell size={18} />
            <span className="notification-badge-pulse">4</span>
          </button>

          {isNotifDropdownOpen && (
            <div className="dropdown-menu-card notif-dropdown">
              <div className="notif-dropdown-header">
                <h3>Notifications</h3>
                <button className="mark-read-btn">Mark all read</button>
              </div>
              <div className="notif-dropdown-list">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notif-item ${notif.read ? "read" : "unread"}`}>
                    <div className="notif-indicator-dot" />
                    <div className="notif-content">
                      <p className="notif-text">{notif.text}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notif-dropdown-footer">
                <button className="view-all-btn">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* <div className="header-vertical-divider" /> */}

        <div className="header-action-wrapper" ref={profileRef}>
          <button className={`user-profile-trigger-btn ${isProfileDropdownOpen ? "active" : ""}`} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} >
            {/* <img className="user-profile-avatar" src="" alt="Alex Johnson Profile" /> */}
            <FaUser size={10} className="user-profile-avatar" />
            {/* <span className="user-profile-name">Alex Johnson</span> */}
            <ChevronDown size={14} className="dropdown-caret" />
          </button>

          {isProfileDropdownOpen && (
            <div className="dropdown-menu-card profile-dropdown">
              <div className="profile-dropdown-header">
                <span className="profile-hdr-name">{user?.name || 'Admin'}</span>
                <span className="profile-hdr-role">{user?.role_name || 'Admin'}</span>
              </div>
              <div className="profile-dropdown-separator" />
              <button className="dropdown-menu-item">
                <User size={16} />
                <Link to='/profile' className="text-decoration-none text-muted" >
                  <span>My Profile</span>
                </Link>
              </button>
              <button className="dropdown-menu-item">
                <Settings size={16} />
                <span>Account Settings</span>
              </button>
              <div className="profile-dropdown-separator" />
              <button className="dropdown-menu-item logout-btn-item">
                <Link to="/" className="d-flex gap-2 text-decoration-none">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
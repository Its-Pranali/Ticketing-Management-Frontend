import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import "../../../public/assets/css/Layout.css";

function Main({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [activeItem, setActiveItem] = useState("Overview");

  // Track screen resizing to auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic root element styling override to make layout full screen bleed
  useEffect(() => {
    const rootEl = document.getElementById("root");
    let originalRootBorder = "";
    let originalRootMaxWidth = "";
    let originalRootWidth = "";
    let originalRootBg = "";
    
    if (rootEl) {
      originalRootBorder = rootEl.style.borderInline;
      originalRootMaxWidth = rootEl.style.maxWidth;
      originalRootWidth = rootEl.style.width;
      originalRootBg = rootEl.style.backgroundColor;

      rootEl.style.borderInline = "none";
      rootEl.style.maxWidth = "100vw";
      rootEl.style.width = "100%";
      rootEl.style.backgroundColor = "transparent";
    }

    // Save and set body/html styles
    const originalBodyBg = document.body.style.background;
    const originalHtmlBg = document.documentElement.style.background;
    
    document.body.style.background = "#f8fafc";
    document.documentElement.style.background = "#f8fafc";

    return () => {
      // Restore on unmount
      if (rootEl) {
        rootEl.style.borderInline = originalRootBorder;
        rootEl.style.maxWidth = originalRootMaxWidth;
        rootEl.style.width = originalRootWidth;
        rootEl.style.backgroundColor = originalRootBg;
      }
      document.body.style.background = originalBodyBg;
      document.documentElement.style.background = originalHtmlBg;
    };
  }, []);

  return (
    <div className={`dashboard-layout-wrapper ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Backdrop overlay for mobile when sidebar is open */}
      {isMobile && !isSidebarCollapsed && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarCollapsed(true)} 
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        isMobile={isMobile}
      />
      
      {/* Main viewport panel */}
      <div className="main-content-panel">
        <Header isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} activePage={activeItem}/>
        
        {/* Render child pages */}
        <main className="page-body-container">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default Main;
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Globe, LayoutDashboard, BarChart3, ShoppingCart, Users, Cloud, MessageSquare, Mail, Kanban, Calendar, Folder, PieChart, ChevronLeft, ChevronRight } from "lucide-react";
import { HiLocationMarker } from "react-icons/hi";
import { GiVillage } from "react-icons/gi";
import { FaMapMarkedAlt, FaUserShield, FaUniversity, FaCodeBranch, FaBuilding, FaUserTie, FaWarehouse, FaUser, FaBox, FaThLarge, FaTasks, FaTicketAlt, FaShare, FaClipboardList, FaChartBar } from "react-icons/fa";
import "../../../public/assets/css/SidebarStyle.css";
import { RiAppsFill, RiTicket2Fill } from "react-icons/ri";
import { MdPendingActions, MdTaskAlt, MdForwardToInbox, MdInventory } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { useAuth } from "../../context/AuthContext";
import { Ticket } from "lucide-react";

function Sidebar({ isCollapsed, setIsCollapsed, isMobile }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 1;
  const isCreateTicket = user?.role === 2 || user?.role === 6;

  const adminMenuGroup = [
    {
      title: "Dashboard",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      ]
    },
    {
      title: "Master Data",
      items: [
        { name: "District", icon: FaMapMarkedAlt, path: "/district", badge: null },
        { name: "Taluka", icon: HiLocationMarker, path: "/taluka", badge: null },
        { name: "Village", icon: GiVillage, path: "/village" },
        { name: "Bank", icon: FaUniversity, path: "/bank" },
        { name: "Branch", icon: FaCodeBranch, path: "/branch" },
        { name: "Organization", icon: FaBuilding, path: "/organization" },
        { name: "Designation", icon: FaUserTie, path: "/designation" },
        { name: "PACS Details", icon: FaWarehouse, path: "/pacs-details" },
        { name: "User Details", icon: FaUser, path: "/user" },
        { name: "Role", icon: FaUserShield, path: "/role" },
        { name: "Product", icon: FaBox, path: "/product", badge: null },
        { name: "Module", icon: RiAppsFill, path: "/module", badge: null },
        { name: "Task", icon: FaTasks, path: "/task" },
      ]
    },
    {
      title: "Ticket Details",
      items: [
        { name: "Open Ticket", icon: FaTicketAlt, path: "/open-ticket" },
        { name: "Inprogress Ticket", icon: MdPendingActions, path: "/inprogress-tickets" },
        { name: "Closed Ticket", icon: MdTaskAlt, path: "/closed-ticket" },
        { name: "Forwarded Ticket", icon: FaShare, path: "/forwarded-tickets" },
        { name: "All Tickets", icon: FaClipboardList, path: "/all-tickets" },
        { name: "Forwarded to NLPSV", icon: MdForwardToInbox, path: "/forwarded-nlpsv-tickets" },
      ]
    },
    {
      title: "Ticket Reports",
      items: [
        { name: "Districtwise Report", icon: FaChartBar, path: "/distwise-report", badge: null },
        { name: "Productwise Report", icon: TbReportAnalytics, path: "/prowise-report", badge: null },
      ]
    }
  ];

  const secMenuGroup = [
    {
      title: "Dashboard",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      ]
    },
    {
      title: "Ticket Details",
      items: [
        { name: "Create Ticket", icon: Ticket, path: "/create-ticket" },
        { name: "Open Ticket", icon: FaTicketAlt, path: "/open-ticket" },
        { name: "Closed Ticket", icon: MdTaskAlt, path: "/closed-ticket" },
        { name: "Forwarded Ticket", icon: FaShare, path: "/forwarded-tickets" },
        { name: "All Tickets", icon: FaClipboardList, path: "/all-tickets" },
      ]
    },
  ];

  const remMenuGroup = [
    {
      title: "Dashboard",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      ]
    },
    {
      title: "Ticket Details",
      items: [
        { name: "Open Ticket", icon: FaTicketAlt, path: "/open-ticket" },
        { name: "Inprogress Ticket", icon: MdPendingActions, path: "/inprogress-tickets" },
        { name: "Closed Ticket", icon: MdTaskAlt, path: "/closed-ticket" },
        { name: "Forwarded Ticket", icon: FaShare, path: "/forwarded-tickets" },
        { name: "All Tickets", icon: FaClipboardList, path: "/all-tickets" },
        { name: "Forwarded to NLPSV", icon: MdForwardToInbox, path: "/forwarded-nlpsv-tickets" },
      ]
    },
    {
      title: "Ticket Reports",
      items: [
        { name: "Districtwise Report", icon: FaChartBar, path: "/distwise-report", badge: null },
        { name: "Productwise Report", icon: TbReportAnalytics, path: "/prowise-report", badge: null },
      ]
    }
  ]

  // const menuGroups = isAdmin ? adminMenuGroup : isCreateTicket ? secMenuGroup : [];
  const menuGroups = isAdmin ? adminMenuGroup : isCreateTicket ? secMenuGroup : remMenuGroup;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <aside className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand-wrapper">
        <div className="brand-logo-container">
          <span className="brand-logo-icon">A</span>
        </div>
        {!isCollapsed && (
          <span className="brand-logo-text">{user?.role_name || 'Admin'}</span>
        )}
      </div>

      <div className="sidebar-nav-scroll">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="sidebar-nav-group">
            {!isCollapsed && (
              <h5 className="sidebar-group-title">{group.title}</h5>
            )}

            <ul className="sidebar-nav-list">
              {group.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={itemIdx} className="sidebar-nav-item">
                    <button onClick={() => handleNavigation(item.path)} className={`sidebar-nav-link ${isActive ? "active" : ""}`} title={isCollapsed ? item.name : undefined} >
                      <span className="sidebar-icon-wrapper">
                        <IconComponent className="sidebar-icon" size={20} />
                      </span>
                      {!isCollapsed && (
                        <span className="sidebar-item-text">{item.name}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="sidebar-item-badge">{item.badge}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
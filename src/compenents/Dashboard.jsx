import Main from "./layout/Main";
import ShaderBackground from "./ShaderBackground";
import React, { useState, useEffect } from "react";
import { FaTicketAlt, FaSpinner, FaShare, FaClipboardList, FaUser, FaUsers, FaUserFriends, FaGlobe, FaUserPlus, FaEnvelope, FaBell, FaColumns, FaChartLine, FaCalendarAlt, FaComments, FaCheck, FaBolt } from "react-icons/fa";
import { MdPendingActions, MdForwardToInbox, MdConfirmationNumber, MdTaskAlt } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";
import api from "../services/api";
import "../../public/assets/css/DashboardStyle.css";
import { useAuth } from "../context/AuthContext";
import TableLoader from "./common/TableLoader";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

function Dashboard() {
    const { user } = useAuth();
    const [count, setCount] = useState({});
    const [loading, setLoading] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);

    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        barYear: new Date().getFullYear(),
    });
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const formatTimeAgo = (isoString) => {
        if (!isoString) return '';
        const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // Map status code to icon component
    const getActivityIcon = (status, color) => {
        const props = { color, size: 15 };
        switch (status) {
            case 1: return <FaTicketAlt {...props} />;
            case 2: return <MdPendingActions {...props} />;
            case 4: return <MdTaskAlt {...props} />;
            case 5: return <FaShare {...props} />;
            case 7: return <MdForwardToInbox {...props} />;
            default: return <FaTicketAlt {...props} />;
        }
    };

    const gettingStartedData = [
        { id: 1, title: 'Invite users', desc: 'Add team members to your workspace', icon: <FaUserPlus />, completed: false },
        { id: 2, title: 'Create a team', desc: 'Organize users into teams', icon: <FaUsers />, completed: true },
        { id: 3, title: 'Configure email templates', desc: 'Set up notification emails', icon: <FaEnvelope />, completed: false },
        { id: 4, title: 'Review notifications', desc: 'Configure notification preferences', icon: <FaBell />, completed: false },
        { id: 5, title: 'Explore apps', desc: 'Discover available applications', icon: <FaColumns />, completed: true },
    ];

    const barChartData = monthlyData;

    const completedCount = gettingStartedData.filter(i => i.completed).length;
    const totalCount = gettingStartedData.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const fetchRecentActivity = async () => {
        setActivityLoading(true);
        try {
            const res = await api.get('/getRecentActivity?limit=5');
            setRecentActivity(res.data.message || []);
        } catch (error) {
            console.error('Error fetching recent activity');
        } finally {
            setActivityLoading(false);
        }
    };

    const quickActionsData = [
        { id: 1, label: 'Invite User', icon: <FaUserPlus />, primary: true },
        { id: 2, label: 'Create Team', icon: <FaUsers />, primary: false },
        { id: 3, label: 'Email & Notifications', icon: <FaEnvelope />, primary: false },
        { id: 4, label: 'Activity Log', icon: <FaChartLine />, primary: false },
        { id: 5, label: 'Calendar', icon: <FaCalendarAlt />, primary: false },
    ];


    const fetchCount = async () => {
        setLoading(false);
        try {
            const res = await api.get('/getDashboardTicketCount');
            setCount(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching count");
        }
        finally {
            setLoading(false);
        }
    }

    const fetchMonthlyTicketCount = async () => {
        try {
            const res = await api.get('/getMonthlyTicketCount', {
                params: {
                    year: filters.barYear
                }
            });

            if (res.data.status) {
                setMonthlyData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching monthly ticket data", error);
        }
    }

    const dashboardCards = {
        1: [ // Admin
            { title: "Open Ticket", path: "/open-ticket", count: count.openT },
            { title: "Inprogress Ticket", path: "/inprogress-tickets", count: count.inprogressT },
            { title: "Closed Ticket", path: "/closed-ticket", count: count.closedT },
            { title: "Forwarded Ticket", path: "/forwarded-tickets", count: count.forwardedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
            { title: "Forwarded to NLPSV", path: "/forwarded-nlpsv-tickets", count: count.forwardedNLPSVT },
        ],

        2: [ // Secretary
            { title: "Create Ticket", path: "/create-ticket" },
            { title: "Open Ticket", path: "/open-ticket", count: count.openT },
            { title: "Inprogress Ticket", path: "/inprogress-tickets", count: count.inprogressT },
            { title: "Closed Ticket", path: "/closed-ticket", count: count.closedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
        ],

        3: [ // L1
            { title: "Open Ticket", path: "/open-ticket", count: count.openT },
            { title: "Inprogress Ticket", path: "/inprogress-tickets", count: count.inprogressT },
            { title: "Closed Ticket", path: "/closed-ticket", count: count.closedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
            { title: "Forwarded Ticket", path: "/forwarded-tickets", count: count.forwardedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
            { title: "Forwarded to NLPSV", path: "/forwarded-nlpsv-tickets", count: count.forwardedNLPSVT },
        ],

        4: [ // L2
            { title: "Ticket From L1", path: "/forwarded-tickets", count: count.forwardedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
            { title: "Forwarded to NLPSV", path: "/forwarded-nlpsv-tickets", count: count.forwardedNLPSVT },
        ],

        5: [ // Dept User
            { title: "Open Ticket", path: "/open-ticket", count: count.openT },
            { title: "Inprogress Ticket", path: "/inprogress-tickets", count: count.inprogressT },
            { title: "Closed Ticket", path: "/closed-ticket", count: count.closedT },
            { title: "Forwarded Ticket", path: "/forwarded-tickets", count: count.forwardedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
            { title: "Forwarded to NLPSV", path: "/forwarded-nlpsv-tickets", count: count.forwardedNLPSVT },
        ],

        6: [ // Call Center
            { title: "Create Ticket", path: "/create-ticket-call" },
            { title: "Forwarded Ticket", path: "/forwarded-tickets", count: count.forwardedT },
            { title: "All Tickets", path: "/all-tickets", count: count.allT },
            { title: "Forwarded to NLPSV", path: "/forwarded-nlpsv-tickets", count: count.forwardedNLPSVT },
        ],
    };

    const cards = dashboardCards[user?.role] || [];

    useEffect(() => {
        fetchCount();
        fetchRecentActivity();
    }, []);

    useEffect(() => {
        fetchMonthlyTicketCount();
    }, [filters.barYear]);

    return (
        <Main>
            <div className="row mb-3">
                <div className="col-md-12">
                    <div className="card-wrapper dash-card-wrapper p-2 py-3">
                        <div className="d-flex gap-3 align-items-center">
                            <div className="user-icon">
                                <FaUser size={30} style={{ color: '#9244f2' }} />
                            </div>

                            <div className="welcome-info">
                                <h2 className="mb-0">Welcome back, {user?.name || 'Admin'}!</h2>
                                <div className="workspace-info d-flex gap-2 py-2 align-items-center">
                                    <span className="badge-page py-0 px-1 d-flex gap-1  small"><FaGlobe />{user?.role_name || ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                {cards.map((card, index) => (
                    <div className="col-md-3" key={index}>
                        <Link to={card.path} className="text-dark text-decoration-none">
                            <div className="card-wrapper mb-3 dash-card-wrap">
                                <div className="d-flex  align-items-center gap-2">
                                    <div className="card-icon d-flex ">
                                        <MdForwardToInbox size={20} />
                                    </div>
                                    <div className="">
                                        <p>{card.title}</p>
                                        <h4>{card.count}</h4>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div className="row mt-4">
                <div className="col-lg-7 mb-4">
                    <div className="new-dash-section h-100 chart-card">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="chart-title mb-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M18 17V9"></path>
                                    <path d="M13 17V5"></path>
                                    <path d="M8 17v-3"></path>
                                </svg>
                                Monthly Tickets
                            </div>

                            <div style={{ width: "120px" }}>
                                <select className="form-select" value={filters.barYear} onChange={(e) => setFilters({ ...filters, barYear: e.target.value })} >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="chart-container" style={{ height: "350px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={barChartData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8932f3" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8932f3" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <XAxis dataKey="month" tick={{ color: "#64748b", fontWeight: "600" }} />
                                    <YAxis tick={{ color: "#64748b" }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#8932f3" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5 mb-4">
                    <div className="new-dash-section chart-card h-100">
                        <div className="new-dash-title">
                            <div className="d-flex align-items-center gap-2">
                                <FaChartLine color="#0ea5e9" />
                                <span>Recent Activity</span>
                            </div>
                            <span className="text-muted" style={{ fontSize: '12px', cursor: 'pointer' }}>View all &rarr;</span>
                        </div>

                        <div className="activity-timeline">
                            {activityLoading ? (
                                <div className="d-flex justify-content-center py-4">
                                    <FaSpinner className="fa-spin" color="#0ea5e9" size={20} />
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <p className="text-center text-muted py-4" style={{ fontSize: '13px' }}>No recent activity</p>
                            ) : (recentActivity.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon-container" style={{ borderColor: activity.color }}>
                                        {getActivityIcon(activity.status, activity.color)}
                                    </div>
                                    <div className="activity-content">
                                        <p>
                                            <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                                        </p>
                                        <span className="activity-time">{formatTimeAgo(activity.time)}</span>
                                    </div>
                                    <div className="activity-avatar" style={{ backgroundColor: '#e0f2fe' }}>
                                        {activity.avatarInitials}
                                    </div>
                                </div>
                            ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}

export default Dashboard;
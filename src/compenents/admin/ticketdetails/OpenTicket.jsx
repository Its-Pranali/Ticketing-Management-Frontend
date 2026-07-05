import Main from "../../layout/Main";
import { MapPin, Search, Edit3, Trash2, Eye } from "lucide-react";
import { FaTicketAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";
import api from "../../../services/api";
import { Link } from "react-router-dom";

function OpenTicket() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const fetchTickets = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/getOpenTickets', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setTickets(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching data", error);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTickets(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaTicketAlt size={22} />
                        </div>
                        <div>
                            <h2>Open Ticket</h2>
                            <p>Manage list of Open Tickets and details</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Ticket Details</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Open Ticket
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table" style={{ width: '1500px', overflowX: 'scroll' }}>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Ticket Id</th>
                                    <th>NLPSV Ticket No</th>
                                    <th>PACS Name</th>
                                    <th>Subject</th>
                                    <th>Requester</th>
                                    <th>Last Activity</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={9} />
                                ) : tickets.length === 0 ? (
                                    <TableDataNotFound title="Open Tickets" colSpan={9} />
                                ) : (
                                    <motion.tbody>
                                        {tickets.map((tk, index) => (
                                            <tr index={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {tk.ticket_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {tk.ticket_number || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.pacs_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.subject?.split(" ").slice(0, 3).join(" ")}
                                                        {tk.subject?.split(" ").length > 3 && "..."}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.user_name?.split(" ").slice(0, 2).join(" ")}
                                                        {tk.user_name?.split(" ").length > 2 && "..."}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.created_at}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {tk.sts_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-view">
                                                            <Link to={`/view-ticket/${tk.id}`}>
                                                                <Eye size={15} />
                                                            </Link>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </motion.tbody>
                                )}
                            </AnimatePresence>
                        </table>
                    </div>
                    <Pagination page={page} setPage={setPage} pagination={pagination} />
                </div>
            </div>
        </Main>
    );
}

export default OpenTicket;
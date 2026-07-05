import Main from "../../layout/Main";
import { MapPin, Search, Eye, } from "lucide-react";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import { MdForwardToInbox } from "react-icons/md";
import Pagination from "../../common/Pagination";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiCheck } from "react-icons/fi";
import { FaCheck, FaFolder, FaTimes } from "react-icons/fa";
import { RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

function ForwardedToNLPSV() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [refreshingId, setRefreshingId] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const fetchTickets = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/getForwardNlpsv', {
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
            console.error("Error while fetching tickets", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleChangeStatus = async (tk) => {
        setLoading(true);
        setRefreshingId(tk.id);
        try {
            const res = await api.post('/getNLPSVStatus', {
                tId: tk.id,
                ticket_id: tk.ticket_id,
                ticket_number: tk.ticket_number,
                ticket_response_id: tk.ticket_response_id,
            });
            console.log(res.data.ticketStatus);

            if (res.data.ticketStatus) {
                Swal.fire("Success", `Ticket No: ${tk.ticket_id} and Status is ${res.data.ticketStatus}`, "success");
                fetchTickets(page, search);
            } else {
                Swal.fire("Error", res.data.message || "Something went wrong", "error");
                console.error(res.data.message);
            }
        }
        catch (error) {
            Swal.fire("Error", "Something went wrong while checking status", "error");
            console.error("Error while change Status", error);
        }
        finally {
            setRefreshingId(null);
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
                            <MdForwardToInbox size={22} />
                        </div>
                        <div>
                            <h2>Forwarded to NLPSV Ticket</h2>
                            <p>Manage list of Forwarded to NLPSVto NLPSV Tickets and details</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Ticket Details</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Forwarded to NLPSV Ticket
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
                        <table className="custom-table" style={{ width: '1800px', overflowX: 'scroll' }}>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Ticket Id</th>
                                    <th>NLPSV Ticket No</th>
                                    <th>PACS Name</th>
                                    <th>Product </th>
                                    <th>Subject</th>
                                    <th>Requester</th>
                                    <th>Status</th>
                                    <th>Created Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={10} />
                                ) : tickets.length === 0 ? (
                                    <TableDataNotFound title="Forwarded to NLPSV" colSpan={10} />
                                ) : (
                                    <motion.tbody>
                                        {tickets.map((tk, index) => (
                                            <tr key={index}>
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
                                                        {tk.ticket_number}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.pacs_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.product_name}
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
                                                        {/* {tk.user_name} */}
                                                        {tk.user_name?.length > 15 ? tk.user_name.slice(0, 15) + "..." : tk.user_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {tk.sts_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.created_at}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-view">
                                                            <Link to={`/view-ticket/${tk.id}`}>
                                                                <Eye size={15} className="d-flex justify-content-center" />
                                                            </Link>
                                                        </button>
                                                        <button className="btn btn-action-circle btn-refresh" onClick={() => handleChangeStatus(tk)} disabled={refreshingId === tk.id} title="Close Ticket">
                                                            <Link>
                                                                <RefreshCw size={15} className="d-flex justify-content-center" />
                                                            </Link>
                                                        </button>
                                                        <button className="btn btn-action-circle btn-folder" title="Reopen Ticket">
                                                            <Link>
                                                                <FaFolder size={13} className="d-flex justify-content-center" />
                                                            </Link>
                                                        </button>
                                                        <button className="btn btn-action-circle btn-view" title="Resolved Ticket">
                                                            <Link>
                                                                <FaCheck size={13} className="d-flex justify-content-center" />
                                                            </Link>
                                                        </button>
                                                        <button className="btn btn-action-circle btn-cross" title="Closed Ticket">
                                                            <Link>
                                                                <FaTimes size={13} className="d-flex justify-content-center" />
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
export default ForwardedToNLPSV;
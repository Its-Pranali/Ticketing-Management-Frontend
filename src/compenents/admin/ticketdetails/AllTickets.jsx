import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import { Search, MapPin, Eye } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FaClipboardList } from "react-icons/fa";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";
import api from "../../../services/api";
import { Link } from "react-router-dom";

function AllTickets() {
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [status, setStatus] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toData, setToData] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        last_page: 1,
        total: 0,
    });
    const [formData, setFormData] = useState({
        from_date: "",
        to_date: "",
        status: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const fetchStatus = async (e) => {
        try {
            const res = await api.get('/getStatus');
            setStatus(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching status", error);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchTickets(1, search, formData);
    }

    const fetchTickets = async (pageNumber = 1, searchTerm = search, filters = formData) => {
        setLoading(true);
        try {
            const res = await api.get('/getAllTickets', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                    from_date: filters.from_date,
                    to_date: filters.to_date,
                    status: filters.status,
                }
            });
            setTickets(res.data.message);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Error while fetching tickets", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStatus();
        fetchTickets(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaClipboardList size={22} />
                        </div>
                        <div>
                            <h2>All Tickets</h2>
                            <p>Manage list of All Tickets and details</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Ticket Details</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                All Tickets
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

                <div className="card" >
                    <form onSubmit={handleSearch}>
                        <div className="row px-3 py-2 align-items-end">
                            <div className="form-group-custom col-md-3">
                                <label htmlFor="from_data">From Date</label>
                                <input type="date" id="from_date" name="from_date" onChange={handleChange} className="form-input-custom" />
                            </div>
                            <div className="form-group-custom col-md-3">
                                <label htmlFor="from_data">To Date</label>
                                <input type="date" id="to_date" name="to_date" onChange={handleChange} className="form-input-custom" />
                            </div>
                            <div className="form-group-custom col-md-3">
                                <label htmlFor="status">Status</label>
                                <select name="status" id="status" className="form-input-custom" onChange={handleChange}>
                                    <option value="">Select Status</option>
                                    {status.map((sta, index) => (
                                        <option key={index} value={sta.id}>{sta.sts_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group-custom col-md-3">
                                <div className="d-flex gap-2">
                                    <button className="btn btn-secondary btn-sm" type="button">Cancel</button>
                                    <button className="btn btn-primary btn-sm" type="submit">Search</button>
                                </div>
                            </div>
                        </div>
                    </form>
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
                                    <th>Subject</th>
                                    <th>Requester</th>
                                    <th>Last Activity</th>
                                    <th>Closed Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={10} />
                                ) : tickets.length === 0 ? (
                                    <TableDataNotFound title="Tickets" colSpan={10} />
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
                                                        {tk.subject}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.user_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.created_at}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tk.updated_at}
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
export default AllTickets;
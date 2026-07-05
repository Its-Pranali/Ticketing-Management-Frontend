import Main from "../../layout/Main";
import { FaChartBar } from "react-icons/fa";
import api from "../../../services/api";
import { useState, useEffect, useRef } from "react";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Search, ChevronDown } from "lucide-react";
import "../masterdata/DistrictStyle.css";

function MultiSelectDropdown({ options = [], selectedIds = [], onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const toggleDropdown = () => setIsOpen(prev => !prev);

    const toggleOption = (id) => {
        const idStr = String(id);
        if (selectedIds.includes(idStr)) {
            onChange(selectedIds.filter(val => val !== idStr));
        } else {
            onChange([...selectedIds, idStr]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name && opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = () => {
        onChange(options.map(opt => String(opt.id)));
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const getDisplayText = () => {
        if (selectedIds.length === 0) return placeholder;
        if (selectedIds.length <= 2) {
            const names = selectedIds.map(id => {
                const found = options.find(o => String(o.id) === String(id));
                return found ? found.name : "";
            }).filter(Boolean);
            if (names.length > 0) return names.join(", ");
        }
        return `${selectedIds.length} Selected`;
    };

    return (
        <div className="multiselect-container" ref={dropdownRef}>
            <div
                className={`multiselect-trigger ${isOpen ? 'active' : ''}`}
                onClick={toggleDropdown}
            >
                <span className="multiselect-trigger-text">{getDisplayText()}</span>
                <ChevronDown size={16} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {isOpen && (
                <div className="multiselect-dropdown">
                    <div className="multiselect-search-wrapper" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            className="multiselect-search-input"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="multiselect-actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="multiselect-action-btn" onClick={handleSelectAll}>
                            Select All
                        </button>
                        <button type="button" className="multiselect-action-btn" onClick={handleClearAll}>
                            Clear All
                        </button>
                    </div>
                    <div className="multiselect-options-list">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center py-2 text-muted" style={{ fontSize: '12px' }}>No options found</div>
                        ) : (
                            filteredOptions.map((opt, index) => {
                                const isChecked = selectedIds.includes(String(opt.id));
                                return (
                                    <div
                                        key={index}
                                        className="multiselect-option"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(opt.id);
                                        }}>
                                        <input type="checkbox" checked={isChecked} onChange={() => { }} style={{ marginRight: '8px' }} />
                                        <span>{opt.name}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function DistrictWiseReport() {
    const [districts, setDistricts] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [filteredTalukas, setFilteredTalukas] = useState([]);
    const [filteredPacs, setFilteredPacs] = useState([]);
    const [pacs, setPacs] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [selectedTalukas, setSelectedTalukas] = useState([]);
    const [selectedPacs, setSelectedPacs] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");

    const fetchDistricts = async () => {
        try {
            const res = await api.get('/getDistrict');
            setDistricts(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching district", error);
        }
    }

    const fetchTickets = async (pageNumber = 1, searchTerm = search, dists = selectedDistricts, tals = selectedTalukas, pacsList = selectedPacs, sts = selectedStatus) => {
        setLoading(true);
        try {
            const res = await api.get('/getDistrictWiseReport', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                    district: dists.join(','),
                    taluka: tals.join(','),
                    socity: pacsList.join(','),
                    status: sts,
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

    const fetchTalukas = async () => {
        try {
            const res = await api.get('/getTaluka');
            setTalukas(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching taluka", error);
        }
    }

    const fetchStatus = async () => {
        try {
            const res = await api.get('/getStatus');
            setStatuses(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching status", error);
        }
    }

    const fetchPacs = async () => {
        try {
            const res = await api.get('/getPacs');
            setPacs(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching PACS", error);
        }
    }

    useEffect(() => {
        if (selectedDistricts.length > 0) {
            const filtered = talukas.filter((tal) => selectedDistricts.includes(String(tal.dist_id)));
            setFilteredTalukas(filtered);
            const filteredIds = filtered.map(t => String(t.id));
            setSelectedTalukas(prev => prev.filter(id => filteredIds.includes(id)));
        } else {
            setFilteredTalukas([]);
            setSelectedTalukas([]);
        }
    }, [selectedDistricts, talukas]);


    useEffect(() => {
        if (selectedTalukas.length > 0) {
            const filtered = pacs.filter((pac) => selectedTalukas.includes(String(pac.taluka_id)));
            setFilteredPacs(filtered);
            const filteredIds = filtered.map(p => String(p.id));
            setSelectedPacs(prev => prev.filter(id => filteredIds.includes(id)));
        } else {
            setFilteredPacs([]);
            setSelectedPacs([]);
        }
    }, [selectedTalukas, pacs]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchTickets(1, search, selectedDistricts, selectedTalukas, selectedPacs, selectedStatus);
    };

    useEffect(() => {
        fetchDistricts();
        fetchTalukas();
        fetchStatus();
        fetchPacs();
        fetchTickets(1, "", [], [], [], "");
    }, []);

    useEffect(() => {
        fetchTickets(page, search, selectedDistricts, selectedTalukas, selectedPacs, selectedStatus);
    }, [page, search]);

    const handleReset = () => {
        setSelectedDistricts([]);
        setSelectedTalukas([]);
        setSelectedPacs([]);
        setSelectedStatus("");
        setSearch("");
        setPage(1);
        fetchTickets(1, "", [], [], [], "");
    }

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaChartBar size={22} />
                        </div>
                        <div>
                            <h2>Districtwise Reports</h2>
                            <p>Manage list of Manage Reports and details</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Ticket Reports</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Districtwise Reports
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search ticket, PACS, or product..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                </div>

                <div className="card" >
                    <form onSubmit={handleSearch}>
                        <div className="row px-3 py-2 align-items-end">
                            <div className="form-group-custom col-md-3">
                                <label>District</label>
                                <MultiSelectDropdown options={districts.map(d => ({ id: d.id, name: d.dist_name }))} selectedIds={selectedDistricts} onChange={setSelectedDistricts} placeholder="Select Districts" />
                            </div>
                            <div className="form-group-custom col-md-2">
                                <label>Taluka</label>
                                <MultiSelectDropdown options={filteredTalukas.map(t => ({ id: t.id, name: t.taluka_name }))} selectedIds={selectedTalukas} onChange={setSelectedTalukas} placeholder="Select Talukas" />
                            </div>
                            <div className="form-group-custom col-md-3">
                                <label>PACS</label>
                                <MultiSelectDropdown options={filteredPacs.map(p => ({ id: p.id, name: p.pacs_name }))} selectedIds={selectedPacs} onChange={setSelectedPacs} placeholder="Select PACS" />
                            </div>
                            <div className="form-group-custom col-md-2">
                                <label htmlFor="status">Status</label>
                                <select name="status" id="status" value={selectedStatus} className="form-input-custom" onChange={(e) => setSelectedStatus(e.target.value)} >
                                    <option value="">Select Status</option>
                                    {statuses.map((sts, index) => (
                                        <option key={index} value={sts.id}>{sts.sts_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group-custom col-md-2">
                                <div className="d-flex gap-2">
                                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => handleReset()}>Cancel</button>
                                    <button className="btn btn-primary btn-sm" type="submit">Search</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table" style={{ width: '1500px', overflowX: 'scroll' }}>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Ticket Id</th>
                                    <th>PACS Name</th>
                                    <th>Product</th>
                                    <th>Subject</th>
                                    <th>Requester</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={8} />
                                ) : tickets.length === 0 ? (
                                    <TableDataNotFound title="Districtwise Report" colSpan={8} />
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
                                                        {tk.user_name}
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

export default DistrictWiseReport;
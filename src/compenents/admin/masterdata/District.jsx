import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit3, Trash2, MapPin, ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react";
import "../../../../public/assets/css/DistrictStyle.css";
import { FaMapMarkedAlt } from "react-icons/fa";

function District() {
    const [showModal, setShowModal] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        dist_name: "",
        dist_name_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.dist_name.trim()) newErrors.dist_name = "District is required";
        if (!formData.dist_name_ll.trim()) newErrors.dist_name_ll = "Regional Name is required";
        return newErrors;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    }

    const fetchDistrict = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/getDistrict');
            setDistricts(res.data.message || []);
        }
        catch (error) {
            console.error("Error while fetching district", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validator();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            if (isEdit) {
                await api.put(`/updateDistrict/${isEdit}`, formData);
                Swal.fire("Success", "District updated successfully", "success");
            }
            else {
                await api.post('/saveDistrict', formData);
                Swal.fire("Success", "District saved successfully", "success");
            }
            setShowModal(false);
            fetchDistrict();
        }
        catch (error) {
            console.error("Error while saving district", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete District",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteDistrict/${id}`);
                Swal.fire("Deleted!", "District deleted successfully", "success");
                fetchDistrict();
            }
            catch (error) {
                console.error("Error while deleting data", error);
            }
        }
    }

    const handleEdit = (dist) => {
        setIsEdit(dist.id);
        setFormData({
            id: dist.id,
            dist_name: dist.dist_name,
            dist_name_ll: dist.dist_name_ll,
        });
        setErrors({});
        setShowModal(true);
    }

    useEffect(() => {
        fetchDistrict();
    }, []);

    const addDistrict = () => {
        handleReset();
        setIsEdit(false);
        setErrors({});
        setShowModal(true);
    }

    const handleReset = () => {
        setFormData({
            dist_name: "",
            dist_name_ll: "",
        });
    }

    // Reset pagination to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Client-side filtering logic
    const filteredDistricts = districts.filter(dist => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const distName = dist.dist_name ? dist.dist_name.toLowerCase() : "";
        const distNameLl = dist.dist_name_ll ? dist.dist_name_ll.toLowerCase() : "";
        const stateName = dist.state ? dist.state.toLowerCase() : "";

        return distName.includes(query) || distNameLl.includes(query) || stateName.includes(query);
    });

    // Pagination calculations
    const totalRecords = filteredDistricts.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    const paginatedDistricts = filteredDistricts.slice(startIndex, startIndex + pageSize);

    // Stagger motion variants for table rows
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
            }
        }
    };

    return (
        <Main>
            <div className="page-container">
                {/* Header Card */}
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaMapMarkedAlt size={22} />
                        </div>
                        <div>
                            <h2>Districts</h2>
                            <p>Manage list of districts and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                District
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input
                            type="text"
                            className="search-input-field"
                            placeholder="Search district, state..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery("")}
                                title="Clear Search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button className="btn-add-page" onClick={addDistrict}>
                        <Plus size={18} />
                        <span>Add District</span>
                    </button>
                </div>

                {/* Main Table Card */}
                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Sr.No</th>
                                    <th>State Name</th>
                                    <th>District Name</th>
                                    <th>Regional Name</th>
                                    <th style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="5">
                                                <div className="table-empty-state">
                                                    <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.2em' }}>
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p style={{ marginTop: '10px' }}>Fetching records...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : paginatedDistricts.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="5">
                                                <div className="table-empty-state">
                                                    <AlertCircle className="empty-state-icon" size={32} />
                                                    <h4>No Districts Found</h4>
                                                    <p>Try refining your search query or add a new district.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <motion.tbody
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        {paginatedDistricts.map((dist, index) => (
                                            <motion.tr key={dist.id || index} variants={itemVariants} >
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {startIndex + index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {dist.state || "Pondicherry"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {dist.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {dist.dist_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button
                                                            className="btn-action-circle btn-edit"
                                                            onClick={() => handleEdit(dist)}
                                                            title="Edit District"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(dist.id)} title="Delete District">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </motion.tbody>
                                )}
                            </AnimatePresence>
                        </table>
                    </div>

                    {/* Pagination Controls Footer */}
                    {filteredDistricts.length > 0 && (
                        <div className="pagination-footer">
                            <div className="pagination-info">
                                Showing <strong style={{ color: 'var(--dist-text-primary)' }}>{totalRecords === 0 ? 0 : startIndex + 1}</strong> to <strong style={{ color: 'var(--dist-text-primary)' }}>{endIndex}</strong> of <strong style={{ color: 'var(--dist-text-primary)' }}>{totalRecords}</strong> entries
                            </div>
                            <div className="pagination-controls">
                                <div className="pagination-select-wrapper">
                                    <span>Show</span>
                                    <select
                                        className="pagination-select"
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span>entries</span>
                                </div>
                                <button
                                    className="btn-pagination"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                    <span>Prev</span>
                                </button>
                                <span style={{ fontSize: '13px', margin: '0 4px', color: 'var(--dist-text-secondary)' }}>
                                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                </span>
                                <button
                                    className="btn-pagination"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Custom AnimatePresence Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            className="modal-backdrop-custom"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                className="modal-dialog-custom"
                                initial={{ scale: 0.94, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.94, y: 20, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header-custom">
                                    <h5>{isEdit ? "Edit District" : "Add District"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom">
                                            <label htmlFor="dist_name">District Name</label>
                                            <input type="text" name="dist_name" id="dist_name" placeholder="Enter district name (e.g. Karaikal)" onChange={handleChange} value={formData.dist_name} className="form-input-custom"
                                            />
                                            {errors.dist_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.dist_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="dist_name_ll">Regional Name</label>
                                            <input type="text" name="dist_name_ll" id="dist_name_ll" placeholder="Enter regional name (e.g. காரைக்கால்)" onChange={handleChange} value={formData.dist_name_ll} className="form-input-custom" />
                                            {errors.dist_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.dist_name_ll}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer-custom">
                                        <button type="button" className="btn-modal-secondary" onClick={() => setShowModal(false)}> Cancel</button>
                                        <button type="submit" className="btn-modal-primary">{isEdit ? "Update" : "Save"}</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Main>
    );
}

export default District;
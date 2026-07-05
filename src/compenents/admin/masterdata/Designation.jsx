import Main from "../../layout/Main";
import { MapPin, Search, Plus, Edit3, Trash2, X, AlertCircle } from "lucide-react";
import { FaUserTie } from "react-icons/fa";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "../../common/Pagination";
import TableDataNotFound from "../../common/TableDataNotFound";
import TableLoader from "../../common/TableLoader";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../services/api";

function Designation() {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [search, setSearch] = useState("");
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [formData, setFormData] = useState({
        designation: "",
        designation_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.designation.trim()) newErrors.designation = "Designation is required";
        if (!formData.designation_ll.trim()) newErrors.designation_ll = "Regional Name is required";
        return newErrors;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    }

    const fetchDesignations = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/designationList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setDesignations(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching designation", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (des) => {
        setFormData({
            designation: des.designation,
            designation_ll: des.designation_ll,
        });
        setShowModal(true);
        setIsEdit(des.id);
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
                await api.put(`/updateDesignation/${isEdit}`, formData);
                Swal.fire("Success", "Designation updated successfully", "success");
            }
            else {
                await api.post(`/saveDesignation`, formData);
                Swal.fire("Success", "Designation saved successfully", "success");
            }
            setShowModal(false);
            fetchDesignations();
        }
        catch (error) {
            console.error("Error while fetching Designation", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Designation",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteDesignation/${id}`);
                Swal.fire("Deleted!", "Designation deleted successfully", "success");
                fetchDesignations();
            }
            catch (error) {
                console.error("Error while deleting Designation", error);
            }
        }
    }

    const addDesignation = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            designation: "",
            designation_ll: "",
        });
    }

    useEffect(() => {
        fetchDesignations(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaUserTie size={22} />
                        </div>
                        <div>
                            <h2>Designation</h2>
                            <p>Manage list of Designation and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Designation
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addDesignation}>
                        <Plus size={18} />
                        <span>Add Designation</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Designation</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : designations.length === 0 ? (
                                    <TableDataNotFound title="designation" colSpan={4} />
                                ) : (
                                    <motion.tbody>
                                        {designations.map((des, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {des.designation}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {des.designation_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(des)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(des.id)}>
                                                            <Trash2 size={15} />
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

                <AnimatePresence>
                    {showModal && (
                        <motion.div className="modal-backdrop-custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                            <motion.div className="modal-dialog-custom" initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                                <div className="modal-header-custom">
                                    <h5>{isEdit ? "Edit Designation" : "Add Designation"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom">
                                            <label htmlFor="designation">Designation Name</label>
                                            <input type="text" name="designation" id="designation" onChange={handleChange} value={formData.designation} className="form-input-custom" placeholder="Enter Designation name" />
                                            {errors.designation && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.designation}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-custom">
                                            <label htmlFor="designation_ll">Regional Name</label>
                                            <input type="text" name="designation_ll" id="designation_ll" onChange={handleChange} value={formData.designation_ll} className="form-input-custom" placeholder="Enter Regional name" />
                                            {errors.designation_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.designation_ll}</span>
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
export default Designation;
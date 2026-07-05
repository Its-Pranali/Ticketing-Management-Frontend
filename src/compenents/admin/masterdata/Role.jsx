import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import { MapPin, Search, Plus, X, AlertCircle, Edit3, Trash2 } from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import api from "../../../services/api";
import TableDataNotFound from "../../common/TableDataNotFound";
import TableLoader from "../../common/TableLoader";
import Pagination from "../../common/Pagination";

function Role() {
    const [showModal, setShowModal] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isEdit, setIsEdit] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        limit: 10,
        total: 0,
    });
    const [formData, setFormData] = useState({
        role: "",
        role_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.role.trim()) newErrors.role = "Role is required";
        if (!formData.role_ll.trim()) newErrors.role_ll = "Regional Name is required";
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

    const fetchRoles = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('roleList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setRoles(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching roles", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (rol) => {
        setFormData({
            role: rol.role,
            role_ll: rol.role_ll,
        });
        setIsEdit(rol.id);
        setShowModal(true);
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
                await api.put(`/updateRole/${isEdit}`, formData);
                Swal.fire("Success", "Role updated successfully", "success");
            }
            else {
                await api.post('/saveRole', formData);
                Swal.fire("Success", "Role saved successfully", "success");
            }
            setShowModal(false);
            fetchRoles();
        }
        catch (error) {
            console.error("Error while fetching Role", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Role",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteRole/${id}`);
                Swal.fire("Deleted!", "Role deleted successfully", "success");
                fetchRoles();
            }
            catch (error) {
                console.error("Error while fetching role", error);
            }
        }
    }

    const addRole = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            role: "",
            role_ll: "",
        });
    }

    useEffect(() => {
        fetchRoles(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaUserShield size={22} />
                        </div>
                        <div>
                            <h2>Role List</h2>
                            <p>Manage list of Roles and regional names</p>
                        </div>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addRole}>
                        <Plus size={18} />
                        <span>Add Role</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Role Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={4} />
                                ) : roles.length === 0 ? (
                                    <TableDataNotFound title="Roles" colSpan={4} />
                                ) : (
                                    <motion.tbody>
                                        {roles.map((rol, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {rol.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {rol.role_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(rol)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(rol.id)}>
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
                                    <h5>{isEdit ? "Edit Role" : "Add Role"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom">
                                            <label htmlFor="role">Role Name</label>
                                            <input type="text" name="role" id="role" value={formData.role} placeholder="Enter Role name" className="form-input-custom" onChange={handleChange} />
                                            {errors.role && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.role}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-custom">
                                            <label htmlFor="role_ll">Regional Name</label>
                                            <input type="text" name="role_ll" id="role_ll" value={formData.role_ll} placeholder="Enter Regional name" className="form-input-custom" onChange={handleChange} />
                                            {errors.role_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.role_ll}</span>
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
export default Role;
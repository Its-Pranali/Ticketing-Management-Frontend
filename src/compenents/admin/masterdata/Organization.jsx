import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import { MapPin, Search, Plus, X, AlertCircle, Edit3, Trash2 } from "lucide-react";
import { FaBuilding } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Swal from "sweetalert2";
import api from "../../../services/api";
import Pagination from "../../common/Pagination";

function Organization() {
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [organizations, setOrganizations] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [formData, setFormData] = useState({
        org_name: "",
        org_name_ll: "",
    });

    const validator = (e) => {
        const newErrors = {};
        if (!formData.org_name.trim()) newErrors.org_name = "Organization Name is required";
        if (!formData.org_name_ll.trim()) newErrors.org_name_ll = "Regional Name is required";
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

    const fetchOrganization = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/organizationList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setOrganizations(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching organization", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (org) => {
        setFormData({
            org_name: org.org_name,
            org_name_ll: org.org_name_ll,
        });
        setShowModal(true);
        setIsEdit(org.id);
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
                await api.put(`/updateOrganization/${isEdit}`, formData);
                Swal.fire("Success", "Organization updated successfully", "success");
            }
            else {
                await api.post('/saveOrganization', formData);
                Swal.fire("Success", "Organization saved successfully", "success");
            }
            setShowModal(false);
            fetchOrganization();
        }
        catch (error) {
            console.log("Error while saving / updating data", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Organization",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteOrganization/${id}`);
                Swal.fire("Deleted!", "Organization deleted successfully", "success");
                fetchOrganization();
            }
            catch (error) {
                console.error("Error while deleting Organization", error);
            }
        }
    }

    const addOrganization = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            org_name: "",
            org_name_ll: "",
        });
    }

    useEffect(() => {
        fetchOrganization(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaBuilding size={22} />
                        </div>
                        <div>
                            <h2>Organization</h2>
                            <p>Manage list of Organization and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Organization
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addOrganization}>
                        <Plus size={18} />
                        <span>Add Organization</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Organization Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : organizations.length === 0 ? (
                                    <TableDataNotFound title="organization" colSpan={4} />
                                ) : (
                                    <motion.tbody>
                                        {organizations.map((org, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {org.org_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {org.org_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(org)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(org.id)}>
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
                                    <h5>{isEdit ? "Edit Organization" : "Add Organization"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom">
                                            <label htmlFor="org_name">Organization Name</label>
                                            <input type="text" name="org_name" id="org_name" onChange={handleChange} value={formData.org_name} className="form-input-custom" placeholder="Enter Organization name" />
                                            {errors.org_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.org_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-custom">
                                            <label htmlFor="org_name_ll">Regional Name</label>
                                            <input type="text" name="org_name_ll" id="org_name_ll" onChange={handleChange} value={formData.org_name_ll} className="form-input-custom" placeholder="Enter Regional name" />
                                            {errors.org_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.org_name_ll}</span>
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
export default Organization;
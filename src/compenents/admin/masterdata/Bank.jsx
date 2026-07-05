import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import { MapPin, Search, Plus, X, Edit3, Trash2, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FaUniversity } from "react-icons/fa";
import api from "../../../services/api";
import TableLoader from "../../common/TableLoader";
import Pagination from "../../common/Pagination";
import TableDataNotFound from "../../common/TableDataNotFound";
import Swal from "sweetalert2";

function Bank() {
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [banks, setBanks] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [formData, setFormData] = useState({
        dist_id: "",
        bank_name: "",
        bank_name_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.dist_id) newErrors.dist_id = "District is required";
        if (!formData.bank_name) newErrors.bank_name = "Bank name is required";
        if (!formData.bank_name_ll) newErrors.bank_name_ll = "Regional name is required";
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

    const fetchDistrcts = async () => {
        try {
            const res = await api.get('/getDistrict');
            setDistricts(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching district", error);
        }
    }

    const fetchBanks = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/bankList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setBanks(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching banks", errors);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (bk) => {
        setFormData({
            dist_id: bk.dist_id,
            bank_name: bk.bank_name,
            bank_name_ll: bk.bank_name_ll,
        });
        setShowModal(true);
        setIsEdit(bk.id);
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
                await api.put(`/updateBank/${isEdit}`, formData);
                Swal.fire("Success", "Bank updated successfully", "success");
            }
            else {
                await api.post('/saveBank', formData);
                Swal.fire("Success", "Bank saved successfully", "success");
            }
            setShowModal(false);
            fetchBanks();
        }
        catch (error) {
            console.error("Error while saving / updating district", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Bank",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteBank/${id}`);
                Swal.fire("Deleted!", "Bank deleted successfully", "success");
                fetchBanks();
            }
            catch (error) {
                console.error("Error while deleting bank", error);
            }
        }
    }

    const addBank = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            dist_id: "",
            bank_name: "",
            bank_name_ll: "",
        });
    }

    useEffect(() => {
        fetchDistrcts();
        fetchBanks(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaUniversity size={22} />
                        </div>
                        <div>
                            <h2>Bank</h2>
                            <p>Manage list of Banks and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Bank
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addBank}>
                        <Plus size={18} />
                        <span>Add Bank</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>District Name</th>
                                    <th>Bank Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : banks.length === 0 ? (
                                    <TableDataNotFound title="Bank" colSpan={5} />
                                ) : (
                                    <motion.tbody>
                                        {banks.map((bk, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {bk.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {bk.bank_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {bk.bank_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(bk)} >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(bk.id)} >
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
                                    <h5>{isEdit ? "Edit Bank" : "Add Bank"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom size={18}">
                                            <label htmlFor="dist_id">District Name</label>
                                            <select name="dist_id" id="dist_id" onChange={handleChange} value={formData.dist_id} className="form-input-custom">
                                                <option value="">Select District</option>
                                                {districts.map((dist, index) => (
                                                    <option key={index} value={dist.id}>{dist.dist_name}</option>
                                                ))}
                                            </select>
                                            {errors.dist_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.dist_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="bank_name">Bank Name</label>
                                            <input type="text" name="bank_name" id="bank_name" onChange={handleChange} value={formData.bank_name} className="form-input-custom" placeholder="Enter bank name" />
                                            {errors.bank_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.bank_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="bank_name_ll">Regional Name</label>
                                            <input type="text" name="bank_name_ll" id="bank_name_ll" onChange={handleChange} value={formData.bank_name_ll} className="form-input-custom" placeholder="Enter regional name" />
                                            {errors.bank_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.bank_name_ll}</span>
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

export default Bank;
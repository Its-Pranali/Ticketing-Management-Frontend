import Main from "../../layout/Main";
import { MapPin, Search, Plus, X, AlertCircle, Edit3, Trash2 } from "lucide-react";
import { RiAppsFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../services/api";
import Swal from "sweetalert2";
import TableDataNotFound from "../../common/TableDataNotFound";
import TableLoader from "../../common/TableLoader";
import Pagination from "../../common/Pagination";

function Module() {
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [modules, setModules] = useState([]);
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
        product_id: "",
        module_name: "",
        module_name_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.product_id) newErrors.product_id = "Product Name is required";
        if (!formData.module_name.trim()) newErrors.module_name = "Module Name is required";
        if (!formData.module_name_ll.trim()) newErrors.module_name_ll = "Regional Name is required";
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

    const fetchModules = async (pageNumber = 1, searchTerm = search) => {
        try {
            const res = await api.get('/moduleList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setModules(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching data", error);
        }
    }

    const handleEdit = (mod) => {
        setFormData({
            product_id: mod.product_id,
            module_name: mod.module_name,
            module_name_ll: mod.module_name_ll,
        });
        setShowModal(true);
        setIsEdit(mod.id);
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
                await api.put(`/updateModule/${isEdit}`, formData);
                Swal.fire("Success", "Product updated successfully", "success");
            }
            else {
                await api.post(`/saveModule`, formData);
                Swal.fire("Success", "Product saved successfully", "success");
            }
            setShowModal(false);
            fetchModules();
        }
        catch (error) {
            console.error("Error while saving / updating module", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Module",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteModule/${id}`);
                Swal.fire("Deleted!", "Module deleted successfully", "success");
                fetchModules();
            }
            catch (error) {
                console.error("Error while deleting module", error);
            }
        }
    }

    const fetchproducts = async () => {
        try {
            const res = await api.get('/getProduct');
            setProducts(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching products", error);
        }
    }

    const addModule = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    useEffect(() => {
        fetchproducts();
        fetchModules(page, search);
    }, [page, search]);

    const handleReset = () => {
        setFormData({
            product_id: "",
            module_name: "",
            module_name_ll: "",
        });
    }

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <RiAppsFill size={22} />
                        </div>
                        <div>
                            <h2>Module</h2>
                            <p>Manage list of Modules and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Module
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addModule}>
                        <Plus size={18} />
                        <span>Add Module</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Product Name</th>
                                    <th>Module Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : modules.length === 0 ? (
                                    <TableDataNotFound title="Module" colSpan={5} />
                                ) : (
                                    <motion.tbody>
                                        {modules.map((mod, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {mod.product_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {mod.module_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {mod.module_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(mod)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(mod.id)}>
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
                                    <h5>{isEdit ? "Edit Module" : "Add Module"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom">
                                            <label htmlFor="product_id">Product Name</label>
                                            <select name="product_id" id="product_id" onChange={handleChange} value={formData.product_id} className="form-input-custom">
                                                <option value="">Select Product</option>
                                                {products.map((pro, index) => (
                                                    <option key={index} value={pro.id}>{pro.product_name}</option>
                                                ))}
                                            </select>
                                            {errors.product_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.product_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="module_name">Module Name</label>
                                            <input type="text" name="module_name" id="module_name" className="form-input-custom" onChange={handleChange} value={formData.module_name} placeholder="Enter Module Name" />
                                            {errors.module_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.module_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="module_name_ll">Regional Name</label>
                                            <input type="text" name="module_name_ll" id="module_name_ll" className="form-input-custom" onChange={handleChange} value={formData.module_name_ll} placeholder="Enter Regional Name" />
                                            {errors.module_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.module_name_ll}</span>
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
export default Module;
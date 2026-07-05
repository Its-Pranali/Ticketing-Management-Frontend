import Main from "../../layout/Main";
import { MapPin, Search, Plus, X, AlertCircle, Edit3, Trash2 } from "lucide-react";
import { FaBox } from "react-icons/fa";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import api from "../../../services/api";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";

function Product() {
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [priorities, setPriorities] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [formData, setFormData] = useState({
        product_name: "",
        product_name_ll: "",
        priority: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.product_name.trim()) newErrors.product_name = "Product name is required";
        if (!formData.product_name_ll.trim()) newErrors.product_name_ll = "Regional name is required";
        if (!formData.priority) newErrors.priority = "Priority is required";
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

    const fetchPriorities = async () => {
        try {
            const res = await api.get('/getPriority');
            setPriorities(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching priority", error);
        }
    }

    const fetchProducts = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/productList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setProducts(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching products", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (pro) => {
        setFormData({
            product_name: pro.product_name,
            product_name_ll: pro.product_name_ll,
            priority: pro.priority,
        });
        setShowModal(true);
        setIsEdit(pro.id);
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
                // await api.put(`/updateProduct/${isEdit}`, formData);
                await api.put(`/updateProduct/${isEdit}`, formData);
                Swal.fire("Success", "Product updated successfully", "success");
            }
            else {
                await api.post('/saveProduct', formData);
                Swal.fire("Success", "Product saved successfully", "success");
            }
            setShowModal(false);
            fetchProducts();
        }
        catch (error) {
            console.error("Error while saving / updating data", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Product",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteProduct/${id}`);
                Swal.fire("Deleted!", "Organization deleted successfully", "success");
                fetchProducts();
            }
            catch (error) {
                console.error("Error while deleting product", error);
            }
        }
    }

    const addProduct = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            product_name: "",
            product_name_ll: "",
            priority: "",
        });
    }

    useEffect(() => {
        fetchPriorities();
        fetchProducts(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaBox size={22} />
                        </div>
                        <div>
                            <h2>Product</h2>
                            <p>Manage list of Product and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Product
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addProduct}>
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Product Name</th>
                                    <th>Regional Name</th>
                                    <th>Priority</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : products.length === 0 ? (
                                    <TableDataNotFound title="Product" colSpan={5} />
                                ) : (
                                    <motion.tbody>
                                        {products.map((pro, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {pro.product_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {pro.product_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {pro.priority_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(pro)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(pro.id)}>
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
                                    <h5>{isEdit ? "Edit Product" : "Add Product"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body-custom">
                                        <div className="form-group-custom">
                                            <label htmlFor="product_name">Product Name</label>
                                            <input type="text" name="product_name" id="product_name" onChange={handleChange} value={formData.product_name} className="form-input-custom" placeholder="Enter Organization name" />
                                            {errors.product_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.product_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="product_name_ll">Regional Name</label>
                                            <input type="text" name="product_name_ll" id="product_name_ll" onChange={handleChange} value={formData.product_name_ll} className="form-input-custom" placeholder="Enter Regional Name" />
                                            {errors.product_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.product_name_ll}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="product_name_ll">Regional Name</label>
                                            <select name="priority" id="priority" onChange={handleChange} value={formData.priority} className="form-input-custom">
                                                <option value="">Select Priority</option>
                                                {priorities.map((pri, index) => (
                                                    <option key={index} value={pri.id}>{pri.priority_name}</option>
                                                ))}
                                            </select>
                                            {errors.product_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.product_name_ll}</span>
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
export default Product;
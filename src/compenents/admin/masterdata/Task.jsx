import { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Search, Plus, MapPin, X, AlertCircle, Table, Edit3, Trash2 } from "lucide-react";
import { FaTasks } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../services/api";
import Swal from "sweetalert2";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";

function Task() {
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [filteredModules, setFilteredModules] = useState([]);
    const [modules, setModules] = useState([]);
    const [tasks, setTasks] = useState([]);
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
        product_id: "",
        module_id: "",
        task_name: "",
        task_name_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.product_id) newErrors.product_id = "Product Name is required";
        if (!formData.module_id) newErrors.module_id = "Module Name is required";
        if (!formData.task_name.trim()) newErrors.task_name = "Task Name is required";
        if (!formData.task_name_ll.trim()) newErrors.task_name_ll = "Regional Name is required";
        return newErrors;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrors({
            ...errors,
            [name]: ""
        });

        if (name === "product_id") {
            const selectedProductId = value;
            const filtered = modules.filter((mod) => String(mod.product_id) === String(selectedProductId));
            setFilteredModules(filtered);
            setFormData(prev => ({
                ...prev,
                product_id: value,
                module_id: "",
            }));
        }
    }

    const fetchTasks = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/taskList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setTasks(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching task", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (tsk) => {
        const filteredModule = modules.filter((mod) => String(mod.product_id) === String(tsk.product_id));
        setFilteredModules(filteredModule);
        setFormData({
            product_id: tsk.product_id,
            module_id: tsk.module_id,
            task_name: tsk.task_name,
            task_name_ll: tsk.task_name_ll,
        });
        setShowModal(true);
        setIsEdit(tsk.id);
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
                await api.put(`/updateTask/${isEdit}`, formData);
                Swal.fire("Success", "Task updated successfully", "success");
            }
            else {
                await api.post('/saveTask', formData);
                Swal.fire("Success", "Task saved successfully", "success");
            }
            setShowModal(false);
            fetchTasks();
        }
        catch (error) {
            console.error("Error while saving / updating data", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Task",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteTask/${id}`);
                Swal.fire("Deleted!", "Task deleted successfully", "success");
                fetchTasks();
            }
            catch (error) {
                console.error("Error while deleting tasks", error);
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

    const fetchModules = async () => {
        try {
            const res = await api.get('/getModule');
            setModules(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching Modules", error);
        }
    }

    const addTask = () => {
        setShowModal(true);
        handleReset();
        setIsEdit(false);
    }

    useEffect(() => {
        fetchproducts();
        fetchModules();
        fetchTasks(page, search);
    }, [page, search]);

    const handleReset = () => {
        setFormData({
            product_id: "",
            module_id: "",
            task_name: "",
            task_name_ll: "",
        });
    }

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaTasks size={22} />
                        </div>
                        <div>
                            <h2>Task</h2>
                            <p>Manage list of Tasks and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Tasks
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addTask}>
                        <Plus size={18} />
                        <span>Add Task</span>
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
                                    <th>Task Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : tasks.length === 0 ? (
                                    <TableDataNotFound title="Task" colSpan={6} />
                                ) : (
                                    <motion.tbody>
                                        {tasks.map((tsk, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {tsk.product_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {tsk.module_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tsk.task_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {tsk.task_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(tsk)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(tsk.id)}>
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
                                    <h5>{isEdit ? "Edit Task" : "Add Task"}</h5>
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
                                            <label htmlFor="module_id">Module Name</label>
                                            <select name="module_id" id="module_id" onChange={handleChange} value={formData.module_id} className="form-input-custom">
                                                <option value="">Select Module</option>
                                                {filteredModules.map((mod, index) => (
                                                    <option key={index} value={mod.id}>{mod.module_name}</option>
                                                ))}
                                            </select>
                                            {errors.module_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.module_id}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-custom">
                                            <label htmlFor="task_name">Task Name</label>
                                            <input type="text" name="task_name" id="task_name" onChange={handleChange} value={formData.task_name} className="form-input-custom" placeholder="Enter Task Name" />
                                            {errors.task_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.task_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-custom">
                                            <label htmlFor="task_name_ll">Regional Name</label>
                                            <input type="text" name="task_name_ll" id="task_name_ll" onChange={handleChange} value={formData.task_name_ll} className="form-input-custom" placeholder="Enter Regional Name" />
                                            {errors.task_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.task_name_ll}</span>
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
export default Task;
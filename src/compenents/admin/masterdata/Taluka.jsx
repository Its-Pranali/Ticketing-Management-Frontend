import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import { MapPin, Plus, X, AlertCircle, Edit3, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import api from "../../../services/api";
import "../../../../public/assets/css/DistrictStyle.css";
import Pagination from "../../common/Pagination";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";

function Taluka() {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [formData, setFormData] = useState({
        dist_id: "",
        taluka_name: "",
        taluka_name_ll: "",
    });

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
        try {
            const res = await api.get('/districtList');
            console.log("District List:", res.data.message);
            setDistricts(res.data.message);
        }
        catch (errors) {
            console.error("Error while fetching districts", errors);
        }
    }

    const fetchTaluka = async (pageNumber = 1, searchTerm = search) => {
        setIsLoading(true);
        try {
            const res = await api.get('/talukaList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setTalukas(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while geting taluka", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const validator = () => {
        const newErrors = {};
        if (!formData.dist_id) newErrors.dist_id = "Diststrict is required";
        if (!formData.taluka_name.trim()) newErrors.taluka_name = "Taluka Name is required";
        if (!formData.taluka_name_ll.trim()) newErrors.taluka_name_ll = "Regional Name is required";
        return newErrors;
    }

    const handleEdit = (tal) => {
        console.log("Edit Taluka:", tal);

        setFormData({
            dist_id: tal.dist_id,
            taluka_name: tal.taluka_name,
            taluka_name_ll: tal.taluka_name_ll,
        });

        setShowModal(true);
        setIsEdit(tal.id);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validator();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        console.log("Submitting:", formData);
        try {
            if (isEdit) {
                await api.put(`/updateTaluka/${isEdit}`, formData);
                Swal.fire("Success", "Taluka updated successfully", "success");
            }
            else {
                await api.post('/saveTaluka', formData);
                Swal.fire("Success", "Taluka saved successfully", "success");
            }
            setErrors({});
            setShowModal(false);
            fetchTaluka();
        }
        catch (error) {
            console.error("Error while saving / updating data", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Taluka",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete(`/deleteTaluka/${id}`);
            Swal.fire("Deleted!", "Taluka deleted successfully", "success");
            fetchTaluka();
        }
        catch (error) {
            console.error("Error while deleting taluka", error);
        }
    }

    const addTaluka = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }


    const handleReset = () => {
        setFormData({
            dist_id: "",
            taluka_name: "",
            taluka_name_ll: "",
        });
    }

    useEffect(() => {
        fetchDistrict();
        fetchTaluka(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <MapPin size={22} />
                        </div>
                        <div>
                            <h2>Talukas</h2>
                            <p>Manage list of talukas and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Taluka
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addTaluka}>
                        <Plus size={18} />
                        <span>Add Taluka</span>
                    </button>
                </div>


                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>State Name</th>
                                    <th>District Name</th>
                                    <th>Taluka Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <TableLoader colSpan={7} />
                                ) : talukas.length === 0 ? (
                                    <TableDataNotFound
                                        title="Districts"
                                        colSpan={6}
                                    />
                                ) : (
                                    <motion.tbody>
                                        {talukas.map((tal, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {tal.state}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {tal.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {tal.taluka_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {tal.taluka_name_ll}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(tal)} title="Edit District">
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(tal.id)} title="Delete District">
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

                {showModal && (
                    <motion.div className="modal-backdrop-custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} >
                        <motion.div className="modal-dialog-custom" initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                            <div className="modal-header-custom">
                                <h5>{isEdit ? "Edit Taluka" : "Add Taluka"}</h5>
                                <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body-custom">
                                    <div className="form-group-custom">
                                        <label htmlFor="dist_id">District Name</label>
                                        <select name="dist_id" id="dist_id" onChange={handleChange} value={formData.dist_id} className="form-input-custom">
                                            <option value="">Select District</option>
                                            {districts.map((dist, index) => (
                                                <option value={dist.id} key={index}>{dist.dist_name}</option>
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
                                        <label htmlFor="taluka_name">Taluka Name</label>
                                        <input type="text" name="taluka_name" id="taluka_name" onChange={handleChange} value={formData.taluka_name} className="form-input-custom" placeholder="Enter Taluka Name" />
                                        {errors.taluka_name && (
                                            <div className="validation-error-text">
                                                <AlertCircle size={13} />
                                                <span>{errors.taluka_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group-custom">
                                        <label htmlFor="taluka_name_ll">Regional Name</label>
                                        <input type="text" name="taluka_name_ll" id="taluka_name_ll" onChange={handleChange} value={formData.taluka_name_ll} className="form-input-custom" placeholder="Enter Regional Name" />
                                        {errors.taluka_name_ll && (
                                            <div className="validation-error-text">
                                                <AlertCircle size={13} />
                                                <span>{errors.taluka_name_ll}</span>
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
            </div>
        </Main>
    );
}
export default Taluka;
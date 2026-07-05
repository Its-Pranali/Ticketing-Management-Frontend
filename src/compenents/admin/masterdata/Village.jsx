import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import api from "../../../services/api";
import { MapPin, Plus, X, AlertCircle, Search, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { GiVillage } from "react-icons/gi";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";


// import { Plus } from "lucide-react";

function Village() {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [filteredTalukas, setFilteredTalukas] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [villages, setVillages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        limit: 10,
        total: 10,
    });
    const [formData, setFormData] = useState({
        state_id: "",
        dist_id: "",
        taluka_id: "",
        village_name: "",
        village_name_ll: "",
        status: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.dist_id) newErrors.dist_id = "District is required";
        if (!formData.taluka_id) newErrors.taluka_id = "Taluka is required";
        if (!formData.village_name) newErrors.village_name = "Village is required";
        if (!formData.village_name_ll) newErrors.village_name_ll = "Regional Name is required";
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

        if (name === "dist_id") {
            const selectedDistrictId = value;
            const filtered = talukas.filter((tal) => String(tal.dist_id) === String(selectedDistrictId));
            setFilteredTalukas(filtered);
            setFormData(prev => ({
                ...prev,
                dist_id: value,
                taluka_id: ""
            }));
        }
    }

    const handleEdit = (vill) => {
        const filteredTaluka = talukas.filter((tal) => String(tal.dist_id) === String(vill.dist_id));
        setFilteredTalukas(filteredTaluka);

        setFormData({
            dist_id: vill.dist_id,
            taluka_id: vill.taluka_id,
            village_name: vill.village_name,
            village_name_ll: vill.village_name_ll,
        });

        setShowModal(true);
        setIsEdit(vill.id);
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
                await api.put(`/updateVillage/${isEdit}`, formData);
                Swal.fire("Success", "Villages updated successfully", "success");
            }
            else {
                await api.post('/saveVillage', formData);
                Swal.fire("Success", "Villages updated successfully", "success");
            }
            setShowModal(false);
            fetchVillages();
        }
        catch (error) {
            console.error("Error while saving / updating Village", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Village",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteVillage/${id}`);
                Swal.fire("Deleted!", "Village deleted successfully", "success");
                fetchVillages();
            }
            catch (error) {
                console.error("Error while deleting data", error);
            }
        }
    }

    const fetchDistrict = async () => {
        try {
            const res = await api.get('/districtList');
            setDistricts(res.data.message);
            console.log(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching district", error);
        }
    }

    const fetchTalukas = async () => {
        try {
            const res = await api.get('/talukaList');
            setTalukas(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching talukas", error);
        }
    }

    const fetchVillages = async (pageNumber = page, searchTerm = search) => {
        setIsLoading(true);
        try {
            const res = await api.get('/villageList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setVillages(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching village", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const addVillage = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            state_id: "",
            dist_id: "",
            taluka_id: "",
            village_name: "",
            village_name_ll: "",
            status: "",
        });
    }

    useEffect(() => {
        fetchDistrict();
        fetchTalukas();
        fetchVillages(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <GiVillage size={22} />
                        </div>
                        <div>
                            <h2>Village</h2>
                            <p>Manage list of Villages and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Village
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addVillage}>
                        <Plus size={18} />
                        <span>Add Village</span>
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
                                    <th>Village Name</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <TableLoader colSpan={7} />
                                ) : villages.length === 0 ? (
                                    <TableDataNotFound title="Village" colSpan={7} />
                                ) : (
                                    <motion.tbody>
                                        {villages.map((vill, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {vill.state}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {vill.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {vill.taluka_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {vill.village_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {vill.village_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(vill)} title="Edit District">
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(vill.id)} title="Delete District">
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
                                    <h5>{isEdit ? "Edit Village" : "Add Village"}</h5>
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
                                            <label htmlFor="taluka_id">Taluka Name</label>
                                            <select name="taluka_id" id="taluka_id" onChange={handleChange} value={formData.taluka_id} className="form-input-custom">
                                                <option value="">Select Taluka</option>
                                                {filteredTalukas.map((tal, index) => (
                                                    <option key={index} value={tal.id}>{tal.taluka_name}</option>
                                                ))}
                                            </select>
                                            {errors.taluka_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.taluka_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="village_name">Village Name</label>
                                            <input type="text" name="village_name" id="village_name" onChange={handleChange} value={formData.village_name} placeholder="Enter village name" className="form-input-custom" />
                                            {errors.village_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.village_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom">
                                            <label htmlFor="village_name_ll">Regional Name</label>
                                            <input type="text" name="village_name_ll" id="village_name_ll" onChange={handleChange} value={formData.village_name_ll} placeholder="Enter regional name" className="form-input-custom" />
                                            {errors.village_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.village_name_ll}</span>
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

export default Village;
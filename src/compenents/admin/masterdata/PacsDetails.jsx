import { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { MapPin, Search, Plus, X, AlertCircle, Edit3, Trash2 } from "lucide-react";
import { FaWarehouse } from "react-icons/fa";
import TableLoader from "../../common/TableLoader";
import Pagination from "../../common/Pagination";
import TableDataNotFound from "../../common/TableDataNotFound";
import api from "../../../services/api";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";

function PacsDetails() {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [districts, setDistricts] = useState([]);
    const [filteredTalukas, setFilteredTalukas] = useState([]);
    const [filteredVillages, setFilteredVillages] = useState([]);
    const [filteredBanks, setFilteredBanks] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [villages, setVillages] = useState([]);
    const [banks, setBanks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [pacs, setPacs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [formData, setFormData] = useState({
        dist_id: "",
        taluka_id: "",
        bank_id: "",
        branch_id: "",
        village_id: "",
        nabard_pacs_id: "",
        pacs_id: "",
        pacs_name: "",
        pacs_name_ll: "",
        ceo_name: "",
        ceo_mobile: "",
        ceo_email: "",
        status: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.dist_id) newErrors.dist_id = "District Name is required";
        if (!formData.taluka_id) newErrors.taluka_id = "Taluka Name is required";
        if (!formData.bank_id) newErrors.bank_id = "Bank Name is required";
        if (!formData.branch_id) newErrors.branch_id = "Branch Name is required";
        if (!formData.village_id.trim()) newErrors.village_id = "Village Name is required";
        if (!formData.nabard_pacs_id.trim()) newErrors.nabard_pacs_id = "Nabard PACS Id Name is required";
        if (!formData.pacs_id.trim()) newErrors.pacs_id = "PACS Id is required";
        if (!formData.pacs_name.trim()) newErrors.pacs_name = "PACS Name is required";
        if (!formData.pacs_name_ll.trim()) newErrors.pacs_name_ll = "PACS Regional Name is required";
        if (!formData.ceo_name.trim()) newErrors.ceo_name = "CEO Name is required";
        if (!formData.ceo_mobile.trim()) newErrors.ceo_mobile = "CEO Mobile is required";
        if (!formData.ceo_email.trim()) newErrors.ceo_email = "CEO Email is required";
        return newErrors;
    }

    const fetchTalukas = async () => {
        try {
            const res = await api.get('/getTaluka');
            setTalukas(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching Taluka", error);
        }
    }

    const fetchDistricts = async () => {
        try {
            const res = await api.get('/getDistrict');
            setDistricts(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching district", error);
        }
    }

    const fetchBanks = async () => {
        try {
            const res = await api.get('/getBank');
            setBanks(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching banks", error);
        }
    }

    const fetchBranches = async () => {
        try {
            const res = await api.get('/getBranch');
            setBranches(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching branch", error);
        }
    }

    const fetchVillages = async () => {
        try {
            const res = await api.get('/getVillage');
            setVillages(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching villages", error);
        }
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
            const filteredBank = banks.filter((bk) => String(bk.dist_id) === String(selectedDistrictId));
            setFilteredBanks(filteredBank);
            setFormData(prev => ({
                ...prev,
                dist_id: value,
                taluka_id: "",
                bank_id: "",
            }));
        }


        if (name === "taluka_id") {
            const selectedBranchId = value;
            const filteredBranch = branches.filter((br) => String(br.taluka_id) === String(value));
            setFilteredBranches(filteredBranch);
            setFormData(prev => ({
                ...prev,
                taluka_id: value,
                branch_id: "",
                village_id: "",
            }));
        }
    }

    const fetchPacs = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/pacsList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setPacs(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching pacs", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (pac) => {
        const filtered = talukas.filter((tal) => String(tal.dist_id) === String(pac.dist_id));
        setFilteredTalukas(filtered);

        const filteredBank = banks.filter((bk) => String(bk.dist_id) === String(pac.dist_id));
        setFilteredBanks(filteredBank);

        const filteredBranch = branches.filter((branch) => String(branch.taluka_id) === String(pac.taluka_id));
        setFilteredBranches(filteredBranch);

        setFormData({
            dist_id: pac.dist_id,
            taluka_id: pac.taluka_id,
            bank_id: pac.bank_id,
            branch_id: pac.branch_id,
            village_id: pac.village_id,
            nabard_pacs_id: pac.nabard_pacs_id,
            pacs_id: pac.pacs_id,
            pacs_name: pac.pacs_name,
            pacs_name_ll: pac.pacs_name_ll,
            ceo_name: pac.ceo_name,
            ceo_mobile: pac.ceo_mobile,
            ceo_email: pac.ceo_email,
        });
        setIsEdit(pac.id);
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
                await api.put(`/updatePacs/${isEdit}`, formData);
                Swal.fire("Success", "PACS updated successfully", "success");
            }
            else {
                await api.post('/savePacs', formData);
                Swal.fire("Success", "PACS saved successfully", "success");
            }
            setShowModal(false);
            fetchPacs();
        }
        catch (error) {
            console.error("Error while saving / updating data", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete PACS Details",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            await api.delete(`/deletePacs/${id}`);
            Swal.fire("Deleted!", "Pacs deleted successfully", "success");
            fetchPacs();
        }
        else {
            console.error("Error while deleting tasks", error);
        }
    }

    const addPacs = () => {
        setShowModal(true);
        handleReset();
        setIsEdit(false);
    }

    const handleReset = () => {
        setFormData({
            dist_id: "",
            taluka_id: "",
            bank_id: "",
            branch_id: "",
            village_id: "",
            nabard_pacs_id: "",
            pacs_id: "",
            pacs_name: "",
            pacs_name_ll: "",
            ceo_name: "",
            ceo_mobile: "",
            ceo_email: "",
            status: "",
        });
    }

    useEffect(() => {
        fetchDistricts();
        fetchTalukas();
        fetchBanks();
        fetchVillages();
        fetchBranches();
        fetchPacs(page, search);
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaWarehouse size={22} />
                        </div>
                        <div>
                            <h2>PACS Details</h2>
                            <p>Manage list of PACS Details and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                PACS Details
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addPacs}>
                        <Plus size={18} />
                        <span>Add PACS</span>
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
                                    <th>Bank Name</th>
                                    <th>Branch Name</th>
                                    <th>Village Name</th>
                                    <th>Nabard PACS Id</th>
                                    <th>PACS Id</th>
                                    <th>PACS Name</th>
                                    <th>PACS Regional Name</th>
                                    <th>PACS CEO Name</th>
                                    <th>PACS CEO Mobile</th>
                                    <th>PACS CEO Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={15} />
                                ) : pacs.length === 0 ? (
                                    <TableDataNotFound title="Pacs" colSpan={14} />
                                ) : (
                                    <motion.tbody>
                                        {pacs.map((pac, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {pac.state}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {pac.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.taluka_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.bank_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.branch_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.village_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.nabard_pacs_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.pacs_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.pacs_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {pac.pacs_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.ceo_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.ceo_mobile}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {pac.ceo_email}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(pac)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(pac.id)}>
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
                            <motion.div className="modal-dialog-custom custom-modal-xl" initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                                <div className="modal-header-custom">
                                    <h5>{isEdit ? "Edit PACS Details" : "Add PACS Details"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row px-3 py-2">
                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="dist_id">District Name</label>
                                            <select name="dist_id" id="dist_id" className="form-input-custom" value={formData.dist_id} onChange={handleChange}>
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

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="taluka_id">Taluka Name</label>
                                            <select name="taluka_id" id="taluka_id" className="form-input-custom" value={formData.taluka_id} onChange={handleChange}>
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

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="bank_id" className="">Bank</label>
                                            <select name="bank_id" id="bank_id" onChange={handleChange} value={formData.bank_id} className="form-input-custom">
                                                <option value="">Select Bank</option>
                                                {filteredBanks.map((bk, index) => (
                                                    <option key={index} value={bk.id}>{bk.bank_name}</option>
                                                ))}
                                            </select>
                                            {errors.bank_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.bank_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="branch_id" className="">Branch Name</label>
                                            <select name="branch_id" id="branch_id" onChange={handleChange} value={formData.branch_id} className="form-input-custom">
                                                <option value="">Select Branch</option>
                                                {filteredBranches.map((branch, index) => (
                                                    <option key={index} value={branch.id}>{branch.branch_name}</option>
                                                ))}
                                            </select>
                                            {errors.branch_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.branch_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="village_id" className="">Village Name</label>
                                            <input type="text" name="village_id" id="village_id" onChange={handleChange} value={formData.village_id} className="form-input-custom" />
                                            {errors.village_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.village_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="nabard_pacs_id" className="">Nabard PACS Id</label>
                                            <input type="text" name="nabard_pacs_id" id="nabard_pacs_id" onChange={handleChange} value={formData.nabard_pacs_id} className="form-input-custom" />
                                            {errors.nabard_pacs_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.nabard_pacs_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="pacs_id" className="">PACS Id</label>
                                            <input type="text" name="pacs_id" id="pacs_id" onChange={handleChange} value={formData.pacs_id} className="form-input-custom" />
                                            {errors.pacs_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.pacs_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="pacs_name" className="">PACS Name</label>
                                            <input type="text" name="pacs_name" id="pacs_name" onChange={handleChange} value={formData.pacs_name} className="form-input-custom" />
                                            {errors.pacs_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.pacs_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="pacs_name_ll" className="">PACS Regional Name</label>
                                            <input type="text" name="pacs_name_ll" id="pacs_name_ll" onChange={handleChange} value={formData.pacs_name_ll} className="form-input-custom" />
                                            {errors.pacs_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.pacs_name_ll}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="ceo_name" className="">PACS CEO Name</label>
                                            <input type="text" name="ceo_name" id="ceo_name" onChange={handleChange} value={formData.ceo_name} className="form-input-custom" />
                                            {errors.ceo_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.ceo_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="ceo_mobile" className="">PACS CEO Mobile</label>
                                            <input type="tel" name="ceo_mobile" id="ceo_mobile" onChange={handleChange} value={formData.ceo_mobile} className="form-input-custom" maxLength="10" />
                                            {errors.ceo_mobile && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.ceo_mobile}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-4">
                                            <label htmlFor="ceo_email" className="">PACS CEO Email</label>
                                            <input type="email" name="ceo_email" id="ceo_email" onChange={handleChange} value={formData.ceo_email} className="form-input-custom" readOnly={!!isEdit} />
                                            {errors.ceo_email && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.ceo_email}</span>
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
export default PacsDetails;
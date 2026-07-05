import Main from "../../layout/Main";
import { useState, useEffect } from "react";
import { MapPin, Plus, Search, X, Edit3, Trash2, AlertCircle } from "lucide-react";
import { FaCodeBranch } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../services/api";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";
import Swal from "sweetalert2";


function Branch() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [banks, setBanks] = useState([]);
    const [filteredTalukas, setFilteredTalukas] = useState([]);
    const [filteredBanks, setFilteredBanks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [errors, setErrors] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
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
        branch_name: "",
        branch_name_ll: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.dist_id) newErrors.dist_id = "District is required";
        if (!formData.taluka_id) newErrors.taluka_id = "Taluka is required";
        if (!formData.bank_id) newErrors.bank_id = "Bank is required";
        if (!formData.branch_name.trim()) newErrors.branch_name = "Branch Name is required";
        if (!formData.branch_name_ll.trim()) newErrors.branch_name_ll = "Regional Name is required";
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

            const filteredTaluka = talukas.filter(
                (tal) => String(tal.dist_id) === String(selectedDistrictId)
            );

            setFilteredTalukas(filteredTaluka);
            setFilteredBanks([]);

            setFormData(prev => ({
                ...prev,
                dist_id: value,
                taluka_id: "",
                bank_id: "",
            }));
        }

        if (name === "dist_id") {
            const selectedTalukaId = value;

            const filteredBank = banks.filter(
                (bk) => String(bk.dist_id) === String(selectedTalukaId)
            );

            setFilteredBanks(filteredBank);

            setFormData(prev => ({
                ...prev,
                taluka_id: value,
                bank_id: "",
            }));
        }
    }



    const fetchDistricts = async () => {
        try {
            const res = await api.get('/districtList');
            setDistricts(res.data.message);
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

    const fetchBanks = async () => {
        try {
            const res = await api.get('/bankList');
            setBanks(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching banks", error);
        }

    }

    const fetchBranches = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/branchList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setBranches(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching branches", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (branch) => {
        const filteredTaluka = talukas.filter((tal) => String(tal.dist_id) === String(branch.dist_id));
        const filteredBank = banks.filter((bk) => String(bk.dist_id) === String(branch.dist_id));
        setFilteredTalukas(filteredTaluka);
        setFilteredBanks(filteredBank);
        setFormData({
            dist_id: branch.dist_id,
            taluka_id: branch.taluka_id,
            bank_id: branch.bank_id,
            branch_name: branch.branch_name,
            branch_name_ll: branch.branch_name_ll,
        });
        setShowModal(true);
        setIsEdit(branch.id);
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
                await api.put(`/updateBranch/${isEdit}`, formData);
                Swal.fire("Success", "Branch updated successfully", "success");
            }
            else {
                await api.post('/saveBranch', formData);
                Swal.fire("Success", "Branch saved successfully", "success");
            }
            setShowModal(false);
            fetchBranches();
        }
        catch (error) {
            console.error("Error while saving / updating branch", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete Branch",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteBranch/${id}`);
                Swal.fire("Deleted!", "Branch deleted successfully", "success");
                fetchBranches();
            }
            catch (error) {
                console.log("Error while deleting branch", error);
            }
        }
    }

    const addBranch = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    useEffect(() => {
        fetchDistricts();
        fetchTalukas();
        fetchBanks();
        fetchBranches(page, search);
    }, [page, search]);

    const handleReset = () => {
        setFormData({
            dist_id: "",
            taluka_id: "",
            bank_id: "",
            branch_name: "",
            branch_name_ll: "",
        });
    }

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaCodeBranch size={22} />
                        </div>
                        <div>
                            <h2>Branch</h2>
                            <p>Manage list of Branches and regional names</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Branch
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addBranch}>
                        <Plus size={18} />
                        <span>Add Branch</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>District</th>
                                    <th>Bank</th>
                                    <th>Taluka</th>
                                    <th>Branch</th>
                                    <th>Regional Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={7} />
                                ) : branches.length === 0 ? (
                                    <TableDataNotFound title="Branch" colSpan={7} />
                                ) : (
                                    <motion.tbody>
                                        {branches.map((branch, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {branch.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {branch.bank_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {branch.taluka_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {branch.branch_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {branch.branch_name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(branch)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(branch.id)}>
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
                            <motion.div className="modal-dialog-custom custom-modal-lg" initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                                <div className="modal-header-custom">
                                    <h5>{isEdit ? "Edit Branch" : "Add Branch"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row px-3 py-2">
                                        <div className="form-group-custom col-md-6">
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
                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="taluka_id">Taluka Name</label>
                                            <select name="taluka_id" id="taluka_id" value={formData.taluka_id} onChange={handleChange} className="form-input-custom" >
                                                <option value="">Select Taluka</option>
                                                {filteredTalukas.map((tal) => (
                                                    <option key={tal.id} value={tal.id}>
                                                        {tal.taluka_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.taluka_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.taluka_id}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="bank_id">Bank Name</label>
                                            <select name="bank_id" id="bank_id" value={formData.bank_id} onChange={handleChange} className="form-input-custom" >
                                                <option value="">Select Bank</option>
                                                {filteredBanks.map((bk) => (
                                                    <option key={bk.id} value={bk.id}>
                                                        {bk.bank_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.bank_id && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.bank_id}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="branch_name">Branch Name</label>
                                            <input type="text" name="branch_name" id="branch_name" value={formData.branch_name} onChange={handleChange} className="form-input-custom" placeholder="Enter branch name" />
                                            {errors.branch_name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.branch_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="branch_name_ll">Regional Name</label>
                                            <input type="text" name="branch_name_ll" id="branch_name_ll" value={formData.branch_name_ll} onChange={handleChange} className="form-input-custom" placeholder="Enter regional name" />
                                            {errors.branch_name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.branch_name_ll}</span>
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
        </Main >
    );
}
export default Branch;
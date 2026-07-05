import Main from "../../layout/Main";
import { MapPin, Search, Plus, X, AlertCircle, Edit3, Trash2, ChevronDown, KeyRound } from "lucide-react";
import { FaUser, FaLock } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../services/api";
import TableLoader from "../../common/TableLoader";
import TableDataNotFound from "../../common/TableDataNotFound";
import Pagination from "../../common/Pagination";
import Swal from "sweetalert2";

function MultiSelectDropdown({ options = [], selectedIds = [], onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);


    const toggleDropdown = () => setIsOpen(prev => !prev);

    const toggleOption = (id) => {
        const idStr = String(id);
        if (selectedIds.includes(idStr)) {
            onChange(selectedIds.filter(val => val !== idStr));
        } else {
            onChange([...selectedIds, idStr]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name && opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = () => {
        onChange(options.map(opt => String(opt.id)));
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const getDisplayText = () => {
        if (selectedIds.length === 0) return placeholder;
        if (selectedIds.length <= 2) {
            const names = selectedIds.map(id => {
                const found = options.find(o => String(o.id) === String(id));
                return found ? found.name : "";
            }).filter(Boolean);
            if (names.length > 0) return names.join(", ");
        }
        return `${selectedIds.length} Selected`;
    };

    return (
        <div className="multiselect-container" ref={dropdownRef}>
            <div className={`multiselect-trigger ${isOpen ? 'active' : ''}`} onClick={toggleDropdown} >
                <span className="multiselect-trigger-text">{getDisplayText()}</span>
                <ChevronDown size={16} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {isOpen && (
                <div className="multiselect-dropdown">
                    <div className="multiselect-search-wrapper" onClick={(e) => e.stopPropagation()}>
                        <input type="text" className="multiselect-search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="multiselect-actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="multiselect-action-btn" onClick={handleSelectAll}>
                            Select All
                        </button>
                        <button type="button" className="multiselect-action-btn" onClick={handleClearAll}>
                            Clear All
                        </button>
                    </div>
                    <div className="multiselect-options-list">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center py-2 text-muted" style={{ fontSize: '12px' }}>No options found</div>
                        ) : (
                            filteredOptions.map((opt, index) => {
                                const isChecked = selectedIds.includes(String(opt.id));
                                return (
                                    <div key={index} className="multiselect-option" onClick={(e) => { e.stopPropagation(); toggleOption(opt.id); }}>
                                        <input type="checkbox" checked={isChecked} onChange={() => { }} style={{ marginRight: '8px' }} />
                                        <span>{opt.name}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function User() {
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState({});
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredPacs, setFilteredPacs] = useState([]);
    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [pacs, setPacs] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        limit: 10,
        total: 0,
    });

    // multiselect state for district
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [passwordData, setPasswordData] = useState({
        user_id: null,
        new_password: "",
        confirm_password: "",
    });

    const [formData, setFormData] = useState({
        name: "",
        name_ll: "",
        mobile: "",
        email: "",
        role: "",
        dist_id: "",
        organization: "",
        designation: "",
        society_id: "",
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Full Name is required";
        if (!formData.name_ll.trim()) newErrors.name_ll = "Regional Name is required";
        if (!formData.mobile) newErrors.mobile = "Mobile is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.role.trim()) newErrors.role = "Role is required";
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
    }

    useEffect(() => {
        if (selectedDistricts.length > 0) {
            const filtered = pacs.filter((pac) => selectedDistricts.includes(String(pac.dist_id)));
            setFilteredPacs(filtered);

            setFormData(prev => {
                const filteredIds = filtered.map(p => String(p.id));
                const isValidSelection = filteredIds.includes(String(prev.society_id));
                return {
                    ...prev,
                    society_id: isValidSelection ? prev.society_id : "",
                };
            });
        } else {
            setFilteredPacs([]);

            if (!isEdit) {
                setFormData(prev => ({ ...prev, society_id: "" }));
            }
        }
    }, [selectedDistricts, pacs]);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/getRole');
            setRoles(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching role", error);
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

    const fetchPacs = async () => {
        try {
            const res = await api.get('/getPacs');
            setPacs(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching PACS", error);
        }
    }

    const fetchOrganizations = async () => {
        try {
            const res = await api.get('/getOrganization');
            setOrganizations(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching Organizations", errors);
        }
    }

    const fetchDesignations = async () => {
        try {
            const res = await api.get('/getDesignation');
            setDesignations(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching Designations", error);
        }
    }

    const fetchUsers = async (pageNumber = 1, searchTerm = search) => {
        setLoading(true);
        try {
            const res = await api.get('/userList', {
                params: {
                    page: pageNumber,
                    search: searchTerm,
                    limit: 10,
                }
            });
            setUsers(res.data.message);
            setPagination(res.data.pagination);
        }
        catch (error) {
            console.error("Error while fetching User", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleEdit = (user) => {
        const matchedRole = roles.find(r => r.role === user.role || String(r.id) === String(user.role));
        const matchedDesignation = designations.find(
            d => d.designation === user.designation || String(d.id) === String(user.designation)
        );
        const matchedOrganization = organizations.find(
            o => o.org_name === user.organization || String(o.id) === String(user.organization)
        );

        const distIds = user.dist_id ? String(user.dist_id).split(',').filter(Boolean) : [];
        setSelectedDistricts(distIds);
        const preFilteredPacs = pacs.filter((pac) => distIds.includes(String(pac.dist_id)));
        setFilteredPacs(preFilteredPacs);

        setFormData({
            name: user.name,
            name_ll: user.name_ll,
            mobile: user.mobile,
            email: user.email,
            role: matchedRole ? String(matchedRole.id) : "",
            designation: matchedDesignation ? String(matchedDesignation.id) : "",
            organization: matchedOrganization ? String(matchedOrganization.id) : "",
            society_id: user.society_id ? String(user.society_id) : "",
            dist_id: user.dist_id || "",
        });
        setIsEdit(user.user_id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validator();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            ...formData,
            dist_id: selectedDistricts.join(','),
        };

        try {
            if (isEdit) {
                await api.put(`/updateUser/${isEdit}`, payload);
                Swal.fire("Success", "User updated successfully", "success");
                fetchUsers();
            }
            else {
                await api.post('/saveUser', payload);
                Swal.fire("Success", "User saved successfully", "success");
            }
            setShowModal(false);
            fetchUsers();
        }
        catch (error) {
            console.error("Error while saving / updating data", error);
        }
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete User",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/deleteUser/${id}`);
                Swal.fire("Deleted!", "User deleted successfully", "success");
                fetchUsers();
            }
            catch (error) {
                console.error("Error while fetching data", error);
            }
        }
    }

    const handleChangePass = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to change password!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes!'
        });

        if (result.isConfirmed) {
            setChangePasswordModal(true);
            setPasswordData({
                user_id: id.user_id,
                new_password: "",
                confirm_password: ""
            });
        }
    }

    const changePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.new_password) {
            Swal.fire("Error", "New password is required", "error");
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            Swal.fire("Error", "Passwords do not match", "error");
            return;
        }

        if (passwordData.new_password.length < 6) {
            Swal.fire("Error", "Password must be at least 6 characters", "error");
            return;
        }

        try {
            await api.post('/changeUserPassword', {
                user_id: passwordData.user_id,
                new_password: passwordData.new_password
            });
            Swal.fire("Success", "User Password changed Successfully", "success");
            setChangePasswordModal(false);
            setPasswordData({ user_id: null, new_password: "", confirm_password: "" });
        }
        catch (error) {
            console.error("Error while changing user password", error);
            Swal.fire("Error", error.response?.data?.message || "Failed to change password", "error");
        }
    }

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    }


    const addUser = () => {
        setShowModal(true);
        setIsEdit(false);
        handleReset();
    }

    const handleReset = () => {
        setFormData({
            name: "",
            name_ll: "",
            mobile: "",
            email: "",
            role: "",
            dist_id: "",
            organization: "",
            designation: "",
            society_id: "",
        });
        setSelectedDistricts([]);
    }

    useEffect(() => {
        fetchRoles();
        fetchDistricts();
        fetchUsers(page, search);
        fetchPacs();
        fetchOrganizations();
        fetchDesignations();
    }, [page, search]);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaUser size={22} />
                        </div>
                        <div>
                            <h2>User Details</h2>
                            <p>Manage list of User Details and regional names</p>
                        </div>
                    </div>

                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                User Details
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <button className="btn-add-page" onClick={addUser}>
                        <Plus size={18} />
                        <span>Add User</span>
                    </button>
                </div>

                <div className="page-table-card">
                    <div className="table-responsive-custom">
                        <table className="custom-table" style={{ width: '1800px' }}>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Full Name</th>
                                    <th>Regional Name</th>
                                    <th>Mobile</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>District</th>
                                    <th>Designation</th>
                                    <th>Organization</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableLoader colSpan={10} />
                                ) : users.length === 0 ? (
                                    <TableDataNotFound title="User" colSpan={10} />
                                ) : (
                                    <motion.tbody>
                                        {users.map((user, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{ fontWeight: 600, opacity: 0.8 }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-state">
                                                        {user.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-page">
                                                        {user.name_ll}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {user.mobile}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {user.email}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {user.dist_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-district">
                                                        {user.designation}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge-lang">
                                                        {user.org_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button className="btn-action-circle btn-edit" onClick={() => handleEdit(user)}>
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-delete" onClick={() => handleDelete(user.user_id)}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                        <button className="btn-action-circle btn-pass" onClick={() => handleChangePass(user)}>
                                                            <KeyRound size={15} />
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
                            <motion.div className="modal-dialog-custom overflow-hidden custom-modal-lg" initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                                <div className="modal-header-custom">
                                    <h5>{isEdit ? "Edit User" : "Add User"}</h5>
                                    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row px-3 py-2">
                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="name">Full Name</label>
                                            <input type="text" name="name" id="name" className="form-input-custom" onChange={handleChange} value={formData.name} placeholder="Enter Full Name" />
                                            {errors.name && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="name_ll">Regional Name</label>
                                            <input type="text" name="name_ll" id="name_ll" className="form-input-custom" onChange={handleChange} value={formData.name_ll} placeholder="Enter Regional Name" />
                                            {errors.name_ll && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.name_ll}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="mobile">Mobile</label>
                                            <input type="tel" name="mobile" id="mobile" className="form-input-custom" onChange={handleChange} value={formData.mobile} placeholder="Enter Mobile Number" />
                                            {errors.mobile && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.mobile}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="email">Email</label>
                                            <input type="email" name="email" id="email" className="form-input-custom" onChange={handleChange} value={formData.email} placeholder="Enter Email Id" />
                                            {errors.email && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-custom col-md-6">
                                            <label htmlFor="role">Role</label>
                                            <select name="role" id="role" className="form-input-custom" onChange={handleChange} value={formData.role}>
                                                <option value="">Select Roles</option>
                                                {roles.map((rol, index) => (
                                                    <option key={index} value={rol.id}>{rol.role}</option>
                                                ))}
                                            </select>
                                            {errors.role && (
                                                <div className="validation-error-text">
                                                    <AlertCircle size={13} />
                                                    <span>{errors.role}</span>
                                                </div>
                                            )}
                                        </div>

                                        {formData.role != "" && formData.role != 1 && (
                                            <div className="form-group-custom col-md-6">
                                                <label>District</label>
                                                <MultiSelectDropdown options={districts.map(d => ({ id: d.id, name: d.dist_name }))} selectedIds={selectedDistricts} onChange={setSelectedDistricts} placeholder="Select Districts" />
                                            </div>
                                        )}

                                        {formData.role == 2 && (
                                            <>
                                                <div className="form-group-custom col-md-6">
                                                    <label htmlFor="society_id">Society / PACS Name</label>
                                                    <select name="society_id" id="society_id" className="form-input-custom" onChange={handleChange} value={String(formData.society_id || "")}>
                                                        <option value="">Select Society / PACS Name</option>
                                                        {filteredPacs.map((pac, index) => (
                                                            <option key={index} value={pac.id}>{pac.pacs_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {formData.role == 5 && (
                                            <>
                                                <div className="form-group-custom col-md-6">
                                                    <label htmlFor="organization">Organization</label>
                                                    <select name="organization" id="organization" className="form-input-custom" onChange={handleChange} value={String(formData.organization || "")}>
                                                        <option value="">Select Organization</option>
                                                        {organizations.map((org, index) => (
                                                            <option key={index} value={org.id}>{org.org_name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-group-custom col-md-6">
                                                    <label htmlFor="designation">Designation</label>
                                                    <select name="designation" id="designation" className="form-input-custom" onChange={handleChange} value={String(formData.designation || "")}>
                                                        <option value="">Select Designation</option>
                                                        {designations.map((des, index) => (
                                                            <option key={index} value={des.id}>{des.designation}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}
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

                <AnimatePresence>
                    {changePasswordModal && (
                        <motion.div className="modal-backdrop-custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChangePasswordModal(false)}>
                            <motion.div className="modal-dialog-custom overflow-hidden" initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                                <div className="modal-header-custom">
                                    <h5>Change Password</h5>
                                    <button className="btn-modal-close" onClick={() => setChangePasswordModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={changePassword}>
                                    <div className="row px-3 py-2">
                                        <div className="form-group-custom col-md-12">
                                            <label htmlFor="new_password" className="form-label">New Password</label>
                                            <input type="password" name="new_password" id="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className="form-input-custom" required />
                                        </div>

                                        <div className="form-group-custom col-md-12">
                                            <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                                            <input type="password" name="confirm_password" id="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} className="form-input-custom" required />
                                        </div>
                                    </div>

                                    <div className="modal-footer-custom">
                                        <button className="btn btn-sm btn-modal-secondary" type="button" onClick={() => setChangePasswordModal(false)}>Cancel</button>
                                        <button className="btn btn-sm btn-modal-primary" type="submit">Update Password</button>
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
export default User;
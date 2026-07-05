import Main from "../../layout/Main";
import { Search, Plus, AlertCircle, Ticket } from "lucide-react";
import { FaCodeBranch, } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { CKEditor } from "ckeditor4-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function CreateTicket() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [errors, setErrors] = useState({});
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [modules, setModules] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const editorInstance = useRef(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        branch_id: "",
        pacs_code: "",
        pacs_name: "",
        product_id: "",
        product_name: "",
        module_id: "",
        module_name: "",
        task_id: "",
        task_name: "",
        subject: "",
        description: "",
        files: [],
    });

    const validator = () => {
        const newErrors = {};
        if (!formData.branch_id) newErrors.branch_id = "Branch Name is required";
        if (!formData.pacs_code.trim()) newErrors.pacs_code = "PACS Code is required";
        if (!formData.pacs_name.trim()) newErrors.pacs_name = "PACS Name is required";
        if (!formData.product_id) newErrors.product_id = "Product is required";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        return newErrors;
    }

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === "file") {
            setFormData(prev => ({ ...prev, files: e.target.files }));
            return;
        }

        if (name === "branch_id") {
            const selectedBranch = branches.find(
                (branch) => branch.id === parseInt(value)
            );

            if (selectedBranch) {
                try {
                    const res = await api.get(`/getPacsById/${selectedBranch.id}`);
                    const pacsData = res.data.message;

                    setFormData((prev) => ({
                        ...prev,
                        branch_id: value,
                        pacs_code: pacsData.pacs_id,
                        pacs_name: pacsData.pacs_name,
                    }));

                    let htmlTable = "<table border='1' style='width:80%;border-collapse:collapse;'>";
                    htmlTable += "<tr><th>DCCB</th><td>-------</td></tr>";
                    htmlTable += "<tr><th>District</th><td>" + (pacsData.dist_name || "-------") + "</td></tr>";
                    htmlTable += "<tr><th>URL</th><td>---------</td></tr>";
                    htmlTable += "<tr><th>Pacs ID</th><td>" + pacsData.pacs_id + "</td></tr>";
                    htmlTable += "<tr><th>Pacs Name</th><td>" + pacsData.pacs_name + "</td></tr>";
                    htmlTable += "<tr><th>Password (if Changes)</th><td>---------</td></tr>";
                    htmlTable += "<tr><th>Pacs Branch Id (if issue Branch)</th><td>---------</td></tr>";
                    htmlTable += "<tr><th>Pacs Branch Id Password</th><td>---------</td></tr>";
                    htmlTable += "<tr><th>Login Date</th><td>---------</td></tr>";
                    htmlTable += "</table><br>";
                    htmlTable += "<div>* Issue Details (Description): --------------</div>";

                    if (editorInstance.current) {
                        editorInstance.current.setData(htmlTable);
                    }
                } catch (error) {
                    console.error("Error fetching PACS details", error);
                }
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        if (name === "product_id") {
            const selectedProductId = value;
            const filtered = modules.filter((mod) => String(mod.product_id) === String(selectedProductId));
            setFilteredModules(filtered);
            setFormData(prev => ({
                ...prev,
                product_id: value,
                module_id: "",
                task_id: "",
            }));
            return;
        }

        if (name === "module_id") {
            const selectedModuleId = value;
            const filteredTask = tasks.filter((tsk) => String(tsk.module_id) === String(selectedModuleId));
            setFilteredTasks(filteredTask);
            setFormData(prev => ({
                ...prev,
                module_id: value,
                task_id: "",
            }));
            return;
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await api.get('/getTask');
            setTasks(res.data.message);
        }
        catch (error) {
            console.error("Error while fetching Tasks", error);
        }
    }

    const fetchBranches = async () => {
        try {
            const res = await api.get('/getSocitySectionId');
            setBranches(res.data.message);
            const secId = (res.data.message[0].id);
        }
        catch (error) {
            console.error("Error while fetching branches", error);
        }
    }

    const fetchProducts = async () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validator();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const payload = new FormData();
            payload.append("branch_id", formData.branch_id);
            payload.append("pacs_code", formData.pacs_code);
            payload.append("pacs_name", formData.pacs_name);
            payload.append("product_id", formData.product_id);
            payload.append("module_id", formData.module_id);
            payload.append("task_id", formData.task_id);
            payload.append("subject", formData.subject);
            payload.append("description", formData.description);

            if (formData.files) {
                Array.from(formData.files).forEach(f => {
                    payload.append("file[]", f);
                });
            }
            await api.post('/saveTicket', payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            Swal.fire("Success", "Ticket Created Successfully", "success");
            navigate('/open-ticket');
        } catch (error) {
            console.error("Error while creating data", error);
        }
    }

    useEffect(() => {
        fetchProducts();
        fetchBranches();
        fetchTasks();
        fetchModules();
    }, []);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <Ticket size={22} />
                        </div>
                        <div>
                            <h2>Create Ticket</h2>
                            <p>Manage list of Created Tickets</p>
                        </div>
                    </div>
                    <div>
                        <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                            <li className="breadcrumb-item">
                                <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Master Data</span>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                Create Ticket
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="page-controls-row">
                    <div className="search-input-wrapper">
                        <Search className="search-input-icon" size={18} />
                        <input type="text" className="search-input-field" placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    {/* <button className="btn-add-page" onClick={createTicket}>
                        <Plus size={18} />
                        <span>Create Ticket</span>
                    </button> */}
                </div>

                <div className="page-header-card d-block">
                    <form onSubmit={handleSubmit}>
                        <div className="row d-flex px-3 py-2">
                            <div className="form-group-custom col-md-4">
                                <label htmlFor="name">Requester</label>
                                <input type="text" name="name" id="name" className="form-input-custom disabled text-muted" onChange={handleChange} value={user?.name || ""} disabled />

                                {errors.name && (
                                    <div className="validation-error-text">
                                        <AlertCircle size={13} />
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-custom col-md-4">
                                <label htmlFor="branch_id">APEX/DCCB Branch Name </label>
                                <select name="branch_id" id="branch_id" onChange={handleChange} value={formData.branch_id} className="form-input-custom" placeholder="Select Branch">
                                    <option value="">Select Branch Name</option>
                                    {branches.map((branch, index) => (
                                        <option value={branch.id} key={index}>{branch.branch_name + "-" + branch.pacs_name}</option>
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
                                <label htmlFor="pacs_code">PACS Code</label>
                                <input type="text" name="pacs_code" id="pacs_code" className="form-input-custom" onChange={handleChange} value={formData.pacs_code} />
                                {errors.pacs_code && (
                                    <div className="validation-error-text">
                                        <AlertCircle size={13} />
                                        <span>{errors.pacs_code}</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-custom col-md-4">
                                <label htmlFor="pacs_name">PACS Name</label>
                                <input type="text" name="pacs_name" id="pacs_name" className="form-input-custom" onChange={handleChange} value={formData.pacs_name} />
                                {errors.pacs_name && (
                                    <div className="validation-error-text">
                                        <AlertCircle size={13} />
                                        <span>{errors.pacs_name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-custom col-md-4">
                                <label htmlFor="product_id">Product</label>
                                <select name="product_id" id="product_id" className="form-input-custom" onChange={handleChange} value={formData.product_id}>
                                    <option value="">Select Product</option>
                                    {products.map((pro, index) => (
                                        <option value={pro.id} key={index}>{pro.product_name}</option>
                                    ))}
                                </select>
                                {errors.product_id && (
                                    <div className="validation-error-text">
                                        <AlertCircle size={13} />
                                        <span>{errors.product_id}</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-custom col-md-4">
                                <label htmlFor="module_id">Module</label>
                                <select name="module_id" id="module_id" className="form-input-custom" onChange={handleChange} value={formData.module_id}>
                                    <option value="">Select Module</option>
                                    {filteredModules.map((mod, index) => (
                                        <option key={index} value={mod.id}>{mod.module_name}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.module_id && (
                                <div className="form-group-custom col-md-4">
                                    <label htmlFor="task_id">Task</label>
                                    <select name="task_id" id="task_id" className="form-input-custom" onChange={handleChange} value={formData.task_id}>
                                        <option value="">Select Task</option>
                                        {filteredTasks.map((tsk, index) => (
                                            <option value={tsk.id} key={index}>{tsk.task_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group-custom col-md-4">
                                <label htmlFor="subject">Subject</label>
                                <input type="text" name="subject" id="subject" className="form-input-custom" onChange={handleChange} value={formData.subject} />
                                {errors.subject && (
                                    <div className="validation-error-text">
                                        <AlertCircle size={13} />
                                        <span>{errors.subject}</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-custom col-md-12">
                                <label htmlFor="description">Discription</label>
                                {/* <CKEditor
                                    editorUrl="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js"
                                    config={{
                                        versionCheck: false
                                    }}
                                /> */}

                                <CKEditor
                                    editorUrl="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js"
                                    config={{
                                        versionCheck: false
                                    }}
                                    onInstanceReady={(e) => {
                                        editorInstance.current = e.editor;
                                    }}
                                    onChange={(e) => {
                                        const data = e.editor.getData();
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: data,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="form-group-custom col-md-4">
                                <label htmlFor="file">File</label>
                                <input type="file" name="file" onChange={handleChange} className="form-input-custom" />
                                {errors.file && (
                                    <div className="validation-error-text">
                                        <AlertCircle size={13} />
                                        <span>{errors.file}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-end gap-2 ticket-form">
                            <button type="button" className="btn-modal-secondary" onClick={() => setShowModal(false)}> Cancel</button>
                            <button type="submit" className="btn-modal-primary">Create Ticket</button>
                        </div>
                    </form>
                </div>
            </div>
        </Main>
    );
}
export default CreateTicket;
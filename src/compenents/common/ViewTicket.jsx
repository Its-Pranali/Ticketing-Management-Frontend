import Main from "../layout/Main";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Reply, Forward, X } from "lucide-react";
import api from "../../services/api";
import { FaRegCalendarAlt, FaUserCircle, FaCheckCircle, FaPaperclip } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { CKEditor } from "ckeditor4-react";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";

function ViewTicket() {
    const FILE_BASE_URL = "https://ticketing-management-backend.onrender.com/public/uploads/";
    const { id } = useParams();
    const [tickets, setTickets] = useState([]);
    const [ticketReply, setTicketReply] = useState(null);
    const [showReplyEditor, setShowReplyEditor] = useState(false);
    const [showForwardTicket, setShowForwardTicket] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();
    // console.log(user?.role, "Role");
    // console.log(user?.status, "Status");
    // console.log(user, "User");
    const [l2Tickets, setL2Tickets] = useState([]);
    const [activePanel, setActivePanel] = useState(null);
    const [ticketStatus, setTicketStatus] = useState(null);
    const [formData, setFormData] = useState({
        upload_file: "",
        status: "",
        description: "",
        forward_to: "",
    });

    const navigate = useNavigate();
    const userRole = user?.role;

    if (user) {
        const userRole = user.role;
        // console.log(userRole, "role");
    }

    const fetchTicket = async () => {
        try {
            const res = await api.get(`getTicketById/${id}`);
            setTickets(res.data.message);
            setTicketReply(res.data.message.replies?.[0] || null);
            // const ticketReply = res.data.message.replies?.[0];
            const ticketRole = res.data.message;
            setTicketStatus(res.data.message.status);
            // console.log(ticketRole.status, "Status");
            // console.log(typeof (user));
            // console.log(user?.role_name);
        }
        catch (error) {
            console.error("Error while fetching tickets", error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // useEffect(() => {
    //     if (user) {
    //         console.log(user.role_name);
    //     }
    // }, [user]);

    const fetchL2 = async (role) => {
        try {
            const res = await api.get(`/getUserByRoleId/${role}`);
            setL2Tickets(res.data.message);
            const ticketRole = res.data.message;
            // console.log(ticketReply, "Status");
            const ticketRes = res.data.message?.[0];
            // console.log(ticketRes.role,"Role");
            // console.log(ticketRes.status,"Status");
        }
        catch (error) {
            console.error("Error while fetching l2", error);
        }
    }

    const handleSubmit = async () => {
        try {
            await api.post('');
        }
        catch (error) {
            console.error("Error while Forwarding ticket to NLPSV", error);
        }
    }

    const addForwarded = () => {
        setShowModal(true);
    }

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        fetchL2(4);
    }, []);

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!formData.description) return Swal.fire("Error", "Please enter a description", "error");
        if (!formData.status) return Swal.fire("Error", "Please select a status", "error");

        try {
            const payload = new FormData();
            payload.append('ticket_id', tickets.ticket_id);
            payload.append('description', formData.description);
            payload.append('new_description', formData.description);
            payload.append('status', formData.status);
            if (formData.upload_file?.[0]) {
                payload.append('upload_file', formData.upload_file[0]);
            }

            const res = await api.post('getTicketReply', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.status) {
                Swal.fire("Success", "Reply submitted successfully!", "success");
                setActivePanel(null);
                setFormData({ upload_file: "", status: "", description: "", forward_to: "" });
                fetchTicket();
                navigate('/open-ticket');
            } else {
                Swal.fire("Error", res.data?.message || "Something went wrong", "error");
            }
        } catch (err) {
            console.error('Reply error', err);
            Swal.fire("Error", "Failed to submit reply", "error");
        }
    };

    const handleForwardSubmit = async (e) => {
        e.preventDefault();
        const forwardData = {
            forward_to: formData.forward_to,
            ticket_subject: tickets.subject,
            ticket_id: tickets.ticket_id,
            pacs_code: tickets.pacs_code,
            pacs_name: tickets.pacs_name,
            ticket_description: tickets.description,
            productName: tickets.product_name,
            moduleName: tickets.module_name,
            taskName: tickets.task_name,
            product_column_name: tickets.product_column_name,
            module_column_name: tickets.module_column_name,
            task_column_name: tickets.task_column_name,
            ticket_filename: tickets.file_path || '',
            old_description: tickets.description,
            new_description: formData.description,
        };
        try {
            const res = await api.post('ticketForwareded', forwardData);
            if (res.data && res.data.status) {
                Swal.fire("Success", "Ticket Successfully forwarded to NLPSV", "success");
                navigate('/open-ticket');
            } else {
                alert('Error while forwarding ticket');
            }
        } catch (err) {
            console.error('Forward error', err);
            alert('Failed to forward ticket');
        }
    };

    // Generic change handler for inputs (status radios, forward select)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    return (
        <Main>
            {tickets && (
                <div className="page-container">
                    <div className="page-header-card">
                        <div className="page-title-area">
                            <div className="page-title-icon">
                                <Eye size={22} />
                            </div>
                            <div>
                                <h2>View Ticket</h2>
                                <p>Manage list of View Tickets and details</p>
                            </div>
                        </div>
                        <div>
                            <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                                <li className="breadcrumb-item">
                                    <span style={{ opacity: 0.7, color: 'var(--dist-text-secondary)' }}>Ticket Details</span>
                                </li>
                                <li className="breadcrumb-item active" style={{ color: '#9244f2', fontWeight: 600 }}>
                                    View Ticket
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className="card px-3 py-4" style={{ backgroundColor: 'var(--dist-bg-card)', borderColor: 'var(--dist-border-color)', color: 'var(--dist-text-primary)' }}>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="d-flex gap-2 align-items-center">
                                    <span>#{tickets.ticket_id}</span>
                                    <div className="badge-state">{tickets.sts_name}</div>
                                </div>
                                <div>
                                    <h2 className="view-title mb-1">{tickets.subject}</h2>
                                </div>
                                <div className="text-muted d-flex gap-2 align-items-center">
                                    <FaRegCalendarAlt />Submitted on {tickets.created_at}
                                </div>
                            </div>

                            <hr className="mt-3" />

                            <div className="p-4">
                                <div className="row g-3">
                                    <div className="col-6 col-md-3 border-end-custom mt-0">
                                        <div className="meta-block">
                                            <label>Requester</label>
                                            <div className="value d-flex align-items-center gap-2">
                                                <FaUserCircle className="text-secondary opacity-50" /> {tickets.user_name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3 border-end-custom mt-0">
                                        <div className="meta-block">
                                            <label>Mobile</label>
                                            <div className="value">{tickets.mobile || "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3 border-end-custom mt-0">
                                        <div className="meta-block">
                                            <label>District</label>
                                            <div className="value">{tickets.dist_name || "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3 mt-0">
                                        <div className="meta-block">
                                            <label>PACS Name (Code)</label>
                                            <div className="value text-truncate" title={`${tickets.pacs_name} (${tickets.pacs_code})`}>
                                                {tickets.pacs_name || "N/A"} <span className="text-muted small">({tickets.pacs_code})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr className="my-4 opacity-10" />
                                <div className="row g-3">
                                    <div className="col-6 col-md-4 border-end-custom mt-0">
                                        <div className="meta-block">
                                            <label>Product Configuration</label>
                                            <div className="value-secondary">{tickets.product_name || "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4 border-end-custom mt-0">
                                        <div className="meta-block">
                                            <label>Module Assigned</label>
                                            <div className="value-secondary">{tickets.module_name || "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4 mt-0">
                                        <div className="meta-block">
                                            <label>Target Task</label>
                                            <div className="value-secondary">{tickets.task_name || "N/A"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-3" style={{ backgroundColor: 'var(--dist-bg-card)', borderColor: 'var(--dist-border-color)', color: 'var(--dist-text-primary)' }}>
                        <div className="row">
                            <div className="col-md-12">
                                <h5 className="section-title">Discussion History</h5>
                                <div className="timeline-container">
                                    <div className="timeline-item">
                                        <div className="timeline-marker initial">
                                            <div className="marker-dot"></div>
                                        </div>
                                        <div className="timeline-content-card shadow-sm">
                                            <div className="card-header-simple d-flex justify-content-between align-items-center">
                                                <span className="fw-bold fs-6" style={{ color: 'var(--dist-text-primary)' }}>Ticket Created by {tickets.user_name}</span>
                                                <span className="timestamp">{formatDate(tickets.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {ticketReply && (
                                        <div className="timeline-item">
                                            <div className={`timeline-marker ${ticketReply.role === 1 ? 'admin' : 'reply'}`}>
                                                <div className="marker-dot"></div>
                                            </div>
                                            <div className="timeline-content-card shadow-sm">
                                                <div className="card-header-simple d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <span className="fw-bold fs-6 me-2" style={{ color: 'var(--dist-text-primary)' }}>{ticketReply.user_name || "Staff User"}</span>
                                                        {ticketReply.role === 1 && <span className="badge-custom-admin">Staff</span>}
                                                    </div>
                                                    <span className="timestamp">{formatDate(ticketReply.created_at)}</span>
                                                </div>
                                                <div className="p-3" style={{ backgroundColor: 'var(--dist-bg-card)' }}>
                                                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: ticketReply.ticket_details }} />

                                                    {/* Attachments Block */}
                                                    {/* {ticketReply.file_path && ticketReply.file_path.length > 0 && (
                                                        <div className="mt-3 pt-3 border-top">
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {ticketReply.file_path.map((file, fIdx) => (
                                                                    <a key={fIdx} href={`${FILE_BASE_URL}${file}`} target="_blank" rel="noopener noreferrer" className="attachment-link" >
                                                                        <FaPaperclip size={12} />
                                                                        <span>View File {fIdx + 1}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )} */}

                                                    {ticketReply?.file_path && (
                                                        <div className="mt-3 pt-3 border-top">
                                                            <a href={`${FILE_BASE_URL}${ticketReply.file_path}`} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                                                <FaPaperclip size={14} className="me-1" />
                                                                View Attachment
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="timeline-item final mb-0">
                                        <div className="timeline-marker status-update">
                                            <FaCheckCircle className="text-success" style={{ zIndex: 5, backgroundColor: 'var(--dist-bg-card)' }} />
                                        </div>
                                        <div className="timeline-status-text ps-4 py-2">
                                            Ticket is currently <span className="fw-bold" style={{ color: 'var(--dist-text-primary)' }}>{tickets.sts_name}</span>.
                                        </div>
                                    </div>

                                    {user?.role === 3 && (
                                        <>
                                            <div className="d-flex gap-2 justify-content-end align-items-center py-2">
                                                <button className="btn btn-sm btn-primary d-flex gap-2 align-items-center" type="button" onClick={() => setActivePanel(activePanel === 'reply' ? null : 'reply')}>Ticket Reply<Reply size={20} /></button>
                                                <button className="btn btn-sm btn-secondary d-flex gap-2 align-items-center" type="button" onClick={() => setActivePanel(activePanel === 'forward' ? null : 'forward')}>Forward Ticket L2<Forward size={20} /></button>
                                            </div>

                                            {activePanel === 'reply' && (
                                                <div className="timeline-content-card shadow-sm">
                                                    <div className="p-3" style={{ backgroundColor: "var(--dist-bg-card)" }}>
                                                        <form onSubmit={handleReplySubmit}>
                                                            <div className="row">
                                                                <div className="col-md-12 form-group-custom">
                                                                    <CKEditor
                                                                        data={formData.description}
                                                                        onChange={(event) => {
                                                                            const data = event.editor.getData();
                                                                            setFormData({ ...formData, description: data });
                                                                        }}
                                                                        editorUrl="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js"
                                                                        config={{
                                                                            versionCheck: false
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="col-md-4 form-group-custom">
                                                                    <label htmlFor="file">File</label>
                                                                    <input type="file" name="upload_file" id="upload_file" className="form-input-custom" onChange={(e) => setFormData({ ...formData, upload_file: e.target.files })} />
                                                                </div>

                                                                <div className="col-md-4 form-group-custom">
                                                                    <label htmlFor="status">Status</label>
                                                                    <select name="status" id="status" className="form-input-custom" value={formData.status} onChange={handleChange}>
                                                                        <option value="">Select Status</option>
                                                                        <option value="2">Inprogress</option>
                                                                        <option value="4">Close</option>
                                                                    </select>
                                                                    {/* <div className="d-flex gap-2 align-items-center">
                                                                        <input type="radio" id="inprogress" name="status" value="2" onChange={handleChange} />
                                                                        <label htmlFor="inprogress">In-Progress</label>
                                                                    </div>
                                                                    <div className="d-flex gap-2 align-items-center">
                                                                        <input type="radio" id="closed" name="status" value="4" onChange={handleChange} />
                                                                        <label htmlFor="closed">Closed</label>
                                                                    </div> */}
                                                                </div>

                                                                <hr className="my-3" />

                                                                <div className="d-flex gap-2 justify-content-end">
                                                                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => navigate('/open-ticket')} >Back</button>
                                                                    <button className="btn btn-sm btn-primary" type="submit">Save</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}

                                            {activePanel === 'forward' && (
                                                <div className="timeline-content-card shadow-sm">
                                                    <div className="p-3" style={{ backgroundColor: "var(--dist-bg-card)" }}>
                                                        <form onSubmit={handleForwardSubmit}>
                                                            <div className="row mt-2 px-2">
                                                                <div className="col-md-4 form-group-custom">
                                                                    <select name="forward_to" id="forward_to" className="form-input-custom" onChange={handleChange}>
                                                                        <option value="">Select L2</option>
                                                                        {l2Tickets.map((l2, index) => (
                                                                            <option key={index} value={l2.user_id}>{l2.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <hr className="my-3" />
                                                                <div className="d-flex justify-content-end gap-2">
                                                                    <button className="btn btn-sm btn-secondary" onClick={() => navigate('/open-ticket')} type="button">Back</button>
                                                                    <button className="btn btn-sm btn-primary" type="submit">Save</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* {user.role === 4 && user.status === 5 && ( */}
                                    {userRole === 4 && ticketStatus === 5 && (
                                        <>
                                            <div className="d-flex justify-content-end gap-2 align-items-center">
                                                <button className="btn btn-sm btn-secondary" type="button" onClick={() => setActivePanel(activePanel === 'reply' ? null : 'reply')}>Ticket Reply</button>
                                                <button className="btn btn-sm btn-primary" type="button" onClick={addForwarded}>Forward Ticket</button>
                                            </div>

                                            {activePanel === 'reply' && (
                                                <div className="timeline-content-card shadow-sm">
                                                    <div className="p-3" style={{ backgroundColor: "var(--dist-bg-card)" }}>
                                                        <form onSubmit={handleReplySubmit}>
                                                            <div className="row">
                                                                <div className="col-md-12 form-group-custom">
                                                                    <CKEditor data={formData.description} onChange={(event) => { const data = event.editor.getData(); setFormData({ ...formData, description: data }); }} editorUrl="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js" config={{ versionCheck: false }} />
                                                                </div>

                                                                <div className="col-md-4 form-group-custom">
                                                                    <label htmlFor="file">File</label>
                                                                    <input type="file" name="upload_file" id="upload_file" className="form-input-custom" onChange={(e) => setFormData({ ...formData, upload_file: e.target.files })} />
                                                                </div>

                                                                <div className="col-md-4 form-group-custom">
                                                                    <label htmlFor="status">Status</label>
                                                                    <select name="status" id="status" className="form-input-custom" value={formData.status} onChange={handleChange}>
                                                                        <option value="">Select Status</option>
                                                                        <option value="2">Inprogress</option>
                                                                        <option value="4">Close</option>
                                                                    </select>
                                                                    {/* <div className="d-flex gap-2 align-items-center">
                                                                        <input type="radio" id="inprogress" name="status" value="2" onChange={handleChange} />
                                                                        <label htmlFor="inprogress">In-Progress</label>
                                                                    </div>
                                                                    <div className="d-flex gap-2 align-items-center">
                                                                        <input type="radio" id="closed" name="status" value="4" onChange={handleChange} />
                                                                        <label htmlFor="closed">Closed</label>
                                                                    </div> */}
                                                                </div>

                                                                <hr className="my-3" />

                                                                <div className="d-flex gap-2 justify-content-end">
                                                                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => navigate('/open-ticket')} >Back</button>
                                                                    <button className="btn btn-sm btn-primary" type="submit">Save</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                    <AnimatePresence>
                        {showModal && (
                            <motion.div className="modal-backdrop-custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} style={{ height: '100%', overflowY: 'scroll' }}>
                                <motion.div className="modal-dialog-custom custom-modal-xl" style={{ position: 'relative', top: '15%' }} initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} >
                                    <div className="modal-header-custom">
                                        <h5>Ticket Description</h5>
                                        <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <form onClick={handleSubmit}>
                                        <div className="modal-body-custom">
                                            <div className="row">
                                                <div className="col-md-12 form-group-custom">
                                                    <label htmlFor="old_description">Old Description</label>
                                                    <CKEditor data={formData.description} onChange={(event) => { const data = event.editor.getData(); setFormData({ ...formData, description: data }); }} editorUrl="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js" config={{ versionCheck: false }} />
                                                </div>

                                                <div className="col-md-12 form-group-custom">
                                                    <label htmlFor="new_description">New Description</label>
                                                    <CKEditor data={formData.description} onChange={(event) => { const data = event.editor.getData(); setFormData({ ...formData, description: data }); }} editorUrl="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js" config={{ versionCheck: false }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal-footer-custom">
                                            <button className="btn btn-sm btn-secondary" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                            <button className="btn btn-sm btn-primary d-flex gap-2 align-items-center" type="submit">Forward Ticket<Forward size={20} /></button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >
            )}
        </Main >
    );
}

export default ViewTicket;
import Main from "../layout/Main";
import { FaUserShield } from "react-icons/fa";
// import "../../../public/assets/images/user_icon.png"
import { useAuth } from "../../context/AuthContext";

function Profile() {
    const { user } = useAuth();
    console.log("User", user);

    return (
        <Main>
            <div className="page-container">
                <div className="page-header-card">
                    <div className="page-title-area">
                        <div className="page-title-icon">
                            <FaUserShield size={22} />
                        </div>
                        <div>
                            <h2>View Profile</h2>
                            <p>Manage list of Roles and regional names</p>
                        </div>
                    </div>
                    <hr />
                </div>
                <div className="card p-3" style={{ backgroundColor: 'var(--dist-bg-card)', borderColor: 'var(--dist-border-color)', color: 'var(--dist-text-primary)' }}>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="">
                                <img src="../../../public/assets/images/user_icon.png" alt="" />
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div>
                                <h2>{user?.name}</h2>
                                <div className="d-flex gap-2">
                                    <div>
                                        <p className="text-muted">Designation</p>
                                        <p>{user?.designation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}
export default Profile;
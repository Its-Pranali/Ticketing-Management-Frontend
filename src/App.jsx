
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Login from './compenents/Login';
import Main from './compenents/layout/Main';
import Dashboard from './compenents/Dashboard';
import District from './compenents/admin/masterdata/District';
import Taluka from './compenents/admin/masterdata/Taluka';
import Bank from './compenents/admin/masterdata/Bank';
import Village from './compenents/admin/masterdata/Village';
import Branch from './compenents/admin/masterdata/Branch';
import Organization from './compenents/admin/masterdata/Organization';
import Designation from './compenents/admin/masterdata/Designation';
import Product from './compenents/admin/masterdata/Product';
import Module from './compenents/admin/masterdata/Module';
import Task from './compenents/admin/masterdata/Task';
import PacsDetails from './compenents/admin/masterdata/PacsDetails';
import OpenTicket from './compenents/admin/ticketdetails/OpenTicket';
import User from './compenents/admin/masterdata/User';
import Role from './compenents/admin/masterdata/Role';
import ClosedTicket from './compenents/admin/ticketdetails/ClosedTicket';
import AllTickets from './compenents/admin/ticketdetails/AllTickets';
import InProgressTicket from './compenents/admin/ticketdetails/InProgressTicket';
import ViewTicket from './compenents/common/ViewTicket';
import ForwardedTicket from './compenents/admin/ticketdetails/ForwardedTicket';
import ForwardedToNLPSV from './compenents/admin/ticketdetails/ForwardedToNLPSV.jsx';
import DistrictWiseReport from './compenents/admin/ticketreports/DistrictwiseReport.jsx';
import ProductwiseReport from './compenents/admin/ticketreports/ProductwiseReport.jsx';
import CreateTicket from './compenents/admin/masterdata/CreateTicket.jsx';
import Profile from './compenents/common/ProfilePage.jsx';

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/district" element={<District />} />
            <Route path="/taluka" element={<Taluka />} />
            <Route path="/bank" element={<Bank />} />
            <Route path="/village" element={<Village />} />
            <Route path="/branch" element={<Branch />} />
            <Route path="/organization" element={<Organization />} />
            <Route path="/designation" element={<Designation />} />
            <Route path="/product" element={<Product />} />
            <Route path="/module" element={<Module />} />
            <Route path="/task" element={<Task />} />
            <Route path="/pacs-details" element={<PacsDetails />} />
            <Route path="/open-ticket" element={<OpenTicket />} />
            <Route path="/user" element={<User />} />
            <Route path="/role" element={<Role />} />
            <Route path="/closed-ticket" element={<ClosedTicket />} />
            <Route path="/all-tickets" element={<AllTickets />} />
            <Route path="/inprogress-tickets" element={<InProgressTicket />} />
            <Route path="/forwarded-tickets" element={<ForwardedTicket />} />
            <Route path="/forwarded-nlpsv-tickets" element={<ForwardedToNLPSV />} />
            <Route path="/view-ticket/:id" element={<ViewTicket />} />
            <Route path="/distwise-report" element={<DistrictWiseReport />} />
            <Route path="/prowise-report" element={<ProductwiseReport />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App;

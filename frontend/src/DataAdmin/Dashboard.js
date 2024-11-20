import React, { useEffect, useState } from 'react';
import '../css/style.css';
import Header from '../BG/DataAdminHeader';
import Sidebar from '../BG/DataAdminSidebar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";

function Dashboard() {
    return (
        <div className="container1">
            <Sidebar />
            <Header />
        </div>
    );
}

export default Dashboard;

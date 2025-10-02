import React, { useEffect, useState } from "react";

// ---ICONS---
import Dashboard from "../assets/dashboard.png";
import Tests from "../assets/tests.png";
import Patients from "../assets/patients.png";
import Reports from "../assets/reports.png";
import TestType from "../assets/test-type.png";

// ---LOGO---
import Logo from "../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [path, setPath] = useState("/");

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (currentPath === "/") {
      setPath("dashboard");
    } else if (currentPath === "/tests") {
      setPath("tests");
    } else if (currentPath === "/patients") {
      setPath("patients");
    } else if (currentPath === "/reports") {
      setPath("reports");
    } else if (currentPath === "/test-types") {
      setPath("test-types");
    }
  }, [currentPath]); // Add currentPath as a dependency to re-run when the path changes

  return (
    <div className="sidebar">
      <div className="logo-container d-flex align-items-center justify-content-between mt-4">
        <img src={Logo} alt="Logo" className="logo" />
        <h5>AL-Madina Lab</h5>
      </div>

      <div className="nav-links ms-3">
        <div
          className={`dashboard link ${path === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <img src={Dashboard} className="ms-3"/>
          <Link to="/" className="ms-3">Dashboard</Link>
        </div>


        <div
          className={`patients link ${path === "patients" ? "active" : ""}`}
          // style={{ paddingLeft: "17px" }}
          onClick={() => navigate("/patients")}
        >
          <img src={Patients} className="ms-3"/>

          <Link to="/patients" className="ms-3">Patients</Link>
        </div>

        <div
          className={`reports link ${path === "reports" ? "active" : ""}`}
          // style={{ paddingLeft: "14px" }}
          onClick={() => navigate("/reports")}
        >
          <img src={Reports} className="ms-3"/>

          <Link to="/reports" className="ms-3">Reports</Link>
        </div>

        <div
          className={`test-type link ${path === "test-types" ? "active" : ""}`}
          // style={{ paddingLeft: "23px" }}
          onClick={() => navigate("/test-types")}
        >
          <img src={TestType} className="ms-3"/>

          <Link to="/test-types" className="ms-3">Test Type</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ---PAGES---
import Login from "./Pages/login";
import Home from "./Pages/home";
import Patients from "./Pages/patients";
import AddNewTest from "./Pages/addNewTest";
import Reports from "./Pages/reports";
import TestType from "./Pages/testType";
import AddNewTestType from "./Pages/addNewTestType";
import BloodTest from "./Pages/BloodTest";
import EditPatient from "./Pages/editPatient";
import EditTestType from "./Pages/editTestType.jsx";

// ---STYLE FILES---
import "./Style/default.css";
import "./Style/media.css";
import "./Style/login.css";
import "./Style/navbar.css";
import "./Style/home.css";
import "./Style/sidebar.css";
import "./Style/patients.css";
import "./Style/test-type.css";
import "./Style/reports.css";
import "./Style/finalReport.css";
import "./Style/editPatient.css";
import "./Style/editTestType.css";

// ---PRIVATE COMPONENTS---
import PrivateComponent from "./Components/PrivateComponent";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route path="/" element={<PrivateComponent />}>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="patients/add-new-test" element={<AddNewTest />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/test-types" element={<TestType />} />
          <Route
            path="test-types/add-new-test-type"
            element={<AddNewTestType />}
          />
          <Route path="patients/edit-patient/:id" element={<EditPatient />} />
          <Route path="/test-types/edit/:id" element={<EditTestType />} />

          {/* ---REPORTS--- */}
          <Route path="/get-report" element={<BloodTest />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

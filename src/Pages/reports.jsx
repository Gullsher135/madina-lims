import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { IoSearch } from "react-icons/io5";
import { VscKebabVertical } from "react-icons/vsc";
import { IoIosClose } from "react-icons/io";
import Success from "../assets/success.png";
import { useLocation, useNavigate } from "react-router-dom";

const Reports = () => {
  const [showActionsIndex, setShowActionsIndex] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.showSuccessMessage) {
      setShowSuccessMessage(true);
      navigate("/patients", { replace: true, state: {} });
    }

    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:80/madina_api/fetch_patients.php"
        );
        const data = await response.json();
        if (data.status === 200) {
          setPatients(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching patients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [location.state]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;

  const filteredPatients = patients.filter(
    (patient) =>
      patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone_number.includes(searchTerm)
  );

  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleShowActions = (index) => {
    setShowActionsIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const deletePatient = async (patientId) => {
    try {
      const response = await fetch(
        `http://localhost:80/madina_api/delete_patient.php`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patientId }),
        }
      );

      const data = await response.json();
      if (data.status === 200) {
        setPatients((prevPatients) =>
          prevPatients.filter((patient) => patient.id !== patientId)
        );
      }
    } catch (error) {
      console.error("Error deleting patient", error);
    }
  };

  const handleEditClick = (id) => {
    navigate(`/patients/edit-patient/${id}`);
  };

  return (
    <>
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="patients-container">
        <div className={`display ${showSuccessMessage && "active"}`}></div>
        <Navbar />

        <div className="patients-content p-4">
          <div className="header d-flex justify-content-between align-items-center">
            <div className="heading">
              <h5>Reports</h5>
            </div>

            <div className="actions d-flex align-items-center">
              <div className="search d-flex">
                <input
                  type="text"
                  placeholder="Search for patient"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="search-icon">
                  <IoSearch className="fs-5" style={{ color: "#fff" }} />
                </div>
              </div>

              
            </div>
          </div>

          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            <>
              <table className="table mt-5">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient Name</th>
                    <th>Phone Number</th>
                    <th>Test</th>
                    <th>Category</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.length > 0 ? (
                    currentPatients.map((patient, index) => {
                      const tests = JSON.parse(patient.tests || "[]");
                      const testNames = tests
                        .map((test) => test.mainTestName)
                        .join(", ");
                      const testCategories = tests
                        .map((test) => test.testCategory)
                        .join(", ");
                      
                      const prices = tests.map(test => 
                        parseFloat(test.testPrice) || 0
                      );
                      const totalPrice = prices.length >= 1 
                        ? prices.reduce((sum, price) => sum + price, 0).toFixed(2)
                        : "-";

                      return (
                        <tr key={patient.id}>
                          <th>{index + 1}</th>
                          <td>{patient.patient_name}</td>
                          <td>{patient.phone_number}</td>
                          <td>{testNames || "-"}</td>
                          <td>{testCategories || "-"}</td>
                          <td>{totalPrice}</td>
                  

                          
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <nav>
                <ul className="pagination">
                  {Array.from(
                    {
                      length: Math.ceil(
                        filteredPatients.length / patientsPerPage
                      ),
                    },
                    (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          currentPage === index + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          onClick={() => paginate(index + 1)}
                          className="page-link"
                        >
                          {index + 1}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </>
          )}
        </div>

      
      </div>
    </>
  );
};

export default Reports;
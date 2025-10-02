import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { IoSearch } from "react-icons/io5";
import { VscKebabVertical } from "react-icons/vsc";
import { IoIosClose } from "react-icons/io";
import Success from "../assets/success.png";
import { useLocation, useNavigate } from "react-router-dom";

const Patients = () => {
  const [showActionsIndex, setShowActionsIndex] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();

  // Reference data mapping sub-tests to examination types
  const testReference = {
    "HBS": "physical",
    "HIV": "microscopic",
    "HRV": "microscopic",
    "RBS": "microscopic",
    "C6C1206": "chemical"
  };

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
    setCurrentPage(1); // Reset to first page on new search
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
        
        // Reset actions menu and pagination if needed
        setShowActionsIndex(null);
        if (currentPatients.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error("Error deleting patient", error);
    }
  };

  const handleEditClick = (id) => {
    navigate(`/patients/edit-patient/${id}`);
  };

  // Structure tests by examination type
  const structureTests = (tests) => {
    return tests.reduce((examinations, test) => {
      // Handle new structured format
      if (test.examinations) {
        Object.entries(test.examinations).forEach(([type, subtests]) => {
          examinations[type] = [
            ...(examinations[type] || []),
            ...subtests.map(subtest => ({
              ...subtest,
              mainTestName: test.mainTestName
            }))
          ];
        });
        return examinations;
      }

      // Convert old flat format to structured
      if (test.subTestNames) {
        test.subTestNames.forEach((name, index) => {
          const examType = testReference[name] || "other";
          examinations[examType] = examinations[examType] || [];
          examinations[examType].push({
            mainTestName: test.mainTestName,
            subTestName: name,
            normalRange: test.normalRanges?.[index] || "",
            unit: test.unit?.[index] || ""
          });
        });
      }
      return examinations;
    }, {});
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

              <button
                className="custom-btn btn-fill ms-2"
                onClick={() => navigate("/patients/add-new-test")}
              >
                Add Patient
              </button>
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
                    <th>Action</th>
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
                          <th>{index + 1 + (currentPage - 1) * patientsPerPage}</th>
                          <td>{patient.patient_name}</td>
                          <td>{patient.phone_number}</td>
                          <td>{testNames || "-"}</td>
                          <td>{testCategories || "-"}</td>
                          <td>{totalPrice}</td>
                          <td>
                            <VscKebabVertical
                              className="ms-3"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleShowActions(index)}
                            />
                          </td>

                          {showActionsIndex === index && (
                            <div className="actions-container active">
                              <button
                                className="get-report"
                                onClick={() => {
                                  const structuredTests = structureTests(tests);
                                  navigate("/get-report", {
                                    state: { 
                                      patient,
                                      examinations: structuredTests 
                                    }
                                  });
                                }}
                              >
                                Get Report
                              </button>
                              <br />
                              <button
                                className="edit"
                                onClick={() => handleEditClick(patient.id)}
                              >
                                Edit
                              </button>
                              <br />
                              <button
                                className="delete"
                                onClick={() => deletePatient(patient.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
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

        <div className={`success-message ${showSuccessMessage && "active"}`}>
          <IoIosClose
            className="close-icon fs-3"
            onClick={() => setShowSuccessMessage(false)}
          />
          <div className="modal-content">
            <div className="success-img">
              <img src={Success} alt="Success" />
            </div>
            <h5 className="text-center" style={{ color: "rgb(77, 75, 75)" }}>
              Added Successfully!
            </h5>
          </div>
        </div>
      </div>
    </>
  );
};

export default Patients;
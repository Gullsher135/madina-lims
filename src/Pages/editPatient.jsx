import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const EditPatient = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDropDown, setShowDropDown] = useState({
    virology: false,
    serology: false,
    hematology: false,
    urineExamination: false,
    specialChemistry: false,
    biochemistry: false,
    hormones: false,
    coagulation: false,
    fluids: false,
    fecal: false,
    autoimmunity: false,
    infectious: false,
    dibetes: false,
    seman: false,
  });

  const [dropdowns, setDropdowns] = useState({
    virology: [1],
    serology: [1],
    hematology: [1],
    urineExamination: [1],
    specialChemistry: [1],
    biochemistry: [1],
    hormones: [1],
    coagulation: [1],
    fluids: [1],
    fecal: [1],
    autoimmunity: [1],
    infectious: [1],
    dibetes: [1],
    seman: [1],
  });

  const [testTypes, setTestTypes] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientAge: "",
    gender: "",
    phoneNumber: "",
    testRequired: "",
    referredBy: "",
  });
  const [selectedTests, setSelectedTests] = useState({});
  const [patientId, setPatientId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testResponse = await fetch(
          "http://localhost:80/madina_api/fetch_test_types.php"
        );
        const testResult = await testResponse.json();
        if (testResult.data && Array.isArray(testResult.data)) {
          setTestTypes(testResult.data);
        }

        if (id) {
          const patientResponse = await fetch(
            `http://localhost:80/madina_api/get_patient.php?id=${id}`
          );
          const patientResult = await patientResponse.json();
          
          if (patientResult.status === 200) {
            const patientData = patientResult.patient;
            setPatientId(patientData.id);
            
            setPatientInfo({
              patientName: patientData.patient_name || "",
              patientAge: patientData.patient_age ? String(patientData.patient_age) : "",
              gender: patientData.gender || "",
              phoneNumber: patientData.phone_number || "",
              testRequired: patientData.test_required || "",
              referredBy: patientData.referred_by || "",
            });

            let tests = patientData.tests;
            if (typeof tests === 'string') {
              try {
                tests = JSON.parse(tests);
              } catch (e) {
                console.error("Error parsing tests:", e);
                tests = [];
              }
            } else if (!Array.isArray(tests)) {
              tests = [];
            }
            
            const groupedByCategory = tests.reduce((acc, test) => {
              const category = test.testCategory.toLowerCase();
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(test);
              return acc;
            }, {});

            const newDropdowns = { ...dropdowns };
            const newSelectedTests = { ...selectedTests };
            
            Object.keys(groupedByCategory).forEach(category => {
              const categoryTests = groupedByCategory[category];
              
              newDropdowns[category] = Array.from(
                { length: categoryTests.length }, 
                (_, i) => i + 1
              );
              
              categoryTests.forEach((test, index) => {
                const key = `${category}-${index}`;
                
                newSelectedTests[key] = {
                  category,
                  mainTestName: test.mainTestName,
                  price: test.testPrice,
                  testTemplate: test.testTemplate,
                  subTests: (test.subTests || []).map(subTest => ({
                    name: subTest.subTestName || "",
                    normalRange: subTest.testNormalRanges || "",
                    unit: subTest.testUnit || "",
                    examType: subTest.examType || ""
                  }))
                };
              });
            });

            setDropdowns(newDropdowns);
            setSelectedTests(newSelectedTests);
          } else {
            console.error("Patient data not found", patientResult);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();

    const patientAge = parseInt(patientInfo.patientAge, 10);
    if (isNaN(patientAge)) {
      setErrorMessage("Please enter a valid patient age");
      return;
    }

    // Transform tests data for API - CORRECTED STRUCTURE
    const testsArray = Object.values(selectedTests)
      .filter(test => test.mainTestName)
      .map(test => ({
        mainTestName: test.mainTestName,
        testCategory: test.category,
        testPrice: test.price,
        testTemplate: test.testTemplate,
        subTests: test.subTests.map(subTest => ({
          subTestName: subTest.name,
          testNormalRanges: subTest.normalRange,
          testUnit: subTest.unit,
          examType: subTest.examType
        }))
      }));

    const patientData = {
      patientName: patientInfo.patientName,
      patientAge: patientAge,
      gender: patientInfo.gender,
      phoneNumber: patientInfo.phoneNumber,
      testRequired: patientInfo.testRequired,
      referredBy: patientInfo.referredBy,
      tests: testsArray
    };

    try {
      const url = patientId 
        ? `http://localhost:80/madina_api/update_patient.php?id=${patientId}`
        : "http://localhost:80/madina_api/add_new_patient.php";
      
      const method = patientId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });

      // First check if response is JSON
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        // Handle non-JSON response (likely HTML error)
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      if (result.status === 200) {
        navigate("/patients", { state: { showSuccessMessage: true } });
      } else {
        setErrorMessage(result.message || "Failed to save patient data");
        console.error("Failed to save patient data:", result);
      }
    } catch (error) {
      // Extract meaningful error message
      const errorMsg = error.message.includes("non-JSON response") 
        ? "Server error: Please check the API configuration" 
        : "Network error. Please try again.";
      
      setErrorMessage(errorMsg);
      console.error("Error saving patient data:", error);
    }
  };

  const toggleDropDown = (category) => {
    setShowDropDown((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleTestSelection = (category, index, event) => {
    const selectedTestName = event.target.value;
    const selectedTest = testTypes.find(
      (test) => test.main_test_name === selectedTestName
    );
  
    if (selectedTest) {
      try {
        const subTests = JSON.parse(selectedTest.sub_tests) || [];
        const key = `${category}-${index}`;

        setSelectedTests((prev) => ({
          ...prev,
          [key]: {
            category,
            mainTestName: selectedTestName,
            subTests: subTests.map((subTest) => ({
              name: subTest.subTestName || "",
              normalRange: subTest.testNormalRanges || "",
              unit: subTest.testUnit || "",
              examType: subTest.examType || ""
            })),
            price: selectedTest.test_price || "",
            testTemplate: selectedTest.test_template || "",
          },
        }));
      } catch (error) {
        console.error("Error parsing sub_tests:", error);
      }
    }
  };

  const addNewDropdown = (category) => {
    setDropdowns((prev) => ({
      ...prev,
      [category]: [...prev[category], prev[category].length + 1],
    }));
  };

  return (
    <>
      <div className="sidebar-container">
        <Sidebar />
      </div>
  
      <div className="edit-patient-container">
        <Navbar />
        <div className="edit-patient-content p-4">
          <h5>{patientId ? "Edit Patient" : "Add New Patient"}</h5>
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
  
          <form action="" className="mt-3" onSubmit={handleSave}>
            <div className="form-grp grp-1 d-flex align-items-center">
              <input
                type="text"
                placeholder="Patient Name"
                value={patientInfo.patientName}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    patientName: e.target.value,
                  })
                }
                required
              />
              <input
                type="text"
                placeholder="Patient Age"
                className="ms-3"
                value={patientInfo.patientAge}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    patientAge: e.target.value,
                  })
                }
                required
              />
            </div>
  
            <div className="form-grp grp-2 d-flex align-items-center mt-3">
              <input
                type="text"
                placeholder="Gender"
                value={patientInfo.gender}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    gender: e.target.value,
                  })
                }
                required
              />
              <input
                type="number"
                placeholder="Phone Number"
                className="ms-3"
                value={patientInfo.phoneNumber}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    phoneNumber: e.target.value,
                  })
                }
                required
              />
            </div>
  
            <div className="form-grp grp-3 d-flex align-items-center mt-3">
              <input
                type="text"
                placeholder="Test Required"
                value={patientInfo.testRequired}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    testRequired: e.target.value,
                  })
                }
                required
              />
              <input
                type="text"
                placeholder="Referred By"
                className="ms-3"
                value={patientInfo.referredBy}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    referredBy: e.target.value,
                  })
                }
                required
              />
            </div>
  
            <div className="test-type mt-4">
              <h6>Test Type</h6>
  
              {/* Virology */}
              <div className="drop-down-btn">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("virology")}>Virology</p>
                  {showDropDown.virology === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("virology")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("virology")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.virology && "active"
                  }`}
                >
                  {dropdowns.virology.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("virology", index, e)
                        }
                        value={selectedTests[`virology-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "virology"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.virology.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("virology")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Serology */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("serology")}>Serology</p>
                  {showDropDown.serology === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("serology")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("serology")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.serology && "active"
                  }`}
                >
                  {dropdowns.serology.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("serology", index, e)
                        }
                        value={selectedTests[`serology-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "serology"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.serology.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("serology")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hematology */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("hematology")}>Hematology</p>
                  {showDropDown.hematology === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("hematology")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("hematology")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.hematology && "active"
                  }`}
                >
                  {dropdowns.hematology.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("hematology", index, e)
                        }
                        value={selectedTests[`hematology-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "hematology"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.hematology.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("hematology")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Urine Examination */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("urineExamination")}>
                    Urine Examination
                  </p>
                  {showDropDown.urineExamination === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("urineExamination")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("urineExamination")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.urineExamination && "active"
                  }`}
                >
                  {dropdowns.urineExamination.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("urineExamination", index, e)
                        }
                        value={selectedTests[`urineExamination-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "urine examination"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.urineExamination.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("urineExamination")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Chemistry */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("specialChemistry")}>
                    Special Chemistry
                  </p>
                  {showDropDown.specialChemistry === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("specialChemistry")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("specialChemistry")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.specialChemistry && "active"
                  }`}
                >
                  {dropdowns.specialChemistry.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("specialChemistry", index, e)
                        }
                        value={selectedTests[`specialChemistry-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "special chemistry"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.specialChemistry.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("specialChemistry")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Biochemistry */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("biochemistry")}>
                    Biochemistry Basic Tests
                  </p>
                  {showDropDown.biochemistry === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("biochemistry")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("biochemistry")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.biochemistry && "active"
                  }`}
                >
                  {dropdowns.biochemistry.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("biochemistry", index, e)
                        }
                        value={selectedTests[`biochemistry-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "biochemistry"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.biochemistry.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("biochemistry")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hormones */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("hormones")}>
                    Hormones Enzymes
                  </p>
                  {showDropDown.hormones === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("hormones")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("hormones")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.hormones && "active"
                  }`}
                >
                  {dropdowns.hormones.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("hormones", index, e)
                        }
                        value={selectedTests[`hormones-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "hormones"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.hormones.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("hormones")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coagulation */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("coagulation")}>
                    Coagulation
                  </p>
                  {showDropDown.coagulation === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("coagulation")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("coagulation")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.coagulation && "active"
                  }`}
                >
                  {dropdowns.coagulation.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("coagulation", index, e)
                        }
                        value={selectedTests[`coagulation-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "coagulation"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.coagulation.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("coagulation")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fluids */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("fluids")}>
                    Fluids
                  </p>
                  {showDropDown.fluids === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("fluids")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("fluids")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.fluids && "active"
                  }`}
                >
                  {dropdowns.fluids.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("fluids", index, e)
                        }
                        value={selectedTests[`fluids-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "fluids"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.fluids.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("fluids")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fecal Analysis */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("fecal")}>
                    Fecal Analysis
                  </p>
                  {showDropDown.fecal === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("fecal")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("fecal")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.fecal && "active"
                  }`}
                >
                  {dropdowns.fecal.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("fecal", index, e)
                        }
                        value={selectedTests[`fecal-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "fecal"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.fecal.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("fecal")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Autoimmunity */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("autoimmunity")}>
                    Autoimmunity
                  </p>
                  {showDropDown.autoimmunity === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("autoimmunity")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("autoimmunity")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.autoimmunity && "active"
                  }`}
                >
                  {dropdowns.autoimmunity.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("autoimmunity", index, e)
                        }
                        value={selectedTests[`autoimmunity-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "autoimmunity"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.autoimmunity.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("autoimmunity")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Infectious Test */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("infectious")}>
                    Infectious Test
                  </p>
                  {showDropDown.infectious === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("infectious")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("infectious")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.infectious && "active"
                  }`}
                >
                  {dropdowns.infectious.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("infectious", index, e)
                        }
                        value={selectedTests[`infectious-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "infectious"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.infectious.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("infectious")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dibetes Test */}
              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("dibetes")}>
                    Dibetes Test
                  </p>
                  {showDropDown.dibetes === false ? (
                    <IoMdArrowDropdown
                      className="icon fs-4"
                      onClick={() => toggleDropDown("dibetes")}
                    />
                  ) : (
                    <IoMdArrowDropup
                      className="icon fs-4"
                      onClick={() => toggleDropDown("dibetes")}
                    />
                  )}
                </div>
  
                <div
                  className={`drop-down-container ${
                    showDropDown.dibetes && "active"
                  }`}
                >
                  {dropdowns.dibetes.map((dropdown, index) => (
                    <div
                      key={index}
                      className="drop-down-content d-flex justify-content-between align-items-center"
                    >
                      <select
                        name={`test-${dropdown}`}
                        id={`test-${dropdown}`}
                        className="mt-3"
                        onChange={(e) =>
                          handleTestSelection("dibetes", index, e)
                        }
                        value={selectedTests[`dibetes-${index}`]?.mainTestName || ""}
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "dibetes"
                          )
                          .map((testType, idx) => (
                            <option key={idx} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.dibetes.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("dibetes")}
                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            <button type="submit" className="btn btn-primary mt-4">Save</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditPatient;
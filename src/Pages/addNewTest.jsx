import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const AddNewTest = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
    fecalautoimminity: false,
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

  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:80/madina_api/fetch_test_types.php"
        );
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          setTestTypes(result.data);
        } else {
          console.error("Unexpected data format:", result);
        }
      } catch (error) {
        console.error("Error fetching test types:", error);
      }
    };

    fetchTestTypes();
  }, []);

  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
  
    const patientAge = parseInt(patientInfo.patientAge, 10);
    if (isNaN(patientAge)) {
      console.error("Invalid patient age.");
      return;
    }
  
    const testsArray = Object.values(selectedTests).filter(test => test.mainTestName);

    const combinedData = {
      patientName: patientInfo.patientName,
      patientAge: patientAge,
      gender: patientInfo.gender,
      phoneNumber: patientInfo.phoneNumber,
      testRequired: patientInfo.testRequired,
      referredBy: patientInfo.referredBy,
      tests: testsArray.map((test) => ({
        mainTestName: test.mainTestName,
        testCategory: test.category,
        testPrice: test.price,
        testTemplate: test.testTemplate,
        subTests: test.subTests.map((subTest) => ({
          subTestName: subTest.name,
          testNormalRanges: subTest.normalRange,
          testUnit: subTest.unit,
          examType: subTest.examType
        }))
      })),
    };

    try {
      const response = await fetch(
        "http://localhost:80/madina_api/add_new_patient.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(combinedData),
        }
      );
  
      const result = await response.json();
      if (result.status === 200) {
        navigate("/patients", { state: { showSuccessMessage: true } });
      } else {
        console.error("Failed to save patient tests:", result);
      }
    } catch (error) {
      console.error("Error saving patient tests:", error);
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
  
      <div className="add-patient-container">
        <Navbar />
        <div className="add-patient-content p-4">
          <h5>Add New Test</h5>
  
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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "virology"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.virology.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("virology")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "serology"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.serology.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("serology")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "hematology"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.hematology.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("hematology")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "urine examination"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.urineExamination.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("urineExamination")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "special chemistry"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.specialChemistry.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("specialChemistry")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "biochemistry"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.biochemistry.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("biochemistry")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("hormones")}>
                    Hormones Enzymes
                  </p>
                  {showDropDown.biochemistry === false ? (
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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "hormones"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.hormones.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("hormones")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("coagulation")}>
                    Coagulation
                  </p>
                  {showDropDown.biochemistry === false ? (
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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "coagulation"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.coagulation.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("coagulation")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "fluids"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.fluids.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("fluids")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "fecal"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.fecal.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("fecal")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                    showDropDown.fecal && "active"
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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "autoimmunity"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.autoimmunity.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("autoimmunity")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "infectious"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.infectious.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("infectious")}
                          style={{color: "#fff"}}

                        >
                          + Add New Test
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="drop-down-btn mt-3">
                <div className="split d-flex align-items-center justify-content-between">
                  <p onClick={() => toggleDropDown("dibetes")}>
                    Dibetes Test
                  </p>
                  {showDropDown.infectious === false ? (
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
                      >
                        <option value="">Select Test</option>
                        {testTypes
                          .filter(
                            (testType) => testType.test_category === "dibetes"
                          )
                          .map((testType, index) => (
                            <option key={index} value={testType.main_test_name}>
                              {testType.main_test_name}
                            </option>
                          ))}
                      </select>
  
                      {index === dropdowns.dibetes.length - 1 && (
                        <button
                          type="button"
                          className="add-test-btn mt-3 ml-3"
                          onClick={() => addNewDropdown("dibetes")}
                          style={{color: "#fff"}}

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

export default AddNewTest;
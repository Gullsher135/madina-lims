import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";

const AddNewTestType = () => {
  const [mainTestName, setMainTestName] = useState("");
  const [testPrice, setTestPrice] = useState("");
  const [testTemplate, setTestTemplate] = useState("");
  const [testCategory, setTestCategory] = useState("");

  // State for rows with separate data for each row
  const [rows, setRows] = useState([
    {
      subTestName: "",
      testNormalRanges: "",
      testUnit: "",
    },
  ]);
  const [physicalExamRows, setPhysicalExamRows] = useState([
    {
      subTestName: { physicalExaminationTestName: "" },
      testNormalRanges: "",
      testUnit: "",
    },
  ]);
  const [microscopeExamRows, setMicroscopeExamRows] = useState([
    {
      subTestName: { microscopicExaminationTestName: "" },
      testNormalRanges: "",
      testUnit: "",
    },
  ]);
  const [chemicalExamRows, setChemicalExamRows] = useState([
    {
      subTestName: { chemicalExaminationTestName: "" },
      testNormalRanges: "",
      testUnit: "",
    },
  ]);

  // ---NAVIGATE VARIABLE---
  const navigate = useNavigate();

  // ---HANDLE SAVE ---
  const handleSave = async (e) => {
    e.preventDefault();

    // Check all required fields are filled
    if (!mainTestName || !testPrice || !testTemplate || !testCategory) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate physical report data
    // if (testTemplate === "physical report") {
    //   const hasEmptyFields = [
    //     ...physicalExamRows,
    //     ...microscopeExamRows,
    //     ...chemicalExamRows
    //   ].some(row => 
    //     !row.subTestName || 
    //     !row.testNormalRanges || 
    //     !row.testUnit
    //   );
      
    //   if (hasEmptyFields) {
    //     alert("Please fill in all test fields including ranges and units");
    //     return;
    //   }
    // }

    const testData = {
      mainTestName,
      testPrice,
      testTemplate,
      testCategory,
      rows,
      physicalExamRows,
      microscopeExamRows,
      chemicalExamRows, 
    };

    try {
      const response = await fetch(
        "http://localhost:80/madina_api/add_new_test_type.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );

      if (response.ok) {
        navigate("/test-types", { state: { showSuccessMessage: true } });
      } else {
        const errorData = await response.json();
        console.error("Error saving test type:", errorData.message);
        alert("Failed to save test type. Please try again.");
      }
    } catch (error) {
      console.error("Error occurred while saving test type:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // ---ADD ROW FUNCTIONS---
  const addRow = () => {
    if (testTemplate === "physical report") {
      setPhysicalExamRows([
        ...physicalExamRows,
        { 
          subTestName: { physicalExaminationTestName: "" },
          testNormalRanges: "",
          testUnit: ""
        },
      ]);
    } else {
      setRows([
        ...rows,
        { subTestName: "", testNormalRanges: "", testUnit: "" },
      ]);
    }
  };

  const addMicroscopeExamRow = () => {
    setMicroscopeExamRows([
      ...microscopeExamRows,
      {
        subTestName: { microscopicExaminationTestName: "" },
        testNormalRanges: "",
        testUnit: "",
      },
    ]);
  };

  const addChemicalExamRow = () => {
    setChemicalExamRows([
      ...chemicalExamRows,
      {
        subTestName: { chemicalExaminationTestName: "" },
        testNormalRanges: "",
        testUnit: "",
      },
    ]);
  };

  // ---HANDLE ROW CHANGE---
  const handleRowChange = (index, field, value, section) => {
    if (testTemplate === "physical report") {
      switch(section) {
        case "physical":
          const updatedPhysicalExamRows = [...physicalExamRows];
          if (field === "physicalExaminationTestName") {
            updatedPhysicalExamRows[index].subTestName.physicalExaminationTestName = value;
          } else {
            updatedPhysicalExamRows[index][field] = value;
          }
          setPhysicalExamRows(updatedPhysicalExamRows);
          break;
          
        case "microscope":
          const updatedMicroscopeExamRows = [...microscopeExamRows];
          if (field === "microscopicExaminationTestName") {
            updatedMicroscopeExamRows[index].subTestName.microscopicExaminationTestName = value;
          } else {
            updatedMicroscopeExamRows[index][field] = value;
          }
          setMicroscopeExamRows(updatedMicroscopeExamRows);
          break;
          
        case "chemical":
          const updatedChemicalExamRows = [...chemicalExamRows];
          if (field === "chemicalExaminationTestName") {
            // Fix glucose test code automatically
            const fixedValue = value === "G6H120a" ? "C6H12O6" : value;
            updatedChemicalExamRows[index].subTestName.chemicalExaminationTestName = fixedValue;
          } else {
            updatedChemicalExamRows[index][field] = value;
          }
          setChemicalExamRows(updatedChemicalExamRows);
          break;
          
        default:
          break;
      }
    } else {
      const updatedRows = [...rows];
      updatedRows[index][field] = value;
      setRows(updatedRows);
    }
  };

  // ---CLEAR STATES---
  const clearState = () => {
    setMainTestName("");
    setTestPrice("");
    setTestTemplate("");
    setTestCategory("");
    setRows([{ subTestName: "", testNormalRanges: "", testUnit: "" }]);
    setPhysicalExamRows([
      { 
        subTestName: { physicalExaminationTestName: "" },
        testNormalRanges: "",
        testUnit: ""
      }
    ]);
    setMicroscopeExamRows([
      {
        subTestName: { microscopicExaminationTestName: "" },
        testNormalRanges: "",
        testUnit: "",
      },
    ]);
    setChemicalExamRows([
      {
        subTestName: { chemicalExaminationTestName: "" },
        testNormalRanges: "",
        testUnit: "",
      },
    ]);
  };

  return (
    <>
      {/* ---SIDEBAR--- */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="add-test-type-container">
        {/* ---NAVBAR--- */}
        <Navbar />

        <div className="add-test-type-content p-4">
          <h5>Add New Test Type</h5>

          <form action="" className="mt-3">
            <div className="form-grp grp-1 d-flex align-items-center">
              <select
                name="test-template"
                id="test-template"
                onChange={(e) => {
                  setTestTemplate(e.target.value);
                  setRows([
                    { subTestName: "", testNormalRanges: "", testUnit: "" },
                  ]);
                  setPhysicalExamRows([
                    { 
                      subTestName: { physicalExaminationTestName: "" },
                      testNormalRanges: "",
                      testUnit: ""
                    },
                  ]);
                  setMicroscopeExamRows([
                    {
                      subTestName: { microscopicExaminationTestName: "" },
                      testNormalRanges: "",
                      testUnit: "",
                    },
                  ]);
                  setChemicalExamRows([
                    {
                      subTestName: { chemicalExaminationTestName: "" },
                      testNormalRanges: "",
                      testUnit: "",
                    },
                  ]);
                }}
                value={testTemplate}
              >
                <option value="">Select Test Template</option>
                <option value="simple report">Simple Report</option>
                <option value="detailed report">Detailed Report</option>
                <option value="physical report">Physical Report</option>
              </select>

              <select
                name="test-category"
                id="test-category"
                className="ms-3"
                onChange={(e) => setTestCategory(e.target.value)}
                value={testCategory}
              >
                <option value="">Select Test Category</option>
                <option value="virology">Virology</option>
                <option value="hematology">Hematology</option>
                <option value="serology">Serology</option>
                <option value="urine examination">Urine Examination</option>
                <option value="special chemistry">Special Chemistry</option>
                <option value="biochemistry">Biochemistry Basic Test</option>
                <option value="hormones">Hormones Enzymes</option>
                <option value="coagulation">Coagulation</option>
                <option value="fluids">Body Fluids</option>
                <option value="fecal">Facal Analysis</option>
                <option value="autoimmunity">Autoimmunity</option>
                <option value="infectious">Infectious Test</option>
                <option value="dibetes">Dibetes Test</option>
              </select>
            </div>

            <div className="form-grp grp-2 d-flex align-items-center mt-3">
              <input
                type="text"
                placeholder="Test Name"
                onChange={(e) => setMainTestName(e.target.value)}
                value={mainTestName}
              />
              <input
                type="number"
                placeholder="Test Price"
                className="ms-3"
                onChange={(e) => setTestPrice(e.target.value)}
                value={testPrice}
              />
            </div>
          </form>

          <div
            className={`preview mt-5 ${testTemplate === "" ? "d-none" : ""}`}
          >
            {testTemplate === "physical report" ? (
              <>
                <div className="physical-exam">
                  <h5
                    style={{
                      textAlign: "center",
                      background: "#eee",
                      padding: "8px",
                    }}
                  >
                    Physical Examination
                  </h5>
                  <table className="table mt-4">
                    <thead>
                      <tr>
                        <th width="15%">Test</th>
                        <th width="35%">Name</th>
                        <th width="25%">Normal Ranges</th>
                        <th width="25%">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {physicalExamRows.map((row, index) => (
                        <tr key={index}>
                          <td>Test</td>
                          <td>
                            <input
                              type="text"
                              placeholder="Test name"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "physicalExaminationTestName",
                                  e.target.value,
                                  "physical"
                                )
                              }
                              value={
                                row.subTestName.physicalExaminationTestName
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="e.g., 0-5"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "testNormalRanges",
                                  e.target.value,
                                  "physical"
                                )
                              }
                              value={row.testNormalRanges}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="e.g., /HPF"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "testUnit",
                                  e.target.value,
                                  "physical"
                                )
                              }
                              value={row.testUnit}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="btn mt-3" onClick={addRow}>
                    Add Row
                  </button>
                </div>

                


                <div className="chemical-exam mt-4">
                  <h5
                    style={{
                      textAlign: "center",
                      background: "#eee",
                      padding: "8px",
                    }}
                  >
                    Chemical Examination
                  </h5>

                  <table className="table mt-4">
                    <thead>
                      <tr>
                        <th width="15%">Test</th>
                        <th width="35%">Name</th>
                        <th width="25%">Normal Ranges</th>
                        <th width="25%">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chemicalExamRows.map((row, index) => (
                        <tr key={index}>
                          <td>Test</td>
                          <td>
                            <input
                              placeholder="Test name"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "chemicalExaminationTestName",
                                  e.target.value,
                                  "chemical"
                                )
                              }
                              value={
                                row.subTestName.chemicalExaminationTestName
                              }
                            />
                          </td>
                          <td>
                            <input
                              placeholder="e.g., 70-100"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "testNormalRanges",
                                  e.target.value,
                                  "chemical"
                                )
                              }
                              value={row.testNormalRanges}
                            />
                          </td>
                          <td>
                            <input
                              placeholder="e.g., mg/dL"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "testUnit",
                                  e.target.value,
                                  "chemical"
                                )
                              }
                              value={row.testUnit}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="btn mt-3" onClick={addChemicalExamRow}>
                    Add Row
                  </button>
                </div>

                <div className="microscope-exam mt-4">
                  <h5
                    style={{
                      textAlign: "center",
                      background: "#eee",
                      padding: "8px",
                    }}
                  >
                    Microscopic Examination
                  </h5>

                  <table className="table mt-4">
                    <thead>
                      <tr>
                        <th width="15%">Test</th>
                        <th width="35%">Name</th>
                        <th width="25%">Normal Ranges</th>
                        <th width="25%">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {microscopeExamRows.map((row, index) => (
                        <tr key={index}>
                          <td>Test</td>
                          <td>
                            <input
                              type="text"
                              placeholder="Test name"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "microscopicExaminationTestName",
                                  e.target.value,
                                  "microscope"
                                )
                              }
                              value={
                                row.subTestName.microscopicExaminationTestName
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="e.g., 0-5"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "testNormalRanges",
                                  e.target.value,
                                  "microscope"
                                )
                              }
                              value={row.testNormalRanges}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="e.g., /HPF"
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "testUnit",
                                  e.target.value,
                                  "microscope"
                                )
                              }
                              value={row.testUnit}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="btn mt-3" onClick={addMicroscopeExamRow}>
                    Add Row
                  </button>
                </div>
              </>
            ) : (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Test Name</th>
                      <th scope="col">Result</th>

                      <th
                        scope="col"
                        className={
                          testTemplate !== "detailed report" ? "d-none" : ""
                        }
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className={
                          testTemplate !== "detailed report" ? "d-none" : ""
                        }
                      >
                        Normal Ranges
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            placeholder=""
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                "subTestName",
                                e.target.value
                              )
                            }
                            value={row.subTestName}
                          />
                        </td>
                        <td
                          className={
                            testTemplate !== "detailed report" ? "d-none" : ""
                          }
                        ></td>
                        <td
                          className={
                            testTemplate !== "detailed report" ? "d-none" : ""
                          }
                        >
                          <input
                            type="text"
                            placeholder=""
                            className="ms-3"
                            onChange={(e) =>
                              handleRowChange(index, "testUnit", e.target.value)
                            }
                            value={row.testUnit}
                          />
                        </td>
                        <td>
                          <textarea
                            type="text"
                            style={{width: "100%"}}
                            wrap="soft"
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                "testNormalRanges",
                                e.target.value
                              )
                            }
                            value={row.testNormalRanges}
                          ></textarea>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn mt-3" onClick={addRow}>
                  Add Row
                </button>
              </>
            )}

            <div className="actions-btn mt-5 mb-3 float-end">
              <button
                className="custom-btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  clearState();
                  navigate("/test-types");
                }}
              >
                Cancel
              </button>

              <button className="custom-btn btn-fill ms-2" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewTestType;
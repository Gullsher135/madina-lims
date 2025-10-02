import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

const EditTestType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mainTestName, setMainTestName] = useState("");
  const [testPrice, setTestPrice] = useState("");
  const [testTemplate, setTestTemplate] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [rows, setRows] = useState([{
    subTestName: "",
    testNormalRanges: "",
    testUnit: "",
  }]);
  const [physicalExamRows, setPhysicalExamRows] = useState([{
    subTestName: { physicalExaminationTestName: "" },
    testNormalRanges: "",
    testUnit: "",
  }]);
  const [microscopeExamRows, setMicroscopeExamRows] = useState([{
    subTestName: { microscopicExaminationTestName: "" },
    testNormalRanges: "",
    testUnit: "",
  }]);
  const [chemicalExamRows, setChemicalExamRows] = useState([{
    subTestName: { chemicalExaminationTestName: "" },
    testNormalRanges: "",
    testUnit: "",
  }]);

  // Fetch test type data when component mounts
  useEffect(() => {
    const fetchTestType = async () => {
      try {
        const response = await fetch(
          `http://localhost:80/madina_api/fetch_test_type_by_id.php?id=${id}`
        );
        const result = await response.json();
        
        if (result.status === 200 && result.data) {
          const data = result.data;
          
          // Set basic fields
          setMainTestName(data.main_test_name);
          setTestPrice(data.test_price);
          setTestTemplate(data.test_template);
          setTestCategory(data.test_category);
          
          // Process sub_tests based on template
          if (data.test_template === 'physical report') {
            const physical = [];
            const microscope = [];
            const chemical = [];
            
            data.sub_tests.forEach(test => {
              if (test.examType === 'physical') {
                physical.push({
                  subTestName: { physicalExaminationTestName: test.subTestName },
                  testNormalRanges: test.testNormalRanges,
                  testUnit: test.testUnit
                });
              } else if (test.examType === 'microscopic') {
                microscope.push({
                  subTestName: { microscopicExaminationTestName: test.subTestName },
                  testNormalRanges: test.testNormalRanges,
                  testUnit: test.testUnit
                });
              } else if (test.examType === 'chemical') {
                chemical.push({
                  subTestName: { chemicalExaminationTestName: test.subTestName },
                  testNormalRanges: test.testNormalRanges,
                  testUnit: test.testUnit
                });
              }
            });
            
            setPhysicalExamRows(physical.length ? physical : [{
              subTestName: { physicalExaminationTestName: "" },
              testNormalRanges: "",
              testUnit: ""
            }]);
            
            setMicroscopeExamRows(microscope.length ? microscope : [{
              subTestName: { microscopicExaminationTestName: "" },
              testNormalRanges: "",
              testUnit: ""
            }]);
            
            setChemicalExamRows(chemical.length ? chemical : [{
              subTestName: { chemicalExaminationTestName: "" },
              testNormalRanges: "",
              testUnit: ""
            }]);
            
          } else {
            setRows(data.sub_tests.map(test => ({
              subTestName: test.subTestName,
              testNormalRanges: test.testNormalRanges,
              testUnit: test.testUnit
            })));
          }
        } else {
          console.error('Error fetching test type:', result.message);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTestType();
    }
  }, [id]);

  // ---HANDLE SAVE ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Check all required fields are filled
    if (!mainTestName || !testPrice || !testTemplate || !testCategory) {
      alert("Please fill in all required fields.");
      setSaving(false);
      return;
    }

    // Build subTests array based on template
    let subTests = [];

    if (testTemplate === 'physical report') {
      // Process physical exam rows
      physicalExamRows.forEach(row => {
        if (row.subTestName.physicalExaminationTestName) {
          subTests.push({
            subTestName: row.subTestName.physicalExaminationTestName,
            testNormalRanges: row.testNormalRanges,
            testUnit: row.testUnit,
            examType: 'physical'
          });
        }
      });

      // Process microscope exam rows
      microscopeExamRows.forEach(row => {
        if (row.subTestName.microscopicExaminationTestName) {
          subTests.push({
            subTestName: row.subTestName.microscopicExaminationTestName,
            testNormalRanges: row.testNormalRanges,
            testUnit: row.testUnit,
            examType: 'microscopic'
          });
        }
      });

      // Process chemical exam rows
      chemicalExamRows.forEach(row => {
        if (row.subTestName.chemicalExaminationTestName) {
          subTests.push({
            subTestName: row.subTestName.chemicalExaminationTestName,
            testNormalRanges: row.testNormalRanges,
            testUnit: row.testUnit,
            examType: 'chemical'
          });
        }
      });
    } else {
      // For simple/detailed reports
      subTests = rows.map(row => ({
        subTestName: row.subTestName,
        testNormalRanges: row.testNormalRanges,
        testUnit: row.testUnit,
        examType: 'general'
      }));
    }

    // Filter out any subTests with empty subTestName
    subTests = subTests.filter(test => test.subTestName.trim() !== "");

    const testData = {
      id: id,
      mainTestName,
      testPrice,
      testTemplate,
      testCategory,
      rows: subTests
    };

    try {
      const response = await fetch(
        "http://localhost:80/madina_api/edit_test_type.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );

      const result = await response.json();
      
      if (result.status === 200) {
        alert("Test type updated successfully!");
        navigate("/test-types");
      } else {
        console.error('Error updating test type:', result.message);
        alert(`Failed to update test type: ${result.message}`);
      }
    } catch (error) {
      console.error('Error occurred while updating test type:', error);
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ---ADD ROW FUNCTIONS---
  const addRow = (section) => {
    switch (section) {
      case "physical":
        setPhysicalExamRows(prev => [
          ...prev,
          { 
            subTestName: { physicalExaminationTestName: "" },
            testNormalRanges: "",
            testUnit: ""
          }
        ]);
        break;
      case "microscope":
        setMicroscopeExamRows(prev => [
          ...prev,
          {
            subTestName: { microscopicExaminationTestName: "" },
            testNormalRanges: "",
            testUnit: "",
          }
        ]);
        break;
      case "chemical":
        setChemicalExamRows(prev => [
          ...prev,
          {
            subTestName: { chemicalExaminationTestName: "" },
            testNormalRanges: "",
            testUnit: "",
          }
        ]);
        break;
      default:
        setRows(prev => [
          ...prev,
          { subTestName: "", testNormalRanges: "", testUnit: "" }
        ]);
    }
  };

  // ---HANDLE ROW CHANGE---
  const handleRowChange = (index, field, value, section) => {
    if (testTemplate === "physical report") {
      switch(section) {
        case "physical":
          setPhysicalExamRows(prev => {
            const newRows = [...prev];
            if (field === "physicalExaminationTestName") {
              newRows[index] = {
                ...newRows[index],
                subTestName: {
                  ...newRows[index].subTestName,
                  physicalExaminationTestName: value
                }
              };
            } else {
              newRows[index] = {
                ...newRows[index],
                [field]: value
              };
            }
            return newRows;
          });
          break;
        case "microscope":
          setMicroscopeExamRows(prev => {
            const newRows = [...prev];
            if (field === "microscopicExaminationTestName") {
              newRows[index] = {
                ...newRows[index],
                subTestName: {
                  ...newRows[index].subTestName,
                  microscopicExaminationTestName: value
                }
              };
            } else {
              newRows[index] = {
                ...newRows[index],
                [field]: value
              };
            }
            return newRows;
          });
          break;
        case "chemical":
          setChemicalExamRows(prev => {
            const newRows = [...prev];
            if (field === "chemicalExaminationTestName") {
              const fixedValue = value === "G6H120a" ? "C6H12O6" : value;
              newRows[index] = {
                ...newRows[index],
                subTestName: {
                  ...newRows[index].subTestName,
                  chemicalExaminationTestName: fixedValue
                }
              };
            } else {
              newRows[index] = {
                ...newRows[index],
                [field]: value
              };
            }
            return newRows;
          });
          break;
        default:
          break;
      }
    } else {
      setRows(prev => {
        const newRows = [...prev];
        newRows[index] = {
          ...newRows[index],
          [field]: value
        };
        return newRows;
      });
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

  if (loading) {
    return (
      <>
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="edit-test-type-container">
          <Navbar />
          <div className="edit-test-type-content p-4">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="edit-test-type-container">
        <Navbar />

        <div className="edit-test-type-content p-4">
          <h5>Edit Test Type</h5>

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
                  <button className="btn mt-3" onClick={() => addRow("physical")}>
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
                              type="text"
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
                              type="text"
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
                              type="text"
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
                  <button className="btn mt-3" onClick={() => addRow("chemical")}>
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
                  <button className="btn mt-3" onClick={() => addRow("microscope")}>
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
                <button className="btn mt-3" onClick={() => addRow()}>
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

              <button 
                className="custom-btn btn-fill ms-2" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTestType;
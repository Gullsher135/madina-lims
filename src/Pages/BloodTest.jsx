import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import Logo from "../assets/logo.png";

const BloodTest = () => {
  const [patientData, setPatientData] = useState(null);
  const [results, setResults] = useState({});
  const [remarks, setRemarks] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.patient) {
      const patient = location.state.patient;
      setPatientData(patient);

      const tests = JSON.parse(patient.tests || "[]");
      const initialResults = {};

      tests.forEach((test, testIndex) => {
        if (test.subTests) {
          test.subTests.forEach((subTest, subIndex) => {
            const key = `${testIndex}-${subIndex}`;
            initialResults[key] = subTest.result || "";
          });
        } else if (test.subTestNames) {
          test.subTestNames.forEach((_, subIndex) => {
            const key = `${testIndex}-${subIndex}`;
            initialResults[key] = test.result?.[subIndex] || "";
          });
        } else {
          const key = `${testIndex}-0`;
          initialResults[key] = test.result || "";
        }
      });

      setResults(initialResults);
    }
  }, [location.state]);

  const handleResultChange = (e, key) => {
    setResults((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = () => {
    const updatedTests = JSON.parse(patientData.tests || "[]").map(
      (test, testIndex) => {
        if (test.subTests) {
          return {
            ...test,
            subTests: test.subTests.map((subTest, subIndex) => ({
              ...subTest,
              result: results[`${testIndex}-${subIndex}`] || "",
            })),
          };
        } else if (test.subTestNames) {
          return {
            ...test,
            result: test.subTestNames.map(
              (_, subIndex) => results[`${testIndex}-${subIndex}`] || ""
            ),
          };
        } else {
          return {
            ...test,
            result: results[`${testIndex}-0`] || "",
          };
        }
      }
    );

    fetch("http://localhost:80/madina_api/update_patient_result.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...patientData,
        tests: updatedTests,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) window.print();
      })
      .catch((error) => console.error("Error:", error));
  };

  // Function to determine if we should show unit and normal ranges columns
  const shouldShowUnitAndRanges = (test) => {
    // For tests with subTests (detailed or physical templates)
    if (test.subTests) {
      // Check if any subTest has unit or normal ranges data
      return test.subTests.some(
        (subTest) => subTest.testUnit || subTest.testNormalRanges
      );
    }
    // For tests with subTestNames (detailed template)
    if (test.subTestNames) {
      // Check if there are units or normal ranges arrays with data
      return (
        (test.unit && test.unit.some((u) => u)) ||
        (test.normalRanges && test.normalRanges.some((nr) => nr))
      );
    }
    // For single tests
    return test.unit || test.normalRanges;
  };

  // Function to group tests by examType for physical template in specific order
  const groupTestsByExamType = (subTests) => {
    const groups = {};
    subTests.forEach((subTest) => {
      const examType = subTest.examType || "general";
      if (!groups[examType]) {
        groups[examType] = [];
      }
      groups[examType].push(subTest);
    });

    // Return groups in specific order: Physical → Chemical → Microscopic → others
    const orderedGroups = {};
    const order = ["physical", "chemical", "microscopic"];

    order.forEach((examType) => {
      if (groups[examType]) {
        orderedGroups[examType] = groups[examType];
      }
    });

    // Add any other exam types that weren't in the specified order
    Object.keys(groups).forEach((examType) => {
      if (!order.includes(examType)) {
        orderedGroups[examType] = groups[examType];
      }
    });

    return orderedGroups;
  };

  if (!patientData) {
    return <div>Loading...</div>;
  }

  const tests = JSON.parse(patientData.tests || "[]");
  const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

  return (
    <div className="blood-test">
      <div className="actions-container">
        <div className="action-btns mb-4 mt-4 ms-5">
          <button
            className="custom-btn btn-outline"
            onClick={() => navigate("/patients")}
          >
            Cancel
          </button>
          <button className="custom-btn btn-fill ms-2" onClick={handleSubmit}>
            Print
          </button>
          <button
            className="custom-btn btn-fill ms-2"
            onClick={() => setRemarks(true)}
          >
            Add Remarks
          </button>
        </div>
      </div>

      <div className="report-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th colSpan="4" style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "center" ,   border: "none"}}>

                        <div className="header-container" style={{display: "flex" , alignItems: "center" , justifyContent: "center" , textAlign: "center" , marginBottom: "30px"}}>
                        <div className="image-container">
                          <img src={Logo} style={{ width: "140px" }} />
                        </div>

                        <div className="text-container">
                          <h1>Al-MADINA LABORATORY</h1>
                          <p>
                            Al-Madina Clinic Sharjeel Medical Complex Near Moti
                            Masjid Kohat Cantt
                          </p>
                        </div>

                        </div>
                      </td>
                    </tr>

                    <tr style={{border: "none"}} className="patient-info-tr">
                      <td style={{border: "none"}}>
                        <table
                          className="patient-info-table"
                          style={{ width: "80%", borderCollapse: "collapse" , marginLeft: "110px"}}
                        >
                          <tbody>
                            <tr>
                              <th className="bg">Patient Name</th>
                              <td className="unbold">{patientData.patient_name}</td>
                              <th className="bg">Patient ID</th>
                              <td className="unbold">{patientData.id}</td>
                            </tr>
                            <tr>
                              <th className="bg">Age</th>
                              <td className="unbold">{patientData.patient_age}</td>
                              <th className="bg">Sex</th>
                              <td className="unbold">{patientData.gender}</td>
                            </tr>
                            <tr>
                              <th className="bg">Referred By</th>
                              <td className="unbold">{patientData.referred_by}</td>
                              <th className="bg">Date</th>
                              <td className="unbold">{currentDate}</td>
                            </tr>
                            <tr>
                              <th className="bg">Investigations</th>
                              <td
                                colSpan="3"
                                style={{
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                }}
                                className="unbold"
                              >
                                {tests.map((t) => t.mainTestName).join(", ")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </th>
            </tr>
          </thead>

          <tbody>
            {tests.map((test, testIndex) => {
              const showUnitAndRanges = shouldShowUnitAndRanges(test);
              const isPhysicalTemplate =
                test.subTests &&
                test.subTests.some(
                  (subTest) =>
                    subTest.examType && subTest.examType !== "general"
                );

              return (
                <tr key={testIndex}>
                  <td>
                    <table
                      className="test-section"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "50px", 

                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            colSpan={showUnitAndRanges ? "4" : "2"}
                            className="test-header"
                          >
                            {test.mainTestName}
                          </th>
                        </tr>
                        <tr>
                          <th>Test Name</th>
                          <th>Result</th>
                          {showUnitAndRanges && <th>Unit</th>}
                          {showUnitAndRanges && <th>Normal Ranges</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Physical Template with examType grouping */}
                        {isPhysicalTemplate ? (
                          Object.entries(
                            groupTestsByExamType(test.subTests)
                          ).map(([examType, subTestsInGroup]) => (
                            <React.Fragment key={examType}>
                              <tr>
                                <td
                                  colSpan={showUnitAndRanges ? "4" : "2"}
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    padding: "8px",
                                  }}
                                >
                                  {examType.toUpperCase()} EXAMINATION
                                </td>
                              </tr>
                              {subTestsInGroup.map((item, subIndex) => {
                                const originalIndex =
                                  test.subTests.indexOf(item);
                                const key = `${testIndex}-${originalIndex}`;
                                return (
                                  <tr key={key}>
                                    <td>{item.subTestName}</td>
                                    <td>
                                      <input
                                        type="text"
                                        value={results[key] || ""}
                                        onChange={(e) =>
                                          handleResultChange(e, key)
                                        }
                                      />
                                    </td>
                                    {showUnitAndRanges && (
                                      <td>{item.testUnit || ""}</td>
                                    )}
                                    {showUnitAndRanges && (
                                      <td>{item.testNormalRanges || ""}</td>
                                    )}
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          ))
                        ) : test.subTests ? (
                          // Detailed Template with subTests
                          test.subTests.map((item, subIndex) => {
                            const key = `${testIndex}-${subIndex}`;
                            return (
                              <tr key={key}>
                                <td>{item.subTestName}</td>
                                <td>
                                  <input
                                    type="text"
                                    value={results[key] || ""}
                                    onChange={(e) => handleResultChange(e, key)}
                                  />
                                </td>
                                {showUnitAndRanges && (
                                  <td>{item.testUnit || ""}</td>
                                )}
                                {showUnitAndRanges && (
                                  <td>{item.testNormalRanges || ""}</td>
                                )}
                              </tr>
                            );
                          })
                        ) : test.subTestNames ? (
                          // Detailed Template with subTestNames
                          test.subTestNames.map((subTest, subIndex) => (
                            <tr key={subIndex}>
                              <td>{subTest}</td>
                              <td>
                                <input
                                  type="text"
                                  value={
                                    results[`${testIndex}-${subIndex}`] || ""
                                  }
                                  onChange={(e) =>
                                    handleResultChange(
                                      e,
                                      `${testIndex}-${subIndex}`
                                    )
                                  }
                                />
                              </td>
                              {showUnitAndRanges && (
                                <td>{test.unit?.[subIndex] || ""}</td>
                              )}
                              {showUnitAndRanges && (
                                <td>{test.normalRanges?.[subIndex] || ""}</td>
                              )}
                            </tr>
                          ))
                        ) : (
                          // Simple Template (single test)
                          <tr>
                            <td>{test.mainTestName}</td>
                            <td>
                              <input
                                type="text"
                                value={results[`${testIndex}-0`] || ""}
                                onChange={(e) =>
                                  handleResultChange(e, `${testIndex}-0`)
                                }
                              />
                            </td>
                            {showUnitAndRanges && <td>{test.unit || ""}</td>}
                            {showUnitAndRanges && (
                              <td>{test.normalRanges || ""}</td>
                            )}
                          </tr>
                        )}

                        {remarks && (
                          <tr>
                            <td>
                              <b>Remarks</b>
                            </td>
                            <td colSpan={showUnitAndRanges ? "3" : "1"}>
                              <textarea
                                className="remarks-input"
                                style={{ width: "100%" }}
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BloodTest;

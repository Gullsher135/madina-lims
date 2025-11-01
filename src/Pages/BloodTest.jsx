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

  const shouldShowExamHeaders = (test) => {
    if (!test.subTests) return false;
    return test.subTests.some(
      (subTest) => subTest.examType && subTest.examType !== "general"
    );
  };

  const formatExamType = (type) => {
    if (type === "general") return null;
    return type.charAt(0).toUpperCase() + type.slice(1) + " Examination";
  };

  const examTypeOrder = ["physical", "chemical", "microscopic"];

  if (!patientData) {
    return <div>Loading...</div>;
  }

  const tests = JSON.parse(patientData.tests || "[]");
  const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

  // Helper function to render normal ranges with line breaks
  const renderNormalRanges = (ranges) => {
    if (!ranges) return "";

    return ranges.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

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
        <div className="print-header">
          <div className="logo-container">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="text-container ms-3">
            <h1>Al-MADINA LABORATORY</h1>
            <p>
              Al-Madina Clinic Sharjeel Medical Complex Near Moti Masjid Kohat
              Cantt
            </p>
          </div>
        </div>

        <div
          className="patient-info"
          style={{ display: "flex", marginTop: "20px" }}
        >
          {/* LEFT COLUMN */}
          <table
            className="patient-info-table"
            style={{ width: "50%", borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <th>Patient Name</th>
                <td>{patientData.patient_name}</td>
              </tr>
              <tr>
                <th>Age</th>
                <td>{patientData.patient_age}</td>
              </tr>

              <tr>
                <th>Referred By</th>
                <td>{patientData.referred_by}</td>
              </tr>

              {/* <tr>
                <th>Tests Required</th>
                <td>
                  <div
                    className="tests-required"
                    title={tests.map((t) => t.mainTestName).join(", ")}
                  >
                    {tests.map((t) => t.mainTestName).join(", ")}
                  </div>
                </td>
              </tr> */}
            </tbody>
          </table>

          {/* RIGHT COLUMN */}
          <table
            className="patient-info-table"
            style={{ width: "50%", borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <th>Patient ID</th>
                <td>
                  <div className="patient-id">{patientData.id}</div>
                </td>
              </tr>

              <tr>
                <th>Sex</th>
                <td>{patientData.gender}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>{currentDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table
          className="patient-info-table"
          style={{
            width: "90%",
            borderCollapse: "collapse",
            marginLeft: "55px",
            marginTop: "-70px",
          }}
        >
          <tbody>
            <tr>
              <th style={{ width: "10%" }}>Investigations</th>
              <td>
                <div
                  className="tests-required"
                  title={tests.map((t) => t.mainTestName).join(", ")}
                  style={{
                    whiteSpace: "nowrap",
                    overflowX: "auto",
                    fontSize: "0.85em",
                    padding: "2px 0",
                    
                  }}
                >
                  {tests
                    .map((t) => t.mainTestName)
                    .join(", ")
                    .slice(0, 100) + (tests.length > 100 ? "..." : "")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

       <div className="report" style={{ marginTop: "50px" }}>
  {tests.map((test, testIndex) => (
    <table
      key={testIndex}
      className="test-section"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
      }}
    >
      <thead>
        <tr>
          <th colSpan="4" className="test-header">
            {test.mainTestName}
          </th>
        </tr>
        <tr>
          <th>Test Name</th>
          <th>Result</th>
          <th>Unit</th>
          <th>Normal Ranges</th>
        </tr>
      </thead>

      <tbody>
        {test.subTests ? (
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
                <td>{item.testUnit || ""}</td>
                <td>{item.testNormalRanges || ""}</td>
              </tr>
            );
          })
        ) : test.subTestNames ? (
          test.subTestNames.map((subTest, subIndex) => (
            <tr key={subIndex}>
              <td>{subTest}</td>
              <td>
                <input
                  type="text"
                  value={results[`${testIndex}-${subIndex}`] || ""}
                  onChange={(e) =>
                    handleResultChange(e, `${testIndex}-${subIndex}`)
                  }
                />
              </td>
              <td>{test.unit?.[subIndex] || ""}</td>
              <td>{test.normalRanges?.[subIndex] || ""}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td>{test.mainTestName}</td>
            <td>
              <input
                type="text"
                value={results[`${testIndex}-0`] || ""}
                onChange={(e) => handleResultChange(e, `${testIndex}-0`)}
              />
            </td>
            <td>{test.unit || ""}</td>
            <td>{test.normalRanges || ""}</td>
          </tr>
        )}

        {remarks && (
          <tr>
            <td>
              <b>Remarks</b>
            </td>
            <td colSpan="3">
              <textarea className="remarks-input" style={{ width: "100%" }} />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  ))}

  <h6 className="text-center mt-5">
    Al-Madina Clinic Sharjeel Medical Complex Near Moti Masjid Kohat Cantt
  </h6>
</div>

      </div>
    </div>
  );
};

export default BloodTest;

import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import TotalTests from "../assets/dash-total-tests.png";
import TotalPatients from "../assets/dash-total-patients.png";
import TotalReports from "../assets/dash-total-reports.png";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const Home = () => {
  const [testTypes, setTestTypes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [timePeriod, setTimePeriod] = useState("today");
  const [earningsData, setEarningsData] = useState({
    labels: [],
    data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestTypes();
    fetchPatients();
    fetchEarningsData(timePeriod);
  }, [timePeriod]);

  const fetchTestTypes = async () => {
    try {
      const response = await fetch("http://localhost:80/madina_api/fetch_test_types.php");
      const result = await response.json();
      if (result.data) setTestTypes(result.data);
    } catch (error) {
      console.error("Error fetching test types:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:80/madina_api/fetch_patients.php");
      const data = await response.json();
      if (data.status === 200) setPatients(data.data || []);
    } catch (error) {
      console.error("Error fetching patients", error);
    }
  };

  const fetchEarningsData = async (period) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:80/madina_api/get_earnings.php?period=${period}`
      );
      const result = await response.json();
      
      if (result.status === 200) {
        setEarningsData({
          labels: result.data.labels,
          data: result.data.amounts
        });
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-color")
    .trim();

  const getColorWithOpacity = (color, opacity) => {
    return color.replace(/[^,]+(?=\))/, opacity);
  };

  const chartData = {
    labels: earningsData.labels,
    datasets: [
      {
        label: "Total Earnings",
        data: earningsData.data,
        backgroundColor: earningsData.labels.map((_, i) => 
          i % 2 === 0 ? primaryColor : getColorWithOpacity(primaryColor, 0.6)
        ),
      },
    ],
  };

  return (
    <>
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="dashboard-container">
        <div className="dashboard">
          <Navbar />
          <div className="dashboard-content p-4">
            <h5>Dashboard</h5>
            <div className="analatics-carts mt-4">
              {/* Existing cards remain the same */}
              <div className="cart total-tests">
                <div className="info">
                  <h6>Total Tests</h6>
                  <h4>{testTypes.length}</h4>
                </div>
                <div className="icon">
                  <img src={TotalTests} alt="Total Tests" />
                </div>
              </div>

              <div className="cart total-patients">
                <div className="info">
                  <h6>Total Patients</h6>
                  <h4>{patients.length}</h4>
                </div>
                <div className="icon">
                  <img src={TotalPatients} alt="Total Patients" />
                </div>
              </div>

              <div className="cart total-reports">
                <div className="info">
                  <h6>Total Reports</h6>
                  <h4>{patients.length}</h4>
                </div>
                <div className="icon">
                  <img src={TotalReports} alt="Total Reports" />
                </div>
              </div>
            </div>

            <div className="earnings-container mt-5">
              <div className="header">
                <h5>Total Earnings</h5>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  style={{ padding: "8px 16px", borderRadius: "8px" }}
                >
                  <option value="today">Today</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>

              <div className="chart mt-4">
                {loading ? (
                  <div className="loader">Loading earnings data...</div>
                ) : earningsData.data.length > 0 ? (
                  <Bar data={chartData} />
                ) : (
                  <p>No earnings data available for this period</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";

// ---NAVBAR---
import Navbar from "../Components/Navbar";

// ---ICONS---
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { TiDeleteOutline } from "react-icons/ti";
import { MdEdit } from "react-icons/md";
import Success from "../assets/success.png";

// ---NAVIGATIONS AND ROUTING RELATED COMP----
import { useLocation, useNavigate } from "react-router-dom";

const TestType = () => {
  // ---STATES---
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDltconfirmation, setShowDltconfirmation] = useState(false);
  const [showDltSuccessMessage, setShowDltSuccessMessage] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const location = useLocation();

  // ---NAVIGATE VARIABLE---
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.showSuccessMessage) {
      setShowSuccessMessage(true);

      // Clear the location state after showing the success message
      navigate("/test-types", { replace: true, state: {} });
    }

    // ---FETCHING TEST TYPES---
    const fetchTestTypes = async () => {
      setLoading(true); // Show loader when fetching starts
      try {
        const response = await fetch(
          "http://localhost:80/madina_api/fetch_test_types.php"
        );
        const result = await response.json();
        console.log(result); // Check the structure of the result
        if (result.data && Array.isArray(result.data)) {
          setTestTypes(result.data); // Save the fetched data from result.data
        } else {
          console.error("Unexpected data format:", result);
        }
      } catch (error) {
        console.error("Error fetching test types:", error);
      }
      setLoading(false); // Hide loader once fetching is complete
    };

    fetchTestTypes();
  }, [location.state, navigate]);

  // ---DELETE FUNCTION---
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:80/madina_api/delete_test_type.php",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ testTypeId: id }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result.status === 200) {
          setShowDltSuccessMessage(true);
          // Update state to remove deleted test type
          setTestTypes((prevTestTypes) =>
            prevTestTypes.filter((testType) => testType.id !== id)
          );
        } else {
          console.error("Error deleting test type:", result.message);
        }
      } else {
        const text = await response.text();
        console.error("Unexpected response format:", text);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
    setShowDltconfirmation(false);
  };

  // ---HANDLE EDIT---
   const handleEditClick = (id) => {
    navigate(`/test-types/edit/${id}`);
  };

  return (
    <>
      {/* ---SIDEBAR--- */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="test-type-container">
        <div
          className={`display ${
            (showSuccessMessage ||
              showDltconfirmation ||
              showDltSuccessMessage) &&
            "active"
          }`}
        ></div>

        {/* ---NAVBAR--- */}
        <Navbar />
        <div className="test-type-content p-4">
          <div className="header d-flex justify-content-between align-items-center">
            {/* ---HEADING--- */}
            <div className="heading">
              <h5>Tests</h5>
            </div>

            {/* ---SEARCH & ADD TEST BUTTON--- */}
            <div className="actions d-flex align-items-center">
              {/* ---SEARCH BAR--- */}
              <div className="search d-flex">
                <input type="text" placeholder="Search for test" />
                <div className="search-icon">
                  <IoSearch className="fs-5" style={{ color: "#fff" }} />
                </div>
              </div>

              {/* ---ADD TEST BUTTON--- */}
              <div className="button-container ms-2">
                <button
                  className="custom-btn btn-fill"
                  onClick={() => navigate("/test-types/add-new-test-type")}
                >
                  Add Test
                </button>
              </div>
            </div>
          </div>

          {/* ---TESTS TABLE--- */}

          {/* ---LOADER--- */}
          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            <table className="table mt-5" style={{ position: "relative" }}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Test Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Template</th>
                  <th scope="col">Price</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {testTypes.length > 0 ? (
                  testTypes.map((testType, index) => (
                    <tr key={testType.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{testType.main_test_name}</td>
                      <td>{testType.test_category}</td>
                      <td>{testType.test_template}</td>
                      <td>{testType.test_price}</td>
                      <td className="d-flex justify-content-evenly">
                        <MdDelete
                          className="fs-4 delete"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDltconfirmation(true);
                            setDeleteId(testType.id);
                          }}
                        />

                        <MdEdit
                          className="fs-4 edit"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEditClick(testType.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No test types found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ---SUCCESS MESSAGE MODAL--- */}
        <div className={`success-message ${showSuccessMessage && "active"}`}>
          <IoIosClose
            className="close-icon fs-3"
            onClick={() => setShowSuccessMessage(false)}
          />
          <div className="modal-content">
            <img src={Success} alt="" className="success-img" />
            <h5 className="text-center" style={{ color: "rgb(77, 75, 75)" }}>
              Added Successfully!
            </h5>
          </div>
        </div>

        {/* ---DELETE SUCCESS MESSAGE--- */}
        <div
          className={`dlt-success-message ${showDltSuccessMessage && "active"}`}
        >
          <IoIosClose
            className="close-icon fs-3"
            onClick={() => setShowDltSuccessMessage(false)}
          />
          <div className="modal-content">
            <img src={Success} alt="" className="success-img" />
            <h5 className="text-center" style={{ color: "rgb(77, 75, 75)" }}>
              Deleted Successfully!
            </h5>
          </div>
        </div>

        {/* ---DELETE CONFIRMATION MODAL--- */}
        <div
          className={`delete-confirmation ${showDltconfirmation && "active"}`}
        >
          <div className="modal-content">
            <TiDeleteOutline className="dlt-icon" />
            <h4 className="text-center">Are you sure?</h4>
            <p className="text-center mt-3">
              Do you really want to delete this test? This process cannot be
              undone.
            </p>

            <div className="actions-btn mt-4">
              <button
                className="custom-btn cancel-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDltconfirmation(false);
                }}
              >
                Cancel
              </button>
              <button
                className="custom-btn danger-btn"
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestType;

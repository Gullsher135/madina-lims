import { React, useState } from "react";

// ---LOGO---
import Logo from "../assets/logo.png";

// ---AXIOS---
import axios from "axios";

// ---EMAIL ICON---
import { HiOutlineMail } from "react-icons/hi";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa6";

// ---PASSWORD ICON---
import { IoKeyOutline } from "react-icons/io5";

const Login = () => {
  // ---STATES---
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---HANDLE LOGIN---
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert('Email and password are required');
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:80/madina_api/index.php",
        {
          email: email,
          password: password,
        }
      );
      const data = response.data;
      console.log(data);

     if(data.status === 200){
      sessionStorage.setItem('user' , JSON.stringify(data.user))
      window.location.href = '/'
     }else{
      alert(data.message)
     }

    } catch (error) {
      console.log(error)
    }
  };
  return (
    <div>
      <div className="login">
        <div className="custom-container">
          <div className="split">

            {/* ---LEFTSIDE CONTENT--- */}
            <div className="left-side">
              <img src={Logo} alt="" className="logo" />
              <h2 className="heading">Al Madina Laboratory</h2>
              <p>
                Step into knowledge, experience growth, and connect with
                learning through your unique entryway.
              </p>
            </div>

            {/* ---RIGHT SIDE CONTENT--- */}
            <div className="right-side">
              <img src={Logo} alt="" className="logo" />
              <h4>Al Madina Laboratory</h4>
              <h5>Sign into your account</h5>

              <div className="form-container mt-4">
                <form action="">
                  <label htmlFor="">Email Address</label>
                  <div className="form-grp-1 form-grp d-flex align-items-center justify-content-between">
                    <HiOutlineMail className="fs-4" />
                    <input type="email" placeholder="Enter Email Adress" onChange={(e) => setEmail(e.target.value)}/>
                  </div>

                  <br />

                  <label htmlFor="">Password</label>
                  <div className="form-grp-2 form-grp d-flex align-items-center justify-content-between">
                    <IoKeyOutline className="fs-4" />
                    <input
                      type={showPassword == true ? "text" : "password"}
                      placeholder="Enter Password"
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <FaRegEyeSlash
                      className={`fs-4 ${
                        showPassword == false ? "d-none" : ""
                      }`}
                      onClick={() => setShowPassword(false)}
                      style={{ cursor: "pointer" }}
                    />

                    <IoEyeOutline
                      className={`fs-4 ${showPassword == true ? "d-none" : ""}`}
                      onClick={() => setShowPassword(true)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <button className="custom-btn btn-fill" onClick={handleLogin}>Login</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

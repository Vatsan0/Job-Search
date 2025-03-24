import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Creatable from "react-select/creatable";

import { login as storeLogin } from "../../store/authSlice";
import api from "../../api/axiosConfig";
import { skillOptions } from "../../data/constants";

const CandidateRegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(""); // Error for name
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // Error for email
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // Error for password
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // Error for confirm password
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Password validation
  const isValidPassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,14}$/;
    return passwordPattern.test(password);
  };

  // Name validation
  const isValidName = (name) => {
    const namePattern = /^[A-Za-z\s]+$/;
    return namePattern.test(name.trim());
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  // Handle input change for name and validate instantly
  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    setName(nameValue);

    if (!isValidName(nameValue)) {
      setNameError("Name should only contain letters and spaces.");
    } else {
      setNameError("");
    }
  };

  // Handle input change for email and validate instantly
  const handleEmailChange = (e) => {
    const emailValue = e.target.value.toLowerCase();
    setEmail(emailValue);

    if (!isValidEmail(emailValue)) {
      setEmailError("Please enter a valid email.");
    } else {
      setEmailError("");
    }
  };

  // Handle input change for password and validate instantly
  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    if (!isValidPassword(passwordValue)) {
      setPasswordError(
        "Password must be between 8-14 characters, with at least one uppercase, one lowercase, one number, and one special character."
      );
    } else {
      setPasswordError("");
    }
  };

  // Handle input change for confirm password and validate instantly
  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);

    if (confirmPasswordValue !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const skillsArray = skills.map((item) => item.value);
    const formData = { name, email, password, skills: skillsArray };

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/candidates/signup", formData);

      if (response.status === 201) {
        dispatch(storeLogin({ isRecruiter: false, userData: response.data }));
        navigate("/");
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setError(error?.response?.data);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-14 mb-24 bg-slate-800 w-full max-w-md 2xl:max-w-xl rounded-lg flex flex-col gap-4 2xl:gap-10 mx-auto"
    >
      <h1 className="text-3xl 2xl:text-5xl font-bold text-white text-center mb-8 2xl:mb-12">
        Candidate Signup
      </h1>

      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={handleNameChange}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required={true}
        />
        {nameError && <p className="text-red-500">{nameError}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required={true}
        />
        {emailError && <p className="text-red-500">{emailError}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required={true}
        />
        {passwordError && <p className="text-red-500">{passwordError}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={`w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold ${
            confirmPasswordError ? "border-red-500 outline-red-500" : ""
          }`}
          required={true}
        />
        {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}
      </div>

      <div className="mt-6">
        <h3 className="text-lg text-white mb-1 font-medium">Skills</h3>
        <Creatable
          options={skillOptions}
          isMulti
          value={skills}
          onChange={(selectedOptions) => setSkills(selectedOptions)}
        />
      </div>

      <button
        type="submit"
        disabled={
          isLoading ||
          !name ||
          !email ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword ||
          nameError ||
          emailError ||
          passwordError ||
          confirmPasswordError
        }
        className={`py-2 px-4 my-10 bg-green-500 hover:opacity-70 rounded-lg text-white text-lg font-semibold transition-opacity ${
          (isLoading ||
            !name ||
            !email ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword ||
            nameError ||
            emailError ||
            passwordError ||
            confirmPasswordError) &&
          "opacity-30 hover:opacity-40"
        }`}
      >
        Register
      </button>

      {/* ERROR NOTIFICATION */}
      <p className="text-red-500 text-center text-lg font-black">{error}</p>

      <p className="text-secondary text-center">
        <Link
          to="/login/candidate"
          className="text-white/80 hover:text-purple-500 text-lg font-semibold"
        >
          Already Registered? Login here
        </Link>
      </p>
    </form>
  );
};

export default CandidateRegisterForm;

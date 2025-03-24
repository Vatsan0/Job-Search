import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { login as storeLogin } from "../../store/authSlice";
import api from "../../api/axiosConfig";

const RecruiterRegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(""); // Error for name
  const [company, setCompany] = useState("");
  const [companyError, setCompanyError] = useState(""); // Error for company
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // Error for email
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // Error for password
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // Error for confirm password
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]); // Suggestions for location
  const [locationError, setLocationError] = useState(""); // Error for location

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
    return namePattern.test(name);
  };

  // Company validation
  const isValidCompany = (company) => {
    const companyPattern = /^[A-Za-z\s]+$/;
    return companyPattern.test(company);
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

  // Handle input change for company and validate instantly
  const handleCompanyChange = (e) => {
    const companyValue = e.target.value;
    setCompany(companyValue);

    if (!isValidCompany(companyValue)) {
      setCompanyError("Company name should only contain letters and spaces.");
    } else {
      setCompanyError("");
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

  // Handle location input change and fetch suggestions from Nominatim API
  const handleLocationChange = (e) => {
    const locationValue = e.target.value;
    setLocation(locationValue);

    if (locationValue.length >= 3) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationValue}&addressdetails=1`)
        .then((response) => response.json())
        .then((data) => {
          // Extract city, state, and country from the returned data
          const filteredSuggestions = data.map((place) => {
            const city = place.address.city || place.address.town || place.address.village || "";
            const state = place.address.state || "";
            const country = place.address.country || "";
            return {
              city,
              state,
              country,
              display_name: `${city}, ${state}, ${country}`,
            };
          });
          setLocationSuggestions(filteredSuggestions);
        })
        .catch((error) => {
          console.error("Error fetching location data", error);
        });
    } else {
      setLocationSuggestions([]); // Clear suggestions when input is short
    }
  };

  // Handle selecting a location suggestion
  const handleLocationSelect = (suggestion) => {
    setLocation(suggestion.display_name); // Set city, state, and country to the location field
    setLocationSuggestions([]); // Clear suggestions
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = { name, email, password, company, location };

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/recruiters/signup", formData);

      if (response.status === 201) {
        dispatch(storeLogin({ isRecruiter: true, userData: response.data }));
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
      className="p-14 mb-24 bg-slate-700 w-full max-w-md 2xl:max-w-xl rounded-lg flex flex-col gap-4 2xl:gap-10 mx-auto"
    >
      <h1 className="text-3xl 2xl:text-5xl font-bold text-white text-center mb-8 2xl:mb-12">
        Recruiter Signup
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

      <div>
        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={handleCompanyChange}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required={true}
        />
        {companyError && <p className="text-red-500">{companyError}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Location (City, State, Country)"
          value={location}
          onChange={handleLocationChange}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required={true}
        />
        {locationSuggestions && locationSuggestions.length > 0 && (
          <ul className="bg-white shadow-md border rounded-lg mt-2">
            {locationSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleLocationSelect(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
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
          !company ||
          !location ||
          nameError ||
          companyError ||
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
            !company ||
            !location ||
            nameError ||
            companyError ||
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
          to="/login/recruiter"
          className="text-white/80 hover:text-purple-500 text-lg font-semibold"
        >
          Already Registered? Login here
        </Link>
      </p>
    </form>
  );
};

export default RecruiterRegisterForm;

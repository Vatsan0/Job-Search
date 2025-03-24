import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Creatable from "react-select/creatable";
import { addJobIdToRecruiter } from "../store/authSlice";
import api from "../api/axiosConfig";
import { skillOptions } from "../data/constants";

const PostJobForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userData = useSelector((state) => state.auth.userData);
  const isRecruiter = useSelector((state) => state.auth.isRecruiter);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login/recruiter");
    } else if (!isRecruiter) {
      navigate("/");
    }
  }, [isAuthenticated, navigate, isRecruiter]);

  const handleInputChange = (setter, field, value) => {
    let updatedErrors = { ...errors };

    // Validations
    if (["position", "company", "location"].includes(field)) {
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        updatedErrors[field] = "Invalid Entry, Please make the correct one";
      } else {
        delete updatedErrors[field];
      }
    }

    if (field === "experience") {
      if (!/^\d+\+?\s*years?$/.test(value)) {
        updatedErrors[field] = "Format should be like '3+ years'.";
      } else {
        delete updatedErrors[field];
      }
    }

    setErrors(updatedErrors);
    setter(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Object.keys(errors).length > 0) {
      setError("Please correct the errors before submitting.");
      return;
    }

    const skillsArray = skills.map((item) => item.value);
    const formData = {
      position,
      company,
      location,
      experience,
      description,
      skills: skillsArray,
    };

    setIsLoading(true);

    try {
      const jobResponse = await api.post("/api/v1/jobs", formData);

      if (jobResponse.status === 201) {
        const appendResponse = await api.post(
          `/api/v1/recruiters/${userData?.email}/appendjob`,
          jobResponse.data.id
        );

        if (appendResponse.status === 200) {
          dispatch(addJobIdToRecruiter({ jobId: jobResponse.data.id }));

          setIsLoading(false);
          navigate("/jobs");
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setError("Something went wrong!");
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-14 mb-24 bg-slate-800 w-full max-w-3xl 2xl:max-w-5xl rounded-lg flex flex-col gap-4 2xl:gap-10 mx-auto"
    >
      <h1 className="text-2xl 2xl:text-4xl font-bold text-white text-center mb-8 2xl:mb-12">
        Post New Job
      </h1>

      <div>
        <input
          type="text"
          placeholder="Position (e.g. Software Engineer)"
          value={position}
          onChange={(e) => handleInputChange(setPosition, "position", e.target.value)}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required
        />
        {errors.position && <p className="text-red-500">{errors.position}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={(e) => handleInputChange(setCompany, "company", e.target.value)}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required
        />
        {errors.company && <p className="text-red-500">{errors.company}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Location (e.g. Bangalore)"
          value={location}
          onChange={(e) => handleInputChange(setLocation, "location", e.target.value)}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required
        />
        {errors.location && <p className="text-red-500">{errors.location}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Experience Required (e.g. 3+ years)"
          value={experience}
          onChange={(e) => handleInputChange(setExperience, "experience", e.target.value)}
          className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
          required
        />
        {errors.experience && <p className="text-red-500">{errors.experience}</p>}
      </div>

      <div>
        <textarea
          cols="30"
          rows="5"
          placeholder="Job Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full py-2 px-4 rounded-lg text-black/80 font-medium"
        ></textarea>
      </div>

      <div>
        <h3 className="text-lg text-white mb-2 font-medium">Skills Required</h3>
        <Creatable
          options={skillOptions}
          isMulti
          value={skills}
          onChange={(selectedOptions) => setSkills(selectedOptions)}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`mt-8 py-2 px-4 bg-green-500 hover:opacity-70 rounded-lg text-white text-lg font-bold transition-opacity ${
          isLoading && "opacity-30 hover:opacity-40"
        }`}
      >
        Post Job
      </button>

      {/* ERROR NOTIFICATION */}
      {error && <p className="text-red-500 text-center text-lg font-black">{error}</p>}
    </form>
  );
};

export default PostJobForm;
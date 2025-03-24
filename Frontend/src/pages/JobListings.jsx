import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";
import JobsList from "../components/JobsList";
import JobApplication from "../components/modals/JobApplication";
import Confirmation from "../components/modals/Confirmation";

const JobListings = () => {
  const userData = useSelector((state) => state.auth.userData);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isJobApplicationModalOpen, setIsJobApplicationModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);

  // User's skills
  const userSkills = userData?.skills || [];

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      const jobsResponse = await api.get("/api/v1/jobs");
      setJobs(jobsResponse.data);
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  const openApplicationModal = () => {
    setIsJobApplicationModalOpen(true);
  };

  const closeApplicationModal = () => {
    setIsJobApplicationModalOpen(false);
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const applyForJob = async (formData) => {
    try {
      const applyResponse = await api.post("/api/v1/applications", formData);

      if (applyResponse.status === 201) {
        closeApplicationModal();
        setConfirmationMessage(`Successfully applied to the job: ${selectedJob?.position} at ${selectedJob?.company}`);
        openConfirmationModal();
      }
    } catch (error) {
      console.log(error);
      closeApplicationModal();
      setConfirmationMessage("Some error occurred while applying for the job. Kindly try again!");
      openConfirmationModal();
    }
  };

  const deleteJob = async (job) => {
    setActionLoading(true);

    try {
      const deleteResponse = await api.delete(`/api/v1/jobs/${job.id}`);

      if (deleteResponse.status === 204) {
        const removeResponse = await api.post(`/api/v1/recruiters/${userData.email}/removejob`, job.id);

        if (removeResponse.status === 200) {
          setJobs(jobs.filter((item) => item.id !== job.id));
          setConfirmationMessage(`Successfully deleted the job: ${job?.position} at ${job?.company}`);
          openConfirmationModal();
        }

        setActionLoading(false);
      }
    } catch (error) {
      console.log(error);
      setActionLoading(false);
      setConfirmationMessage("Some error occurred while deleting the job. Kindly try again!");
      openConfirmationModal();
    }
  };

  // Filter jobs based on search term, company, location, and user skills
  const filteredJobs = jobs.filter(job => {
    const isMatchingSkills = selectedSkills.length === 0 || selectedSkills.every(skill => job.skills.includes(skill));
    const isMatchingCompany = selectedCompany.length === 0 || selectedCompany.some(company => job.company.toLowerCase().includes(company.toLowerCase()));
    const isMatchingLocation = selectedLocation.length === 0 || selectedLocation.some(location => job.location.toLowerCase().includes(location.toLowerCase()));
    const isMatchingTitle = job.position.toLowerCase().includes(searchTerm.toLowerCase());

    return isMatchingSkills && isMatchingCompany && isMatchingLocation && isMatchingTitle;
  });

  // Sort jobs: first show jobs that match the user's skills
  const skillMatchedJobs = filteredJobs.filter(job => userSkills.some(skill => job.skills.includes(skill)));
  const otherJobs = filteredJobs.filter(job => !userSkills.some(skill => job.skills.includes(skill)));

  return (
    <div className="pt-40 px-32">
      {/* Main Layout with Flex */}
      <div className="flex gap-8">
        {/* Left Side: Filters */}
        <div className="w-1/4 space-y-6">
          <div className="mb-6">
            <input
              type="text"
              className="w-full p-3 rounded border border-gray-300"
              placeholder="Search by Job Title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Skills Filter */}
          <details className="group relative overflow-hidden rounded border border-gray-300 shadow-sm dark:border-gray-600">
            <summary className="flex items-center justify-between gap-2 p-3 text-gray-700 dark:text-gray-200">
              <span className="text-sm font-medium">Skills</span>
              <span className="transition-transform group-open:-rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>

            <div className="bg-white dark:bg-gray-900 p-3">
              <div className="flex flex-col gap-3">
                {Array.from(new Set(jobs.flatMap((job) => job.skills))).map((skill) => (
                  <label key={skill} className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-900"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = e.target.checked
                          ? [...selectedSkills, skill]
                          : selectedSkills.filter((s) => s !== skill);
                        setSelectedSkills(newSkills);
                      }}
                      checked={selectedSkills.includes(skill)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>

          {/* Location Filter */}
          <details className="group relative overflow-hidden rounded border border-gray-300 shadow-sm dark:border-gray-600">
            <summary className="flex items-center justify-between gap-2 p-3 text-gray-700 dark:text-gray-200">
              <span className="text-sm font-medium">Location</span>
              <span className="transition-transform group-open:-rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>

            <div className="bg-white dark:bg-gray-900 p-3">
              <div className="flex flex-col gap-3">
                {Array.from(new Set(jobs.map((job) => job.location))).map((location) => (
                  <label key={location} className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-900"
                      value={location}
                      onChange={(e) => {
                        const newLocation = e.target.checked
                          ? [...selectedLocation, location]
                          : selectedLocation.filter((loc) => loc !== location);
                        setSelectedLocation(newLocation);
                      }}
                      checked={selectedLocation.includes(location)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>

          {/* Company Filter */}
          <details className="group relative overflow-hidden rounded border border-gray-300 shadow-sm dark:border-gray-600">
            <summary className="flex items-center justify-between gap-2 p-3 text-gray-700 dark:text-gray-200">
              <span className="text-sm font-medium">Company</span>
              <span className="transition-transform group-open:-rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>

            <div className="bg-white dark:bg-gray-900 p-3">
              <div className="flex flex-col gap-3">
                {Array.from(new Set(jobs.map((job) => job.company))).map((company) => (
                  <label key={company} className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-900"
                      value={company}
                      onChange={(e) => {
                        const newCompany = e.target.checked
                          ? [...selectedCompany, company]
                          : selectedCompany.filter((comp) => comp !== company);
                        setSelectedCompany(newCompany);
                      }}
                      checked={selectedCompany.includes(company)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{company}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>

        {/* Right Side: Job Results */}
        <div className="w-3/4">
          {isLoading ? (
            <p className="text-white text-lg font-bold">Loading...</p>
          ) : filteredJobs.length > 0 ? (
            <>
              {skillMatchedJobs.length > 0 && (
                <div>
                  <h2 className="text-white text-lg font-bold">Jobs Matching Your Skills</h2>
                  <JobsList
                    actionLoading={actionLoading}
                    jobs={skillMatchedJobs}
                    onApply={openApplicationModal}
                    onDelete={deleteJob}
                    setSelectedJob={setSelectedJob}
                  />
                </div>
              )}

              {otherJobs.length > 0 && (
                <div>
                  <h2 className="text-white text-lg font-bold">Other Jobs</h2>
                  <JobsList
                    actionLoading={actionLoading}
                    jobs={otherJobs}
                    onApply={openApplicationModal}
                    onDelete={deleteJob}
                    setSelectedJob={setSelectedJob}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-white text-lg font-bold">No jobs available based on your filters.</p>
          )}
        </div>
      </div>

      <JobApplication
        isOpen={isJobApplicationModalOpen}
        onClose={closeApplicationModal}
        job={selectedJob}
        applyForJob={applyForJob}
      />

      <Confirmation
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        message={confirmationMessage}
      />
    </div>
  );
};

export default JobListings;

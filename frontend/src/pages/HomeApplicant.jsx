import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoChatbubbleEllipses } from "react-icons/io5"; // Importing chat icon

const HomeApplicant = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [userName, setUserName] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Set username from localStorage when the component is mounted
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      console.error("User name is not stored in localStorage");
    }

    // Fetch jobs and applied jobs
    const fetchJobsAndApplications = async () => {
      try {
        const [jobsRes, appliedJobsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/application/jobs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/application/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (jobsRes.data && appliedJobsRes.data) {
          setJobs(jobsRes.data);
          setAppliedJobs(appliedJobsRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchJobsAndApplications();
  }, [token]);

  // Handle job application
  const applyForJob = async (jobId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/application/apply/${jobId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update applied jobs list
      setAppliedJobs((prev) => [
        ...prev,
        {
          id: `${userId}-${jobId}`,
          jobId,
          Job: jobs.find((j) => j.id === jobId),
        },
      ]);
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-4">
      {/* Navbar */}
      <nav className="bg-purple-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Job Board</h1>
        <div className="flex items-center">
          <span className="mr-4">Welcome, {userName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Available Jobs */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>
        {jobs.length === 0 ? (
          <p>No jobs available.</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="border p-3 flex flex-col md:flex-row justify-between items-center rounded shadow-md"
              >
                <div className="flex flex-col md:flex-row justify-between items-center w-full">
                  <span className="font-semibold">{job.title}</span>
                  <span className="text-sm text-gray-500">
                    {job.description}
                  </span>
                </div>
                <button
                  onClick={() => applyForJob(job.id)}
                  className={`mt-2 md:mt-0 px-3 py-1 rounded ${
                    appliedJobs.some(
                      (appliedJob) => appliedJob.jobId === job.id
                    )
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-500 text-white"
                  }`}
                  disabled={appliedJobs.some(
                    (appliedJob) => appliedJob.jobId === job.id
                  )}
                >
                  {appliedJobs.some((appliedJob) => appliedJob.jobId === job.id)
                    ? "Applied"
                    : "Apply"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Your Applications */}
        <h2 className="text-2xl font-bold mt-6 mb-4">Your Applications</h2>
        <ul className="space-y-3">
          {appliedJobs.map((application) => (
            <li
              key={application.id || `${userId}-${application.jobId}`}
              className="border p-3 rounded shadow-md"
            >
              {application.Job?.title || "Job Title Not Found"}
            </li>
          ))}
        </ul>
      </div>

      {/* Floating Chat Icon */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300"
      >
        <IoChatbubbleEllipses size={40} />
      </button>
    </div>
  );
};

export default HomeApplicant;

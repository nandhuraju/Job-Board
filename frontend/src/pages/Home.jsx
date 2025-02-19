import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const userName = localStorage.getItem("userName"); // Fetch name from localStorage
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/job", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs", error);
      }
    };
    fetchJobs();
  }, []);

  const deleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Job Board</h1>
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Welcome, {userName}!</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Jobs</h2>
          <button
            onClick={() => navigate("/add-job")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            + Add Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-600 text-center">No jobs found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 shadow-md rounded-lg border flex flex-col justify-between"
              >
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-gray-700 mt-2">{job.description}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => navigate(`/view-applicants/${job.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    View Applicants
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

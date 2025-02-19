import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ViewApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/job/${jobId}/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplicants(response.data);
    };
    fetchApplicants();
  }, [jobId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <button
          onClick={() => navigate("/home")}
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">Job Board</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Applicants</h2>
        {applicants.length === 0 ? (
          <p className="text-gray-600 text-center">
            No applicants found for this job.
          </p>
        ) : (
          <ul className="space-y-2">
            {applicants.map((applicant) => (
              <li
                key={applicant.id}
                className="border p-4 bg-white rounded shadow-md"
              >
                <p className="font-semibold">
                  {applicant.User?.name || "Unknown"}
                </p>
                <p className="text-gray-600">
                  {applicant.User?.email || "Unknown Email"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;

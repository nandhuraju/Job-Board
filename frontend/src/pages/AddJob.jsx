import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddJob = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/job", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Job added successfully!");
      navigate("/home");
    } catch (error) {
      console.error(
        "Job creation failed:",
        error.response?.data || error.message
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
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

      {/* Form */}
      <div className="p-6 max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md"
        >
          <h2 className="text-2xl font-bold mb-4">Add Job</h2>
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            required
          />
          <textarea
            name="description"
            placeholder="Job Description"
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;

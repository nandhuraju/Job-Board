import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "applicant", // Default role
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/register",
        formData
      );

      // Store token in localStorage after signup
      localStorage.setItem("token", response.data.token);

      alert("Signup successful!");

      // Redirect to login after signup
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/src/assets/WhatsApp Image 2025-02-19 at 10.27.26 AM.jpeg')",
      }}
    >
      {/* Signup Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <select
            name="role"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="applicant">Applicant</option>
            <option value="company">Company</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

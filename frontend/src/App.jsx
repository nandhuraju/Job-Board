import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import Home from "./pages/Home";
import AddJob from "./pages/AddJob";
import ViewApplicants from "./pages/ViewApplicants";
import HomeApplicant from "./pages/HomeApplicant";
import LoginPage from "./pages/LoginPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/view-applicants/:jobId" element={<ViewApplicants />} />
        <Route path="/homeApplicant" element={<HomeApplicant/>} />
      </Routes>
    </Router>
  );
};

export default App;

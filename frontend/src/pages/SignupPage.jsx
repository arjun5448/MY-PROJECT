import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api/authApi";
import { extractApiError } from "../utils/errorUtils";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await signupUser(formData);
      setSuccess(data.message || "Signup successful. Please login.");
      setFormData({ username: "", password: "" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (apiError) {
      setError(extractApiError(apiError, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <span className="eyebrow">Advisor Workspace</span>
        <h1>Create your LIC tracking workspace.</h1>
        <p>
          Set up your account and start managing customer premiums, policy dates, and follow-up
          actions from one dashboard.
        </p>
      </div>

      <div className="auth-card">
        <h2>Signup</h2>
        <p>Create a secure account to manage your clients.</p>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Creating..." : "Signup"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;

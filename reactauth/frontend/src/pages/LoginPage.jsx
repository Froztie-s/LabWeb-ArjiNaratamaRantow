import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { detectRoleFromEmail, redirectPathForRole } from "../utils/role";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.usernameOrEmail || !form.password) {
      setError("Please fill out both fields.");
      return;
    }
    setLoading(true);
    try {
      console.log("Attempting login with:", form);
      const data = await loginUser(form);
      console.log("Login response:", data);

      const detectedRole =
        data?.user?.role ||
        detectRoleFromEmail(data?.user?.email || form.usernameOrEmail) ||
        "student";
      console.log("Detected role:", detectedRole);

      const user = { ...data.user, role: detectedRole };
      // Extract token from the nested structure
      const tokenValue = data.token?.access || '';
      console.log("Raw token from server:", data.token);
      console.log("Extracted token value:", tokenValue);
      setAuthData({ user, token: tokenValue });

      const redirectPath = redirectPathForRole(detectedRole);
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Log in to access your dashboard.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username or Email
            <input
              type="text"
              name="usernameOrEmail"
              value={form.usernameOrEmail}
              onChange={handleChange}
              placeholder="student@..."
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="muted">
          Need an account? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

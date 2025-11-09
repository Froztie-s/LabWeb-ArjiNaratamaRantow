import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { detectRoleFromEmail, redirectPathForRole } from "../utils/role";

const initialState = {
  email: "",
  username: "",
  full_name: "",
  password: "",
  password_confirmation: "",
  major: "",
  role: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim() && key !== "major") {
        // major is optional
        nextErrors[key] = "Required";
      }
    });
    if (form.password && form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = "Passwords do not match";
    }
    const role = detectRoleFromEmail(form.email);
    if (!role) {
      nextErrors.email = "Use your campus email to determine your role.";
    }
    return { nextErrors, role };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    const { nextErrors, role } = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      // Set role based on email domain
      const detectedRole = detectRoleFromEmail(form.email);
      const payload = {
        ...form,
        role: detectedRole,
        password_confirmation: form.password_confirmation,
      };
      await registerUser(payload);
      setStatus("Account created! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setStatus(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Your Account</h1>
        <p className="muted">Use your official Prasetiya Mulya email.</p>
        {status && (
          <div
            className={`toast ${
              status.startsWith("Account") ? "success" : "error"
            }`}
          >
            {status}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
            />
            {errors.full_name && (
              <span className="field-error">{errors.full_name}</span>
            )}
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="you@student.prasetiyamulya.ac.id"
              onChange={handleChange}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </label>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
            />
            {errors.password_confirmation && (
              <span className="field-error">
                {errors.password_confirmation}
              </span>
            )}
          </label>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

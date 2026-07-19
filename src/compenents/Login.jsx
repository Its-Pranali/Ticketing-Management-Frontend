import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import ShaderBackground from "./ShaderBackground";
import "../../public/assets/css/LoginStyle.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();


  const validator = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email id is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setErrors({
      ...errors,
      [e.target.name]: ""
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validator();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/login', formData);
      if (response.data.status) {
        // Save the Passport access token so future API requests include it
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        login(response.data.user);
        navigate('/dashboard');
      } else {
        setErrors({ general: response.data.message || "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error while login", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.message === 'Network Error') {
        setErrors({ general: "Cannot reach server. Make sure the backend is running on port 8000." });
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    // Override the centered container (#root) widths, borders, and background
    const rootEl = document.getElementById("root");
    let originalRootBorder = "";
    let originalRootMaxWidth = "";
    let originalRootWidth = "";
    let originalRootBg = "";
    if (rootEl) {
      originalRootBorder = rootEl.style.borderInline;
      originalRootMaxWidth = rootEl.style.maxWidth;
      originalRootWidth = rootEl.style.width;
      originalRootBg = rootEl.style.backgroundColor;

      rootEl.style.borderInline = "none";
      rootEl.style.maxWidth = "100vw";
      rootEl.style.width = "100%";
      rootEl.style.backgroundColor = "transparent";
    }

    // Save body & html background styles
    const originalBodyBg = document.body.style.background;
    const originalHtmlBg = document.documentElement.style.background;

    // Apply black viewport background for shader canvas
    document.body.style.background = "transparent";
    document.documentElement.style.background = "#000";

    return () => {
      // Restore on exit
      if (rootEl) {
        rootEl.style.borderInline = originalRootBorder;
        rootEl.style.maxWidth = originalRootMaxWidth;
        rootEl.style.width = originalRootWidth;
        rootEl.style.backgroundColor = originalRootBg;
      }
      document.body.style.background = originalBodyBg;
      document.documentElement.style.background = originalHtmlBg;
    };
  }, []);

  // 3D Card rotation coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };



  return (
    <div className="login-container">
      {/* Interactive WebGL Shader Background */}
      <ShaderBackground />

      {/* Background gradients and noise */}
      <div className="glow-bg-purple" />
      <div className="noise-overlay" />

      {/* Top and Bottom ambient glows */}
      <div className="glow-top-1" />
      <motion.div className="glow-top-2" animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} />
      <motion.div className="glow-bottom" animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }} />

      {/* Decorative pulse glow spots */}
      <div className="glow-spot-1" />
      <div className="glow-spot-2" />

      {/* Card container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="card-container" style={{ perspective: 1500 }}  >
        <motion.div className="card-wrapper-tilt" style={{ rotateX, rotateY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} whileHover={{ z: 10 }}  >
          {/* Animated Light Beam Borders */}
          <div className="beams-border-wrapper">
            {/* Top Light Beam */}
            <motion.div style={{ position: "absolute", top: 0, left: 0, height: "3px", width: "50%", background: "linear-gradient(to right, transparent, #fff, transparent)", opacity: 0.7 }} animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], }} transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" } }} />

            {/* Right Light Beam */}
            <motion.div style={{ position: "absolute", top: 0, right: 0, height: "50%", width: "3px", background: "linear-gradient(to bottom, transparent, #fff, transparent)", opacity: 0.7 }} animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], }} transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }} />

            {/* Bottom Light Beam */}
            <motion.div style={{ position: "absolute", bottom: 0, right: 0, height: "3px", width: "50%", background: "linear-gradient(to right, transparent, #fff, transparent)", opacity: 0.7 }} animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], }} transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }} />

            {/* Left Light Beam */}
            <motion.div style={{ position: "absolute", bottom: 0, left: 0, height: "50%", width: "3px", background: "linear-gradient(to bottom, transparent, #fff, transparent)", opacity: 0.7 }} animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], }} transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }} />

            {/* Corner Glow Spots */}
            <motion.div className="corner-glow top-left" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }} />
            <motion.div className="corner-glow top-right" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }} />
            <motion.div className="corner-glow bottom-right" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }} />
            <motion.div className="corner-glow bottom-left" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }} />
          </div>

          {/* Glass Card Body */}
          <div className="card-main">
            <div className="card-inner-pattern" />

            {/* Header Section */}
            <div className="card-header-section">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.8 }} className="logo-circle-new" >
                Ticketing System
                {/* <img src="../../public/assets/images/vol-logo.png" alt="" /> */}
                <div className="logo-inner-glow" />
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="header-title"  >
                Welcome Back
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="header-subtitle" >
                Sign in to continue
              </motion.p>
            </div>

            {/* Form Space */}
            <form onSubmit={handleSubmit} className="form-space">
              <div className="input-group">
                {/* Email Input */}
                <motion.div className={`input-wrapper-new ${focusedInput === "email" ? "focused" : ""}`} whileFocus={{ scale: 1.02 }} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} >
                  <Mail className="input-icon-left" />
                  <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} onFocus={() => setFocusedInput("email")} onBlur={() => setFocusedInput(null)} className="input-element-new" required />
                  {focusedInput === "email" && (
                    <motion.div layoutId="input-highlight" className="input-highlight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                  )}
                  {errors.email && (
                    <div className="text-danger text-small">{errors.email}</div>
                  )}
                </motion.div>



                {/* Password Input */}
                <motion.div className={`input-wrapper-new ${focusedInput === "password" ? "focused" : ""}`} whileFocus={{ scale: 1.02 }} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} >
                  <Lock className="input-icon-left" />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedInput("password")} onBlur={() => setFocusedInput(null)} className="input-element-new" required />

                  {/* Eye Toggle button */}
                  <div onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                    {showPassword ? (
                      <EyeOff className="password-toggle-icon" />
                    ) : (
                      <Eye className="password-toggle-icon" />
                    )}
                  </div>

                  {focusedInput === "password" && (
                    <motion.div layoutId="input-highlight" className="input-highlight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                  )}

                  {errors.password && (
                    <div className="text-danger small">{errors.password}</div>
                  )}
                </motion.div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="remember-forgot-container">
                <div className="checkbox-wrapper">
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input id="remember-me" type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="custom-checkbox-input" />
                    {rememberMe && (
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="custom-checkbox-tick" >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <label htmlFor="remember-me" className="checkbox-label">
                    Remember me
                  </label>
                </div>

                <a href="#" className="forgot-password-link">
                  Forgot password?
                </a>
              </div>

              {/* General error message */}
              {/* {errors.general && (
                <div style={{
                  background: 'rgba(255,80,80,0.12)',
                  border: '1px solid rgba(255,80,80,0.4)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginBottom: '8px'
                }}>
                  {errors.general}
                </div>
              )} */}

              {/* Sign In button */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="google-button-new primary-button-new" >
                <div className="google-button-glow" />
                <div className="google-button-body">
                  <span className="google-button-text">{isLoading ? "Logging in..." : "Login"}</span>
                </div>
              </motion.button>

              {/* <p className="signup-footer">
                Don't have an account?
                <a className="signup-link-new" href="#">
                  Sign up
                  <span className="signup-link-underline" />
                </a>
              </p> */}
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
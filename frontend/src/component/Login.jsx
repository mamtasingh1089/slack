import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";
import AuthLayout from "./auth/AuthLayout";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [email, setEmail] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!captchaValue) {
      setErrorMsg("Please complete the reCAPTCHA.");
      return;
    }

    try {
      setLoading(true);

      // Attempt standard user login first with default fallback password
      try {
        const res = await axios.post("/api/user/login", {
          email,
          password: "Password123!",
        });

        const { token, user: loggedUser } = res.data;
        if (token && loggedUser) {
          localStorage.setItem("token", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          dispatch(setUser(loggedUser));
          navigate("/");
          return;
        }
      } catch (err) {
        console.warn("Standard user login failed, falling back to Slack passwordless flow:", err);
      }

      // Fallback: Slack login flow (which is passwordless with recaptcha)
      const res = await axios.post("/api/slack/slacklogin", {
        email,
        captcha: captchaValue,
      });

      const token = res?.data?.token;
      const loggedUser = res?.data?.user;

      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      if (loggedUser) {
        dispatch(setUser(loggedUser));
      }

      navigate("/");
    } catch (error) {
      console.error("Login failure:", error);
      setErrorMsg(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to sign in. Please verify your email or reCAPTCHA."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Floating Create Account Trigger */}
      <div className="absolute top-6 right-6 text-sm text-[#5F6F69]">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-[#0D8F7A] font-semibold cursor-pointer hover:underline"
        >
          Create an account
        </span>
      </div>

      {/* Main Content Form Container */}
      <div className="flex flex-col gap-6 w-full px-4">
        
        {/* Welcome Header */}
        <div className="flex flex-col gap-1.5 text-center mt-8 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#16231F]">
            Enter your email to sign in
          </h1>
          <p className="text-[#5F6F69] text-sm mt-1">
            Or choose another option to sign in.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D9534F] rounded-md text-sm text-center">
            {errorMsg}
          </div>
        )}

        {user && (
          <div className="p-3 bg-green-50 border border-green-200 text-[#219B75] rounded-md text-sm text-center">
            Welcome back, {user.name}!
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            id="email"
            placeholder="name@work-email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-md border-2 border-[#0D8F7A] focus:outline-none focus:ring-2 focus:ring-[#087765] bg-white text-[#16231F] font-medium"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 mt-4 rounded-md text-white font-semibold transition-colors flex items-center justify-center ${
              loading ? "bg-[#A3E0D6] cursor-not-allowed" : "bg-[#0D8F7A] hover:bg-[#087765]"
            }`}
          >
            {loading ? "Processing..." : "Sign In With Email"}
          </button>

          {/* reCAPTCHA Checkbox */}
          <div className="mt-2 flex justify-center w-full">
            <ReCAPTCHA
              sitekey="6LcBK8orAAAAAN5v2azDSWpnmI7rfSEj0PMt9hxP"
              onChange={handleCaptchaChange}
            />
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
            Or sign in with
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Authentication Button - Google Only */}
        <div className="w-full">
          <button
            type="button"
            className="flex items-center justify-center gap-3 w-full h-12 border border-gray-300 rounded-md text-sm font-semibold text-[#16231F] hover:bg-gray-50 transition-colors"
          >
            <FcGoogle className="text-xl" /> Google
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm">
          <span className="text-[#5F6F69]">Having trouble? </span>
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Try entering a workspace URL
          </span>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Login;

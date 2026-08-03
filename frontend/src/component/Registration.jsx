import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";
import { serverURL } from '../main';

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post(`${serverURL}/api/user/register`, {
        name,
        email,
        password,
      });
      const { token, user } = result.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      dispatch(setUser(user));
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Sign In Trigger */}
      <div className="absolute top-6 right-6 text-sm text-[#5F6F69]">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-[#0D8F7A] font-semibold cursor-pointer hover:underline"
        >
          Sign in
        </span>
      </div>

      {/* Main Content Form Container */}
      <div className="flex flex-col gap-6 w-full px-4">
        
        {/* Welcome Header */}
        <div className="flex flex-col gap-1.5 text-center mt-8 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#16231F]">
            Create your nineAm account
          </h1>
          <p className="text-[#5F6F69] text-sm mt-1">
            Or choose another option to get started.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D9534F] rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {user && (
          <div className="p-3 bg-green-50 border border-green-200 text-[#219B75] rounded-md text-sm text-center">
            Welcome, {user.name}!
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            id="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-md border-2 border-[#0D8F7A] focus:outline-none focus:ring-2 focus:ring-[#087765] bg-white text-[#16231F] font-medium"
          />

          <input
            type="email"
            id="email"
            placeholder="name@work-email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-md border-2 border-[#0D8F7A] focus:outline-none focus:ring-2 focus:ring-[#087765] bg-white text-[#16231F] font-medium"
          />

          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Processing..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
            Or register with
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Authentication Buttons - Google & Apple */}
        <div className="flex gap-4 w-full">
          <button
            type="button"
            className="flex items-center justify-center gap-3 w-1/2 h-12 border border-gray-300 rounded-md text-sm font-semibold text-[#16231F] hover:bg-gray-50 transition-colors"
          >
            <FcGoogle className="text-xl" /> Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-3 w-1/2 h-12 border border-gray-300 rounded-md text-sm font-semibold text-[#16231F] hover:bg-gray-50 transition-colors"
          >
            <FaApple className="text-xl" /> Apple
          </button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-[#5F6F69] text-xs">
          <span className="cursor-pointer hover:underline">Privacy & terms</span>
          <span className="cursor-pointer hover:underline">Contact us</span>
          <span className="cursor-pointer hover:underline">Change region</span>
        </div>

      </div>
    </>
  );
};

export default Registration;

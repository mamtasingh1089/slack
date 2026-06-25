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
  const user = useSelector((state) => state.user.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      {/* Logo */}
      <div className="flex flex-row items-center gap-2 mb-6">
        <img
          src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
          alt="Slack"
          className="w-8 h-8"
        />
        <p className="font-bold text-2xl">Slack</p>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center">
        Enter your email address to <br /> register
      </h1>
      <p className="text-gray-600 mt-2">Or choose another option</p>

      
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col">
        <input
          type="text"
          placeholder="Name"
          className="h-[45px] mt-5 px-4 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
        <input
          type="email"
          placeholder="name@work-email.com"
          className="h-[45px] mt-5 px-4 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="h-[45px] mt-5 px-4 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        <button
          type="submit"
          className="h-[45px] mt-5 bg-[#703578] text-white font-medium rounded-md"
        >
          Register
        </button>
      </form>

    
      {error && <p className="text-red-600 mt-3">{error}</p>}

      {/* Success Info */}
      {user && <div className="mt-3">Welcome, {user.name}</div>}

      {/* Divider */}
      <div className="flex items-center w-full max-w-md my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">OTHER OPTIONS</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Social Buttons */}
      <div className="w-full max-w-md flex gap-4">
        <button className="w-1/2 h-[45px] border border-gray-400 rounded-md font-medium hover:bg-gray-50 flex justify-center items-center gap-2">
          <FcGoogle className="text-xl" /> Google
        </button>
        <button className="w-1/2 h-[45px] border border-gray-400 rounded-md font-medium hover:bg-gray-50 flex justify-center items-center gap-2">
          <FaApple className="text-xl" /> Apple
        </button>
      </div>

      {/* Footer Links */}
      <p className="mt-10 text-gray-600">Already using Slack?</p>
      <p
        onClick={() => navigate("/login")}
        className="text-blue-600 cursor-pointer"
      >
        Sign in to an existing workspace
      </p>

      <div className="flex gap-6 mt-10 text-gray-500 text-sm">
        <p className="cursor-pointer">Privacy & terms</p>
        <p className="cursor-pointer">Contact us</p>
        <p className="cursor-pointer">Change region</p>
      </div>
    </div>
  );
};

export default Registration;

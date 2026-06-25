import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";
import { serverURL } from '../main';

const Login = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate=useNavigate()
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const dispatch=useDispatch();
  const user =useSelector((state)=>state.user.user)


const handleSubmit = async (e) => {
  e.preventDefault();
  console.log({ email, password });
  try {
    const res = await axios.post(`${serverURL}/api/user/login`, {
  email,
  password,
});

    const { token, user } = res.data;
    if (!token || !user) throw new Error("Invalid login response")
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    dispatch(setUser(user));
    console.log({ token, user }, "token");
    navigate("/");
  } catch (error) {
    console.error(error);
  }
};
 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    
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

     
     
      <input
        type="email"
        placeholder="name@work-email.com"
        name="email"
        className="w-full max-w-md h-[45px] mt-5 px-4 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
        onChange={(e)=>setEmail(e.target.value)}
        value={email}
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        className="w-full max-w-md h-[45px] mt-5 px-4 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
        onChange={(e)=>setPassword(e.target.value)}
        value={password}
      />

    
      <button
       
        className="w-full max-w-md h-[45px] mt-5 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-md"
        onClick={handleSubmit}
      >
        Continoue
      </button>

     
      <div className="flex items-center w-full max-w-md my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">OTHER OPTIONS</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

     
      <div className="w-full max-w-md flex gap-4">
        <button className="w-1/2 h-[45px] border border-gray-400 rounded-md font-medium hover:bg-gray-50 flex justify-center items-center gap-2">
          <FcGoogle className="text-xl" /> Google
        </button>
        <button className="w-1/2 h-[45px] border border-gray-400 rounded-md font-medium hover:bg-gray-50 flex justify-center items-center gap-2">
          <FaApple className="text-xl" /> Apple
        </button>
      </div>

     
      <p className="mt-10 text-gray-600"
       >Don't have account?</p>
      <p
        onClick={() => navigate("/register")}
        className="text-blue-600 cursor-pointer"
      >
        Rigester
      </p>
{user && <div>welcome {user.name}</div>}
      <div className="flex gap-6 mt-10 text-gray-500 text-sm">
        <p className="cursor-pointer">Privacy & terms</p>
        <p className="cursor-pointer">Contact us</p>
        <p className="cursor-pointer">Change region</p>
      </div>
    </div>
  );
};

export default Login;

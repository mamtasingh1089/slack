import React, { useState, useEffect, useRef } from "react";
import { CiClock2, CiSearch } from "react-icons/ci";
import { FaArrowRight, FaArrowLeft, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUnreadConversations, fetchConversations } from "../redux/conversationSlice";
import axios from "axios";
import { serverURL } from '../main';
import Avatar from "../component/Avatar"; 

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const unreadConversations = useSelector(selectUnreadConversations);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openChat = async (otherId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${serverURL}/api/conversation/read/${otherId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      dispatch(fetchConversations());
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
    navigate(`/user/${otherId}`);
    setIsDropdownOpen(false);
  };

  return (
   
 <div className="h-12 fixed top-0 left-0 right-0 bg-[#3f0c41] text-white flex items-center justify-between shadow-md px-4 z-50">
      <div className="flex items-center gap-5">
        <FaArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
        <FaArrowRight onClick={() => navigate(1)} className="cursor-pointer" />
        <CiClock2 />
      </div>

      <div className="flex-1 flex justify-center px-8">
        <div className="w-full max-w-lg flex items-center bg-[#5a2a5c] rounded-md px-3 py-1">
          <CiSearch className="text-xl text-gray-300 mr-2" />
          <input
            type="text"
            placeholder="Search Koalaliving..."
            className="bg-transparent text-white placeholder-gray-300 w-full focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative cursor-pointer text-xl">
            <FaBell />
            {unreadConversations.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-xs flex items-center justify-center">
                {unreadConversations.length}
              </div>
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-md shadow-lg border border-gray-700">
              <div className="p-3 border-b border-gray-700"> <h3 className="font-semibold">Unread Messages</h3> </div>
              {unreadConversations.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {unreadConversations.map((convo) => (
                    <div key={convo._id} onClick={() => openChat(convo.other._id)} className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer">
                      <p className="text-sm"> New message from{" "} <span className="font-bold">{convo.other.name}</span> </p>
                      <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"> {convo.unreadCount} </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-3 text-sm text-gray-400">No new messages</p>
              )}
            </div>
          )}
        </div>
        <div className="w-8 h-8">
            <Avatar user={user} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
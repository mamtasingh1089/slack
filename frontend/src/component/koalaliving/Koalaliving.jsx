// src/component/koalaliving/Koalaliving.jsx
import React, { useRef, useState, useEffect } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { IoRocketOutline } from "react-icons/io5";
import slack from "../../assets/slack.png"; // adjust path if necessary
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../redux/userSlice";
import Invite from "./Invite";

const Koalaliving = () => {
  const dropdownRef = useRef(null);
  const [dropdown, setDropdown] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const workspaceName = "Koalaliving";
  const dispatch = useDispatch();
  const navigate = useNavigate() ;

  // close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handler = (e) => {
      if (dropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onEsc);
    };
  }, [dropdown]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    dispatch(clearUser());
    navigate("/login");
    setDropdown(false);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setDropdown((d) => !d)}
        className="flex items-center gap-[5px] hover:bg-[#958197] mt-[20px] cursor-pointer px-3 py-2 rounded-md text-white font-medium"
        aria-expanded={dropdown}
        aria-haspopup="true"
      >
        <span>Koalaliving</span>
        <MdKeyboardArrowDown />
      </button>

      {/* Dropdown */}
      {dropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-[56px] left-0 w-72 bg-white text-black rounded-lg shadow-xl z-50"
          style={{ minWidth: 240 }}
        >
          {/* Workspace header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b hover:bg-[#275982] hover:text-white">
            <div className="bg-[#616061] rounded-xl w-10 h-10 flex items-center justify-center text-white font-bold">K</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Koalaliving</p>
              <p className="text-xs text-gray-300">1 workspace</p>
            </div>
            <div className="text-gray-400">
              <MdKeyboardArrowRight />
            </div>
          </div>

          {/* Pro banner */}
          <div className="px-4 py-3 border-b hover:bg-[#275982] hover:text-white ">
            <p className="text-xs  mb-1">
              Your workspace is currently on Slack's <strong>Pro</strong> subscription.
            </p>
            <button
              className="text-blue-700 text-sm hover:underline"
              onClick={() => {
                alert("Open billing / Learn more (placeholder)");
                setDropdown(false);
              }}
            >
              Learn more
            </button>
          </div>

          {/* Promo */}
          <div className="px-4 py-3 border-b flex gap-3 items-start hover:bg-[#275982] hover:text-white">
            <div className="mt-0.5 text-purple-300">
              <IoRocketOutline size={18} />
            </div>
            <div className="text-sm">
              <div className="font-medium ">Want access to advanced AI features?</div>
              <div className="text-xs ">Get access to powerful, time-saving AI features with Business+.</div>
            </div>
          </div>

 
          {/* Menu options */}
          <div className="flex flex-col text-sm">
           <button
        className="text-left px-4 py-3 border-b  hover:bg-[#275982] hover:text-white w-full text-sm"
        onClick={() => setOpenInvite(prev=>!prev)}
      >
        Invite people to {workspaceName}
      </button>
    {openInvite && (
  <Invite
    workspaceName={workspaceName}
    onClose={() => setOpenInvite(false)}
  />
)}

            <button
              className="text-left px-4 py-3 hover:bg-[#275982] hover:text-white flex items-center justify-between"
              onClick={() => {
                setDropdown(false);
                navigate("/profilepage");
              }}
            >
              <span>Preferences</span>
              <MdKeyboardArrowRight className="text-gray-400" />
            </button>

            <button
              className="text-left px-3 py-3 hover:bg-[#275982] hover:text-white flex items-center justify-between border-b"
              onClick={() => {
                setDropdown(false);
                // tools & settings - hook into modal or nav
              }}
            >
              <span>Tools & settings</span>
              <MdKeyboardArrowRight className="text-gray-400" />
            </button>

            <button
              className="text-left px-4 py-3 hover:bg-[#275982] hover:text-white"
              onClick={() => {
                setDropdown(false);
                alert("Sign in on mobile (placeholder)");
              }}
            >
              Sign in on mobile
            </button>

            <button
              className="text-left px-4 py-3 hover:bg-[#275982] hover:text-white"
              onClick={handleSignOut}
            >
              Sign out
            </button>

            <button
              className="text-left px-4 py-3 hover:bg-[#275982] hover:text-white flex items-center justify-between"
              onClick={() => {
                setDropdown(false);
                alert("Open the Slack app (placeholder)");
              }}
            >
              <span>Open the Slack app</span>
              <img src={slack} alt="Slack" className="h-5" />
            </button>
          </div>

         
        </div>
      )}
    </div>
  );
};

export default Koalaliving;

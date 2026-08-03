import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSingleUser, setUser } from "../redux/userSlice"; 
import { serverURL } from '../main'; 

// --- Icons ---
const SmileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="gray" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const Status = ({ onClose }) => {
    const dispatch = useDispatch();
    const expiryRef = useRef(null);
    const notifRef = useRef(null);
    
    const user = useSelector((state) => state.user.user);
    const singleUser = useSelector((state) => state.user.singleUser);
    const workspaceName = "Koalaliving"; 

    const [statusText, setStatusText] = useState(user?.status?.text || "");
    const [statusIcon, setStatusIcon] = useState(user?.status?.emoji || null);
    
    const [expiry, setExpiry] = useState("1 hour");
    const [pauseNotif, setPauseNotif] = useState(user?.status?.pauseNotifications ? "Pause notifications for everyone" : "Do not pause");
    
    const [isLoading, setIsLoading] = useState(false);
    const [isExpiryOpen, setIsExpiryOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const hasStatus = statusText.length > 0;

    const presets = [
        { icon: '📅', text: 'In a meeting', defaultTime: '1 hour' },
        { icon: '🚌', text: 'Commuting', defaultTime: '30 minutes' },
        { icon: '🤒', text: 'Off sick', defaultTime: 'Today' },
        { icon: '🌴', text: 'On holiday', defaultTime: "Don't clear" },
        { icon: '🏡', text: 'Working remotely', defaultTime: 'Today' },
    ];

    const expiryOptions = [
        "Don't clear", "30 minutes", "1 hour", "4 hours", "Today", "This week"
    ];

    const notifOptions = [
        "Do not pause", "Pause notifications for everyone", "Pause except VIPs"
    ];

    // Helper to get Auth Config
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");
        return {
            headers: { 
                Authorization: token?.startsWith("Bearer") ? token : `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (expiryRef.current && !expiryRef.current.contains(event.target)) {
                setIsExpiryOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePresetClick = (preset) => {
        setStatusText(preset.text);
        setStatusIcon(preset.icon);
        setExpiry(preset.defaultTime);
    };

    const handleClearStatusBackend = async () => {
        setIsLoading(true);
        try {
            const res = await axios.delete(`${serverURL}/api/user/status`, getAuthConfig());
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                if (singleUser && singleUser._id === res.data.user._id) {
                    dispatch(setSingleUser(res.data.user));
                }
                onClose();
            }
        } catch (err) {
            console.error("Failed to clear status:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveStatus = async () => {
        if (!hasStatus) return;
        setIsLoading(true);
        let expiryDate = null;
        const now = new Date();

        switch(expiry) {
          case '30 minutes': expiryDate = new Date(now.getTime() + 30 * 60000); break;
          case '1 hour': expiryDate = new Date(now.getTime() + 60 * 60000); break;
          case '4 hours': expiryDate = new Date(now.getTime() + 4 * 60 * 60000); break;
          case 'Today': 
            expiryDate = new Date(); 
            expiryDate.setHours(23, 59, 59, 999); 
            break;
          case 'This week':
             const dayOfWeek = 7 - now.getDay(); 
             expiryDate = new Date(now.setDate(now.getDate() + dayOfWeek));
             expiryDate.setHours(23, 59, 0, 0);
             break;
          default: expiryDate = null; 
        }

        let pauseMode = 'everyone';
        if (pauseNotif === "Pause except VIPs") pauseMode = 'except_vips';

        const payload = {
          text: statusText,
          emoji: statusIcon || "💬",
          expiryTime: expiryDate,
          pauseNotifications: pauseNotif !== "Do not pause",
          pauseMode: pauseMode
        };

        try {
          const res = await axios.post(`${serverURL}/api/user/status`, payload, getAuthConfig());
          if(res.data.success) {
              dispatch(setUser(res.data.user)); 
              if (singleUser && singleUser._id === res.data.user._id) {
                  dispatch(setSingleUser(res.data.user));
              }
              onClose(); 
          }
        } catch (err) {
          console.error("Failed to set status:", err);
          alert("Could not save status. Please try again.");
        } finally {
          setIsLoading(false);
        }
    };

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 font-sans animate-in fade-in duration-200">
        <div className="bg-white w-[520px] rounded-lg shadow-2xl relative flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">Set a status</h2>
              <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <XIcon />
              </button>
          </div>
  
          {/* Body */}
          <div className="px-6 pb-2 min-h-[300px]">
              
              {/* Input Field */}
              <div className="relative mb-6">
                  <button className="absolute left-3 top-3 text-lg hover:bg-gray-100 rounded p-0.5">
                      {statusIcon ? statusIcon : <SmileIcon />}
                  </button>
                  
                  <input 
                      type="text" 
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="What's your status?" 
                      className="w-full pl-11 pr-10 py-2.5 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      autoFocus
                  />

                  {hasStatus && (
                      <button onClick={handleClearStatusBackend} className="absolute right-3 top-3.5 hover:opacity-70">
                          <XCircleIcon />
                      </button>
                  )}
              </div>
  
              {!hasStatus ? (
                  /* SUGGESTIONS LIST */
                  <div className="mb-2">
                      <h3 className="text-xs font-bold text-gray-500 tracking-wide mb-2 uppercase">For {workspaceName}</h3>
                      <ul className="space-y-0.5">
                          {presets.map((item, index) => (
                              <li 
                                  key={index} 
                                  onClick={() => handlePresetClick(item)}
                                  className="flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer hover:bg-[#1264a3] hover:text-white group transition-colors"
                              >
                                  <span className="text-lg w-6 text-center">{item.icon}</span>
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-white">{item.text}</span>
                                  <span className="text-sm text-gray-400 group-hover:text-blue-200 ml-auto">{item.defaultTime}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              ) : (
                  <div className="space-y-4 mb-4"> 
                       {/* Dropdown 1: Remove Status After */}
                       <div className="relative w-full" ref={expiryRef}>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Remove status after...</label>
                            <button 
                                onClick={() => { setIsExpiryOpen(!isExpiryOpen); setIsNotifOpen(false); }}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded hover:border-gray-400 text-sm text-gray-800"
                            >
                                <span>{expiry}</span>
                                <ChevronDown />
                            </button>
                            
                            {isExpiryOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                                    {expiryOptions.map(opt => (
                                        <div 
                                            key={opt}
                                            onClick={() => { setExpiry(opt); setIsExpiryOpen(false); }}
                                            className={`px-4 py-1.5 text-sm cursor-pointer hover:bg-[#1264a3] hover:text-white flex items-center gap-2 ${expiry === opt ? 'bg-[#1264a3] text-white' : 'text-gray-700'}`}
                                        >
                                           <span className={expiry === opt ? 'font-bold' : 'ml-0'}>{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                       </div>

                       {/* Dropdown 2: Pause Notifications */}
                       <div className="relative w-full" ref={notifRef}>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Pause notifications</label>
                            <button 
                                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsExpiryOpen(false); }}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded hover:border-gray-400 text-sm text-gray-800"
                            >
                                <span>{pauseNotif}</span>
                                <ChevronDown />
                            </button>

                             {isNotifOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                                    {notifOptions.map(opt => (
                                        <div 
                                            key={opt}
                                            onClick={() => { setPauseNotif(opt); setIsNotifOpen(false); }}
                                            className={`px-4 py-1.5 text-sm cursor-pointer hover:bg-[#1264a3] hover:text-white flex items-center gap-2 ${pauseNotif === opt ? 'bg-[#1264a3] text-white' : 'text-gray-700'}`}
                                        >
                                           <span className={pauseNotif === opt ? 'font-bold' : 'ml-0'}>{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                       </div>
                  </div>
              )}
          </div>
  
          {/* Footer */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 bg-white rounded-b-lg border-t border-gray-200 mt-auto">
              <button 
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-100 border border-gray-300 rounded transition-colors"
              >
                  Cancel
              </button>
              <button 
                  onClick={handleSaveStatus}
                  disabled={isLoading}
                  className={`px-6 py-1.5 text-sm font-bold rounded transition-colors ${hasStatus ? "bg-[#007a5a] text-white hover:bg-[#148567]" : "bg-gray-100 text-gray-400 cursor-default"}`} 
              >
                  {isLoading ? "Saving..." : "Save"}
              </button>
          </div>
        </div>
      </div>,
      document.body 
    );
};

export default Status;
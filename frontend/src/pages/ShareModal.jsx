import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  X, Bold, Italic, Strikethrough, Link as LinkIcon, 
  List, ListOrdered, Code, Quote, AtSign, Smile, Film 
} from "lucide-react";
import useClickOutside from "../hook/useClickOutside";
import Avatar from "../component/Avatar";
import axios from "axios";
import { serverURL } from "../main";
import { useNavigate } from "react-router-dom";

const ShareModal = ({ isOpen, onClose,onForward   , fileData, usersList = [] }) => {

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setShowDropdown(false));

  if (!isOpen) return null;

  const filteredUsers = (usersList || []).filter(user => 
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.find(u => u._id === user._id)
  );

  // Inside ShareModal.jsx
const handleForwardClick = async () => {
  if (selectedUsers.length === 0) return;

  try {
    const payload = {
      originalMessageId: fileData.messageId, // Ensure this exists!
      receiverIds: selectedUsers.map(u => u._id)
    };

    const token = localStorage.getItem("token");
   onForward(selectedUsers);
onClose();


    alert("Forwarded successfully");
    onClose();
  } catch (err) {
    console.error(err);
    alert("Forwarding failed");
  }
};

  const handleSelectUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
    setShowDropdown(false);
  };

  // CORRECTED: Added the logic to call your backend API
const handleForward = async () => {
  if (!selectedUsers.length || !fileData?.messageId) return;

  setIsSending(true);
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${serverURL}/api/message/forward`,
      {
        originalMessageId: fileData.messageId,
        receiverIds: selectedUsers.map(u => u._id),
        additionalMessage: message,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 🔥 AUTO OPEN RECEIVER CHAT
    dispatch(setSingleUser(res.data.receiverUser));

    onClose();
  } finally {
    setIsSending(false);
  }
};





  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 font-sans text-left">
      <div className="bg-white w-full max-w-[520px] rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Forward this message</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 relative">
          <div className="relative">
            <div className={`flex flex-wrap items-center gap-2 p-2 border-2 rounded-lg transition-all ${showDropdown ? 'border-[#1264a3]' : 'border-gray-200'}`}>
              {selectedUsers.map(user => (
                <div key={user._id} className="flex items-center gap-1.5 bg-[#e8f0f5] border border-blue-200 rounded p-1 pr-1.5">
                   <Avatar user={user} size="sm" />
                   <span className="text-[13px] font-semibold text-gray-800">{user.name}</span>
                   <button onClick={() => setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))} className="text-gray-500 hover:text-red-500"><X size={10} /></button>
                </div>
              ))}
              <input 
                className="flex-1 outline-none text-[15px] min-w-[120px] py-1" 
                placeholder={selectedUsers.length === 0 ? "Search for channel or person" : ""} 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }} 
                onFocus={() => setShowDropdown(true)} 
              />
            </div>
            {showDropdown && filteredUsers.length > 0 && (
              <div ref={dropdownRef} className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden z-[1100] max-h-[220px] overflow-y-auto">
                {filteredUsers.map(user => (
                  <div key={user._id} onClick={() => handleSelectUser(user)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1264a3] hover:text-white cursor-pointer group transition-colors">
                    <Avatar user={user} size="sm" />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">{user.name}</span>
                        <span className="text-xs opacity-70 group-hover:text-white">{user.email || user.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex items-center gap-0.5 p-1 border-b bg-gray-50/50">
              <ToolbarBtn icon={<Bold size={16}/>} /><ToolbarBtn icon={<Italic size={16}/>} /><ToolbarBtn icon={<Strikethrough size={16}/>} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <ToolbarBtn icon={<LinkIcon size={16}/>} /><ToolbarBtn icon={<List size={16}/>} /><ToolbarBtn icon={<ListOrdered size={16}/>} />
            </div>
            <textarea 
                className="w-full p-3 min-h-[100px] outline-none text-[15px] resize-none" 
                placeholder="Add a message if you like." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
            />
            <div className="flex items-center gap-2 px-3 py-2 border-t bg-white">
              <ToolbarBtn icon={<AtSign size={18}/>} /><ToolbarBtn icon={<Smile size={18}/>} />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50">
         {fileData?.image ? (
  <img
    src={fileData.image}
    className="w-10 h-10 rounded object-cover"
    alt="preview"
  />
) : (
  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
    <Film size={22} />
  </div>
)}

           <div
  className="text-[14px] font-medium text-gray-900 line-clamp-2"
  dangerouslySetInnerHTML={{ __html: fileData?.message }}
/>

<div className="text-xs text-gray-500 mt-1">
  From {fileData?.sender?.name}
</div>

          </div>

          <div className="flex items-center justify-between pt-2">
            <button className="flex items-center gap-2 text-[#1264a3] hover:underline font-bold text-sm">
                <LinkIcon size={16} />Copy link
            </button>
            {/* CORRECTED: Added onClick={handleForward} and isSending state */}
            <button 
                onClick={handleForward}
                disabled={selectedUsers.length === 0 || isSending} 
                className={`px-6 py-2 rounded font-bold text-[15px] transition-all ${selectedUsers.length > 0 && !isSending ? 'bg-[#007a5a] text-white hover:bg-[#005a44] shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {isSending ? "Forwarding..." : "Forward"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ToolbarBtn = ({ icon }) => (
  <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors">{icon}</button>
);

export default ShareModal;
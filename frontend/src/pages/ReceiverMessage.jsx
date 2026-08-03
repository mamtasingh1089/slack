import React, { memo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../component/Avatar";
import axios from "axios";
import { removeChannelMessage } from "../redux/channelMessageSlice";
import { removeMessage } from "../redux/messageSlice";
import useClickOutside from "../hook/useClickOutside";
import { CiClock2 } from "react-icons/ci";
import { MdAddReaction, MdShare, MdBookmarkBorder, MdMoreVert, MdOutlineForwardToInbox } from "react-icons/md";
import { BiMessageRoundedDetail } from "react-icons/bi";
import Status from "./Status";
import EmojiPicker from 'emoji-picker-react';
import { serverURL } from "../main";
import ThreadPanel from "./MessagethreadPanel";
//import ThreadPanel from "./MessagethreadPanel";
import ReactMarkdown from "react-markdown";

const ReceiverMessage = memo(({ 
  message, 
  createdAt, 
  image, 
  messageId, 
  channelId, 
  onForward, 
  isForwarded, 
  forwardedFrom,
   onThreadClick, 
   sender,
   onReact,
  reactions = [], 
  onEmojiClick, 
  replyCount = 0,
   isThread = false, 
  ...props 
}) => {
   const singleUser = useSelector((state) => state.user.singleUser);
  const { onlineUsers = [] } = useSelector((state) => state.socket);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [openThread,setOpenThread]=useState()
const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });
const [showReactionPicker, setShowReactionPicker] = useState(false);
//const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });


//const reactionPickerRef = useRef(null);
  const menuRef = useRef(null);
  const profileCardRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useClickOutside(menuRef, () => setShowMenu(false));
  useClickOutside(profileCardRef, () => setShowProfileCard(false)); 
  useClickOutside(reactionPickerRef, () => setShowReactionPicker(false));

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

   

const formattedDate = createdAt
  ? new Date(createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "";


  const isOnline = user && onlineUsers.includes(singleUser?._id);
  const isMe = user?._id === sender?._id;


  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setShowProfileCard(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setShowProfileCard(false), 300);
  };

  const getLocalTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " local time";
  };

  // const handlePillClick = (emoji) => {
  //   handleReactionSelect({ emoji });
  // };

  const handleReactionSelect = async (emojiData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${serverURL}/api/message/react/${messageId}`, { emoji: emojiData.emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReactionPicker(false);
    } catch (error) {
      console.error("Reaction failed", error);
    }
  };

//   const triggerForward = () => {
//   if (!onForward) return;

//   onForward({
//     messageId,
//     message,
//     image,
//     sender,
//     createdAt,
    
//   });
// };

const triggerForward = () => {
  onForward();
};


  const handleDelete = async () => {
    if (!messageId || !window.confirm("Delete this message?")) return;
    try {
      const token = localStorage.getItem("token");
      const url = channelId 
        ? `${serverURL}/api/channel/${channelId}/messages/${messageId}`
        : `${serverURL}/api/message/delete/${messageId}`;
      
      await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      
      if (channelId) dispatch(removeChannelMessage(messageId));
      else dispatch(removeMessage(messageId));
      
      setShowMenu(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div
      className={`group relative flex mb-1 hover:bg-gray-50 px-4 py-2 -mx-4 transition-colors ${showProfileCard || showMenu || showReactionPicker ? 'z-40' : 'z-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <div className="relative w-full text-left" ref={profileCardRef}>
        <div className="flex items-center gap-2 p-1 rounded-md -ml-1 select-none w-full">
          <div className="flex flex-row gap-3 items-start w-full">
            <div className="mt-1">
              <Avatar user={singleUser || sender} size="md" />
            </div>

            <div className="flex flex-col w-full text-left">
            <div className="flex items-baseline gap-2">
    <h1 className="font-bold text-[15px] text-gray-900 cursor-pointer hover:underline"
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      onClick={() => setShowProfileCard(!showProfileCard)}>
      {sender?.name || "Unknown"}
    </h1>
    <span className="text-xs text-gray-500">{formattedTime}</span>
  </div>

{/* ---------- FORWARDED MESSAGE (RECEIVER SIDE) ---------- */}
{isForwarded && (
  <div className="mt-2 mb-2">
    
    {/* Forwarded label */}
    <div className="flex items-center gap-1 text-gray-500 text-[12px] mb-1">
      <MdOutlineForwardToInbox size={14} />
      <span className="italic">Forwarded</span>
    </div>

    {/* Forwarded message box */}
    <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 max-w-[420px]">

      {/* Original sender */}
      <div className="flex items-center gap-2 mb-1">
        <Avatar user={sender} size="xs" />
        <span className="text-[13px] font-bold text-gray-900">
          {sender?.name || "Unknown"}
        </span>
      </div>

      {/* Message content */}
      <div
        className="text-[14px] text-gray-700 ml-7 mb-2"
        dangerouslySetInnerHTML={{ __html: message }}
      />

      {/* Footer */}
      <div className="flex gap-3 text-[12px] text-gray-500 ml-7">
        <span>Direct message</span>
        <span>
          {new Date(createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span className="text-blue-600 cursor-pointer hover:underline">
          View conversation
        </span>
      </div>

    </div>
  </div>
)}



              {image && (
                <img 
                  src={image} 
                  alt="Sent" 
                  className="rounded-md mt-2 max-w-[360px] max-h-[300px] object-cover border border-gray-200" 
                />
              )}

           {message && !isForwarded && (
    <div
      dangerouslySetInnerHTML={{ __html: message }}
      className="prose prose-sm text-gray-800"
    />
  )}


              {/* --- THREAD REPLY LINK (Visible if replies exist) --- */}
              {replyCount > 0 && (
                <div 
                  onClick={onThreadClick}
                  className="mt-2 flex items-center gap-2 cursor-pointer group/thread"
                >
                  <div className="flex -space-x-1">
                     <Avatar user={singleUser ||  sender} size="sm" />
                  </div>
                  <span className="text-[13px] font-black text-[#1264a3] hover:underline">
                    {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                  <span className="text-[11px] text-gray-400 opacity-0 group-hover/thread:opacity-100 transition-opacity"
                  onClick={()=>setOpenThread(true)}>
                    View thread
                  </span>
                </div>
              )}

              {openThread &&
               <ThreadPanel onClose={()=>setOpenThread(false)} messageId={messageId} channelId={channelId} />}

              {/* --- REACTION PILLS SECTION --- */}
              <div className="flex flex-wrap gap-1 mt-1.5 items-center">
             {/* --- REACTION PILLS --- */}
{reactions.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-1.5 items-center">
    {reactions.map((reaction, idx) => {
      const reacted = reaction.users.includes(user?._id);

      return (
        <button
          key={idx}
          onClick={() => onReact(messageId, reaction.emoji)}
          className={`flex items-center gap-1 px-2 py-[2px] rounded-full border text-sm
            ${
              reacted
                ? "bg-blue-50 border-blue-400 text-blue-600"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs font-semibold">
            {reaction.users.length}
          </span>
        </button>
      );
    })}
  </div>
)}

                {/* Small Add Reaction Icon (Visible on hover) */}
                 {(isHovered || showMenu || showReactionPicker) && (
               <div className="absolute -top-6 md:-top-4 right-2 md:right-4 bg-white border border-gray-300 shadow-lg rounded-lg flex items-center p-0.5 z-[60] h-9">
                        
                       <div className="relative">
  <button
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setEmojiPosition({
        top: rect.top - 180,
        left: rect.left - 180,
      });
      setShowReactionPicker(true);
    }}
    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
  >
    <MdAddReaction size={18} />
  </button>

  <Tooltip label="Add reaction" />

  {showReactionPicker && (
  <div
    ref={reactionPickerRef}
    className="fixed z-[9999] shadow-2xl"
    style={{
      top: emojiPosition.top,
      left: emojiPosition.left,
    }}
  >
    <EmojiPicker
      onEmojiClick={(emojiData) => {
        onReact(messageId, emojiData.emoji);
        setShowReactionPicker(false);
      }}
    />
  </div>
)}

</div>

              
                        {/* Corrected ActionIcon with onClick passing */}
                       {isThread && (
  <ActionIcon 
    icon={<BiMessageRoundedDetail size={18}/>} 
    label="Reply in thread" 
    onClick={onThreadClick} 
  />
)}

                        
                        <button 
                          onClick={triggerForward} 
                          className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors group/tool relative"
                        >
                          <MdShare size={18} />
                          <Tooltip label="Forward message" />
                        </button>
              
                <div className="hidden sm:flex">
                           <ActionIcon icon={<MdBookmarkBorder size={18}/>} label="Save" />
                      </div>
              
                        <div className="relative group/tooltip" ref={menuRef}>
                          <button 
                            className={`p-2 rounded-md transition-colors ${showMenu ? 'bg-gray-100 text-black' : 'hover:bg-gray-100 text-gray-600'}`}
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                          >
                            <MdMoreVert size={18} />
                          </button>
                          {!showMenu && <Tooltip label="More actions" />}
                          {showMenu && (
                            <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-[70] text-sm text-gray-700">
                              <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer transition-colors text-left">Copy link</div>
                              {isMe && (
                                  <div 
                                    onClick={handleDelete} 
                                    className="px-4 py-1.5 hover:bg-[#e01e5a] hover:text-white text-[#e01e5a] cursor-pointer flex justify-between font-medium"
                                  >
                                      <span>Delete message...</span> <span className="text-xs opacity-80">delete</span>
                                  </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card Hover Modal */}
        {showProfileCard && (
          <div 
            className="absolute top-[30px] left-0 w-[300px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[100]"
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <Avatar user={ singleUser || sender} size="lg" />
                <div className="flex flex-col flex-1 ml-4 mt-1">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{singleUser?.name} </h3>
                  <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'} mt-1`}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mb-6">
                <CiClock2 className="text-xl" />
                <span className="text-sm font-medium">{getLocalTime()}</span>
              </div>
              <button 
                onClick={() => isMe && setShowStatusModal(true)}
                className="w-full py-1.5 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold text-sm"
              >
                {isMe ? "Set a status" : "View full profile"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showStatusModal && <Status onClose={() => setShowStatusModal(false)} />}

     
      {/* {(isHovered || showMenu || showReactionPicker) && (
 <div className="absolute -top-6 md:-top-4 right-2 md:right-4 bg-white border border-gray-300 shadow-lg rounded-lg flex items-center p-0.5 z-[60] h-9">
          
          <div className="relative" ref={reactionPickerRef}>
              <button 
                onClick={() => setShowReactionPicker(!showReactionPicker)} 
                className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
              >
                <MdAddReaction size={18}/>
              </button>
              <Tooltip label="Add reaction" />
              {showReactionPicker && (
                  <div className="absolute bottom-full right-0 mb-2 shadow-2xl z-[110]">
                      <EmojiPicker width={300} height={400} onEmojiClick={handleReactionSelect} />
                  </div>
              )}
          </div>


          <ActionIcon 
            icon={<BiMessageRoundedDetail size={18}/>} 
            label="Reply in thread" 
            onClick={onThreadClick} 
          />
          
         <button 
  onClick={triggerForward} 
  className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors group/tool relative"
>
  <MdShare size={18} />
  <Tooltip label="Forward message" />
</button>


  <div className="hidden sm:flex">
             <ActionIcon icon={<MdBookmarkBorder size={18}/>} label="Save" />
        </div>

          <div className="relative group/tooltip" ref={menuRef}>
            <button 
              className={`p-2 rounded-md transition-colors ${showMenu ? 'bg-gray-100 text-black' : 'hover:bg-gray-100 text-gray-600'}`}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <MdMoreVert size={18} />
            </button>
            {!showMenu && <Tooltip label="More actions" />}
            {showMenu && (
              <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-[70] text-sm text-gray-700">
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer transition-colors text-left">Copy link</div>
                
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
});

const Tooltip = ({ label }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tool:block group-hover/tooltip:block z-[70]">
    <div className="bg-[#1a1d21] text-white text-[13px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap relative shadow-xl">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1a1d21]"></div>
    </div>
  </div>
);

const ActionIcon = ({ icon, label, onClick }) => (
  <div className="relative group/tooltip">
    <button 
      onClick={onClick} 
      className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
    >
      {icon}
    </button>
    <Tooltip label={label} />
  </div>
);

export default ReceiverMessage;
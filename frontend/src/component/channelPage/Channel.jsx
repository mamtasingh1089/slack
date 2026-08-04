import axios from "axios";
import { serverURL } from '../../main';
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from 'emoji-picker-react';

import { resetChannelUnread } from "../../redux/channelSlice.js"; 
import { setChannelMessages, addChannelMessage, clearChannelMessages, incrementChannelReplyCount } from "../../redux/channelMessageSlice";

import SenderMessage from "../../pages/SenderMessage.jsx";
import ReceiverMessage from "../../pages/ReceiverMessage.jsx";
import ChannelSubPage from "./ChannelSubPage.jsx";
// import ThreadPanel from "./MessagethreadPanel.jsx";
import ChannelThread from './ChannelThread.jsx'

import { LiaFile } from "react-icons/lia";
import { LuFolder } from "react-icons/lu";
import { CgFileAdd } from "react-icons/cg";
import { FiMessageCircle, FiBold, FiItalic } from "react-icons/fi";
import { FaUserFriends, FaStrikethrough, FaListUl, FaCode } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { IoSend, IoAddSharp } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import { GoLink, GoQuote } from "react-icons/go";
import { AiOutlineOrderedList } from "react-icons/ai";
import { RiCodeBlock } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
//import ChannelFilteredFiles from "../component/filePage/ChannelFilteredFiles.jsx";
import ChannelFilterPage from '../../component/filePage/ChannelFilterPage.jsx';
import ShareModal from "../../pages/ShareModal.jsx";

//import Avatar from "../../component/common/Avatar.jsx";

const Channel = () => {
  const { channelId } = useParams();
  const dispatch = useDispatch();
  const listEndRef = useRef(null);
  const imageRef = useRef(null);
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [isSubPageOpen, setIsSubPageOpen] = useState(false);
  const [openEditTopic, setOpenEditTopic] = useState(false);
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [html, setHtml] = useState("");
   const [activeFormats, setActiveFormats] = useState({});
     const [shareOpen, setShareOpen] = useState(false);
     const [shareData, setShareData] = useState(null);

  const user = useSelector((state) => state.user.user);
  const allMessages = useSelector((state) => state.channelMessage.channelMessages) || []; 
  const selectedChannel = useSelector((state) => state.channel.selectedChannelId);
  const socket = useSelector((state) => state.socket?.socket);
  const allUsers = useSelector((state) => state.user.allUsers);
  const singleUser = useSelector((state) => state.user.singleUser);

  
  // 1. Mark channel as read on entry
  useEffect(() => {
    if (!channelId || !user?._id) return;
    const markRead = async () => {
      try {
        await axios.post(`${serverURL}/api/channel/${channelId}/read`, {}, { withCredentials: true });
        dispatch(resetChannelUnread({ channelId, userId: user._id }));
      } catch (error) {
        console.error("Error marking channel read:", error);
      }
    };
    markRead();
  }, [channelId, user?._id, dispatch]);

  // 2. Tab cleanup on channel change
  useEffect(() => {
    setActiveTab("messages");
    setShowPopover(false);
    setActiveThread(null); // Close thread when switching channels
  }, [channelId]);

  // 3. Unified Real-time Socket Handler
  useEffect(() => {
    if (!socket || !channelId || !user?._id) return;

    const handler = async (payload) => {
      const message = payload?.message || payload;
      const incomingChannelId = payload?.channel?._id || payload?.channel || payload?.channelId;
      const parentId = payload?.parentId;

      if (String(incomingChannelId) !== String(channelId)) return;

      if (parentId) {
        // Increment reply count in real-time
        dispatch(incrementChannelReplyCount({ parentId }));
      } else {
        // Add new main message
        const exists = allMessages.some(m => String(m._id) === String(message._id));
        if (!exists) {
          dispatch(addChannelMessage(message));
        }
      }
    };

    socket.on('newChannelMessage', handler);
    return () => socket.off('newChannelMessage', handler);
  }, [socket, channelId, dispatch, allMessages, user?._id]);

  // 4. Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!channelId) return;
        setLoading(true);
        dispatch(clearChannelMessages());
        const res = await axios.get(`${serverURL}/api/channel/${channelId}/messages`, { withCredentials: true });
        dispatch(setChannelMessages(res.data));
      } catch (error) {
        console.error("Error fetching channel messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [channelId, dispatch]);

  // 5. Join Socket Room
  useEffect(() => {
    if (!socket || !channelId) return;
    socket.emit('joinChannel', channelId);
    return () => {
      socket.emit('leaveChannel', channelId);
    };
  }, [socket, channelId]);

  // 6. Scroll to bottom
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handler = async (payload) => {
    const message = payload?.message || payload;
    const incomingChannelId = payload?.channel?._id || payload?.channel || payload?.channelId;
    const parentId = payload?.parentId; // Check if it's a thread reply

    if (String(incomingChannelId) !== String(channelId)) return;

    if (parentId) {
        // It's a thread reply: Just update the count in the main list
        dispatch(incrementChannelReplyCount({ parentId }));
        // Note: The ThreadPanel has its own listener to add the message to the sidebar
    } else {
        // It's a normal message: Add to main list
        const exists = allMessages.some(m => String(m._id) === String(message._id));
        if (!exists) dispatch(addChannelMessage(message));
    }
};


 const handleOpenThread = (msg) => {
  setActiveThread({
    messageId: msg._id,
    text: msg.text,
    sender: msg.sender,          // ✅ FULL OBJECT
    senderName: msg.sender?.name // ✅ ADD THIS
  });
};




 const onEmojiClick = (emojiData) => {
  editorRef.current.focus();
  document.execCommand("insertText", false, emojiData.emoji);
  setHtml(editorRef.current.innerHTML);
  setShowPicker(false);
};


  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
      setPlusOpen(false); 
    }
  };

  const cancelImage = () => {
    setBackendImage(null);
    setFrontendImage(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const sendMessage = async (e) => {
  if (e) e.preventDefault();

  // Prevent empty message
  if (!html.trim() && !backendImage) return;

  setLoading(true);

  const formData = new FormData();
  formData.append("message", html); // ✅ send formatted HTML
  if (backendImage) {
    formData.append("image", backendImage);
  }

  try {
    await axios.post(`${serverURL}/api/channel/${channelId}/messages`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // ✅ Clear editor properly
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }

    setHtml("");
    cancelImage();

  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setLoading(false);
  }
};

const iconClass = (command) =>
  `cursor-pointer transition-colors ${
    activeFormats[command] ? "text-blue-600 bg-gray-300" : "text-gray-600 hover:text-gray-900"
  }`;

const toggleFormat = (command, value = null) => {
  document.execCommand(command, false, value);
  setActiveFormats((prev) => ({ ...prev, [command]: !prev[command] }));
  editorRef.current.focus();
  setHtml(editorRef.current.innerHTML);
};

const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(e);
  }
};


  const formatText = (command, value = null) => {
  editorRef.current.focus();
  document.execCommand(command, false, value);
  setHtml(editorRef.current.innerHTML); // 🔥 critical
};


  const handleSaveTopic = async () => {
    setSaving(true);
    try {
      const payload = { topic };
      await axios.put(`${serverURL}/api/conversation/topic/with/${user._id}`, payload);
      setOpenEditTopic(false);
    } catch (error) {
      console.error("Error updating topic:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = (msg) => {
  setShareData({
    message: msg.text,
    image: msg.image,
    sender: msg.sender,
    messageId: msg._id,
    channelId
  });
  setShareOpen(true);
};


  if (!selectedChannel) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading Channel...</p>
      </div>
    );
  }

 return (
<div className="flex h-full w-full bg-white overflow-hidden pt-[40px]">
      {/* ================= LEFT CHAT ================= */}
       <div className="flex flex-1 min-w-0"></div>
<div
  className={`
    flex flex-col h-full min-w-0 border-r border-gray-200
    ${activeThread ? 'hidden md:flex md:w-[60%]' : 'flex w-full'}
  `}
>

        {/* HEADER */}
        <header className="border-b p-4 flex justify-between items-center">
          <p
            className="font-bold text-lg cursor-pointer"
            onClick={() => setIsSubPageOpen(true)}
          >
            # {selectedChannel.name}
          </p>

          <div className="flex items-center gap-3">
                       <div className="flex items-center border rounded-md p-1.5 cursor-pointer h-8">
              <p className="font-semibold text-sm mr-2">{selectedChannel.members?.length || 0}</p>
              <FaUserFriends className="text-lg" />
            </div>

                       <div className="hover:bg-gray-100 rounded-md p-1.5 cursor-pointer h-8 w-8 flex items-center justify-center">
              <IoMdMore className="text-xl" />
            </div>

          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-4 px-4 py-2 text-sm border-b">
          <button
            onClick={() => setActiveTab("messages")}
            className={activeTab === "messages" ? "font-bold" : ""}
          >
            <FiMessageCircle /> Messages
          </button>

          <button
            onClick={() => setActiveTab("files")}
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
          >
            <LiaFile /> Files
          </button>

          <button onClick={() => setActiveTab("page")}>
            <LuFolder /> Pages
          </button>

          <button onClick={() => setActiveTab("untitled")}>
            <CgFileAdd /> Untitled
          </button>
        </div>

        {/* BODY */}
        {activeTab === "messages" && (
          <>
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {allMessages.map((msg) => {
                const isMine =
                  String(msg.sender?._id) === String(user?._id);
                return isMine ? (
                  <SenderMessage
  key={msg._id}
  {...msg}
  onThreadClick={() => handleOpenThread(msg)}
  onForward={() => {
    setShareData({
      messageId: msg._id,
      message: msg.text,          // channel me text = msg.text
      image: msg.image,
      sender: msg.sender,
      channelId
    });
    setShareOpen(true);
  }}
/>

                ) : (
               <ReceiverMessage
  key={msg._id}
  message={msg.text}
  createdAt={msg.createdAt}
  image={msg.image}
  sender={msg.sender}
  messageId={msg._id}
  channelId={channelId}
  reactions={msg.reactions}
  replyCount={msg.replyCount}
  isForwarded={msg.isForwarded}
  forwardedFrom={msg.forwardedFrom}
  onThreadClick={() => handleOpenThread(msg)}

  // 🔥 THIS IS THE KEY
  onForward={() => {
  setShareData({
    messageId: msg._id,
    message: msg.message,
    image: msg.image,
    sender: msg.sender,
    createdAt: msg.createdAt,
  });
  setShareOpen(true);
}}

/>

                );
              })}
              <div ref={listEndRef} />
            </main>

{shareOpen && (
  <ShareModal
    isOpen={shareOpen}
    onClose={() => setShareOpen(false)}
    fileData={shareData}
    usersList={allUsers}
  />
)}


{/* ================= Channel Input Area ================= */}
<div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white mb-[10px]">
  <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">

    {/* Toolbar */}
    <div className="flex flex-row items-center gap-3 bg-gray-100 px-3 py-2 order-1 flex-wrap">
      <FiBold
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("bold"); }}
        className={iconClass("bold")}
      />
      <FiItalic
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("italic"); }}
        className={iconClass("italic")}
      />
      <FaStrikethrough
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("strikeThrough"); }}
        className={iconClass("strikeThrough")}
      />
      <GoLink
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt("Enter link");
          if (url) toggleFormat("createLink", url);
        }}
        className={iconClass("createLink")}
      />
      <AiOutlineOrderedList
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("insertOrderedList"); }}
        className={iconClass("insertOrderedList")}
      />
      <FaListUl
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("insertUnorderedList"); }}
        className={iconClass("insertUnorderedList")}
      />
      <GoQuote
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("formatBlock", "blockquote"); }}
        className={iconClass("formatBlock")}
      />
      <FaCode
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("insertHTML", "<code></code>"); }}
        className={iconClass("insertHTML")}
      />
      <RiCodeBlock
        onMouseDown={(e) => { e.preventDefault(); toggleFormat("formatBlock", "pre"); }}
        className={iconClass("pre")}
      />
    </div>

    {/* ContentEditable Editor */}
    <form onSubmit={sendMessage} className="flex flex-col order-2">
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => setHtml(e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        data-placeholder={`Message #${selectedChannel.name}`}
        className="w-full p-3 min-h-[60px] outline-none resize-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      ></div>

      {/* Preview Image */}
      {frontendImage && (
        <div className="p-2">
          <div className="relative w-20 h-20">
            <div className="group relative h-full w-full">
              <img src={frontendImage} alt="Preview" className="h-full w-full rounded-md object-cover"/>
              <button onClick={cancelImage} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove image">
                <RxCross2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 relative">
        <div className="flex items-center gap-3 text-gray-600">
          <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Attach file" onClick={() => setPlusOpen(prev => !prev)}>
            <IoAddSharp />
          </button>
          <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Emoji" onClick={() => setShowPicker(prev => !prev)}>
            <BsEmojiSmile />
          </button>
        </div>

        {plusOpen && (
          <div className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md border p-2 z-10">
            <div onClick={() => imageRef.current.click()} className="p-2 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap">
              Upload from your computer
              <input type="file" hidden accept="image/*,video/*" ref={imageRef} onChange={handleImage} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button type="submit" className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1 rounded hover:bg-[#006a4e] disabled:opacity-50" disabled={loading || (!html.trim() && !backendImage)}>
            <IoSend />
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <MdKeyboardArrowDown className="text-2xl" />
          </button>
        </div>
      </div>
    </form>

    {/* Emoji Picker */}
    {showPicker && (
      <div className='absolute bottom-[80px] left-[20px] lg:left-[50px] shadow z-10'>
        <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={onEmojiClick} />
      </div>
    )}
</div>
</div>

          </>
        )}

        {/* VIEW: FILES */}
        {activeTab === 'files' && (
           <ChannelFilterPage channelId={channelId} />
        )}

      </div>

{shareOpen && (
  <ShareModal
    isOpen={shareOpen}
    onClose={() => setShareOpen(false)}
    fileData={shareData}
    usersList={allUsers}
  />
)}

      {/* Edit Topic Modal */}
      {openEditTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4">
          <div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Edit topic</h2>
              <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-5 overflow-y-auto">
              <input type="text" value={topic} onChange={handleTopicChange} className="border rounded-xl p-2 hover:bg-[#f8f8f8]" />
              <p className="text-sm text-gray-700">Add a topic to your conversation.</p>
            </div>
            <div className="flex items-center gap-3 py-4 px-6 justify-end border-t">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button>
              <button type="button" onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save topic"}</button>
            </div>
          </div>
        </div>
      )}


      {/* ================= THREAD PANEL ================= */}
      {activeThread && (
  <div className="flex w-full md:w-[40%] border-l">
    <ChannelThread
      parentMessage={activeThread}
      receiverId={channelId}
      isChannel
      onClose={() => setActiveThread(null)}
    />
  </div>
)}


      {isSubPageOpen && (
        <ChannelSubPage
          channel={selectedChannel}
          onClose={() => setIsSubPageOpen(false)}
        />
      )}
    </div>
   
  );
};

export default Channel;
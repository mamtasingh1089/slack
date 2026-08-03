import React, { useState, useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverURL } from "../../main";

import { useSelector } from "react-redux";
import { FiBold, FiItalic, FiMessageCircle } from "react-icons/fi";
import { FaStrikethrough, FaListUl, FaCode } from "react-icons/fa6";
import { GoLink, GoQuote } from "react-icons/go";
import { AiOutlineOrderedList } from "react-icons/ai";
import { RiCodeBlock } from "react-icons/ri";
import { BsEmojiSmile, BsCopy, BsEye, BsPin, BsPlusLg, BsLightning } from "react-icons/bs";
import { IoSend, IoAddSharp } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";

import { CgFileAdd } from "react-icons/cg";
import EmojiPicker from "emoji-picker-react";
import Avatar from "../Avatar";
import SenderMessage from "../../pages/SenderMessage";
import ReceiverMessage from "../../pages/ReceiverMessage";


const ThreadPanel = ({ parentMessage, onClose, receiverId ,profileImage,isChannel }) => {
  const imageRef = useRef(null);
  const plusMenuRef = useRef(null);
  const listEndRef = useRef(null);
  const editorRef = useRef(null);
  const [html,setHtml]=useState("")
 
  const { socket } = useSelector((state) => state.socket || {});

  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null); // preview URL
  const [backendFile, setBackendFile] = useState(null); // actual File object
  const [plusOpen, setPlusOpen] = useState(false);
  const [fileType, setFileType] = useState("");
  const [activeFormats, setActiveFormats] = useState({});


   const singleUser = useSelector((state) => state.user.singleUser);
   const user = useSelector((state) => state.user.user);
 const isMe = user?._id === singleUser?._id;


  useEffect(() => {
    if (parentMessage?.messageId) fetchReplies();
  }, [parentMessage?.messageId]);
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);


useEffect(() => {
    if (!socket) return;

    const handleThreadReply = (payload) => {
        console.log("Thread Socket Payload:", payload); 
        const incomingParentId = String(payload.parentId);
        const currentThreadId = String(parentMessage.messageId);

        if (incomingParentId === currentThreadId) {
            setReplies((prev) => {
                const isAlreadyPresent = prev.find((r) => String(r._id) === String(payload.newMessage._id));
                if (isAlreadyPresent) return prev;
                return [...prev, payload.newMessage];
            });
        }
    };

    socket.on("newMessage", handleThreadReply);
    return () => socket.off("newMessage", handleThreadReply);
}, [socket, parentMessage.messageId]);

useEffect(() => {
    if (!socket) return;

    const handleIncomingReply = (payload) => {
      const incomingParentId = payload.parentId;
      const message = payload.newMessage || payload.message;

      if (String(incomingParentId) === String(parentMessage.messageId)) {
        setReplies((prev) => {
          if (prev.find((r) => String(r._id) === String(message._id))) return prev;
          return [...prev, message];
        });
      }
    };

    const eventName = isChannel ? "newChannelMessage" : "newMessage";
    socket.on(eventName, handleIncomingReply);
    return () => socket.off(eventName, handleIncomingReply);
  }, [socket, parentMessage.messageId, isChannel]);

 const fetchReplies = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = isChannel 
        ? `${serverURL}/api/channel/messages/${parentMessage.messageId}/replies`
        : `${serverURL}/api/message/thread/${parentMessage.messageId}`;
      
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setReplies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  };


  const handleSendReply = async (e) => {
  if (e) e.preventDefault();

  // Prevent empty reply
  if (!replyText.trim() && !backendFile) return;

  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("message", replyText); // ✅ supports formatted text later
    formData.append("parentId", parentMessage.messageId);

    if (backendFile) {
      formData.append("image", backendFile); // ✅ image / video support
    }

    // ✅ Correct API based on DM or Channel
    const url = isChannel
      ? `${serverURL}/api/channel/${receiverId}/messages/${parentMessage.messageId}/reply`
      : `${serverURL}/api/message/reply/${receiverId}`;

    await axios.post(url, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // ✅ Clean reset (important to prevent duplicate sends & UI bugs)
    setReplyText("");
    setBackendFile(null);
    setFrontendImage(null);
    setFileType("");
    setPlusOpen(false);
    setShowPicker(false);

  } catch (error) {
    console.error("Reply failed:", error);
  } finally {
    setLoading(false);
  }
};


  const getAvatarUser = (messageSender) => {
  if (!messageSender) return singleUser;
  if (messageSender._id === user?._id) {
    return user;
  }
  return singleUser;
};






 
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackendFile(file);
    setFileType(file.type || "");
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setFrontendImage(url);
    } else {
      setFrontendImage(null);
    }
  };


  const cancelFile = () => {
    if (frontendImage) {
      try {
        URL.revokeObjectURL(frontendImage);
      } catch (e) {
        /* ignore */
      }
    }
    setBackendFile(null);
    setFrontendImage(null);
    setFileType("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  // handle Enter key (send message) — send on Enter unless shiftKey is pressed
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatText = (command, value = null) => {
  editorRef.current.focus();
  document.execCommand(command, false, value);
  setHtml(editorRef.current.innerHTML); // 🔥 critical sync
};

const toggleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    setActiveFormats((prev) => ({ ...prev, [command]: !prev[command] }));
    editorRef.current.focus();
    setHtml(editorRef.current.innerHTML);
  };

  const iconClass = (command) =>
    `cursor-pointer transition-colors ${
      activeFormats[command] ? "text-blue-600 bg-gray-300" : "text-gray-600 hover:text-gray-900"
    }`;

const onEmojiClick = (emojiData) => {
  editorRef.current.focus();
  document.execCommand("insertText", false, emojiData.emoji);
  setHtml(editorRef.current.innerHTML);
  setShowPicker(false);
};



  // Send reply
  // const handleSendReply = async (e) => {
  //   if (e && e.preventDefault) e.preventDefault();
  //   // Prevent empty message unless file is attached
  //   if (!replyText.trim() && !backendFile) return;
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     const formData = new FormData();
  //     formData.append("message", replyText);
  //     formData.append("parentId", parentMessage.messageId);
  //     if (backendFile) {
  //       // Adjust field name to match backend's expected name, e.g., 'image' or 'file'
  //       formData.append("image", backendFile);
  //     }

  //     const res = await axios.post(
  //       `${serverURL}/api/message/reply/${receiverId}`,
  //       formData,
  //       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
  //     );

  //     // Optionally, optimistic update: push the sent message if backend returns it
  //     // if (res?.data) {
  //     //   // If server returns the created message object
  //     //   const created = res.data;
  //     //   // If backend returns created object inside some property, you may need to adjust
  //     //   // For safety, append the returned object if it has _id
  //     //   if (created._id) {
  //     //     setReplies((prev) => [...prev, created]);
  //     //   } else if (Array.isArray(created) && created.length) {
  //     //     // handle array response
  //     //     setReplies((prev) => [...prev, ...created]);
  //     //   }
  //     // }

  //     // reset input & files
  //     setReplyText("");
  //     cancelFile();
  //     setPlusOpen(false);
  //     setShowPicker(false);
  //   } catch (err) {
  //     console.error("Reply failed:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

//   const handleSendReply = async () => {
//     if (!replyText.trim() && !backendFile) return;
//     setLoading(true);
//     try {
//         const token = localStorage.getItem("token");
//         const formData = new FormData();
//         formData.append("message", replyText);

//         // URL logic based on type
//         const url = isChannel 
//             ? `${serverURL}/api/channel/${receiverId}/messages/${parentMessage.messageId}/reply`
//             : `${serverURL}/api/message/reply/${receiverId}`;

//         await axios.post(url, formData, {
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         setReplyText("");
//         cancelFile();
//     } catch (err) { console.error(err); }
//     finally { setLoading(false); }
// };

  return (
      <div className="w-full md:w-[450px] flex flex-col bg-white h-full border-l border-gray-200 shadow-xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div>
          <h3 className="font-black text-lg">Thread</h3>
          <p className="text-xs text-gray-500">Conversation in {isChannel ? `#channel` : `DM`}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md"><RxCross2 size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Parent Message Bubble */}
        <div className="p-4  bg-gray-50/30">
          <div className="flex gap-3">
<Avatar user={parentMessage.sender} size="md" />

            <div className="flex-1">
              <p className="font-black text-sm">{parentMessage?.senderName}</p>
              <p className="text-[15px] text-gray-800">{parentMessage?.text}</p>
              {parentMessage?.image && (
                <img src={parentMessage.image} className="mt-2 rounded-lg max-h-48 border shadow-sm" alt="parent-img" />
              )}
            </div>
          </div>
        </div>

        {/* Replies   */}
        <div className="p-4 space-y-2">
          {replies.map((reply) => {
            const isMine = String(reply.sender?._id || reply.sender) === String(user?._id);
            const props = { key: reply._id, message: reply.message, createdAt: reply.createdAt, image: reply.image, messageId: reply._id };
            return isMine ? <SenderMessage {...props} /> : <ReceiverMessage {...props} sender={reply.sender} />;
          })}
          <div ref={listEndRef} />
        </div>
      </div>

      {/* Common Message Input with Uploads */}
    {/* ================= Thread Input Area ================= */}
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
    <form onSubmit={handleSendReply} className="flex flex-col order-2">
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => setHtml(e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        data-placeholder={`Message ${singleUser?.name || ""}`}
        className="w-full p-3 min-h-[60px] outline-none resize-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      ></div>

      {/* Preview Image */}
      {frontendImage && (
        <div className="p-2">
          <div className="relative w-20 h-20">
            <div className="group relative h-full w-full">
              <img src={frontendImage} alt="Preview" className="h-full w-full rounded-md object-cover"/>
              <button onClick={cancelFile} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove image">
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
          <button type="submit" className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1 rounded hover:bg-[#006a4e] disabled:opacity-50" disabled={loading || (!html.trim() && !frontendImage)}>
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
        <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={(emoji) => {
          editorRef.current.focus();
          document.execCommand("insertText", false, emoji.emoji);
          setHtml(editorRef.current.innerHTML);
          setShowPicker(false);
        }} />
      </div>
    )}
  </div>
</div>

    </div>
  );
};

export default ThreadPanel;

import React, { useState, useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverURL } from "../main";

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
import Avatar from "../component/Avatar";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";


const ThreadPanel = ({ parentMessage, onClose, receiverId ,profileImage,isChannel,onForward }) => {
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
  const [editorKey, setEditorKey] = useState(0);
  const [shareData, setShareData] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

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

  const eventName = isChannel ? "newChannelMessage" : "newMessage";

  const handleIncomingReply = (payload) => {
    const incomingParentId = payload.parentId;
    const message = payload.newMessage || payload.message;

    if (String(incomingParentId) === String(parentMessage.messageId)) {
      setReplies(prev => {
        if (prev.find(r => String(r._id) === String(message._id))) return prev;
        return [...prev, message];
      });
    }
  };

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

  const cleanText = replyText.replace(/<[^>]*>/g, "").trim();
  if (!cleanText && !backendFile) return;

  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("message", replyText);
    formData.append("parentId", parentMessage.messageId);
    if (backendFile) formData.append("image", backendFile);

    const url = isChannel
      ? `${serverURL}/api/channel/${receiverId}/messages/${parentMessage.messageId}/reply`
      : `${serverURL}/api/message/reply/${receiverId}`;

    await axios.post(url, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 💣 HARD RESET EDITOR
    setReplyText("");
    setEditorKey(prev => prev + 1);
    cancelFile();
    setShowPicker(false);

  } catch (err) {
    console.error("Reply failed:", err);
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


 const onEmojiClick = (arg1, arg2) => {
  const emoji = (arg2 && arg2.emoji) || (arg1 && arg1.emoji) || arg1?.native;

  editorRef.current.innerHTML += emoji;
  setReplyText(editorRef.current.innerHTML);
  setShowPicker(false);
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


  const toggleFormat = (command, value = null) => {
  document.execCommand(command, false, value);

  setActiveFormats((prev) => ({
    ...prev,
    [command]: !prev[command],
  }));
};

const iconClass = (command) =>
  `cursor-pointer transition-colors  ${
    activeFormats[command]
      ? "text-blue-600 bg-gray-300 "
      : "text-gray-600 hover:text-gray-900"
  }`;

 const handleReact = async (messageId, emoji) => {
  const token = localStorage.getItem("token");

  await axios.post(
    `${serverURL}/api/message/react/${messageId}`,
    { emoji },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setReplies(prev =>
    prev.map(msg =>
      msg._id === messageId
        ? {
            ...msg,
            reactions: msg.reactions?.some(r => r.emoji === emoji)
              ? msg.reactions.map(r =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        users: r.users.includes(user._id)
                          ? r.users.filter(id => id !== user._id)
                          : [...r.users, user._id],
                      }
                    : r
                )
              : [...(msg.reactions || []), { emoji, users: [user._id] }],
          }
        : msg
    )
  );
};


const handleForward = (reply) => {
  setShareData(reply);
  setShareOpen(true);
};

const handleSave = async (messageId) => {
  const token = localStorage.getItem("token");
  await axios.post(
    `${serverURL}/api/message/save/${messageId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

const handleDelete = async (messageId) => {
  if (!window.confirm("Delete this message?")) return;

  const token = localStorage.getItem("token");
  await axios.delete(
    `${serverURL}/api/message/delete/${messageId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setReplies(prev => prev.filter(r => r._id !== messageId));
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

<div className="flex-1 overflow-y-auto overflow-x-visible relative">


        {/* Parent Message Bubble */}
        <div className="p-4  bg-gray-50/30">
          <div className="flex gap-3">
<Avatar user={getAvatarUser (parentMessage.sender)} size="md" />

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
  const commonProps = {
  message: reply.message || reply.text,
    createdAt: reply.createdAt,
    messageId: reply._id,
    sender: reply.sender,
    image: reply.image,
    // channelId,
    reactions: reply.reactions || [],
    onReact: handleReact,
    onForward: () => handleForward(reply),
    onThreadClick: null,
    replyCount: 0,
    isThread: true, // ✅ VERY IMPORTANT
  };

  return reply.sender._id === user._id ? (
    <SenderMessage key={reply._id} {...commonProps} />
  ) : (
    <ReceiverMessage key={reply._id} {...commonProps} />
  );
})}

          <div ref={listEndRef} />
        </div>
      </div>

      {/* Common Message Input with Uploads */}
      <div className="p-4 border-t">
        <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
         <div className="flex flex-row items-center gap-5 bg-gray-100 px-3 py-2 order-1">
  <FiBold
    onMouseDown={(e) => {
      e.preventDefault(); // Prevent losing focus
      toggleFormat("bold");
    }}
    className={iconClass("bold")}
  />

  <FiItalic
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("italic");
    }}
    className={iconClass("italic")}
  />

  <FaStrikethrough
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("strikeThrough");
    }}
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
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("insertOrderedList");
    }}
    className={iconClass("insertOrderedList")}
  />

  <FaListUl
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("insertUnorderedList");
    }}
    className={iconClass("insertUnorderedList")}
  />

  <GoQuote
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("formatBlock", "blockquote");
    }}
    className={iconClass("formatBlock")}
  />

  <FaCode
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("insertHTML", "<code></code>");
    }}
    className={iconClass("insertHTML")}
  />

  <RiCodeBlock
    onMouseDown={(e) => {
      e.preventDefault();
      toggleFormat("formatBlock", "pre");
    }}
    className={iconClass("pre")}
  />
</div>


          <form onSubmit={handleSendReply} className="flex flex-col order-2">
           <div
  key={editorKey}                      // 💣 forces reset
  ref={editorRef}
  contentEditable
  suppressContentEditableWarning
  onInput={(e) => setReplyText(e.currentTarget.innerHTML)}
  onKeyDown={handleKeyDown}
  data-placeholder={`Message ${singleUser?.name || ""}`}
  className="w-full p-3 min-h-[60px] outline-none resize-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
/>


            {/* Preview area for selected image/video */}
            {frontendImage && (
              <div className="p-2">
                <div className="relative w-28 h-28">
                  <div className="group relative h-full w-full">
                    {/* If fileType is video, show video preview */}
                    {fileType.startsWith("video/") ? (
                      <video src={frontendImage} className="h-full w-full rounded-md object-cover" controls />
                    ) : (
                      <img src={frontendImage} alt="Preview" className="h-full w-full rounded-md object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={cancelFile}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      <RxCross2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 relative">
              <div className="flex items-center gap-3 text-gray-600">
                <button
                  type="button"
                  className="text-xl p-1 rounded hover:bg-gray-200"
                  title="Attach file"
                  onClick={() => setPlusOpen((prev) => !prev)}
                >
                  <IoAddSharp />
                </button>
                <button
                  type="button"
                  className="text-xl p-1 rounded hover:bg-gray-200"
                  title="Emoji"
                  onClick={() => setShowPicker((prev) => !prev)}
                >
                  <BsEmojiSmile />
                </button>
              </div>

              {plusOpen && (
                <div ref={plusMenuRef} className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md border p-2">
                  <div
                    onClick={() => {
                      if (imageRef.current) imageRef.current.click();
                    }}
                    className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
                  >
                    <CgFileAdd />
                    <span>Upload from your computer</span>
                    <input type="file" hidden accept="image/*,video/*,application/pdf" ref={imageRef} onChange={handleImage} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1 rounded hover:bg-[#006a4e] disabled:opacity-50"
                  disabled={loading || (!replyText.trim() && !backendFile)}
                  aria-label="Send reply"
                >
                  <IoSend />
                </button>
                <div className="h-5 w-px bg-gray-300" />
                <button type="button" className="p-1 rounded hover:bg-gray-200" onClick={() => { /* extra menu */ }}>
                  <MdKeyboardArrowDown className="text-2xl" />
                </button>
              </div>
            </div>
          </form>

          {/* {showPicker && (
            <div className="absolute bottom-[80px] left-[260px] lg:left-[460px] shadow z-10">
              <EmojiPicker width={350} height={450} onEmojiClick={onEmojiClick} />
            </div>
          )} */}
 {showPicker && (
              <div className='absolute top-[80px] left-[260px] lg:left-[460px] shadow z-100'>
                <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={onEmojiClick} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ThreadPanel;

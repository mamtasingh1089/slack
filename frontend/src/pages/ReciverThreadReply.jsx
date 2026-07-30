// import React, { useState, useEffect, useRef } from "react";
// import { RxCross2 } from "react-icons/rx";
// import axios from "axios";
// import { serverURL } from "../main";

// import { useSelector } from "react-redux";
// import { FiBold, FiItalic, FiMessageCircle } from "react-icons/fi";
// import { FaStrikethrough, FaListUl, FaCode } from "react-icons/fa6";
// import { GoLink, GoQuote } from "react-icons/go";
// import { AiOutlineOrderedList } from "react-icons/ai";
// import { RiCodeBlock } from "react-icons/ri";
// import { BsEmojiSmile, BsCopy, BsEye, BsPin, BsPlusLg, BsLightning } from "react-icons/bs";
// import { IoSend, IoAddSharp } from "react-icons/io5";
// import { MdKeyboardArrowDown } from "react-icons/md";

// import { CgFileAdd } from "react-icons/cg";
// import EmojiPicker from "emoji-picker-react";
// import Avatar from "../component/Avatar";


// const ReciverThreadReply = ({ parentMessage, onClose, receiverId }) => {
//   const imageRef = useRef(null);
//   const plusMenuRef = useRef(null);
//   const listEndRef = useRef(null);

//   //const { singleUser } = useSelector((state) => state.message);
//   const { socket } = useSelector((state) => state.socket || {});

//   const [replies, setReplies] = useState([]);
//   const [replyText, setReplyText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [frontendImage, setFrontendImage] = useState(null); // preview URL
//   const [backendFile, setBackendFile] = useState(null); // actual File object
//   const [plusOpen, setPlusOpen] = useState(false);
//   const [fileType, setFileType] = useState("");
//    const singleUser = useSelector((state) => state.user.singleUser);
//    const user = useSelector((state) => state.user.user);
   

//   // Fetch replies when parentMessage changes
//   useEffect(() => {
//     if (parentMessage?.messageId) fetchReplies();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [parentMessage?.messageId]);

//   // Scroll to bottom when replies update
//   useEffect(() => {
//     listEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [replies]);

//   // Socket listener for new messages in thread
//   useEffect(() => {
//     if (!socket) return;
//     const handleThreadReply = (payload) => {
//       // payload expected to contain { parentId, newMessage }
//       if (!payload) return;
//       if (payload.parentId === parentMessage.messageId) {
//         setReplies((prev) => {
//           if (prev.find((r) => r._id === payload.newMessage._id)) return prev;
//           return [...prev, payload.newMessage];
//         });
//       }
//     };
//     socket.on("newMessage", handleThreadReply);
//     return () => {
//       socket.off("newMessage", handleThreadReply);
//     };
//   }, [socket, parentMessage?.messageId]);

//   // Fetch replies from backend
//   const fetchReplies = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!parentMessage?.messageId) return;
//       const res = await axios.get(
//         `${serverURL}/api/message/thread/${parentMessage.messageId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setReplies(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Error fetching thread replies:", err);
//     }
//   };

//   // Emoji click handler (emoji-picker-react passes event and emojiObject in newer versions)
//   // We'll accept either signature: (emojiData) or (event, emojiObject)
//   const onEmojiClick = (arg1, arg2) => {
//     const emoji = (arg2 && arg2.emoji) || (arg1 && arg1.emoji) || (arg1?.native || "");
//     setReplyText((prev) => prev + emoji);
//     setShowPicker(false);
//   };

//   // File selection handler
//   const handleImage = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     // Basic validation: allow images and videos and docs as needed
//     setBackendFile(file);
//     setFileType(file.type || "");
//     // create preview for image/video only
//     if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
//       const url = URL.createObjectURL(file);
//       setFrontendImage(url);
//     } else {
//       // For other files, you can set a generic icon or just store file name
//       setFrontendImage(null);
//     }
//   };

//   // cancel selected file, revoke preview URL
//   const cancelFile = () => {
//     if (frontendImage) {
//       try {
//         URL.revokeObjectURL(frontendImage);
//       } catch (e) {
//         /* ignore */
//       }
//     }
//     setBackendFile(null);
//     setFrontendImage(null);
//     setFileType("");
//     if (imageRef.current) {
//       imageRef.current.value = "";
//     }
//   };

//   // handle Enter key (send message) — send on Enter unless shiftKey is pressed
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendReply();
//     }
//   };

//   // Send reply
//   const handleSendReply = async (e) => {
//     if (e && e.preventDefault) e.preventDefault();
//     // Prevent empty message unless file is attached
//     if (!replyText.trim() && !backendFile) return;
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const formData = new FormData();
//       formData.append("message", replyText);
//       formData.append("parentId", parentMessage.messageId);
//       if (backendFile) {
//         // Adjust field name to match backend's expected name, e.g., 'image' or 'file'
//         formData.append("image", backendFile);
//       }

//       const res = await axios.post(
//         `${serverURL}/api/message/reply/${receiverId}`,
//         formData,
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
//       );

//       // Optionally, optimistic update: push the sent message if backend returns it
//       if (res?.data) {
//         // If server returns the created message object
//         const created = res.data;
//         // If backend returns created object inside some property, you may need to adjust
//         // For safety, append the returned object if it has _id
//         if (created._id) {
//           setReplies((prev) => [...prev, created]);
//         } else if (Array.isArray(created) && created.length) {
//           // handle array response
//           setReplies((prev) => [...prev, ...created]);
//         }
//       }

//       // reset input & files
//       setReplyText("");
//       cancelFile();
//       setPlusOpen(false);
//       setShowPicker(false);
//     } catch (err) {
//       console.error("Reply failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full md:w-[450px] flex flex-col bg-white h-full border-l border-gray-200 shadow-xl z-50">
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 shadow-sm bg-white">
//         <div>
//           <h3 className="font-black text-lg">Thread</h3>
//           <p className="text-xs text-gray-500 truncate max-w-[250px]">Conversation with {parentMessage?.senderName}</p>
//         </div>
//         <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md" aria-label="Close thread">
//           <RxCross2 size={20} />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto">
//         {/* Parent Message Bubble */}
//         <div className="p-4  bg-gray-50/30">
//           <div className="flex gap-3">
//             <Avatar user={parentMessage?.senderProfile} size="md" />
//             <div className="flex-1">
//               <p className="font-black text-sm">{parentMessage?.senderName}</p>
//               <p className="text-[15px] text-gray-800">{parentMessage?.text}</p>
//               {parentMessage?.image && (
//                 <img src={parentMessage.image} className="mt-2 rounded-lg max-h-48 border shadow-sm" alt="parent-img" />
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Replies List */}
//         <div className="p-4 space-y-6">
//           {replies.map((reply) => (
//             <div key={reply._id || reply.id} className="flex gap-3">
//               <Avatar user={reply.sender?.senderProfile} size="sm" />
//               <div className="flex-1">
//                 <div className="flex items-baseline gap-2">
//                   <p className="font-black text-sm">{reply.sender?.name || reply.user?.name || "Unknown"}</p>
//                   <span className="text-[11px] text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
//                 </div>
//                 <p className="text-[15px] text-gray-700">{reply.message || reply.text}</p>

//                 {reply.image && (
//                   // image URL provided
//                   <img src={reply.image} className="mt-2 rounded-lg max-h-48 border" alt="reply-content" />
//                 )}

//                 {/* Support for video files in replies (if reply.files present) */}
//                 {Array.isArray(reply.files) &&
//                   reply.files.map((f, i) =>
//                     f.mimetype && f.mimetype.startsWith("video") ? (
//                       <video key={i} src={f.url} controls className="mt-2 rounded-lg max-h-48 border" />
//                     ) : null
//                   )}
//               </div>
//             </div>
//           ))}
//           <div ref={listEndRef} />
//         </div>
//       </div>

//       {/* Common Message Input with Uploads */}
//       <div className="p-4 border-t">
//         <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
//           <div className="flex flex-row items-center gap-5 bg-gray-100 px-3 py-2 order-1">
//             <FiBold className="cursor-pointer" />
//             <FiItalic className="cursor-pointer" />
//             <FaStrikethrough className="cursor-pointer" />
//             <GoLink className="cursor-pointer" />
//             <AiOutlineOrderedList className="cursor-pointer" />
//             <FaListUl className="cursor-pointer" />
//             <GoQuote className="cursor-pointer" />
//             <FaCode className="cursor-pointer" />
//             <RiCodeBlock className="cursor-pointer" />
//           </div>

//           <form onSubmit={handleSendReply} className="flex flex-col order-2">
//             <textarea
//               value={replyText}
//               onChange={(e) => setReplyText(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder={`Message ${singleUser?.name || ""}`}
//               className="w-full p-3 min-h-[60px] outline-none resize-none"
//               disabled={loading}
//             />

//             {/* Preview area for selected image/video */}
//             {frontendImage && (
//               <div className="p-2">
//                 <div className="relative w-28 h-28">
//                   <div className="group relative h-full w-full">
//                     {/* If fileType is video, show video preview */}
//                     {fileType.startsWith("video/") ? (
//                       <video src={frontendImage} className="h-full w-full rounded-md object-cover" controls />
//                     ) : (
//                       <img src={frontendImage} alt="Preview" className="h-full w-full rounded-md object-cover" />
//                     )}
//                     <button
//                       type="button"
//                       onClick={cancelFile}
//                       className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
//                       aria-label="Remove file"
//                     >
//                       <RxCross2 size={14} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="flex items-center justify-between px-3 py-2 bg-gray-50 relative">
//               <div className="flex items-center gap-3 text-gray-600">
//                 <button
//                   type="button"
//                   className="text-xl p-1 rounded hover:bg-gray-200"
//                   title="Attach file"
//                   onClick={() => setPlusOpen((prev) => !prev)}
//                 >
//                   <IoAddSharp />
//                 </button>
//                 <button
//                   type="button"
//                   className="text-xl p-1 rounded hover:bg-gray-200"
//                   title="Emoji"
//                   onClick={() => setShowPicker((prev) => !prev)}
//                 >
//                   <BsEmojiSmile />
//                 </button>
//               </div>

//               {plusOpen && (
//                 <div ref={plusMenuRef} className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md border p-2">
//                   <div
//                     onClick={() => {
//                       if (imageRef.current) imageRef.current.click();
//                     }}
//                     className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
//                   >
//                     <CgFileAdd />
//                     <span>Upload from your computer</span>
//                     <input type="file" hidden accept="image/*,video/*,application/pdf" ref={imageRef} onChange={handleImage} />
//                   </div>
//                 </div>
//               )}

//               <div className="flex items-center gap-2">
//                 <button
//                   type="submit"
//                   className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1 rounded hover:bg-[#006a4e] disabled:opacity-50"
//                   disabled={loading || (!replyText.trim() && !backendFile)}
//                   aria-label="Send reply"
//                 >
//                   <IoSend />
//                 </button>
//                 <div className="h-5 w-px bg-gray-300" />
//                 <button type="button" className="p-1 rounded hover:bg-gray-200" onClick={() => { /* extra menu */ }}>
//                   <MdKeyboardArrowDown className="text-2xl" />
//                 </button>
//               </div>
//             </div>
//           </form>

//           {/* {showPicker && (
//             <div className="absolute bottom-[80px] left-[260px] lg:left-[460px] shadow z-10">
//               <EmojiPicker width={350} height={450} onEmojiClick={onEmojiClick} />
//             </div>
//           )} */}
//  {showPicker && (
//               <div className='absolute top-[80px] left-[260px] lg:left-[460px] shadow z-100'>
//                 <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={onEmojiClick} />
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReciverThreadReply;

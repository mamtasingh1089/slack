// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const Chat = ({ senderId, receiverId }) => {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");

//   // fetch messages
//   useEffect(() => {
//     const   res  = async () => {
//       const res = await axios.get(`/api/message/${senderId}/${receiverId}`);
//       setMessages(res.data);
//     };
//     fetchMessages();
//   }, [senderId, receiverId]);

//   // send message
//   const sendMessage = async () => {
//     if (!text) return;
//     await axios.post("/api/message/send", {
//       senderId,
//       receiverId,
//       text,
//     });
//     setMessages([...messages, { senderId, receiverId, text }]);
//     setText("");
//   };

//   return (
//     <div className="w-full h-[90vh] flex flex-col p-4">
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto border p-2 rounded-md bg-gray-100">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`p-2 my-1 max-w-[60%] rounded-lg ${
//               msg.senderId === senderId
//                 ? "bg-blue-500 text-white ml-auto"
//                 : "bg-gray-300 text-black mr-auto"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="flex gap-2 mt-2">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           className="flex-1 border p-2 rounded-md"
//           placeholder="Type a message..."
//         />
//         <button 
//           onClick={sendMessage}
//           className="bg-blue-500 text-white px-4 rounded-md"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;

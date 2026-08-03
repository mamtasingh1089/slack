// import React, { useEffect, useState } from "react";
// import { RxCross2 } from "react-icons/rx";
// import Avatar from "../component/Avatar";
// import axios from "axios";
// import { serverURL } from "../main";

// const ForwardModal = ({ open, onClose, message }) => {
//   const [query, setQuery] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     axios.get(`${serverURL}/api/user/all`, { withCredentials: true })
//       .then(res => setUsers(res.data.users || []));
//   }, []);

//   const toggleUser = (user) => {
//     setSelected(prev =>
//       prev.find(u => u._id === user._id)
//         ? prev.filter(u => u._id !== user._id)
//         : [...prev, user]
//     );
//   };

//   const handleForward = async () => {
//     if (!selected.length) return;

//     setLoading(true);

//     await axios.post(
//       `${serverURL}/api/message/forward`,
//       {
//         originalMessageId: message.messageId,
//         receiverIds: selected.map(u => u._id),
//       },
//       { withCredentials: true }
//     );

//     setSelected([]);
//     onClose();
//     setLoading(false);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[200]">
//       <div className="bg-white w-[520px] rounded-xl shadow-2xl">

//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="font-bold text-lg">Share this file</h2>
//           <RxCross2 onClick={onClose} className="cursor-pointer text-xl" />
//         </div>

//         {/* Search */}
//         <div className="p-4">
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search for channel or person"
//             className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           {/* Selected Pills */}
//           <div className="flex flex-wrap gap-2 mt-3">
//             {selected.map(user => (
//               <div key={user._id} className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
//                 <Avatar user={user} size="sm" />
//                 <span className="text-sm">{user.name}</span>
//                 <RxCross2
//                   className="cursor-pointer"
//                   onClick={() => toggleUser(user)}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* User List */}
//         <div className="max-h-[260px] overflow-y-auto border-t">
//           {users
//             .filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
//             .map(user => (
//               <div
//                 key={user._id}
//                 onClick={() => toggleUser(user)}
//                 className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
//               >
//                 <Avatar user={user} size="sm" />
//                 <span className="font-medium">{user.name}</span>
//               </div>
//             ))}
//         </div>

//         {/* Message Preview */}
//         <div className="p-4 border-t bg-gray-50">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <span className="font-semibold">{message.sender}</span>
//             <span>{message.name}</span>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-between items-center p-4 border-t">
//           <button className="text-blue-600 text-sm">Copy link</button>

//           <button
//             disabled={!selected.length || loading}
//             onClick={handleForward}
//             className="bg-green-700 text-white px-4 py-1.5 rounded-md disabled:opacity-50"
//           >
//             Forward
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ForwardModal;

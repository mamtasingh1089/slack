// import React, { useState } from 'react';
// import { BsEmojiSmile, BsBookmark, BsThreeDotsVertical } from "react-icons/bs";
// import { RiShareForwardFill, RiReplyLine } from "react-icons/ri";
// import { MdDeleteOutline } from "react-icons/md";

// const MessageActionToolbar = ({ onReact, onSave, onForward, onDelete }) => {
//   const [showMore, setShowMore] = useState(false);

//   return (
//     <div className="absolute -top-5 right-2 flex items-center bg-white border border-gray-200 rounded-lg shadow-md px-1 py-0.5 z-20 group-hover:opacity-100 opacity-0 transition-opacity duration-200">
//       <button onClick={onReact} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900" title="Add reaction">
//         <BsEmojiSmile size={16} />
//       </button>
//       <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900" title="Reply in thread">
//         <RiReplyLine size={18} />
//       </button>
//       <button onClick={onForward} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900" title="Forward message">
//         <RiShareForwardFill size={18} />
//       </button>
//       <button onClick={onSave} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900" title="Save message">
//         <BsBookmark size={15} />
//       </button>
      
//       {/* More Actions Menu */}
//       <div className="relative">
//         <button 
//           onClick={() => setShowMore(!showMore)} 
//           className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900" 
//           title="More actions"
//         >
//           <BsThreeDotsVertical size={16} />
//         </button>

//         {showMore && (
//           <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-30">
//             <button 
//               onClick={() => { onDelete(); setShowMore(false); }}
//               className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
//             >
//               <MdDeleteOutline size={18} /> Delete message
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MessageActionToolbar;
// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setSingleUser } from "../redux/userSlice";

// const OnlineUser = () => {
//   const { onlineUsers } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   return (
//     <div className="flex flex-col gap-2 p-2">
//       {onlineUsers && onlineUsers.length > 0 ? (
//         onlineUsers.map((user, index) => (
//           <div
//             key={`${user._id || user.userId || user.name || "user"}-${index}`} // ✅ unique key
//             className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-gray-600 transition"
//             onClick={() => {
//               dispatch(setSingleUser(user));
//               navigate("/msg");
//             }}
//           >
//             {/* Profile Avatar */}
//             <div className="w-[35px] h-[35px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
//               {user.name?.charAt(0).toUpperCase() || "U"}
//             </div>

//             {/* User Name */}
//             <span className="text-white text-sm">{user.name}</span>
//           </div>
//         ))
//       ) : (
//         <p className="text-gray-400 text-sm">No users online</p>
//       )}
//     </div>
//   );
// };

// export default OnlineUser;
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSingleUser } from "../redux/userSlice";

const OnlineUser = () => {
  const { onlineUsers } = useSelector((state) => state.user);
  const me = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ hide self from online list
  const visibleOnline = Array.isArray(onlineUsers)
    ? onlineUsers.filter((u) => (u._id || u.userId) !== me?._id)
    : [];

  return (
    <div className="flex flex-col gap-2 p-2">
      {visibleOnline && visibleOnline.length > 0 ? (
        visibleOnline.map((user, index) => (
          <div
            key={`${user._id || user.userId || user.name || "user"}-${index}`}
            className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-gray-600 transition"
            onClick={() => {
              dispatch(setSingleUser(user));
              navigate("/msg");
            }}
          >
            <div className="w-[35px] h-[35px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-white text-sm">{user.name}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm">No users online</p>
      )}
    </div>
  );
};

export default OnlineUser;

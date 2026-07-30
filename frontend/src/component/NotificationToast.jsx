import React from 'react';
import { RxCross2 } from "react-icons/rx";

const NotificationToast = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id} 
          className="bg-[#3f0c41] text-white p-4 rounded-md shadow-lg w-[300px] border-l-4 border-[#eabdfc] animate-slide-in relative pointer-events-auto transition-all duration-300"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
            <div className='flex flex-col'>
                <span className="font-bold text-sm capitalize">{note.sender}</span>
                <span className="text-xs text-gray-300">#{note.channelName}</span>
            </div>
            <button 
              onClick={() => removeNotification(note.id)}
              className="text-gray-400 hover:text-white"
            >
              <RxCross2 />
            </button>
          </div>

          {/* Body */}
          <p className="text-sm truncate text-gray-200 mt-1">
            {note.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
// src/pages/Later.jsx

import React, { useState } from 'react';
import Topbar from '../../pages/Topbar'; // Assuming these paths are correct
import Sidebar from '../../pages/Sidebar';
import { IoReorderThreeOutline } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { BsFileEarmarkFill, BsCursorFill } from "react-icons/bs";
import box from '../../assets/box.png'; 
import later from '../../assets/later.png'; // This asset doesn't appear to be used
import hand from '../../assets/hand.png';
// Import the new Reminder Modal component
import ReminderModal from './ReminderModal'; 


const savedItems = [
  { type: 'PNG', name: 'image.png', sender: 'Nitish Khanna' },
  { type: 'PNG', name: 'image.png', sender: 'Nitish Khanna' },
  { type: 'PNG', name: 'image.png', sender: 'Nitish Khanna' },
  { type: 'PNG', name: 'image.png', sender: 'Nitish Khanna' },
  { type: 'JPEG', name: 'IMG_20250822_175223.jpg', sender: 'Mamta Singh (you)' },
];

const Later = () => {
  const [activeTab, setActiveTab] = useState('In progress');
  // Renamed to 'isReminderOpen' for clarity, but your 'reminder' state is fine too.
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'In progress':
        return (
          <div className="flex-1 overflow-y-auto">
            {savedItems.map((item, index) => (
              <div key={index} className="p-4 border-b border-gray-700">
                <p className="text-xs text-gray-400 font-bold mb-2">{item.type}</p>
                <div className="flex items-center gap-3 cursor-pointer group">
                  <BsFileEarmarkFill className="text-2xl text-blue-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-white font-medium group-hover:underline">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.sender}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Archived':
        return (
          <div className='flex-1 flex flex-col items-center justify-center text-center p-8'>
            <img src={box} className='h-[30px] w-[30px] my-4'/>
            <h3 className="font-bold text-lg text-[#d1d2d3] mb-2">Out of sight, but not out of mind</h3>
            <p className="text-sm text-gray-200 max-w-xs">
              No more wasting time searching for messages. Archive messages that you come back to often.
            </p>
          </div>
        );

      case 'Completed':
        return (
          <div className='flex-1 flex flex-col items-center justify-center text-center p-8'>
            <img src={hand} className='h-[30px] w-[30px] mb-5'/>
            <h3 className="font-bold text-lg text-[#d1d2d3] mb-2">Feels good to tick things off</h3>
            <p className="text-sm text-gray-300 max-w-xs">
              See all the things that you’ve completed in one place. Sometimes you need a reminder of how amazing you are.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <Topbar />
      <Sidebar />

      <div className="pt-12 pl-[72px] h-full w-full flex flex-row">
        
        {/* Left Column Container */}
        <div className="w-[360px] h-full bg-[#3f0c41] text-gray-200 flex flex-col border-r border-gray-700">
          
          {/* Header */}
          <div className='flex flex-row justify-between items-center p-4 border-b border-gray-700'>
            <h1 className='font-bold text-2xl text-white'>Later</h1>
            <div className='flex items-center gap-4 text-2xl'>
              <button className='hover:text-white'><IoReorderThreeOutline /></button>
              {/* Button to open the reminder modal */}
              <button className='hover:text-white' onClick={() => setIsReminderOpen(true)}><FiPlus /></button>
            </div>
          </div>
          
          {/* Tabs Container */}
          <div className="flex items-center px-4 pt-2 border-b border-gray-700">
            {['In progress', 'Archived', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 text-sm font-semibold whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400'
                }`}
              >
                {tab} {tab === 'In progress' && <span className="font-normal">{savedItems.length}</span>}
              </button>
            ))}
          </div>

          {/* Render the content for the active tab HERE */}
          {renderContent()}

        </div>

        {/* Right Column: Content Display */}
        <div className="flex-1 h-full bg-white flex items-center justify-center">
          <div className="text-center">
            <BsCursorFill className="text-9xl text-purple-300 transform -rotate-45" />
          </div>
        </div>
      </div>
      
      {/* Reminder Modal */}
      <ReminderModal 
        isOpen={isReminderOpen} 
        onClose={() => setIsReminderOpen(false)} 
      />
    </div>
  );
};

export default Later;
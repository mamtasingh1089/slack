// src/components/ReminderModal.jsx

import React from 'react';
import { MdClose } from "react-icons/md";
import { BsCalendar, BsClock } from "react-icons/bs";
import {
    FaBold,
    FaItalic,
    FaStrikethrough,
    FaLink,
    FaListUl,
    FaListOl,
    FaIndent,
    FaOutdent,
    FaCode,
} from "react-icons/fa";

const ReminderModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Mock data for time selection dropdown (simplified)
    const timeOptions = [
        "6:15 PM", 
        "7:00 PM", 
        "8:00 AM", 
        "Tomorrow at 9:00 AM"
    ];

    return (
        // Modal Overlay (Fixed position, full screen, dimmed background)
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-[100] flex items-center justify-center backdrop-blur-sm">
            
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Reminder</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1">
                        <MdClose className="text-2xl" />
                    </button>
                </div>

                {/* Body / Form */}
                <div className="p-6 space-y-6 text-gray-800">
                    
                    {/* When - Date Selector */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">When</label>
                        <div className="relative">
                            <select 
                                defaultValue="Today"
                                className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option>Today</option>
                                <option>Tomorrow</option>
                                <option>Next Week</option>
                            </select>
                            <BsCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Time Selector */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Time</label>
                        <div className="relative">
                            <select 
                                defaultValue="6:15 PM"
                                className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                {timeOptions.map((time, index) => (
                                    <option key={index}>{time}</option>
                                ))}
                            </select>
                            <BsClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Description / Text Editor */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <div className="border border-gray-300 rounded-md">
                            
                            {/* Toolbar */}
                            <div className="flex p-2 border-b space-x-3 text-gray-600">
                                <FaBold className="cursor-pointer hover:text-gray-800" />
                                <FaItalic className="cursor-pointer hover:text-gray-800" />
                                <FaStrikethrough className="cursor-pointer hover:text-gray-800" />
                                <FaLink className="cursor-pointer hover:text-gray-800" />
                                <FaListUl className="cursor-pointer hover:text-gray-800" />
                                <FaListOl className="cursor-pointer hover:text-gray-800" />
                                <FaIndent className="cursor-pointer hover:text-gray-800" />
                                <FaOutdent className="cursor-pointer hover:text-gray-800" />
                                <FaCode className="cursor-pointer hover:text-gray-800" />
                            </div>

                            {/* Textarea */}
                            <textarea
                                placeholder="Remind me to..."
                                className="w-full h-24 p-3 resize-none focus:outline-none text-sm rounded-b-md"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer / Buttons */}
                <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
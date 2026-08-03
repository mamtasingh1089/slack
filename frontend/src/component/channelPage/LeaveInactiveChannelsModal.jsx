import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {serverURL} from '../../main'



const ChannelsIllustration = () => (
    <div className="bg-[#7d95eb] w-full h-full flex items-center justify-center rounded-l-lg p-4">
        <div className="bg-[#4a154b] p-6 rounded-lg shadow-lg text-white w-48 animate-float">
            <div className="flex items-center mb-4">
                <span className="text-sm font-bold">Channels</span>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2"><span className="text-gray-400 font-bold">#</span><div className="h-2 bg-gray-500 rounded w-full"></div></div>
                <div className="flex items-center gap-2"><span className="text-gray-400 font-bold">#</span><div className="h-2 bg-gray-500 rounded w-full"></div></div>
                <div className="flex items-center gap-2"><span className="text-gray-400 font-bold">#</span><div className="h-2 bg-gray-500 rounded w-full"></div></div>
            </div>
        </div>
    </div>
);

const LeaveInactiveChannelsModal = ({ isVisible, onClose }) => {
    const dispatch = useDispatch();
    
    const allChannels = useSelector((state) => state.channel.allChannels) || [];

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    

    const [selectedChannels, setSelectedChannels] = useState([]);


    useEffect(() => {
        if (isVisible && allChannels.length > 0) {
            setSelectedChannels(allChannels.map(c => c._id));
        }
    }, [isVisible, allChannels]);

  
    const handleSelectAll = (e) => {
        if (e.target.checked) {
          
            setSelectedChannels(allChannels.map(c => c._id));
        } else {
            setSelectedChannels([]);
        }
    };

   
    const handleSelectChannel = (channelId) => {
        setSelectedChannels(prev =>
            prev.includes(channelId)
                ? prev.filter(id => id !== channelId) 
                : [...prev, channelId]               
        );
    };

    const handleLeaveChannels = async (e) => {
        e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const leaveRequests = selectedChannels.map(channelId => {
            return axios.delete(`${serverURL}/api/channel/${channelId}/members/me`, { withCredentials: true });
        });
        await Promise.all(leaveRequests);
        dispatch(allChannels());
        setLoading(false);
        onClose();
        } catch (error) {
            console.error("Error leaving channels:", error);
            setError(error.response ? error.response.data.message : "An unexpected error occurred.");
            setLoading(false);
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white text-black w-full max-w-[700px] h-[500px] rounded-xl shadow-2xl flex relative"
                 onClick={(e) => e.stopPropagation()}>
                
                <button className="absolute top-4 right-4 text-black cursor-pointer transition-colors" onClick={onClose}>
                    <IoClose size={24} />
                </button>

                <div className="w-2/5 hidden md:block ">
                    <ChannelsIllustration />
                </div>

                <div className="w-full md:w-3/5 p-8 flex flex-col">
                    <h2 className="text-2xl font-bold mb-2 text-black">Leave channels</h2>
                    <p className="text-black mb-6">

                        You’re in  {allChannels.length} channels! Let’s remove some channels from your sidebar that have been collecting dust.
                    </p>
                    <label htmlFor="timeframe" className="text-sm font-semibold text-black mb-1">
                        Show channels that I haven't viewed in:
                    </label>
                    <select id="timeframe" className="w-full text-black p-2 border   border-gray-300 rounded-md mb-6 bg-white focus:ring-2 focus:ring-blue-500">
                        <option value="6m" className='hover:bg-[#1264a3]'>6 months</option>
                        <option value="1y">1 year</option>
                        <option value="all">All time</option>
                    </select>

                    <div className="border-t pt-4 space-y-3 flex-grow overflow-y-auto">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="select-all"
                                className="h-4 w-4 rounded text-red-500 border-black focus:ring-red-400"
                                checked={allChannels.length > 0 && selectedChannels.length === allChannels.length}
                                onChange={handleSelectAll}
                                disabled={allChannels.length === 0} 
                            />
                            <label htmlFor="select-all" className="ml-3 text-sm font-semibold text-black">
                                Select all {allChannels.length} channels
                            </label>
                        </div>
                        
                    
                        {allChannels.map(channel => (
                            <div key={channel._id} className="flex items-center pl-2">
                                <input
                                    type="checkbox"
                                    id={`channel-${channel._id}`}
                                    className="h-4 w-4 rounded text-red-500 border-gray-300 focus:ring-red-400"

                                    checked={selectedChannels.includes(channel._id)}
                                    onChange={() => handleSelectChannel(channel._id)}
                                />
                                <label htmlFor={`channel-${channel._id}`} className="ml-3 text-sm">
                                    # {channel.name}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex justify-end gap-3 pt-6">
                        <button 
                            className="px-4 py-2 rounded-md font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
                            onClick={onClose}
                        >
                            Remind me later
                        </button>
                        <button 
                            className="px-4 py-2 rounded-md font-semibold text-white bg-[#007a5a] hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            onClick={handleLeaveChannels}
                            disabled={selectedChannels.length === 0 || loading}
                        >
                            {loading ? 'Leaving...' : `Leave ${selectedChannels.length} Channels`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveInactiveChannelsModal;
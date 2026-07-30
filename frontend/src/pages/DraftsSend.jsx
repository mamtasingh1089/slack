import React, { useState, useEffect } from 'react';
import { BiPencil } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { format, isToday, isYesterday } from 'date-fns';
import axios from 'axios';
import { serverURL } from '../main';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchConversations } from '../redux/conversationSlice';
import { setChannel, setSelectedChannelId } from '../redux/channelSlice';

import Avatar from '../component/Avatar'; 
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import HomePageSidebar from '../component/sidebar/HomePageSidebar';

const DraftsSend = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('Drafts');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const me = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        switch (activeTab) {
          case 'Drafts':
            endpoint = `${serverURL}/api/draft/drafts`;
            break;
          case 'Scheduled':
            endpoint = `${serverURL}/api/draft/scheduled`;
            break;
          case 'Sent':
            endpoint = `${serverURL}/api/draft/sent`;
            break;
          default:
            endpoint = `${serverURL}/api/draft/drafts`;
        }

        const res = await axios.get(endpoint, { withCredentials: true });
        
        const formattedData = res.data.map((item) => formatMessageForUI(item));
        setData(formattedData);
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error?.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

 

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    if(!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await axios.delete(`${serverURL}/api/draft/${id}`, { withCredentials: true });
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting draft", error);
    }
  };

 
  const handleChannelClick = (channelObj) => {
    if(!channelObj) return;
    try {
        const cId = channelObj._id || channelObj;
        dispatch(setSelectedChannelId(cId));
        if(typeof channelObj === 'object') dispatch(setChannel(channelObj));
        navigate(`/channel/${cId}`);
    } catch(err) {
        console.error("Failed to join or open channel:", err);
    }
  };

 
  const handleUserClick = async (otherId) => {
    if (!me?._id || !otherId) return;
    try {
        await axios.post(`${serverURL}/api/conversation/`, { senderId: me._id, receiverId: otherId });
        await axios.put(`${serverURL}/api/conversation/mark-read/${otherId}`);
        dispatch(fetchConversations());
        navigate(`/dm/${otherId}`);
    } catch (err) {
        console.error("Failed to create or get conversation:", err);
    }
  };

  return (
    <div className="w-full h-screen bg-white overflow-hidden font-sans">
      <Topbar />
      <Sidebar />
      <HomePageSidebar />

      <main className="ml-[30%] pt-12 h-full flex flex-col border-l bg-[#f8f8f8] border-gray-200">
      
        <div className="px-6 pt-1 pb-0 flex-shrink-0 bg-white">
          <div className="flex justify-between items-center mb-4 pt-4">
            <h1 className="text-[22px] font-bold text-[#1d1c1d]">Drafts & sent</h1>
          </div>
          
          <div className="flex items-center gap-6 text-[15px] border-b border-gray-200">
            <TabItem label="Drafts" count={activeTab === 'Drafts' ? data.length : null} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabItem label="Scheduled" count={activeTab === 'Scheduled' ? data.length : null} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabItem label="Sent" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

     
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
            {loading ? (
                <div className="flex justify-center items-center h-40 text-gray-500">Loading...</div>
            ) : (
                <>
                    {activeTab === 'Drafts' && (
                        data.length > 0 
                        ? <MessageList 
                            messages={data} 
                            type="draft" 
                            onDelete={handleDelete} 
                            onChannelClick={handleChannelClick}
                            onUserClick={handleUserClick}
                          /> 
                        : <EmptyState message="No drafts found." />
                    )}

                    {activeTab === 'Scheduled' && (
                        data.length > 0 
                        ? <MessageList 
                            messages={data} 
                            type="draft" 
                            onDelete={handleDelete}
                            onChannelClick={handleChannelClick}
                            onUserClick={handleUserClick} 
                          /> 
                        : <ScheduledView />
                    )}

                    {activeTab === 'Sent' && (
                        data.length > 0 
                        ? <MessageList 
                            messages={data} 
                            type="sent" 
                            onChannelClick={handleChannelClick}
                            onUserClick={handleUserClick}
                          /> 
                        : <EmptyState message="No sent messages yet." />
                    )}
                </>
            )}
        </div>
      </main>
    </div>
  );
};


const formatMessageForUI = (item) => {
    let targetName = "Unknown";
    let targetAvatarPath = null;
    let isChannel = false;
    let rawChannel = null;
    let rawReceiverId = null;

    
    if (item.channel) {
        isChannel = true;
        if (typeof item.channel === 'object') {
            targetName = `# ${item.channel.name}`;
            rawChannel = item.channel; 
        } else {
            targetName = "# Unknown Channel";
            rawChannel = { _id: item.channel };
        }
    } 
  
    else if (item.receiver) {
        if (typeof item.receiver === 'object') {
            targetName = item.receiver.name || "Unknown User";
            targetAvatarPath = item.receiver.profilePic || item.receiver.profileImage;
            rawReceiverId = item.receiver._id;
        } else {
            rawReceiverId = item.receiver; 
        }
    }

    const dateObj = new Date(item.scheduledAt || item.createdAt);

    return {
        id: item._id,
        user: targetName, 
        avatarPath: targetAvatarPath, 
        isChannel: isChannel,
        rawChannel: rawChannel,
        rawReceiverId: rawReceiverId,
        message: item.message || (item.files?.length > 0 ? "📎 Attachment" : item.image ? "📷 Image" : ""),
        time: format(dateObj, 'h:mm a'),
        date: dateObj,
    };
};



const TabItem = ({ label, count, activeTab, setActiveTab }) => {
    const isActive = activeTab === label;
    return (
        <div onClick={() => setActiveTab(label)} className={`pb-3 px-1 cursor-pointer flex items-center gap-1.5 border-b-[3px] transition-all relative top-[1px] ${isActive ? 'border-[#1264a3] text-[#1d1c1d] font-bold' : 'border-transparent text-[#616061] hover:text-[#1d1c1d] hover:bg-gray-50'}`}>
            <span>{label}</span>
            {count > 0 && <span className="text-gray-500 font-normal text-sm bg-gray-100 px-1.5 rounded-full">{count}</span>}
        </div>
    );
};

const MessageList = ({ messages, type, onDelete, onChannelClick, onUserClick }) => {
    const grouped = messages.reduce((acc, curr) => {
        let dateKey = "";
        try {
            if (isToday(curr.date)) dateKey = "Today";
            else if (isYesterday(curr.date)) dateKey = "Yesterday";
            else dateKey = format(curr.date, 'EEEE, d MMMM'); 
        } catch(e) { dateKey = "Recent"; }

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(curr);
        return acc;
    }, {});

    return (
        <div className="pb-10">
            {Object.keys(grouped).map((dateGroup) => (
                <div key={dateGroup}>
                    <div className="sticky top-0 bg-white z-10 font-bold text-[15px] text-[#1d1c1d] flex items-center px-6 py-2 border-b border-gray-100">
                        {dateGroup}
                        <span className="ml-2 text-xs font-normal text-gray-400">▼</span>
                    </div>
                    
                    <div>
                        {grouped[dateGroup].map((item) => (
                            <div 
                                key={item.id} 
                                className="group relative flex items-start gap-3 px-6 py-2.5 cursor-pointer border-b border-transparent hover:bg-[#f2f2f2] hover:border-gray-200 transition-colors"
                                // CLICK ANYWHERE ON ROW TO OPEN
                                onClick={() => {
                                    if(item.isChannel) {
                                        onChannelClick(item.rawChannel);
                                    } else {
                                        onUserClick(item.rawReceiverId);
                                    }
                                }}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {item.isChannel ? (
                                       <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                            #
                                       </div>
                                    ) : (
                                       <Avatar 
                                            user={{ 
                                                name: item.user, 
                                                profileImage: item.avatarPath
                                            }} 
                                            size="sm" 
                                       />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 ml-3">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-[15px] font-bold text-[#1d1c1d] truncate">{item.user}</h3>
                                        <span className="text-xs text-[#616061] whitespace-nowrap ml-2">{item.time}</span>
                                    </div>
                                    <p className="text-[#616061] text-[15px] truncate leading-snug">{item.message}</p>
                                </div>

                                {type === 'draft' && (
                                    <div className="absolute right-4 top-2 hidden group-hover:flex bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden z-20">
                                        <button className="p-2 hover:bg-gray-100 text-[#1d1c1d]" title="Edit" onClick={(e) => e.stopPropagation()}>
                                            <BiPencil size={18} />
                                        </button>
                                        <button 
                                            className="p-2 hover:bg-gray-100 text-[#e01e5a]" 
                                            title="Delete" 
                                            onClick={(e) => handleDelete(item.id, e)} // Correctly pass ID and event
                                        >
                                            <RxCross2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ScheduledView = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="mb-6 relative">
             <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="80" rx="35" ry="12" fill="#4a154b" opacity="0.1" />
                <path d="M15 50 L15 65 C15 75 85 75 85 65 L85 50" fill="#3f0e40" />
                <ellipse cx="50" cy="50" rx="35" ry="12" fill="#5c2c5d" />
                <ellipse cx="50" cy="48" rx="33" ry="11" fill="#e8d5ea" />
                <path d="M50 48 L 60 48" stroke="#4a154b" strokeWidth="2" strokeLinecap="round" />
                <path d="M50 48 L 50 40" stroke="#4a154b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="39" r="1" fill="#4a154b" />
                <circle cx="50" cy="57" r="1" fill="#4a154b" />
                <circle cx="81" cy="48" r="1" fill="#4a154b" />
                <circle cx="19" cy="48" r="1" fill="#4a154b" />
             </svg>
        </div>
        <h2 className="text-[19px] font-bold text-[#1d1c1d] mb-2">Write now, send later.</h2>
        <p className="text-[#616061] max-w-[450px] mb-8 leading-6 text-[15px]">Schedule messages to be sent at a later time.</p>
        <button className="px-4 py-2 border border-gray-300 rounded font-bold text-[15px] hover:bg-gray-50 transition-colors text-[#1d1c1d] bg-white">Start new message</button>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-[40vh] text-gray-500"><p>{message}</p></div>
);

export default DraftsSend;
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '../../main';

import Koalaliving from '../koalaliving/Koalaliving';
import Avatar from '../Avatar';
import LeaveInactiveChannelsModal from '../channelPage/LeaveInactiveChannelsModal';
import NewChannel from '../channelPage/NewChannel';
import useClickOutside from '../../hook/useClickOutside'; 
import slackbot from '../../assets/slackbot.png';
import Invite from '../koalaliving/Invite';
import {  MdOutlineFilterList } from "react-icons/md"; // Added Filter icon
import { AiOutlineCheck } from "react-icons/ai"; // Added Check icon

import { setAllUsers } from '../../redux/userSlice';
import { fetchConversations, selectAllConversations } from '../../redux/conversationSlice';
import { setChannel, setSelectedChannelId, setAllChannels } from '../../redux/channelSlice';

import { CiSettings, CiHeadphones } from "react-icons/ci";
import { FaRegEdit, FaFileArchive } from "react-icons/fa";
import { RiChatThreadLine } from "react-icons/ri";
import { LuSendHorizontal } from "react-icons/lu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import DraftsSend from '../../pages/DraftsSend';


const HomePageSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const settingsRef = useRef(null);
    const channelOptionsRef = useRef(null); 
    const addChannelBoxRef = useRef(null);

    const { id: activeChatId, channelId: activeChannelId } = useParams(); 

   
    const [openChannel, setOpenChannel] = useState(true);
    const [directMessageOpen, setDirectMessageOpen] = useState(true);
    const [openApp, setOpenApp] = useState(false);
    const [invite, setInvite] = useState(false);

    const [openBox, setOpenBox] = useState(false);
    const [openAddChannel, setOpenAddChannel] = useState(false);
    const [openCreate, setCreateOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [openDraftsPage,setOpenDraftsPage]=useState()
    const [openSettingsPage,setOpenSettingsPage]=useState()
  
    const me = useSelector((state) => state.user.user);
    const { allUsers = [] } = useSelector((state) => state.user);
    const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
    const allChannels = useSelector((state) => state.channel.allChannels);
    const conversations = useSelector(selectAllConversations);
    const socket = useSelector((state) => state.socket.socket);

    // const channelOptionsRef = useRef(null); 
    //const addChannelBoxRef = useRef(null); 

    const isDND = me?.notificationPausedUntil && new Date() < new Date(me.notificationPausedUntil);



    useClickOutside(channelOptionsRef, () => {
        setOpenAddChannel(false);
        setCreateOpen(false);
        setManageOpen(false);
    });

    useClickOutside(addChannelBoxRef, () => {
        setOpenBox(false);
    });

    // 1. Fetch Channels
   useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await axios.get(`${serverURL}/api/channel/getAllChannel`);
                dispatch(setAllChannels(res.data));
            } catch (err) {
                console.error("Error fetching channels", err);
            }
        };
        if (me?._id) fetchChannels();
    }, [dispatch, me?._id]);
   
    // 2. Fetch Users & Conversations
   useEffect(() => {
        dispatch(fetchConversations());
        if (!allUsers || allUsers.length === 0) {
            const fetchAllUsers = async () => {
                try {
                    const res = await axios.get(`${serverURL}/api/user/get`);
                    dispatch(setAllUsers(res.data));
                } catch (err) {
                    console.error("Failed to fetch all users:", err);
                }
            };
            fetchAllUsers();
        }
    }, [dispatch, allUsers.length]);

    // 3. Listen for real-time Channel updates
    useEffect(() => {
      if (!socket) return;
      const handleNewChannelMessage = ({ channel: updatedChannel }) => {
        if (!updatedChannel) return;
        const updatedList = (allChannels || []).map(ch =>
          ch._id === updatedChannel._id ? { ...ch, ...updatedChannel } : ch
        );
        const exists = updatedList.some(c => c._id === updatedChannel._id);
        const finalList = exists ? updatedList : [updatedChannel, ...updatedList];
        dispatch(setAllChannels(finalList));
      };
      socket.on('newChannelMessage', handleNewChannelMessage);
      return () => socket.off('newChannelMessage', handleNewChannelMessage);
    }, [socket, allChannels, dispatch]);

 const openChat = async (otherId) => {
        if (!me?._id) return;
        try {
            await axios.post(`${serverURL}/api/conversation/`, { senderId: me._id, receiverId: otherId });
            await axios.put(`${serverURL}/api/conversation/mark-read/${otherId}`);
            dispatch(fetchConversations());
            navigate(`/dm/${otherId}`);
        } catch (err) {
            console.error("Failed to create or get conversation:", err);
        }
    };
    
   const openChannelPage = (channel) => {
        try {
            dispatch(setSelectedChannelId(channel));
            dispatch(setChannel(channel));
            navigate(`/channel/${channel._id}`);
        } catch(err) {
            console.error("Failed to join or open channel:", err);
        }
    };

    const handleOpenCreateChannel = () => {
        setIsNewChannelModalOpen(true);
        setOpenAddChannel(false);
        setCreateOpen(false);
        setOpenBox(false);
    };
    
    const handleOpenLeaveInactive = () => {
        setIsLeaveModalOpen(true);
        setOpenAddChannel(false);
        setManageOpen(false);
    };

    useClickOutside(settingsRef, () => {
        setOpenSettingsPage(false);
    });

   const SettingsDropdown = () => (
        <div ref={settingsRef} className="absolute left-[80%] top-10 w-[280px] bg-white text-black shadow-2xl rounded-lg z-[100] border border-gray-200 py-2">
            <div className="group relative">
                <div className="flex justify-between items-center px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer font-medium">
                    <span>Filter and sort</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs opacity-60">Active only</span>
                        <MdKeyboardArrowRight />
                    </div>
                </div>
                
                <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-[240px] bg-white text-black shadow-xl rounded-lg border border-gray-200 py-2">
                    <div className="px-4 py-1 text-xs text-gray-500">Filter conversations by:</div>
                    <div className="flex items-center justify-between px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer">
                        <span>Active only</span>
                        <AiOutlineCheck className="text-blue-500" />
                    </div>
                    <div className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer">Unread messages</div>
                </div>
            </div>

            <div className="border-t my-1"></div>

            <div className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer">
                <p className="font-medium text-sm">Create a section</p>
            </div>

            <div className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer">
                <p className="font-medium text-sm">Manage channel list</p>
            </div>

            <div className="border-t my-1"></div>
            <div className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer flex items-center gap-2">
                <MdOutlineFilterList /> <span className="text-sm">Clean up list</span>
            </div>
        </div>
    );

    return (
        <div className="fixed top-12 left-[5%] md:w-[25%] w-[25%] h-full bg-[#3f0c41] text-gray-200 flex flex-col border-r border-gray-700 flex-shrink-0 ">
            {/* Header */}
            <div className='flex flex-row justify-between items-center p-1 border-b border-gray-700'>
                <Koalaliving />
               <div className="flex gap-3 text-xl mt-5 relative"> {/* Added relative here */}
                    <CiSettings 
                        className="cursor-pointer" 
                        onClick={() => setOpenSettingsPage(prev => !prev)}
                    />
                    {openSettingsPage && <SettingsDropdown />}
                    
                    <FaRegEdit className="cursor-pointer" />
                </div>
            </div>

           

            <div className='flex flex-col flex-grow overflow-auto'>
                <div className='p-2 space-y-2 border-b border-[#d8c5dd]'>
                    <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer'><RiChatThreadLine /> <p>Threads</p></div>
                    <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer' onClick={() => navigate('/huddles')}><CiHeadphones /><p>Huddles</p></div>
<div 
    className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer' 
    onClick={() => navigate('/draftssend')}
>
    <LuSendHorizontal /> <p>Drafts & sent</p>
</div>
         <div 
            className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer'
            onClick={() => navigate('/directories')}
        >
            <FaFileArchive /><p>Directories</p>
        </div>
                </div>

{/* {openDraftsPage && (
    <DraftsSend/>
)} */}
                {/* Channels Section */}
                <div className="flex text-[#d8c5dd] items-center justify-between cursor-pointer hover:bg-[#683c6a] p-1 rounded group">
                    <div className='flex items-center gap-[10px] flex-grow' onClick={() => setOpenChannel(prev => !prev)}>
                        <IoMdArrowDropdown className={`transition-transform duration-200 ${openChannel ? "rotate-0" : "-rotate-90"}`} />
                        <p>Channels</p>
                    </div>
                    <div className='relative'>
                        <div className='hover:bg-[#350d36] rounded p-1' onClick={() => setOpenAddChannel(prev => !prev)}>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineDotsVertical /></span>
                        </div>
                    </div>
                </div>

                <ul>
                           {openChannel && (
                    <ul className="mt-1 space-y-1">
                        {allChannels.map((ch) => {
                            const myId = me?._id;
                            // 1. Get raw count from DB/Redux
                            const rawCount = ch.unreadCounts && myId ? ch.unreadCounts[myId] : 0;
                            
                            // 2. Check if this channel is currently open
                            const isActive = ch._id === activeChannelId;

                            // 3. LOGIC FIX: If active, force count to 0. Otherwise use rawCount.
                            const count = isActive ? 0 : rawCount;
                            
                            // 4. Determine bold styling
                            const isBold = count > 0;

                            return (
                                <li 
                                    key={ch._id} 
                                    onClick={() => openChannelPage(ch)}
                                    className={`
                                        flex justify-between items-center px-6 py-1 cursor-pointer
                                        ${isActive ? "bg-[#1164a3] text-white" : "hover:bg-[#350d36] text-[#d8c5dd]"}
                                        ${isBold ? "font-bold text-white" : ""}
                                    `}
                                >
                                    <div className='truncate'># {ch.name}</div>
                                    
                                    {/* Only show badge if count > 0 */}
                                    {count > 0 && (
                                        <div className="bg-[#eabdfc] text-[#3f0c41] text-xs font-bold px-2 rounded-full">
                                            {count}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
                </ul>
                
                <div className='flex p-2 gap-2 hover:bg-[#350d36] hover:rounded cursor-pointer text-white' onClick={() => setOpenBox(prev => !prev)}>
                    <div className='bg-gray-700 px-2 rounded'>+</div>
                    <p>Add channels</p>
                </div>

                {/* --- 3. Apply the refs to the menu containers --- */}
                <div ref={channelOptionsRef}>
                    {openAddChannel && (
                        <div className="absolute md:ml-[340px] ml-[190px] flex flex-col -translate-y-1/2 w-[300px] top-90 rounded-lg bg-white shadow-lg z-50 text-black">
                            <div className="flex flex-col shadow-lg shadow-gray-400">
                                <div className='gap-[200px] flex border-b px-4 items-center py-3 hover:bg-blue-600 hover:text-white cursor-pointer' onClick={() => { setCreateOpen(p => !p); setManageOpen(false); }}>
                                    <p>Create</p><MdKeyboardArrowRight />
                                </div>
                                <div className='gap-[185px] flex border-b px-4 items-center py-3 hover:bg-blue-600 hover:text-white cursor-pointer' onClick={() => { setManageOpen(p => !p); setCreateOpen(false); }}>
                                    <p>Manage</p><MdKeyboardArrowRight />
                                </div>
                            </div>
                        </div>
                    )}
                    {openCreate && (
                        <div className="absolute ml-[480px] flex flex-col -translate-y-1/2 w-[200px] top-80 rounded-lg bg-white shadow-lg z-50 text-black">
                            <div className="flex flex-col">
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer' onClick={handleOpenCreateChannel}>Create channel</div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Browse channels</div>
                            </div>
                        </div>
                    )}
                    {manageOpen && (
                        <div className="absolute ml-[480px] flex flex-col -translate-y-1/2 w-[200px] top-95 shadow-lg rounded-lg bg-white z-50 text-black">
                            <div className="flex flex-col">
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Browser channel</div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Edit sections</div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer' onClick={handleOpenLeaveInactive}>Leave inactive channels</div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div ref={addChannelBoxRef}>
                    {openBox && (
                        <div className="absolute ml-[90px] flex flex-col -translate-y-1/2 w-[200px] top-120 rounded-lg bg-white shadow-lg z-50 text-black">
                            <div className="flex flex-col">
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer' onClick={handleOpenCreateChannel}>Create a new channel</div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Browse channels</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Direct Messages Section */}
                <div className='mt-4 px-2'>
                    <div className="flex text-[#d8c5dd] items-center gap-1 cursor-pointer hover:bg-[#350d36] px-2 py-1 rounded-md" onClick={() => setDirectMessageOpen(p => !p)}>
                        <IoMdArrowDropdown className={`transition-transform duration-200 text-lg ${directMessageOpen ? "rotate-0" : "-rotate-90"}`} />
                        <p className='font-semibold text-sm'>Direct messages</p>
                    </div>
   {directMessageOpen && (
                        <div className="mt-1 space-y-0.5">
                            {allUsers.filter(u => u._id !== me?._id).map((user) => {
                                const isOnline = onlineUsers.includes(user._id);
                                const isActive = user._id === activeChatId;
                                const conv = conversations.find(c => String(c.other?._id || c.other) === String(user._id));
                                const count = isActive ? 0 : (conv?.unreadCount || 0);

                                return (
                                    <div key={user._id} onClick={() => openChat(user._id)} 
                                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md cursor-pointer pl-6 
                                        ${isActive ? "bg-[#1164a3] text-white" : count > 0 ? "text-white font-bold" : "text-[#d8c5dd] hover:bg-[#350d36]"}`}>
                                        <div className='flex items-center gap-2 truncate'>
                                            <div className="relative flex-shrink-0">
                                                <Avatar user={user} size="sm" />
                                                {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#3f0c41] bg-[#2bac76]" />}
                                            </div>
                                            <p className="text-sm truncate">{user.name}</p>
                                        </div>
                                        {count > 0 && !isDND && (
                                            <span className='bg-[#eabdfc] text-[#6d3c73] text-xs font-bold rounded-full px-2'>{count}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                <div className='flex cursor-pointer items-center gap-2 px-3 py-1 hover:bg-[#683c6a] rounded-md ' onClick={()=>setInvite(true)}>
                    <div className='text-xl bg-[#683c6a] w-[25px] h-[25px] flex items-center justify-center rounded'>+</div>
                    <p>Invite people</p>
                </div>

               {invite && (
  <Invite 
    workspaceName="Koalaliving" 
    onClose={() => setInvite(false)} 
  />
)}

                {/* ... Apps Section ... */}
                <div className='p-2 flex items-center cursor-pointer' onClick={() => setOpenApp((prev) => !prev)}>
                    <IoMdArrowDropdown className={`transition-transform duration-200 ${openApp ? "rotate-0" : "-rotate-90"}`} />
                    Apps
                </div>
                {openApp && (
                <>
                    <div className='px-3 flex cursor-pointer items-center gap-3 py-1 hover:bg-[#683c6a] rounded-md'>
                        <img src={slackbot} className='w-[25px] rounded' alt="Slackbot icon" />
                        Slackbot
                    </div>
                    <div className='flex cursor-pointer items-center gap-2 px-3 py-1 hover:bg-[#683c6a] rounded-md'>
                        <div className='text-xl bg-[#683c6a] w-[25px] h-[25px] flex items-center justify-center rounded'>+</div>
                        <p>Add apps</p>
                    </div>
                </>
                )}
            </div>

            {/* Modals are rendered outside the main flow, at the end of the component */}
            <NewChannel 
                isVisible={isNewChannelModalOpen} 
                onClose={() => setIsNewChannelModalOpen(false)} 
            />
            <LeaveInactiveChannelsModal 
                isVisible={isLeaveModalOpen} 
                onClose={() => setIsLeaveModalOpen(false)}
            />
        </div>
    );
}

export default HomePageSidebar;
import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi';
import { IoMdArrowDropdown } from 'react-icons/io';
import { BiCheck, BiEnvelope, BiLock, BiArchiveIn } from 'react-icons/bi';
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdOutlineTag, MdPeopleOutline, MdBusiness } from "react-icons/md";
import { RiExternalLinkLine } from "react-icons/ri";
import { BsEnvelope } from "react-icons/bs";
import axios from 'axios';

import HomePageSidebar from '../component/sidebar/HomePageSidebar'; 
import Topbar from './Topbar';
import Sidebar from './Sidebar';

import ProfilePage from '../component/profile/ProfilePage'; 
import AllUser from '../component/profile/AllUser';
import FullProfile from '../component/profile/FullProfile';
import { useDispatch, useSelector } from 'react-redux';
import { setAllChannels, setSelectedChannelId, setChannel } from '../redux/channelSlice';
import { serverURL } from '../main';
import { useNavigate } from 'react-router-dom';

const Directories = () => {

  const [activeTab, setActiveTab] = useState('Channels'); 
  const singleUser = useSelector((state) => state.user.singleUser);

  return (
    <div className="w-full h-screen bg-[#f3f4f6] overflow-hidden font-sans">
      
      <Topbar />
      <Sidebar />
      <HomePageSidebar />

      <main className="mt-12 md:ml-[30%] ml-[30%] md:w-[70%] h-[calc(100vh-48px)] bg-white flex flex-col border-l border-gray-200">
        
     
        <div className="px-6 pt-6 pb-0 flex-shrink-0 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Directories</h1>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <TabItem label="People" icon={<MdPeopleOutline className="text-lg"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabItem label="Channels" icon={<MdOutlineTag className="text-lg"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabItem label="User groups" icon={<HiOutlineUserGroup className="text-lg"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabItem label="External" icon={<RiExternalLinkLine className="text-lg"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabItem label="Invitations" icon={<BiEnvelope className="text-lg"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      
     
        <div className={`flex-1 bg-white ${activeTab === 'People' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
           
            {activeTab === 'People' && (
             <div className="h-full bg-white flex flex-row border-l border-gray-200 relative">
                

                <div className={`flex-1 h-full min-w-0 bg-[#f8f8f8] overflow-y-auto ${singleUser ? 'hidden md:block' : 'block'}`}>
                   <AllUser />
                </div>

                {/* Right Side: Full Profile (Fixed Wrapper) */}
                {singleUser && (
                  <div className="h-full bg-white border-l border-gray-200 shadow-xl z-20 w-full md:w-auto md:flex-shrink-0 md:max-w-[400px] overflow-hidden">
                    <FullProfile />
                  </div>
                )}

             </div>
            )}

            {activeTab === 'Channels' && <ChannelsView />}
            {activeTab === 'User groups' && <UserGroupsView />}
            {activeTab === 'External' && <ExternalView />}
            {activeTab === 'Invitations' && <InvitationsView />}
        </div>
      </main>
    </div>
  );
};

const ChannelsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [scopeFilter, setScopeFilter] = useState('Other channels'); 
  const [typeFilter, setTypeFilter] = useState('Public'); 

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allChannels = useSelector((state) => state.channel.allChannels);
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/channel/getall`, {
             withCredentials: true 
        });
        if(res.data) {
            dispatch(setAllChannels(res.data));
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };
    fetchChannels();
  }, [dispatch]);

  const handleJoinChannel = async (channelId) => {
    try {
        const res = await axios.post(`${serverURL}/api/channel/join`, 
            { channelId },
            { withCredentials: true }
        );

        if (res.status === 200) {
            const updatedChannels = allChannels.map(channel => {
                if (channel._id === channelId) {
                    return {
                        ...channel,
                        members: [...channel.members, currentUser._id] 
                    };
                }
                return channel;
            });
            dispatch(setAllChannels(updatedChannels));
        }
    } catch (error) {
        console.error("Error joining channel:", error);
        alert(error.response?.data?.message || "Failed to join channel");
    }
  };

  const openChannelPage = (channel) => {
    try {
        dispatch(setSelectedChannelId(channel._id));
        dispatch(setChannel(channel));
        navigate(`/channel/${channel._id}`);
    } catch(err) {
        console.error("Failed to open channel:", err);
    }
  };

  const filteredChannels = allChannels?.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isMember = channel.members.some(m => (typeof m === 'object' ? m._id : m) === currentUser?._id);
    
    let matchesScope = true;
    if (scopeFilter === 'My channels') matchesScope = isMember;
    if (scopeFilter === 'Other channels') matchesScope = !isMember; 
    
    let matchesType = true;
    const visibility = channel.visibility || 'public'; 

    if (typeFilter === 'Public') matchesType = visibility === 'public';
    if (typeFilter === 'Private') matchesType = visibility === 'private';
    if (typeFilter === 'Archived') matchesType = visibility === 'archived';
    
    return matchesSearch && matchesScope && matchesType;
  });

  return (
    <>
      <div className="px-6 py-4 space-y-4 flex-shrink-0 bg-white z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-500 text-lg" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2 border border-gray-400 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Search for channels"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    Clear
                </button>
            )}
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded font-bold text-sm hover:bg-gray-50 transition-colors whitespace-nowrap bg-white">
            Create channel
          </button>
        </div>

        <div className="flex flex-wrap justify-between items-center text-sm gap-y-2 relative z-50">
          <div className="flex flex-wrap items-center gap-2">
             <ChannelScopeDropdown selected={scopeFilter} onChange={setScopeFilter} />
             <ChannelTypeDropdown selected={typeFilter} onChange={setTypeFilter} />
             <FilterButton text="Workspaces" />
             <FilterButton text="Organisations" />
             <div className="flex items-center gap-1 text-blue-600 cursor-pointer font-medium hover:underline ml-2">
                <FiFilter /> Filters
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Sort:</span>
            <FilterButton text="Most recommended" isSort />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        {filteredChannels && filteredChannels.length > 0 ? (
            filteredChannels.map((channel) => {
                const isJoined = channel.members.some(member => {
                    const memberId = typeof member === 'object' ? member._id : member;
                    return memberId === currentUser?._id;
                });

                return (
                  <div key={channel._id} className="group px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="max-w-3xl pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900"># {channel.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                          {isJoined && (
                            <span className="flex items-center text-[#007a5a] font-medium bg-[#eefcf6] px-1 rounded">
                              <BiCheck className="mr-1 text-lg" /> Joined
                            </span>
                          )}
                          {(isJoined || channel.description) && <span>·</span>}
                          <span>{channel.members?.length || 0} members</span>
                          {channel.description && <span className="hidden sm:inline">·</span>}
                          <span className="truncate max-w-md hidden sm:block">{channel.description}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center flex-shrink-0">
                          {isJoined ? (
                            <div className="flex gap-2">
                              <button 
                                className="opacity-0 group-hover:opacity-100 px-4 py-1 border border-gray-300 rounded font-bold text-sm hover:bg-gray-100 bg-white transition-opacity"
                                onClick={() => openChannelPage(channel)} 
                              >
                                Open in Home
                              </button>
                            </div>
                          ) : (
                             <button 
                                onClick={() => handleJoinChannel(channel._id)}
                                className="opacity-0 group-hover:opacity-100 px-4 py-1 border border-gray-300 rounded font-bold text-sm hover:bg-gray-100 bg-white transition-opacity"
                             >
                                Join
                             </button>
                          )}
                      </div>
                    </div>
                  </div>
                );
            })
        ) : (
            <div className="p-10 text-center text-gray-500">
                <p className="font-bold text-gray-700">No channels found</p>
                <p className="text-sm mt-1">Try changing your filters or search term</p>
            </div>
        )}
        <div className="h-20"></div>
      </div>
    </>
  );
};

// --- Custom Dropdown Components ---

const ChannelScopeDropdown = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Defined 'options' here for this specific component
    const options = ["All channels", "My channels", "Other channels"];

    return (
        <div className="relative inline-block text-left">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 border rounded text-sm font-medium whitespace-nowrap transition-colors
                ${selected === 'Other channels' || selected === 'My channels' 
                    ? 'bg-[#1d9bd1] text-white border-[#1d9bd1] hover:bg-[#1264a3]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
                <span>{selected}</span>
                <IoMdArrowDropdown />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 py-1 border border-gray-200">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#1164a3] hover:text-white flex items-center justify-between group"
                            >
                                <span>{option}</span>
                                {selected === option && <FiCheck className="text-blue-500 group-hover:text-white" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ChannelTypeDropdown = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Define 'items' here. DO NOT use 'options' variable in the return statement.
    const items = [
        { label: "Any channel type", icon: null },
        { label: "Public", icon: <MdOutlineTag className="text-lg" /> },
        { label: "Private", icon: <BiLock className="text-lg" /> },
        { label: "Archived", icon: <BiArchiveIn className="text-lg" /> },
        { label: "External", icon: <RiExternalLinkLine className="text-lg" /> },
    ];

    const getIcon = (label) => {
        const item = items.find(i => i.label === label);
        return item ? item.icon : null;
    };

    return (
        <div className="relative inline-block text-left">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 border rounded text-sm font-medium whitespace-nowrap transition-colors
                ${selected !== 'Any channel type'
                    ? 'bg-[#1d9bd1] text-white border-[#1d9bd1] hover:bg-[#1264a3]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
                <span className="flex items-center gap-1">
                    {getIcon(selected)}
                    {selected}
                </span>
                <IoMdArrowDropdown />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute left-0 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 py-2 border border-gray-200">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Any channel type
                        </div>
                        {/* FIX: Ensure we are mapping 'items' here, NOT 'options' */}
                        {items.slice(1).map((item) => (
                            <button
                                key={item.label}
                                onClick={() => { onChange(item.label); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#1164a3] hover:text-white flex items-center gap-3 group"
                            >
                                <span className="text-gray-500 group-hover:text-white w-5 flex justify-center">{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {selected === item.label && <FiCheck className="text-blue-500 group-hover:text-white" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Other Views ---

const UserGroupsView = () => (
    <>
      <div className="px-6 py-4 space-y-4">
         <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-500 text-lg" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by team name, project or department"
            />
        </div>
        <div className="flex justify-between items-center text-sm">
           <div className="flex items-center gap-2">
             <FilterButton text="Workspaces" />
             <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 bg-white">
                Exclude deactivated
             </button>
           </div>
           <FilterButton text="A to Z" isSort />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
         <h3 className="text-lg font-bold text-gray-900 mb-1">No results</h3>
         <p className="text-gray-500">No user groups have been created yet</p>
      </div>
    </>
);

const ExternalView = () => (
    <div className="bg-[#fcf8f3] min-h-full">
       <div className="px-6 py-4 bg-white border-b border-gray-200">
         <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-500 text-lg" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Search for people"
            />
        </div>
       </div>

       <div className="px-10 py-10 flex items-center justify-between">
         <div className="max-w-lg">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Work with people outside Koalaliving in Slack</h2>
           <p className="text-gray-700 mb-6 leading-relaxed">
             Move your conversations out of siloed email threads and collaborate with external people, clients, vendors and partners in Slack.
           </p>
         </div>
       </div>

       <div className="px-10 grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-900 mb-2">Create a channel with external people</h3>
             <p className="text-sm text-gray-500 mb-6">Work with multiple people and organisations outside Koalaliving</p>
             <button className="bg-[#007a5a] text-white px-4 py-2 rounded font-bold hover:bg-[#148567]">Create channel</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-900 mb-2">Talk one-to-one</h3>
             <p className="text-sm text-gray-500 mb-6">Talk one-to-one with anyone outside Koalaliving</p>
             <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-50 bg-white">Start a DM</button>
          </div>
       </div>
    </div>
);

const InvitationsView = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="relative mb-6">
           <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-lg relative z-10">
              <BsEnvelope className="text-4xl text-blue-500" />
           </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Track your invitations</h2>
        <p className="text-gray-600 max-w-md mb-6">You’ll see the status of invitations that you’ve sent and received here.</p>
        <button className="px-4 py-2 border border-gray-300 rounded font-bold text-sm hover:bg-gray-50 transition-colors text-gray-700 mb-8">Learn more</button>
    </div>
);

const TabItem = ({ label, icon, activeTab, setActiveTab }) => (
  <div 
    onClick={() => setActiveTab(label)}
    className={`pb-3 pt-1 cursor-pointer flex items-center gap-2 transition-all border-b-2 ${
      activeTab === label 
      ? 'border-[#1264a3] text-black' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const FilterButton = ({ text, isSort = false }) => (
  <button className={`flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 bg-white whitespace-nowrap ${isSort ? 'border-none font-semibold hover:bg-transparent px-1' : ''}`}>
    <span>{text}</span>
    <IoMdArrowDropdown className="text-gray-500" />
  </button>
);

export default Directories;
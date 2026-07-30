import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';

// --- Icon Imports ---
// Ensure you have the 'react-icons' library installed: npm install react-icons
import { IoIosNotifications, IoIosDocument, IoIosLink } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";
import { MdPersonAddAlt1, MdDeleteOutline, MdOutlineEmail } from "react-icons/md";
import { CiStar } from "react-icons/ci";
import { RiHeadphoneLine, RiArrowDownSLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { BsInfoCircle, BsEye, BsPin, BsPlusLg, BsLightning } from "react-icons/bs";
import { FiCopy, FiMessageCircle, FiEdit, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { VscFiles } from "react-icons/vsc";
import { CgProfile } from "react-icons/cg";
import Avatar from '../Avatar';


// --- Redux Slice Import ---
// Verify this path is correct for your redux folder structure.
import { setAllChannels } from '../../redux/channelSlice';

// --- Asset Import ---
// Verify this path points to your jira.png image.
import jira from '../../assets/jira.png';

// --- Component Import ---
// Verify this path points to your AddMember component.
import AddMemberModal from "./AddMember";
import { setChannelMessages } from '../../redux/channelMessageSlice';

const InfoSection = ({ title, value, onEdit, children }) => (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold">{title}</p>
                {value ? <p className="text-sm text-gray-700 mt-1">{value}</p> : children}
            </div>
            {onEdit && <button onClick={onEdit} className="text-sm text-blue-600 font-semibold hover:underline ml-4 flex-shrink-0">Edit</button>}
        </div>
    </div>
);

const ChannelSubPage = ({ channel, onClose }) => {
    // I have renamed 'star' and 'allPosts' for better clarity.
    const [activeTab, setActiveTab] = useState('tabs');
    const [openEditTopic, setOpenEditTopic] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(channel.topic || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isStarPopoverOpen, setIsStarPopoverOpen] = useState(false);
    const [isNotificationsPopoverOpen, setIsNotificationsPopoverOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

    const allUsers = useSelector((state) => state.user.allUsers);
    const addMember = useSelector((state) => state.channel.addMember);
    const channelMessgaes=useSelector((state)=>state.channel.channelMessgaes)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSaveTopic = async () => {
        setIsSaving(true);
        try {
            await axios.patch(`/api/channel/${channel._id}`, { topic: currentTopic });
            const res = await axios.get('/api/channel/getAllChannel');
            dispatch(setAllChannels(res.data));
            setOpenEditTopic(false);
        } catch (error) {
            console.error("Failed to update topic:", error);
            alert("Error: Could not save the topic.");
        } finally {
            setIsSaving(false);
        }
    };

    const getUserNameById = (userId) => {
        const user = allUsers.find(u => u._id === userId);
        return user ? user.name : "Unknown User";
    };

    const handleLeaveChannel = async () => {
        if (window.confirm(`Are you sure you want to leave #${channel.name}?`)) {
            try {
                await axios.delete(`/api/channel/${channel._id}/members/me`);
                const res = await axios.get('/api/channel/getAllChannel');
                dispatch(setAllChannels(res.data));
                alert(`You have left #${channel.name}.`);
                onClose();
                navigate('/');
            } catch (error) {
                console.error("Failed to leave channel:", error);
                alert("Error: Could not leave the channel.");
            }
        }
    };

    const copyChannelId = () => {
        navigator.clipboard.writeText(channel._id);
        alert("Channel ID copied to clipboard!");
    };

    // const channelSendMessage=async()=>{
    //   try{
    //     const result=await axios.get(`http://localhost:5000/api/${channel_id}/messages`,{withCredentials:true})
    //     dispatch(setChannelMessages(result.data))
    //   }catch(error){
    //     console.log(error)
    //   }
    // }

    const createdByName = getUserNameById(channel.createdBy);
    const createdDate = format(new Date(channel.createdAt), 'd MMMM yyyy');

    const renderTabContent = () => {
        // ... The renderTabContent function remains the same as in the previous answer
        // It is syntactically correct.
        // No changes needed inside this function.
        // The full implementation is omitted here for brevity but should be included from the previous response.
         switch (activeTab) {
            case 'about':
                // --- THIS SECTION IS UNCHANGED, AS REQUESTED ---
                return (
                    <div>
                        <div className="p-4 bg-white shadow-md m-6 rounded-lg">
                            <InfoSection
                                title="Topic"
                                value={channel.topic || "Add a topic"}
                                onEdit={() => {
                                    setCurrentTopic(channel.topic || ''); 
                                    setOpenEditTopic(true);
                                }}
                            />
                            <InfoSection
                                title="Description"
                                value={channel.description || "This channel is for working on a project. Hold meetings, share docs, and make decisions together with your team."}
                                onEdit={() => alert("Edit Description clicked")}
                            />
                            <InfoSection title="Managed by">
                                {channel.managedBy && channel.managedBy.length > 0 ? (
                                    <div className="flex items-center gap-1 text-sm mt-1">
                                        <BsInfoCircle className="text-gray-500" />
                                        <span className="text-blue-600 font-semibold">{getUserNameById(channel.managedBy?.[0])}</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 mt-1">Got questions? Ask an admin to add a channel manager to help things run smoothly.</p>
                                )}
                            </InfoSection>
                            <InfoSection
                                title="Created by"
                                value={`${createdByName} on ${createdDate}`}
                            />
                            
                            <div className="pt-4">
                                <button onClick={handleLeaveChannel} className="text-sm text-red-600 font-semibold hover:underline">
                                    Leave channel
                                </button>
                            </div>
                        </div>

                        <div className="flex  m-6 flex-col  h-full   bg-white rounded shadow-md p-4">
                            <h1 className='text-black font-semibold'>Files</h1>
                            <span>There aren’t any files to see here right now. But there could be – drag and drop any file into the message pane to add it to this conversation.</span>
                        </div>
                   </div>
                );
            case 'members':
                // --- THIS SECTION IS UNCHANGED, AS REQUESTED ---
                return (
                    <div className=''>
                        <div className='px-2 flex '>
                         <div>
                               <input 
                            className='p-2 m-2 rounded shadow-lg border w-[320px]'
                            placeholder='Find member'/>
                         </div>
                             <div> <input 
                            className='p-2 m-2 rounded shadow-lg border'
                            placeholder='Everyone'/>
                            </div>
                            </div>

                            <div className=' h-[400px] overflow-auto'>
                                <div className='p-4 flex gap-4 items-center'
                                onClick={() => setIsAddMemberModalOpen(true)}>
                                    <div className='w-10 h-10 rounded bg-[#e8f5fa] flex items-center justify-center text-2xl '><MdPersonAddAlt1 className=''/></div>
                                    <div>Add people</div>
                                </div>
                                 <div className='p-4 flex gap-4 flex-col '>
                                  {addMember.map((user)=>(
                                <div key={user._id} className='flex items-center gap-4'>
                                  <div>
                                    <Avatar  size={10}  user={user} className="w-10 h-10"/>
                                  </div>
                                  <div className='flex flex-col'>
                                    <div className='flex gap-2'>
                                        <h2>{user.name}</h2>
                                        <p>{user.name}</p>
                                    </div>
                                    <div>
                                        <p>{user.profession || "profession"}</p>
                                    </div>
                                </div>
                                </div>
                                
                              ))}
                                </div>
                            </div>
                    </div>
                );
            case 'tabs':
                return (
                  <div className="px-6 pt-2 bg-[#f8f8f8] h-[500px]">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h2 className='font-bold text-md'>Manage tabs</h2>
                      <p className='text-gray-600 text-sm mt-1'>Reorder, add, remove and hide the tabs that everyone sees in this channel.</p>
        
                      <div className='mt-2 flex flex-col gap-1'>
                        <div className='group flex items-center justify-between p-2 rounded-md'>
                          <div className='flex items-center gap-3'><FiMessageCircle className='text-gray-600' size={18} /><p className='text-sm'>Messages</p></div>
                        </div>
                        
                        <div className='group flex items-center justify-between p-2 hover:bg-gray-100 rounded-md'>
                          <div className='flex items-center gap-3'><IoIosDocument className='hover:text-gray-600' size={18} /><p className='text-sm'>Meeting notes</p></div>
                          <div className="hidden group-hover:flex items-center gap-1 border border-gray-300 bg-white rounded-md ">
                            <button className="p-1 hover:bg-gray-200 rounded"><FiEdit size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiTrash2 size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiArrowUp size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiArrowDown size={16} /></button>
                          </div>
                        </div>,,,.

                        <div className='group flex items-center justify-between p-2 hover:bg-gray-100 rounded-md'>
                          <div className='flex items-center gap-3'><VscFiles className='text-gray-600' size={18} /><p className='text-sm'>Files</p></div>
                          <div className="hidden group-hover:flex items-center gap-1 border border-gray-300 bg-white rounded-md ">
                            <button className="p-1 hover:bg-gray-200 rounded"><BsEye size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiArrowUp size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiArrowDown size={16} /></button>
                          </div>
                        </div>

                         <div className='group flex items-center justify-between p-2 hover:bg-gray-100 rounded-md'>
                          <div className='flex items-center gap-3'><BsLightning className='text-gray-600' size={18} /><p className='text-sm'>Workflows</p></div>
                           <p className='text-sm text-gray-500'>Hidden</p>
                          <div className="hidden group-hover:flex items-center gap-1 border border-gray-300 bg-white rounded-md ">
                            <button className="p-1 hover:bg-gray-200 rounded"><BsEye size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiArrowUp size={16} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded"><FiArrowDown size={16} /></button>
                          </div>
                        </div>

                        <div className='group flex items-center justify-between p-2 hover:bg-gray-100 rounded-md'>
                            <div className='flex items-center gap-3'><BsPin className='text-gray-600' size={18} /><p className='text-sm'>Pins</p></div>
                            <p className='text-sm text-gray-500'>Hidden</p>
                            <div className="hidden group-hover:flex items-center gap-1 border border-gray-300 bg-white rounded-md ">
                                <button className="p-1 hover:bg-gray-200 rounded"><BsEye size={16} /></button>
                                <button className="p-1 hover:bg-gray-200 rounded"><FiArrowUp size={16} /></button>
                                <button className="p-1 hover:bg-gray-200 rounded"><FiArrowDown size={16} /></button>
                            </div>
                        </div>                      
                      </div>
        
                      <div className='mt-4 pt-4 border-t'>
                        <button className='w-[100px] flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-md hover:bg-gray-100'>
                          <BsPlusLg className='text-gray-800' />
                          <p className='text-gray-800 font-semibold text-sm'>New Tab</p>
                        </button>
                      </div>
                    </div>
                  </div>
                );
            default:
                return <div></div>
        }
    };
    // ... The rest of the component's JSX remains the same as in the previous answer.
    // It is syntactically correct.
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white overflow-auto rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[92vh] ml-10 mt-[20px]">
                <header className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">#{channel.name}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                            <RxCross2 size={24} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={() => setIsStarPopoverOpen(prev => !prev)}>
                            <CiStar className="mr-1" />  <RiArrowDownSLine className="ml-1" />
                        </button>
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={() => setIsNotificationsPopoverOpen(prev => !prev)}>
                          <IoIosNotifications /> All new posts <RiArrowDownSLine className="ml-1" />
                        </button>
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100">
                            <RiHeadphoneLine className="mr-1" /> Huddle
                        </button>
                    </div>
                </header>

                {isStarPopoverOpen && (
                    <div className="absolute w-[250px] top-[130px] left-[130px] md:left-[400px] bg-white shadow-lg rounded-lg shadow-gray-300 z-50">
                        <div>
                            <p className='px-5 py-2'>Move to...</p>
                        </div>
                        <div className='flex items-center px-5 gap-[9px] py-2 border-b border-gray-300'><CiStar className="mr-1 text-xl" /><p>Starred</p></div>
                        <div className='flex items-center px-5 gap-[15px] py-3'>
                            <p className='text-2xl'>+</p>
                            <p>Create your first section</p>
                        </div>
                    </div>
                )}

                {isNotificationsPopoverOpen && (
                    <div className="absolute w-[300px] top-[125px] left-[170px] md:left-[550px] bg-white shadow-lg rounded-lg border z-50">
                        <div className="">
                            <div className="py-1">
                                <p className="text-sm text-gray-600 px-6 pt-1">Get notifications for...</p>
                            </div>
                            <div className="flex items-start rounded hover:bg-[#1264a3] text-blue-700 hover:text-white cursor-pointer p-2">
                                <div className="pt-1">
                                    <IoCheckmark size={18} />
                                </div>
                                <div className="ml-3">
                                    <p className="font-bold">All new posts</p>
                                    <p className="text-sm">Messages and threads that you follow</p>
                                </div>
                            </div>
                            <div className="flex items-start rounded hover:bg-[#1264a3] hover:text-white cursor-pointer p-2">
                                <div className="w-[18px] hover:text-white"></div>
                                <div className="ml-3">
                                    <p className="font-bold">Just mentions</p>
                                    <p className="text-sm">@you, @channel, @here</p>
                                </div>
                            </div>
                            <div className="flex items-start rounded hover:bg-[#1264a3] hover:text-white cursor-pointer p-2">
                                <div className="w-[18px]"></div>
                                <div className="ml-3">
                                    <p className="font-bold">Nothing</p>
                                    <p className="text-sm">Don&apos;t get push notifications for this channel</p>
                                </div>
                            </div>
                        </div>
                        <hr className="my-1" />
                        <div className="">
                            <div className="flex items-start rounded hover:text-white hover:bg-[#1264a3] cursor-pointer p-2">
                                <div className="w-[18px]"></div>
                                <div className="">
                                    <p className="font-bold px-3">Mute channel</p>
                                    <p className="text-sm px-3">Only get notified if someone @mentions you personally</p>
                                </div>
                            </div>
                        </div>
                        <hr className="my-1" />
                        <div className="">
                            <div className="rounded hover:bg-[#1264a3] cursor-pointer hover:text-white p-2">
                                <p className='px-5'>Advanced options</p>
                            </div>
                            <div className="rounded hover:bg-[#1264a3] cursor-pointer hover:text-white p-2">
                                <p className='px-5'>Edit default preferences</p>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="flex items-center gap-4 px-4 border-b border-gray-200 flex-shrink-0">
                    {['about', 'members', 'tabs', 'integrations', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 text-sm font-semibold capitalize ${activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {openEditTopic && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
                            <div className="px-6 py-4 flex items-center justify-between border-b">
                                <h2 className="text-xl font-bold">Edit topic</h2>
                                <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600"><RxCross2 /></button>
                            </div>
                            <div className="p-6">
                                <textarea 
                                    value={currentTopic} 
                                    onChange={(e) => setCurrentTopic(e.target.value)} 
                                    className="w-full border rounded px-2 py-1 min-h-[100px]" 
                                    placeholder="Add a topic" 
                                />
                                <p className="text-xs text-gray-500 mt-2">Let people know what this channel is for.</p>
                            </div>
                            <div className="flex items-center justify-end gap-3 py-3 px-6 border-t bg-gray-50">
                                <button onClick={() => setOpenEditTopic(false)} className="px-4 py-2 border rounded font-semibold" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white font-semibold rounded" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
      
                {isAddMemberModalOpen && (
                    <AddMemberModal
                        channel={channel}
                        onClose={() => setIsAddMemberModalOpen(false)}
                    />
                )}

                <main className="overflow-y-auto bg-[#f8f8f8]">
                    {renderTabContent()}
                </main>
                
                <footer className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Channel ID: {channel._id}</span>
                        <button onClick={copyChannelId} title="Copy Channel ID" className="hover:text-black">
                            <FiCopy />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
export default ChannelSubPage;
// src/pages/Right.jsx (Corrected)
import axios from "axios";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { CiHeadphones, CiStar, CiClock2 } from "react-icons/ci";
import { IoMdMore } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, clearMessages } from "../redux/messageSlice";
import { fetchConversations } from "../redux/conversationSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import Home from '../component/Home';
import { FiBold, FiItalic, FiMessageCircle } from "react-icons/fi";
import { FaStrikethrough, FaListUl, FaCode } from "react-icons/fa6";
import { GoLink, GoQuote } from "react-icons/go";
import { AiOutlineOrderedList } from "react-icons/ai";
import { RiCodeBlock, RiArrowDropDownLine } from "react-icons/ri";
import { BsEmojiSmile, BsCopy, BsEye, BsPin, BsPlusLg, BsLightning } from "react-icons/bs";
import { IoSend, IoAddSharp } from "react-icons/io5";
import { RxCross1, RxCross2 } from "react-icons/rx";
import { MdOutlinePlaylistAdd, MdKeyboardArrowDown, MdOutlineForwardToInbox, MdOutlineEmail } from "react-icons/md";
import { RiPhoneLine } from "react-icons/ri";
import Avatar from "../component/Avatar";
import { CgProfile } from "react-icons/cg";
import { IoIosNotificationsOutline, IoIosDocument, IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import { LuFile } from "react-icons/lu";
import { FaRegFolderClosed } from "react-icons/fa6";
import { MdPersonSearch } from "react-icons/md";

const Right = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listEndRef = useRef(null);
  


  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [calling, setCalling] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditTopic, setOpenEditTopic] = useState(false);
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [addConversation, setAddConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [openProfile, setOpenProfile] = useState(false);

  // Redux Selector Hooks
  const { allUsers = [] } = useSelector((state) => state.user);
  const singleUser = useSelector((state) => state.user.singleUser);
  const user = useSelector((state) => state.user.user);
  const allMessages = useSelector((state) => state.message.messages);
  const { socket, onlineUsers = [] } = useSelector((state) => state.socket);

  // Memoization Hooks
  const isOnline = useMemo(() => {
    if (!singleUser?._id) return false;
    return onlineUsers.some(onlineId => String(onlineId) === String(singleUser._id));
  }, [onlineUsers, singleUser]);

  const messages = useMemo(() => {
    if (!user?._id || !id) return [];
    return allMessages.filter(
      (msg) =>
        (String(msg.sender?._id) === String(user._id) && String(msg.receiver) === String(id)) ||
        (String(msg.sender?._id) === String(id) && String(msg.receiver) === String(user._id))
    );
  }, [allMessages, user?._id, id]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const excludedIds = new Set([
      user?._id,
      singleUser?._id,
      ...selectedUsers.map(u => u._id)
    ]);
    return allUsers.filter(u =>
      u && u.name && !excludedIds.has(u._id) &&
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allUsers, user, singleUser, selectedUsers]);

  // Effect Hooks
  useEffect(() => {
    if (singleUser) {
      setTopic(singleUser.conversationTopic || "");
    }
  }, [singleUser]);

  useEffect(() => {
    if (id) {
      dispatch(clearMessages());
      fetchUser();
      fetchMessages();
      markThreadAsRead();
    } else {
      dispatch(setSingleUser(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 2. HELPER FUNCTIONS AND EVENT HANDLERS ---
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUser = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`/api/user/${id}`, authHeaders());
      dispatch(setSingleUser(res.data));
    } catch (error) {
      console.error("Error fetching single user:", error);
      dispatch(setSingleUser(null));
    }
  };

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`/api/message/getAll/${id}`, authHeaders());
      dispatch(setMessages(Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const markThreadAsRead = async () => {
    if (!id) return;
    try {
      await axios.post(`/api/conversation/read/${id}`, {}, authHeaders());
      dispatch(fetchConversations());
    } catch (error) {
      console.error("Failed to mark thread as read", error);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !singleUser?._id) return;
    setLoading(true);
    try {
      await axios.post(`/api/message/send/${singleUser._id}`, { message: newMsg }, authHeaders());
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleCancel = () => { setOpenEdit(false); setOpenEditTopic(false); };

  const handleSaveTopic = async () => {
    if (!user?._id || !singleUser?._id) return;
    setSaving(true);
    try {
      const payload = { topic };
      const res = await axios.put(`/api/conversation/topic/with/${singleUser._id}`, payload, authHeaders());
      if (res.data) console.log("Topic updated successfully", res.data);
      setOpenEditTopic(false);
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Failed to update topic.");
    } finally {
      setSaving(false);
    }
  };

 const handleSelectUser = (userToAdd) => {
  setSelectedUsers(prev => {
    // prevent duplicates by _id
    if (!userToAdd || prev.some(u => String(u._id) === String(userToAdd._id))) return prev;
    return [...prev, userToAdd];
  });
  setSearchQuery("");
};



  const handleRemoveUser = (userIdToRemove) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userIdToRemove));
  };

  const handleCloseModal = () => {
    setAddConversation(false);
    setSelectedUsers([]);
    setSearchQuery("");
  };

  const handleCreateGroupConversation = async () => {
    if (selectedUsers.length === 0) return;
    const participantIds = [singleUser._id, ...selectedUsers.map(u => u._id)];
    try {
      const payload = { participantIds };
      const res = await axios.post('/api/conversation/group', payload, authHeaders());
      if (res.status === 201 && res.data) {
        navigate(`/conversation/${res.data._id}`);
      }
    } catch (error) {
      console.error("Failed to create group conversation", error);
      alert("Could not create the group.");
    } finally {
      handleCloseModal();
    }
  };

  // --- 3. CONDITIONAL RETURN (AFTER ALL HOOKS) ---
  if (!singleUser) {
    return <Home />;
  }

  // local renderer for the about/tabs/integrations content inside Edit modal
  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="px-6 bg-[#f8f8f8] py-4 max-h-[340px]">
            <div className="shadow rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">Topic</p>
                  <p className="font-medium text-sm">{topic || "Add a topic"}</p>
                </div>
                <button className="text-sm text-blue-600 font-semibold" onClick={() => { setOpenEdit(false); setOpenEditTopic(true); }}>Edit</button>
              </div>
            </div>

            <div className="mt-4 shadow rounded-lg py-3 px-4 bg-white">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CiClock2 className="font-extrabold text-xl" />
                  <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} local time</span>
                </div>

                <div className="flex flex-row gap-3 items-center">
                  <RiPhoneLine className='text-lg' />
                  <p className="text-blue-700 text-sm">{singleUser?.number || '112'}</p>
                </div>

                {singleUser?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdOutlineForwardToInbox className='text-lg' />
                    <p className="text-blue-600">{singleUser.email}</p>
                  </div>
                )}

                <p
                  className="text-blue-600 font-medium mt-2 cursor-pointer text-sm"
                  onClick={() => {
                    setOpenEdit(false);
                    setOpenProfile(true);
                    navigate('/profilepage'); // navigate to full profile: adapt if route differs
                  }}
                >
                  View full profile
                </p>
              </div>
            </div>

            <div
              className="bg-white mt-4 rounded-xl font-semibold p-3 shadow flex flex-row cursor-pointer hover:bg-gray-50 text-sm"
              onClick={() => { setOpenEdit(false); setAddConversation(true); }}
            >
              Add people to this conversation
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span>Channel ID:</span>
              <span className="font-mono text-gray-700">{singleUser._id || "D098X21T2VC"}</span>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(singleUser._id || ""); alert("Channel ID copied"); }}
                className="ml-auto"
              >
                <BsCopy />
              </button>
            </div>
          </div>
        );

      case 'tabs':
        return (
          <div className="px-6 bg-[#f8f8f8] py-4 max-h-[340px] overflow-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <p className='font-semibold text-md'>Manage tabs</p>
              <p className='text-gray-900 text-sm'>Reorder, add, remove and hide the tabs that everyone sees in this channel.</p>

              <div className='mt-4 flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <FiMessageCircle className='text-lg text-gray-700' />
                    <p>Messages</p>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <LuFile className='text-lg' />
                    <p>Files</p>
                  </div>
                  <div className='flex items-center gap-2 border p-1 rounded-xl'>
                    <BsEye className='text-gray-500' />
                    <IoIosArrowRoundUp />
                    <IoIosArrowRoundDown />
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <FaRegFolderClosed className='text-lg text-gray-700' />
                    <p>slack</p>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IoIosDocument className='text-lg text-gray-700' />
                    <p>Untitled</p>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <BsLightning className='text-lg' />
                    <p>Workflows</p>
                  </div>
                  <p className='text-sm text-gray-500'>Hidden</p>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <BsPin className='text-lg' />
                    <p>Pins</p>
                  </div>
                  <p className='text-sm text-gray-500'>Hidden</p>
                </div>
              </div>

              <div className='flex items-center gap-2 mt-4 pt-4 border-t cursor-pointer'>
                <BsPlusLg className='text-lg text-gray-900' />
                <p className='text-gray-900'>New Tab</p>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="px-6 bg-[#f8f8f8] py-4 min-h-[340px]">
            <div className='bg-white rounded-lg shadow p-4 flex items-start gap-4'>
              <div className='bg-[#e0edf2] p-1 rounded'>
                <MdOutlineEmail className='text-2xl text-[#1264a3]' />
              </div>
              <div>
                <p className='font-semibold text-md'>Send emails to this conversation</p>
                <p className='text-gray-900 text-sm mt-1'>Get an email address that posts incoming emails in this conversation.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // --- 4. RENDER JSX ---
  return (
    <div className="w-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 ">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setOpenEdit(true)}>
          <div className="relative">
            <Avatar user={singleUser} size="md" />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-500"}`} />
          </div>
          <p className="font-semibold">{singleUser.name}</p>
        </div>

        <div className="flex items-center gap-4 text-xl text-gray-600">
          <div className="flex flex-row border rounded-xl p-1 items-center gap-2">
            <div className="hover:bg-[#f3f4f6] rounded-md p-1">
              <CiHeadphones className={`cursor-pointer hover:text-purple-600 transition-colors ${calling ? 'animate-pulse text-gray-500' : ''}`} title={calling ? 'Calling...' : 'Start call'} />
            </div>
            <div className="hover:bg-[#f3f4f6] rounded-md p-1">
              <RiArrowDropDownLine className="text-2xl" />
            </div>
          </div>

          <IoMdMore className="cursor-pointer" />
          <div><RxCross1 className="cursor-pointer" onClick={() => navigate('/')} /></div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-15">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative">
            <div>
              <button className="absolute top-4 right-4 text-xl text-gray-600 cursor-pointer p-6" onClick={() => setOpenEdit(false)}><RxCross2 /></button>

              <div className="flex flex-row gap-4 p-6">
                <Avatar user={singleUser} size="lg" />
                <div className="flex p-6 flex-col justify-center gap-2">
                  <h1 className="text-3xl font-bold">{singleUser.name}</h1>
                  <p className="font-semibold">{singleUser.role}</p>
                </div>
              </div>

              <div className="mt-6 px-6 flex gap-2 flex-wrap">
                <div className="border h-[40px] w-[75px] rounded flex items-center justify-center"><CiStar className="h-[20px] w-[20px]" /><MdKeyboardArrowDown className="h-[20px] w-[20px]" /></div>
                <button className="px-2 border rounded flex items-center gap-2"><IoIosNotificationsOutline />Mute</button>
                <button className="px-3 border rounded flex items-center gap-2"><CgProfile /> VIP</button>
                <button className="px-2 py-2 border rounded flex items-center"><MdPersonSearch />Hide</button>
                <button className="px-1 border rounded flex items-center gap-2"><CiHeadphones /> Huddle ▾</button>
              </div>

              <div className="mt-6 px-6 flex flex-row gap-6 border-b-2">
                <button className={`font-semibold pb-2 ${activeTab === 'about' ? 'border-b-2 border-black' : 'text-gray-500'}`} onClick={() => setActiveTab('about')}>About</button>
                <button className={`font-semibold pb-2 ${activeTab === 'tabs' ? 'border-b-2 border-black' : 'text-gray-500'}`} onClick={() => setActiveTab('tabs')}>Tabs</button>
                <button className={`font-semibold pb-2 ${activeTab === 'integrations' ? 'border-b-2 border-black' : 'text-gray-500'}`} onClick={() => setActiveTab('integrations')}>Integrations</button>
              </div>

              {renderContent()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {openEditTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4">
          <div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Edit topic</h2>
              <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-5 overflow-y-auto">
              <input type="text" value={topic} onChange={handleTopicChange} className="border rounded-xl p-2 hover:bg-[#f8f8f8]" />
              <p className="text-sm text-gray-700">Add a topic to your conversation with @{singleUser.name}. This will be visible to both of you at the top of your DM.</p>
            </div>
            <div className="flex items-center gap-3 py-4 px-6 justify-end border-t">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button>
              <button type="button" onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save topic"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Conversation Modal */}
      {addConversation && (
        <div className="inset-0 z-50 bg-black/50 items-center justify-center p-20 px-4 fixed flex">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Add people to this conversation</h2>
              <button onClick={handleCloseModal} className="text-xl text-gray-600" aria-label="Close modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-4 overflow-y-auto">
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {selectedUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 text-sm">
                      <span>{u.name}</span>
                      <button onClick={() => handleRemoveUser(u._id)} className="text-gray-600 hover:text-black"><RxCross2 /></button>
                    </div>
                  ))}
                </div>
              )}

              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., Vijay or @vijay" className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none" />

              {searchQuery.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <div key={result._id} onClick={() => handleSelectUser(result)} className="flex items-center gap-3 p-3 hover:bg-blue-100 cursor-pointer">
                        <div className="relative">
                          <Avatar user={result} size="sm" />
                          {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                        </div>
                        <span className="font-semibold">{result.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-gray-500">No people found.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button type="button" onClick={handleCreateGroupConversation} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={selectedUsers.length === 0}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message and Canvas tabs */}
      <div className="border-b border-gray-300 flex flex-row gap-[30px] px-[15px] pb-[10px] ">
        <div className="flex flex-row items-center gap-[5px] font-semibold"><FiMessageCircle /><p>Message</p></div>
        <div className="flex flex-row items-center gap-[5px] font-semibold"><MdOutlinePlaylistAdd /><p>Add canvas</p></div>
        <div className="font-semibold"><div>+</div></div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-gray-50 ">
     {messages.map((msg, idx) => {
  const isMine = String(msg.sender?._id) === String(user._id);
  const key = msg._id ? `${msg._id}-${idx}` : `msg-${idx}`;
  return isMine ? (
    <SenderMessage key={key} message={msg.message} createdAt={msg.createdAt} />
  ) : (
    <ReceiverMessage key={key} message={msg.message} createdAt={msg.createdAt} user={msg.sender} />
  );
})}

        <div ref={listEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white ">
        <MessageInput 
        value={newMsg}
        onChange={setNewMsg}
        onSend={sendMessage}
        placeholder={`Message ${singleUser?.name}`}
        loading={loading}
    />
      </div>
    </div>
  );
};

export default Right;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CiSearch } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { fetchConversations, selectAllConversations } from "../redux/conversationSlice";
import { setAllUsers } from "../redux/userSlice";
import { serverURL } from '../main';
import Avatar from "../component/Avatar";

const DmsLeft = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id: activeChatId } = useParams();
    const me = useSelector((state) => state.user.user);
    const { allUsers = [] } = useSelector((s) => s.user);
    const conversations = useSelector(selectAllConversations) || [];
    const { messages = [] } = useSelector((s) => s.message || {});
    const { onlineUsers = [] } = useSelector((s) => s.socket) || {};

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchConversations());
        if (!allUsers || allUsers.length === 0) {
            const fetchAllUsers = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(`${serverURL}/api/user/get`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    dispatch(setAllUsers(res.data));
                } catch (err) {
                    console.error("Failed to fetch all users:", err);
                }
            };
            fetchAllUsers();
        }
    }, [dispatch, allUsers.length]);

    const latestMessageByUserId = useMemo(() => {
        const latestMap = new Map();

        messages.forEach((msg) => {
            const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
            const receiverId = msg.receiver?._id?.toString() || msg.receiver?.toString();

            if (!senderId || !receiverId) return;
            if (!me?._id) return;

            const otherUserId = senderId === me._id.toString() ? receiverId : senderId;
            const existing = latestMap.get(otherUserId);

            if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
                latestMap.set(otherUserId, msg);
            }
        });

        return latestMap;
    }, [messages, me?._id]);

    const directMessageList = useMemo(() => {
        const users = allUsers.filter((u) => String(u._id) !== String(me?._id));
        const conversationByUserId = new Map();

        conversations.forEach((convo) => {
            const otherId = convo?.other?._id || convo?.other;
            if (otherId) {
                conversationByUserId.set(String(otherId), convo);
            }
        });

        const merged = users.map((user) => {
            const convo = conversationByUserId.get(String(user._id));
            const latestMessage = latestMessageByUserId.get(String(user._id));
            return {
                ...convo,
                other: user,
                lastMessage: latestMessage || convo?.lastMessage,
                unreadCount: convo?.unreadCount || 0,
                updatedAt: convo?.updatedAt,
            };
        });

       merged.sort((a, b) => {
            // 1. Get the most recent time possible for User A
            const aTime = Math.max(
                a.updatedAt ? new Date(a.updatedAt).getTime() : 0,
                a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
            );

            // 2. Get the most recent time possible for User B
            const bTime = Math.max(
                b.updatedAt ? new Date(b.updatedAt).getTime() : 0,
                b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
            );

            // 3. If both have messages/history, sort by newest time
            if (bTime !== aTime) {
                return bTime - aTime;
            }

            // 4. Fallback: If neither has a message, keep those with an existing 
            // conversation object slightly higher than completely "cold" users
            const aHasConvo = Boolean(a._id);
            const bHasConvo = Boolean(b._id);
            if (aHasConvo !== bHasConvo) return aHasConvo ? -1 : 1;

            // 5. Final Fallback: Alphabetical
            return (a.other?.name || "").localeCompare(b.other?.name || "");
        });

        return merged;
    }, [allUsers, conversations, me?._id, latestMessageByUserId]);

    const filteredList = useMemo(() => {
        if (!searchTerm) return directMessageList;
        const lowercasedFilter = searchTerm.toLowerCase();
        return directMessageList.filter((item) =>
            (item.other?.name || "").toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, directMessageList]);

    const openChat = async (otherId) => {
        if (!me?._id) {
            console.error("Cannot open chat: current user not loaded.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${serverURL}/api/conversation/`,
                { senderId: me._id, receiverId: otherId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(fetchConversations());
        } catch (err) {
            console.error("Failed to create or get conversation:", err);
        }

        setSearchTerm("");
        navigate(`/dms/${otherId}`);
    };

    const renderUserItem = (item) => {
        const chatUser = item.other;
        if (!chatUser) return null;

        const isOnline = onlineUsers.some((id) => String(id) === String(chatUser._id));
        const isActive = String(chatUser._id) === String(activeChatId);

        // --- LAST MESSAGE DISPLAY LOGIC ---
        const lastMsg = item.lastMessage;
        let displayMessage = "No messages yet";

        if (lastMsg) {
            if (lastMsg.text) {
                displayMessage = lastMsg.text;
            } else if (lastMsg.imageUrl || lastMsg.image) {
                displayMessage = "📷 Photo";
            } else if (lastMsg.videoUrl) {
                displayMessage = "🎥 Video";
            } else if (lastMsg.message) {
                displayMessage = lastMsg.message;
            }
        }

        return (
            <div
                key={chatUser._id}
                onClick={() => openChat(chatUser._id)}
                className={`flex items-center justify-between hover:bg-[#350d36] rounded-md px-2 py-2 cursor-pointer transition-colors ${
                    isActive ? "bg-[#1164a3] text-white" : "text-[#d8c5dd]"
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative flex-shrink-0">
                        <Avatar user={chatUser} size="sm" />
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#3f0c41] bg-[#2bac76]" />
                        )}
                    </div>

                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-1.5">
                            <p className={`font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-white'}`}>
                                {chatUser.name}
                            </p>
                            {chatUser.status?.emoji && (
                                <span className="text-sm" title={chatUser.status.text || ""}>
                                    {chatUser.status.emoji}
                                </span>
                            )}
                        </div>
                        <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-400'} ${!isActive && item.unreadCount > 0 ? "font-bold text-white" : ""}`}>
                            {displayMessage}
                        </p>
                    </div>
                </div>

                {item.unreadCount > 0 && !isActive && (
                    <span className="bg-[#eabdfc] text-[#3f0c41] text-xs font-bold rounded-full px-2 py-0.5">
                        {item.unreadCount}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="lg:w-[640px] lg:pl-[75px] pt-[50px] pl-[54px] flex-shrink-0 h-full bg-[#5a2a5c] flex flex-col border-r border-gray-700">
            <div className="p-3 border-b border-purple-900 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg text-white">Direct messages</h3>
                <FaEdit className="text-xl text-white cursor-pointer" />
            </div>

            <div className="p-3 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Find a DM"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#3e1d3f] border border-gray-500 text-white rounded-md py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-2 space-y-1">
                {filteredList.length > 0 ? (
                    filteredList.map((item) => renderUserItem(item))
                ) : (
                    <p className="text-gray-400 text-sm px-2">No users found</p>
                )}
            </div>
        </div>
    );
};

export default DmsLeft;
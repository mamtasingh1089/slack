import React, { useState, useEffect, useMemo } from 'react';
import Topbar from '../../pages/Topbar';
import Sidebar from '../../pages/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivitiesForUser } from '../../redux/activitySlice';
import Avatar from '../Avatar'; // Make sure this import path is correct

// No changes needed for ActivityItem component
const ActivityItem = ({ activity }) => {
    const renderActivityText = () => {
        switch (activity.action) {
            case 'MENTION':
                return (
                    <>
                        <span className="font-bold">{activity.actor.name}</span> mentioned you in{' '}
                        <span className="font-bold">#{activity.context.id?.name}</span>
                    </>
                );
            case 'THREAD_REPLY':
                return (
                    <>
                        <span className="font-bold">{activity.actor.name}</span> replied to a thread you are in.
                    </>
                );
            case 'REACTION_ADDED':
                return (
                    <>
                        <span className="font-bold">{activity.actor.name}</span> reacted to your message.
                    </>
                );
            default:
                return 'New activity';
        }
    };

    return (
        <div className="border-b border-gray-700 px-4 py-3 hover:bg-[#6a3a6c] transition-colors duration-200">
            <div className="flex items-start gap-3">
                <img src={activity.actor.profileImage || '/default-avatar.png'} alt="actor avatar" className="w-9 h-9 rounded" />
                <div className="flex-1">
                    <p className="text-sm text-gray-100">{renderActivityText()}</p>
                    {activity.target?.id?.content && (
                        <p className="text-sm text-gray-400 mt-1 p-2 border-l-2 border-gray-500">
                            {activity.target.id.content}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5">
                        {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {!activity.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>}
            </div>
        </div>
    );
};


const Activity = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('All');
    const [showUnread, setShowUnread] = useState(false);

    // --- Redux State Selection ---
    const user = useSelector((state) => state.user.user);
    const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { items: activities, status, error } = useSelector((state) => state.activityData);
    const { messages } = useSelector((state) => state.message);
    const { allChannels = [] } = useSelector((state) => state.channel);

    const isOnline = (userId) => onlineUsers.some((id) => String(id) === String(userId));

    // --- Memoized Logic for Direct Messages ---
    const lastMessagesByConversation = useMemo(() => {
        if (!messages || !user?._id) return [];
        const conversations = new Map();
        messages.forEach(msg => {
            const otherUserId = msg.sender._id === user._id ? msg.receiver._id : msg.sender._id;
            const existing = conversations.get(otherUserId);
            if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
                conversations.set(otherUserId, msg);
            }
        });
        return Array.from(conversations.values());
    }, [messages, user]);

    // ✅ Memoized logic to combine and sort DMs and Channels
    const latestConversationsAndChannels = useMemo(() => {
        const formattedDms = lastMessagesByConversation.map(message => {
            const otherUser = message.sender._id === user._id ? message.receiver : message.sender;
            return {
                type: 'dm',
                id: otherUser._id,
                data: { ...message, otherUser: otherUser },
                timestamp: new Date(message.createdAt).getTime(),
            };
        });

        const formattedChannels = allChannels
            .filter(channel => channel.lastMessage)
            .map(channel => ({
                type: 'channel',
                id: channel._id,
                data: channel,
                timestamp: new Date(channel.lastMessage.createdAt).getTime(),
            }));
            
        const combined = [...formattedDms, ...formattedChannels];
        combined.sort((a, b) => b.timestamp - a.timestamp);
        return combined;

    }, [lastMessagesByConversation, allChannels, user]);


    // --- Effect for fetching activities ---
    useEffect(() => {
        if (user?._id && currentWorkspace?._id) {
            dispatch(fetchActivitiesForUser({
                userId: user._id,
                workspaceId: currentWorkspace._id,
                unreadOnly: showUnread,
            }));
        }
    }, [dispatch, user?._id, currentWorkspace?._id, showUnread]);

    // --- Rendering for Activity Feed ---
    const renderActivities = () => {
        const filteredActivities = activities.filter(activity => {
            if (activeTab === 'All') return true;
            if (activeTab === 'Mentions' && activity.action === 'MENTION') return true;
            if (activeTab === 'Threads' && activity.action === 'THREAD_REPLY') return true;
            if (activeTab === 'Reactions' && activity.action === 'REACTION_ADDED') return true;
            return false;
        });

        if (status === 'loading') return <p className="p-4 text-gray-400">Loading activities...</p>;
        if (status === 'failed') return <p className="p-4 text-red-400">Error: {error}</p>;
        if (!user || !currentWorkspace) return <p className="p-4 text-gray-400">Please log in and select a workspace.</p>;
        if (filteredActivities.length > 0) {
            return filteredActivities.map(activity => <ActivityItem key={activity._id} activity={activity} />);
        }
        return <p className="p-4 text-gray-400">No activities to show for this tab.</p>;
    };

    const Tab = ({ label }) => (
        <p onClick={() => setActiveTab(label)} className={`font-semibold cursor-pointer pb-2 ${activeTab === label ? 'border-b-2 border-white text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </p>
    );

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden bg-[#3f0e40]">
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                {/* Left Panel: Contains all content */}
                <div className="w-full lg:w-[460px] ml-0 lg:ml-[72px] mt-12 h-[calc(100vh-3rem)] bg-[#5a2a5c] text-gray-200 flex flex-col border-l border-r border-gray-700">
                    
                    <div className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                        <h3 className="font-bold text-xl">Activity & Messages</h3>
                        <label className="flex items-center text-xs cursor-pointer">
                            <span className="mr-2 text-gray-300">Unread only</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only peer" checked={showUnread} onChange={() => setShowUnread(!showUnread)} />
                                <div className="block bg-gray-600 w-8 h-4 rounded-full peer-checked:bg-green-500"></div>
                                <div className="dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-full"></div>
                            </div>
                        </label>
                    </div>

                    {/* ✅ FIX: Single scrollable container for all content */}
                    <div className="flex-1 overflow-y-auto">
                        
                        <div className="flex gap-4 p-4 border-b border-gray-700 sticky top-0 bg-[#5a2a5c]">
                            <Tab label="All" /> <Tab label="Mentions" /> <Tab label="Threads" /> <Tab label="Reactions" /> <Tab label="Invitations" />
                        </div>
                        
                        <div>
                            {renderActivities()}
                        </div>
                        
                        <div className="p-4 border-t border-b border-gray-700 sticky top-[65px] bg-[#5a2a5c]">
                            <h3 className="font-bold text-xl">Conversations</h3>
                        </div>

                        {/* ✅ FIX: Messages list rendered here with dark-theme styles */}
                        <div className="p-2">
                            {latestConversationsAndChannels.length > 0 ? (
                                latestConversationsAndChannels.map((item) => {
                                    if (item.type === 'dm') {
                                        const otherUser = item.data.otherUser;
                                        return (
                                            <div key={item.id} className="flex items-center p-2 hover:bg-[#6a3a6c] rounded-md cursor-pointer">
                                                <div className="relative">
                                                    <Avatar user={otherUser} size="md" />
                                                    {isOnline(otherUser._id) && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#5a2a5c] bg-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex-grow ml-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-100">{otherUser?.name || "Unknown User"}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(item.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                    <p className="pt-1 text-sm truncate text-gray-300">{item.data.message}</p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    if (item.type === 'channel') {
                                        return (
                                             <div key={item.id} className="flex items-center p-2 hover:bg-[#6a3a6c] rounded-md cursor-pointer">
                                                <div className="w-10 h-10 flex-shrink-0 bg-gray-700 rounded-md flex items-center justify-center font-bold text-gray-400">
                                                    #
                                                </div>
                                                <div className="flex-grow ml-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-100">{item.data.name}</span>
                                                         <span className="text-xs text-gray-400">
                                                            {new Date(item.data.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                    <p className="pt-1 text-sm truncate text-gray-300">
                                                        <span className="font-medium text-gray-200">{item.data.lastMessage.sender.name}: </span>
                                                        {item.data.lastMessage.content}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null;
                                })
                            ) : (
                                <p className="p-2 text-sm text-gray-400">No conversations yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ✅ FIX: Right panel is now empty with a white background */}
                <div className="flex-1 bg-white mt-12 h-[calc(100vh-3rem)]">
                    {/* This space is intentionally left blank */}
                </div>
            </div>
        </div>
    );
};

export default Activity;
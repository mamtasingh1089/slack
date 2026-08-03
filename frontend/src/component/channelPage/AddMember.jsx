import React, { useState, useMemo } from 'react';
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
//import { setAddMember } from '../../redux/channelSlice';
import { addMembers } from '../../redux/channelSlice';

const UserListItem = ({ user, isAlreadyMember, onSelect, isSelected }) => (
    <div
        className={`flex items-center justify-between p-2 rounded cursor-pointer ${isAlreadyMember ? 'opacity-50' : 'hover:bg-gray-100'}`}
        onClick={() => !isAlreadyMember && onSelect(user)}
    >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-300 flex-shrink-0"></div>
            <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p> 
            </div>
        </div>
        {isAlreadyMember && <span className="text-xs text-gray-500">Already in this channel</span>}
        {isSelected && !isAlreadyMember && <span className="text-xs text-blue-600 font-semibold">Selected</span>}
    </div>
);

const AddMemberModal = ({ channel, onClose }) => {
    const [step, setStep] = useState(1); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    const allUsers = useSelector((state) => state.user.allUsers);
    const dispatch = useDispatch();

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        return allUsers.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !selectedUsers.find(su => su._id === user._id)
        );
    }, [searchTerm, allUsers, selectedUsers]);

    const isUserInChannel = (userId) => {
        return channel.members.includes(userId);
    };

    const handleSelectUser = (user) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
            setSearchTerm(''); 
        }
    };

    const handleRemoveSelectedUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
    };
    
    const handleClose = () => {
        if (selectedUsers.length === 0 && step === 1) {
            setStep(2);
        } else {
            onClose();
        }
    };

    const handleAddMembers = async () => {
        setIsAdding(true);
        const memberIds = selectedUsers.map(u => u._id);
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Authentication error: No token found.");
            setIsAdding(false);
            return;
        }

        try {
            // This payload is correct for your backend
            const payload = { members: memberIds };

            await axios.post(
                `/api/channel/${channel._id}/members`, 
                payload,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert('Members added successfully!');
            
            // Dispatch the correct action to ADD members, not replace them
            dispatch(addMembers(selectedUsers));

            onClose(); 
        } catch (error) {
            console.error("Failed to add members:", error);
            if (error.response && error.response.status === 400) {
                alert("Error: The server rejected the request. The data sent might be invalid.");
            } else {
                alert("Error: Could not add members.");
            }
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                
                {step === 1 && (
                    <>
                        <header className="p-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Add people to #{channel.name}</h2>
                                <p className="text-sm text-gray-500">#{channel.name}</p>
                            </div>
                            <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
                                <RxCross2 size={24} />
                            </button>
                        </header>

                        <main className="p-4">
                            <div className="bg-gray-100 text-sm text-gray-700 p-2 rounded">
                                You can only add other people from <strong>Koalaliving</strong> to this channel.
                            </div>

                            {selectedUsers.length > 0 && (
                                <div className="mt-3 p-2 border rounded-md flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div key={user._id} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-sm">
                                            <span>{user.name}</span>
                                            <button onClick={() => handleRemoveSelectedUser(user._id)} className="font-bold hover:text-red-600">
                                                <RxCross2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-3 relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="e.g. Nathalie, or james@a1company.com"
                                    className="w-full p-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                />

                                {searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border shadow-lg rounded-md z-10 max-h-60 overflow-y-auto">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <UserListItem
                                                    key={user._id}
                                                    user={user}
                                                    isAlreadyMember={isUserInChannel(user._id)}
                                                    onSelect={handleSelectUser}
                                                    isSelected={false}
                                                />
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-500">No results found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </main>

                        <footer className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={handleAddMembers}
                                disabled={selectedUsers.length === 0 || isAdding}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isAdding ? 'Adding...' : 'Add'}
                            </button>
                        </footer>
                    </>
                )}

                {step === 2 && (
                    <div className="p-6 text-center">
                        <h3 className="text-lg font-bold mb-2">Skip without inviting?</h3>
                        <p className="text-gray-600 mb-6">
                            You can add members later, but channels are best with at least a few teammates together.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded font-semibold">
                                Back
                            </button>
                            <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white font-semibold rounded">
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMemberModal;
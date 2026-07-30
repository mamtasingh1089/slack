import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import axios from 'axios';
import { format, formatDistanceToNow } from "date-fns";
import { setSingleUser } from '../redux/userSlice';
import dp from "../assets/dp.webp"; 
import {serverURL} from '../main'


import { CiClock2, CiHeadphones } from "react-icons/ci";
import { IoMailOutline, IoAddSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { LuMessageCircle } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { AiOutlineAudio } from "react-icons/ai";



const ProfileSidebar = ({ user, onClose }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);

    // State for modals within this component
    const [openEdit, setOpenEdit] = useState(false);
    const [editContact, setEditContact] = useState(false);
    const [editAbout, setEditAbout] = useState(false);
    
    // State for form data and saving
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    const isCurrentUserProfile = currentUser?._id === user?._id;
    const localTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Effect to populate form when a modal opens
    useEffect(() => {
        if (user) {
            const dateForInput = user.date ? format(new Date(user.date), 'yyyy-MM-dd') : "";
            setForm({
                name: user.name || "",
                displayName: user.displayName || user.name || "",
                title: user.role || "",
                email: user.email || "",
                number: user.number || "",
                date: dateForInput,
                namePronunciation: user.namePronunciation || "",
                timezone: user.timezone || ""
            });
        }
    }, [user, openEdit, editContact, editAbout]);

    const getImageUrl = (path) => {
        if (!path) return dp;
        if (path.startsWith('http') || path.startsWith('blob:')) return path;
        return `${serverURL}/${path.replace(/\\/g, '/')}`;
    };

    const handleFormChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
    };
    const handleCancel = () => {
        setOpenEdit(false);
        setEditContact(false);
        setEditAbout(false);
        setUploadFile(null);
    };

    const handleSaveChanges = async () => {
        if (!user?._id) return;
        setSaving(true);
        const token = localStorage.getItem("token");
        try {
            const fd = new FormData();
            // Use 'role' for title as expected by backend
            Object.keys(form).forEach(key => fd.append(key === 'title' ? 'role' : key, form[key])); 
            if (uploadFile) fd.append("avatar", uploadFile);

            const res = await axios.put(`/api/user/edit/${user._id}`, fd, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });

            if (res?.data) {
                dispatch(setSingleUser(res.data));
            }
            handleCancel();
        } catch (err) {
            console.error("Failed to save changes", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <aside className="fixed top-0 right-0 bottom-0 w-[420px] border-l h-full flex flex-col bg-white z-20" aria-label="Profile pane">
                <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Profile</h3>
                    <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="w-full flex justify-center mt-6 mb-4">
                        <img src={getImageUrl(user.profileImage)} alt="avatar" className="w-48 h-48 rounded-lg object-cover" />
                    </div>
                    <div className="flex items-center">
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        {isCurrentUserProfile && <button className="ml-4 text-sm font-semibold text-blue-600" onClick={() => setOpenEdit(true)}>Edit</button>}
                    </div>
                     <p className="text-gray-600 mt-1">{user.role}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2"><CiClock2 className="font-bold text-lg" /><span>{localTime} local time</span></div>
                    
                    <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold">Contact Information</h4>
                            {isCurrentUserProfile && <button className="text-sm font-semibold text-blue-600" onClick={() => setEditContact(true)}>Edit</button>}
                        </div>
                        <div className="mt-3 flex items-start gap-3"><IoMailOutline className="text-xl text-gray-500 mt-1"/><div><p className="text-sm text-gray-600">Email address</p><a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a></div></div>
                    </div>

                    {isCurrentUserProfile && (
                        <div className="mt-6 border-t pt-4">
                             <div className="flex items-center justify-between"><h4 className="font-bold">About Me</h4><button className="text-sm font-semibold text-blue-600" onClick={() => setEditAbout(true)}>Edit</button></div>
                            {user.date ? (<div className="mt-2"><p className="text-sm text-gray-600">Start Date</p><p>{format(new Date(user.date), 'MMM d, yyyy')} ({formatDistanceToNow(new Date(user.date))} ago)</p></div>) : (<button className="text-sm text-blue-600 mt-2" onClick={() => setEditAbout(true)}>+ Add Start Date</button>)}
                        </div>
                    )}
                </div>
            </aside>
            
            {/* Main Edit Modal */}
            {openEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"><div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Edit your profile</h2><button onClick={handleCancel}><RxCross2/></button></div><div className="p-6 overflow-y-auto flex gap-6"><div className="flex-1"><div className="mb-4"><label className="font-medium">Full name</label><input type="text" value={form.name} onChange={e => handleFormChange('name', e.target.value)} className="w-full border rounded p-2 mt-1" /></div><div className="mb-4"><label className="font-medium">Display name</label><input type="text" value={form.displayName} onChange={e => handleFormChange('displayName', e.target.value)} className="w-full border rounded p-2 mt-1" /></div><div className="mb-4"><label className="font-medium">Title</label><input type="text" value={form.title} onChange={e => handleFormChange('title', e.target.value)} className="w-full border rounded p-2 mt-1" /></div></div><div className="w-56 text-center"><label className="font-medium">Profile photo</label><img src={uploadFile ? URL.createObjectURL(uploadFile) : getImageUrl(user.profileImage)} alt="avatar" className="w-48 h-48 rounded-lg object-cover mx-auto mt-2" /><label className="block mt-2"><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /><span className="text-sm text-blue-600 font-semibold cursor-pointer">Upload Photo</span></label></div></div><div className="p-4 border-t flex justify-end gap-2"><button onClick={handleCancel} className="px-4 py-2 border rounded">Cancel</button><button onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></div></div></div>
            )}
        </>
    );
};

export default ProfileSidebar;
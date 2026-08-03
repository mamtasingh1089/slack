<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
import { setSingleUser } from "../../redux/userSlice"; // Adjust path
import { serverURL } from "../../main"; // Adjust path
import dp from "../../assets/dp.webp"; // Adjust path

// Icons
import { RxCross2 } from "react-icons/rx";
import { CiClock2, CiHeadphones } from "react-icons/ci";
import { IoMailOutline, IoAddSharp } from "react-icons/io5";
import { LuMessageCircle } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { AiOutlineAudio } from "react-icons/ai";

const FullProfile = () => {
  const dispatch = useDispatch();
  
  // Redux
  const singleUser = useSelector((state) => state.user.singleUser);
  const currentUser = useSelector((state) => state.user.user);
  const { onlineUsers = [] } = useSelector((s) => s.socket) || {};

  // Local UI State
  const [openEdit, setOpenEdit] = useState(false); // Main Profile Edit
  const [editContact, setEditContact] = useState(false); // Contact Info Edit
  const [editAbout, setEditAbout] = useState(false); // About Me Edit
  
  // Form State
  const [form, setForm] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- Helpers ---
  const isOnline = singleUser ? (onlineUsers || []).some((id) => String(id) === String(singleUser._id)) : false;
  const localTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isMe = currentUser?._id === singleUser?._id;

  const getImageUrl = (path) => {
    if (!path) return dp;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${serverURL}/${path.replace(/\\/g, '/')}`;
  };

  const closeProfile = () => {
    dispatch(setSingleUser(null));
  };

  // --- Effects ---
  useEffect(() => {
    if ((openEdit || editContact || editAbout) && singleUser) {
        const dateForInput = singleUser.date ? format(new Date(singleUser.date), 'yyyy-MM-dd') : "";
        setForm({
            name: singleUser.name || "",
            displayName: singleUser.displayName || singleUser.name || "",
            title: singleUser.role || "",
            email: singleUser.email || "",
            number: singleUser.number || "",
            location: singleUser.location || "",
            namePronunciation: singleUser.namePronunciation || "",
            timezone: singleUser.timezone || "",
            date: dateForInput,
        });
        setUploadFile(null);
    }
  }, [openEdit, editContact, editAbout, singleUser]);

  // --- Handlers ---
  const handleFormChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleFileChange = (e) => e.target.files?.[0] && setUploadFile(e.target.files[0]);

  const handleSaveChanges = async () => {
    if (!singleUser?._id) return;
    setSaving(true);
    try {
        const fd = new FormData();
        Object.keys(form).forEach(key => fd.append(key, form[key]));
        if (form.title) fd.append('role', form.title); // Map title to role
        if (uploadFile) fd.append("avatar", uploadFile);

        const token = localStorage.getItem("token");
        const res = await axios.put(`${serverURL}/api/user/edit/${singleUser._id}`, fd, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        if (res?.data) dispatch(setSingleUser(res.data));
        
        // Close all modals
        setOpenEdit(false); setEditContact(false); setEditAbout(false);
    } catch (err) {
        console.error("Save failed", err);
        alert("Failed to save.");
    } finally {
        setSaving(false);
    }
  };

  if (!singleUser) return null;

  return (
    <>
      {/* --- Sidebar Container --- */}
      <aside className="w-[550px]  md:w-[400px] bg-white border-l h-full flex flex-col shadow-xl z-20  ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h3 className="text-xl font-bold">Profile</h3>
          <button onClick={closeProfile} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><RxCross2 size={24}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Avatar & Name */}
          <div className="flex flex-col mb-6">
             <div className="relative w-64 h-64 mx-auto mb-4">
                <img src={getImageUrl(singleUser.profileImage)} alt="profile" className="w-full h-full object-cover rounded-xl shadow-sm" />
             </div>
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">{singleUser.name}</h2>
                   <p className="text-gray-600">{singleUser.role}</p>
                </div>
                {isMe && <button onClick={() => setOpenEdit(true)} className="text-blue-600 font-semibold text-sm hover:underline">Edit</button>}
             </div>
             
             {/* Status */}
             <div className="mt-4 space-y-2">
                 <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'border border-gray-400'}`}></span>
                    <span className="text-gray-700">{isOnline ? 'Active' : 'Away'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CiClock2 className="text-lg"/>
                    <span>{localTime} local time</span>
                 </div>
             </div>

             {/* Action Buttons */}
             <div className="mt-6 flex gap-3">
                {isMe ? (
                    <button className="flex-1 border border-gray-300 rounded py-1 px-3 text-sm font-semibold hover:bg-gray-50">Set a status</button>
                ) : (
                    <>
                      <button className="flex-1 border border-gray-300 rounded py-2 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-gray-50">
                          <LuMessageCircle /> Message
                      </button>
                      <button className="border border-gray-300 rounded px-3 py-2 hover:bg-gray-50"><CiHeadphones /></button>
                      <button className="border border-gray-300 rounded px-3 py-2 hover:bg-gray-50"><IoMdMore /></button>
                    </>
                )}
             </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Contact Info */}
          <div className="mb-6">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Contact information</h4>
                {isMe && <button onClick={() => setEditContact(true)} className="text-blue-600 text-sm hover:underline">Edit</button>}
             </div>
             
             <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600"><IoMailOutline /></div>
                   <div>
                      <p className="text-sm text-gray-500">Email address</p>
                      <a href={`mailto:${singleUser.email}`} className="text-blue-600 hover:underline">{singleUser.email}</a>
                   </div>
                </div>
                {singleUser.number && (
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">#</div>
                       <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <a href={`tel:${singleUser.number}`} className="text-blue-600 hover:underline">{singleUser.number}</a>
                       </div>
                    </div>
                )}
             </div>
          </div>

          {/* About Me */}
          {isMe || singleUser.date ? (
              <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900">About me</h4>
                    {isMe && <button onClick={() => setEditAbout(true)} className="text-blue-600 text-sm hover:underline">Edit</button>}
                  </div>
                  {singleUser.date && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                          <p className="text-gray-500 mb-1">Start Date</p>
                          <p className="font-medium">{format(new Date(singleUser.date), 'MMM d, yyyy')} ({formatDistanceToNow(new Date(singleUser.date))} ago)</p>
                      </div>
                  )}
              </div>
          ) : null}

        </div>
      </aside>

      {/* --- MODALS (Edit Profile, Contact, About) --- */}
      {/* Shared Modal Wrapper Logic could go here, keeping it inline for simplicity */}
      
      {/* 1. Edit Main Profile */}
      {openEdit && (
        <ModalWrapper title="Edit your profile" onClose={() => setOpenEdit(false)}>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <Input label="Full name" value={form.name} onChange={v => handleFormChange("name", v)} />
                    <Input label="Display name" value={form.displayName} onChange={v => handleFormChange("displayName", v)} />
                    <Input label="Title" value={form.title} onChange={v => handleFormChange("title", v)} />
                </div>
                <div className="w-40 flex flex-col items-center gap-3">
                    <img src={uploadFile ? URL.createObjectURL(uploadFile) : getImageUrl(singleUser.profileImage)} className="w-32 h-32 rounded object-cover border" alt="preview"/>
                    <label className="border px-3 py-1 rounded text-sm font-semibold cursor-pointer hover:bg-gray-50">
                        Upload Photo <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </label>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <ButtonSecondary onClick={() => setOpenEdit(false)}>Cancel</ButtonSecondary>
                <ButtonPrimary onClick={handleSaveChanges} disabled={saving}>Save Changes</ButtonPrimary>
            </div>
        </ModalWrapper>
      )}

      {/* 2. Edit Contact */}
      {editContact && (
          <ModalWrapper title="Edit Contact Info" onClose={() => setEditContact(false)}>
              <div className="space-y-4">
                  <Input label="Email" value={form.email} onChange={v => handleFormChange("email", v)} />
                  <Input label="Phone" value={form.number} onChange={v => handleFormChange("number", v)} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <ButtonSecondary onClick={() => setEditContact(false)}>Cancel</ButtonSecondary>
                <ButtonPrimary onClick={handleSaveChanges} disabled={saving}>Save Changes</ButtonPrimary>
            </div>
          </ModalWrapper>
      )}

      {/* 3. Edit About */}
      {editAbout && (
          <ModalWrapper title="Edit About Me" onClose={() => setEditAbout(false)}>
               <div className="space-y-4">
                  <label className="block text-sm font-bold mb-1">Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={e => handleFormChange("date", e.target.value)} />
               </div>
               <div className="flex justify-end gap-3 mt-6">
                <ButtonSecondary onClick={() => setEditAbout(false)}>Cancel</ButtonSecondary>
                <ButtonPrimary onClick={handleSaveChanges} disabled={saving}>Save Changes</ButtonPrimary>
            </div>
          </ModalWrapper>
      )}
    </>
  );
};

// --- Mini Components for Cleaner JSX ---
const ModalWrapper = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{title}</h3>
                <button onClick={onClose}><RxCross2 size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

const Input = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-bold mb-1 text-gray-700">{label}</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
);

const ButtonPrimary = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="px-4 py-2 bg-[#007a5a] text-white font-bold rounded hover:bg-[#148567] disabled:opacity-50">{children}</button>
);
const ButtonSecondary = ({ children, onClick }) => (
    <button onClick={onClick} className="px-4 py-2 border border-gray-300 font-bold rounded hover:bg-gray-50">{children}</button>
);

=======
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
import { setSingleUser } from "../../redux/userSlice"; // Adjust path
import { serverURL } from "../../main"; // Adjust path
import dp from "../../assets/dp.webp"; // Adjust path

// Icons
import { RxCross2 } from "react-icons/rx";
import { CiClock2, CiHeadphones } from "react-icons/ci";
import { IoMailOutline, IoAddSharp } from "react-icons/io5";
import { LuMessageCircle } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { AiOutlineAudio } from "react-icons/ai";

const FullProfile = () => {
  const dispatch = useDispatch();
  
  // Redux
  const singleUser = useSelector((state) => state.user.singleUser);
  const currentUser = useSelector((state) => state.user.user);
  const { onlineUsers = [] } = useSelector((s) => s.socket) || {};

  // Local UI State
  const [openEdit, setOpenEdit] = useState(false); // Main Profile Edit
  const [editContact, setEditContact] = useState(false); // Contact Info Edit
  const [editAbout, setEditAbout] = useState(false); // About Me Edit
  
  // Form State
  const [form, setForm] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- Helpers ---
  const isOnline = singleUser ? (onlineUsers || []).some((id) => String(id) === String(singleUser._id)) : false;
  const localTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isMe = currentUser?._id === singleUser?._id;

  const getImageUrl = (path) => {
    if (!path) return dp;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${serverURL}/${path.replace(/\\/g, '/')}`;
  };

  const closeProfile = () => {
    dispatch(setSingleUser(null));
  };

  // --- Effects ---
  useEffect(() => {
    if ((openEdit || editContact || editAbout) && singleUser) {
        const dateForInput = singleUser.date ? format(new Date(singleUser.date), 'yyyy-MM-dd') : "";
        setForm({
            name: singleUser.name || "",
            displayName: singleUser.displayName || singleUser.name || "",
            title: singleUser.role || "",
            email: singleUser.email || "",
            number: singleUser.number || "",
            location: singleUser.location || "",
            namePronunciation: singleUser.namePronunciation || "",
            timezone: singleUser.timezone || "",
            date: dateForInput,
        });
        setUploadFile(null);
    }
  }, [openEdit, editContact, editAbout, singleUser]);

  // --- Handlers ---
  const handleFormChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleFileChange = (e) => e.target.files?.[0] && setUploadFile(e.target.files[0]);

  const handleSaveChanges = async () => {
    if (!singleUser?._id) return;
    setSaving(true);
    try {
        const fd = new FormData();
        Object.keys(form).forEach(key => fd.append(key, form[key]));
        if (form.title) fd.append('role', form.title); // Map title to role
        if (uploadFile) fd.append("avatar", uploadFile);

        const token = localStorage.getItem("token");
        const res = await axios.put(`/api/user/edit/${singleUser._id}`, fd, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        if (res?.data) dispatch(setSingleUser(res.data));
        
        // Close all modals
        setOpenEdit(false); setEditContact(false); setEditAbout(false);
    } catch (err) {
        console.error("Save failed", err);
        alert("Failed to save.");
    } finally {
        setSaving(false);
    }
  };

  if (!singleUser) return null;

  return (
    <>
      {/* --- Sidebar Container --- */}
      <aside className="w-[550px]  md:w-[400px] bg-white border-l h-full flex flex-col shadow-xl z-20  ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h3 className="text-xl font-bold">Profile</h3>
          <button onClick={closeProfile} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><RxCross2 size={24}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Avatar & Name */}
          <div className="flex flex-col mb-6">
             <div className="relative w-64 h-64 mx-auto mb-4">
                <img src={getImageUrl(singleUser.profileImage)} alt="profile" className="w-full h-full object-cover rounded-xl shadow-sm" />
             </div>
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">{singleUser.name}</h2>
                   <p className="text-gray-600">{singleUser.role}</p>
                </div>
                {isMe && <button onClick={() => setOpenEdit(true)} className="text-blue-600 font-semibold text-sm hover:underline">Edit</button>}
             </div>
             
             {/* Status */}
             <div className="mt-4 space-y-2">
                 <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'border border-gray-400'}`}></span>
                    <span className="text-gray-700">{isOnline ? 'Active' : 'Away'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CiClock2 className="text-lg"/>
                    <span>{localTime} local time</span>
                 </div>
             </div>

             {/* Action Buttons */}
             <div className="mt-6 flex gap-3">
                {isMe ? (
                    <button className="flex-1 border border-gray-300 rounded py-1 px-3 text-sm font-semibold hover:bg-gray-50">Set a status</button>
                ) : (
                    <>
                      <button className="flex-1 border border-gray-300 rounded py-2 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-gray-50">
                          <LuMessageCircle /> Message
                      </button>
                      <button className="border border-gray-300 rounded px-3 py-2 hover:bg-gray-50"><CiHeadphones /></button>
                      <button className="border border-gray-300 rounded px-3 py-2 hover:bg-gray-50"><IoMdMore /></button>
                    </>
                )}
             </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Contact Info */}
          <div className="mb-6">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Contact information</h4>
                {isMe && <button onClick={() => setEditContact(true)} className="text-blue-600 text-sm hover:underline">Edit</button>}
             </div>
             
             <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600"><IoMailOutline /></div>
                   <div>
                      <p className="text-sm text-gray-500">Email address</p>
                      <a href={`mailto:${singleUser.email}`} className="text-blue-600 hover:underline">{singleUser.email}</a>
                   </div>
                </div>
                {singleUser.number && (
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">#</div>
                       <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <a href={`tel:${singleUser.number}`} className="text-blue-600 hover:underline">{singleUser.number}</a>
                       </div>
                    </div>
                )}
             </div>
          </div>

          {/* About Me */}
          {isMe || singleUser.date ? (
              <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900">About me</h4>
                    {isMe && <button onClick={() => setEditAbout(true)} className="text-blue-600 text-sm hover:underline">Edit</button>}
                  </div>
                  {singleUser.date && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                          <p className="text-gray-500 mb-1">Start Date</p>
                          <p className="font-medium">{format(new Date(singleUser.date), 'MMM d, yyyy')} ({formatDistanceToNow(new Date(singleUser.date))} ago)</p>
                      </div>
                  )}
              </div>
          ) : null}

        </div>
      </aside>

      {/* --- MODALS (Edit Profile, Contact, About) --- */}
      {/* Shared Modal Wrapper Logic could go here, keeping it inline for simplicity */}
      
      {/* 1. Edit Main Profile */}
      {openEdit && (
        <ModalWrapper title="Edit your profile" onClose={() => setOpenEdit(false)}>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <Input label="Full name" value={form.name} onChange={v => handleFormChange("name", v)} />
                    <Input label="Display name" value={form.displayName} onChange={v => handleFormChange("displayName", v)} />
                    <Input label="Title" value={form.title} onChange={v => handleFormChange("title", v)} />
                </div>
                <div className="w-40 flex flex-col items-center gap-3">
                    <img src={uploadFile ? URL.createObjectURL(uploadFile) : getImageUrl(singleUser.profileImage)} className="w-32 h-32 rounded object-cover border" alt="preview"/>
                    <label className="border px-3 py-1 rounded text-sm font-semibold cursor-pointer hover:bg-gray-50">
                        Upload Photo <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </label>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <ButtonSecondary onClick={() => setOpenEdit(false)}>Cancel</ButtonSecondary>
                <ButtonPrimary onClick={handleSaveChanges} disabled={saving}>Save Changes</ButtonPrimary>
            </div>
        </ModalWrapper>
      )}

      {/* 2. Edit Contact */}
      {editContact && (
          <ModalWrapper title="Edit Contact Info" onClose={() => setEditContact(false)}>
              <div className="space-y-4">
                  <Input label="Email" value={form.email} onChange={v => handleFormChange("email", v)} />
                  <Input label="Phone" value={form.number} onChange={v => handleFormChange("number", v)} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <ButtonSecondary onClick={() => setEditContact(false)}>Cancel</ButtonSecondary>
                <ButtonPrimary onClick={handleSaveChanges} disabled={saving}>Save Changes</ButtonPrimary>
            </div>
          </ModalWrapper>
      )}

      {/* 3. Edit About */}
      {editAbout && (
          <ModalWrapper title="Edit About Me" onClose={() => setEditAbout(false)}>
               <div className="space-y-4">
                  <label className="block text-sm font-bold mb-1">Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={e => handleFormChange("date", e.target.value)} />
               </div>
               <div className="flex justify-end gap-3 mt-6">
                <ButtonSecondary onClick={() => setEditAbout(false)}>Cancel</ButtonSecondary>
                <ButtonPrimary onClick={handleSaveChanges} disabled={saving}>Save Changes</ButtonPrimary>
            </div>
          </ModalWrapper>
      )}
    </>
  );
};

// --- Mini Components for Cleaner JSX ---
const ModalWrapper = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{title}</h3>
                <button onClick={onClose}><RxCross2 size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

const Input = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-bold mb-1 text-gray-700">{label}</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
);

const ButtonPrimary = ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="px-4 py-2 bg-[#007a5a] text-white font-bold rounded hover:bg-[#148567] disabled:opacity-50">{children}</button>
);
const ButtonSecondary = ({ children, onClick }) => (
    <button onClick={onClick} className="px-4 py-2 border border-gray-300 font-bold rounded hover:bg-gray-50">{children}</button>
);

>>>>>>> anshul
export default FullProfile;
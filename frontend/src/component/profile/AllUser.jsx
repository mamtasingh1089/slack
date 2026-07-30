import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { setSingleUser } from "../../redux/userSlice"; 
import { serverURL } from "../../main"; 
import dp from "../../assets/dp.webp"; 
import Invite from "../koalaliving/Invite"; 

const AllUser = () => {
  const dispatch = useDispatch();
  
  // Redux Data
  const { onlineUsers = [] } = useSelector((s) => s.socket) || {};
  const allUsers = useSelector((state) => state.user.allUsers) || [];
  const singleUser = useSelector((state) => state.user.singleUser);

  // Local State
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("most");
  const [titleFilter, setTitleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  
  // State for Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Helper for Images
  const getImageUrl = (path) => {
    if (!path) return dp;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${serverURL}/${path.replace(/\\/g, '/')}`;
  };

  // Filter Logic
  const filtered = useMemo(() => {
    const query = (q || "").trim().toLowerCase();
    return allUsers.filter((u) => {
      if (!u) return false;
      const matchesQuery = !query || (u.name && u.name.toLowerCase().includes(query)) || (u.role && u.role.toLowerCase().includes(query));
      const matchesTitle = !titleFilter || (u.role && u.role.toLowerCase().includes(titleFilter));
      const matchesLocation = !locationFilter || (u.location && u.location.toLowerCase().includes(locationFilter));
      return matchesQuery && matchesTitle && matchesLocation;
    });
  }, [allUsers, q, titleFilter, locationFilter]);

  const clearFilters = () => {
    setTitleFilter("");
    setLocationFilter("");
    setSort("most");
  };

  const openUser = (u) => {
    dispatch(setSingleUser(u));
  };

  // Dynamic Grid Columns
  const gridClasses = singleUser 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";

  return (
    <div className="flex flex-col h-full bg-[#f8f8f8]">
      
      {/* --- Fixed Header Section --- */}
      <div className="flex-shrink-0 px-6 pt-6 pb-2 bg-[#f8f8f8] z-10">
        
        {/* Search and Invite Row */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CiSearch className="text-gray-500 text-xl group-focus-within:text-blue-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search for people" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          
          <button 
            className="px-4 py-2 bg-white border border-gray-300 rounded font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm"
            onClick={() => setShowInviteModal(true)}
          >
            Invite people
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 outline-none hover:bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" 
            value={titleFilter} 
            onChange={(e) => setTitleFilter(e.target.value)}
          >
            <option value="">Title</option>
            <option value="software">Software Developer</option>
            <option value="ceo">CEO</option>
            <option value="cto">CTO</option>
            <option value="devops">DevOps Engineer</option>
          </select>

          <select 
            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 outline-none hover:bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">Location</option>
            <option value="remote">Remote</option>
            <option value="india">India</option>
            <option value="us">United States</option>
          </select>

          <button type="button" className="flex items-center gap-1 text-gray-600 text-sm font-medium hover:text-blue-600 ml-2 transition-colors" onClick={() => setOpenFilter(true)}>
            <IoFilter /> Filters
          </button>

          <div className="ml-auto">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-gray-600 text-sm font-medium outline-none cursor-pointer hover:text-gray-900 transition-colors">
              <option value="most">Most recommended</option>
              <option value="recent">Recently active</option>
              <option value="a-z">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Scrollable Grid Section --- */}
      {/* 
          1. scroll-smooth: Enables smooth scrolling behavior
          2. Custom scrollbar styles via arbitrary Tailwind variants 
      */}
      <div 
        className="
          flex-1 
          overflow-y-auto 
          px-6 py-4 
          scroll-smooth 
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
          transition-colors
        "
      >
        <div className={gridClasses}>
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              <p className="text-lg font-semibold">No people found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((u) => {
              const key = u._id;
              const isOnline = (onlineUsers || []).some((id) => String(id) === String(u._id));
              const isActive = singleUser && singleUser._id === u._id;

              return (
                <div 
                  key={key} 
                  onClick={() => openUser(u)}
                  className={`
                    group relative bg-white border border-gray-200 rounded-lg h-80
                    flex flex-col items-center text-center cursor-pointer 
                    hover:shadow-md hover:border-gray-300 
                    ${isActive ? "ring-2 ring-blue-500 border-transparent z-10 shadow-md" : ""}
                  `}
                >
                  <div className="relative mb-3 ">
                    <img 
                      src={getImageUrl(u.profileImage)} 
                      alt={u.name} 
                      className="w-48 h-52 object-cover rounded-md shadow-sm" 
                    />
                  </div>
                  
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-1 mb-1">
                       <h3 className="font-bold text-gray-900 truncate max-w-[80%] text-[15px]">{u.name}</h3>
                       {/* Online Status Dot */}
                       {isOnline ? (
                         <span className="w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white shadow-sm" title="Active"></span>
                       ) : (
                         <span className="w-2.5 h-2.5 border-2 border-gray-300 rounded-full" title="Away"></span>
                       )}
                    </div>
                    
                    <p className="text-gray-500 text-sm truncate">{u.role || "Member"}</p>
                    
                    {u.status?.text && (
                         <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-600 bg-gray-100 py-1 px-2 rounded-md truncate max-w-full">
                             <span>{u.status.emoji}</span>
                             <span className="truncate">{u.status.text}</span>
                         </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Spacer for bottom scrolling */}
        <div className="h-10"></div>
      </div>

      {/* --- Invite Modal --- */}
      {showInviteModal && (
        <Invite 
            workspaceName="Koalaliving" 
            onClose={() => setShowInviteModal(false)} 
        />
      )}

      {/* --- Filter Modal (Mobile/Detailed) --- */}
      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl p-6 relative animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filter People</h2>
                <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors" onClick={() => setOpenFilter(false)}>
                    <RxCross2 size={20} />
                </button>
            </div>
            
            <div className="space-y-5">
              <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Title</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)}>
                      <option value="">Any title</option>
                      <option value="software">Software Developer</option>
                  </select>
              </div>
              
              <div className="flex gap-3 mt-8">
                  <button onClick={clearFilters} className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Clear</button>
                  <button onClick={() => setOpenFilter(false)} className="flex-1 px-4 py-2 bg-green-700 text-white rounded-md font-semibold hover:bg-green-800 transition-colors shadow-sm">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUser;
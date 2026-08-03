import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../main";
import { format } from "date-fns"; 
import { BsSearch, BsFileEarmarkText, BsFileEarmarkCode, BsFileEarmarkPdf, BsThreeDots } from "react-icons/bs";
import { AiOutlineFileUnknown, AiOutlineShareAlt } from "react-icons/ai";
import { FaFileWord, FaFileExcel } from "react-icons/fa";
import { MdOutlineOpenInNew } from "react-icons/md";
import { CiStar } from "react-icons/ci";

const FilterMsgPage = ({ receiverId }) => {
  const [media, setMedia] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  // 1. Fetch Data
  useEffect(() => {
    if (receiverId) {
      setLoading(true);
      axios.get(`${serverURL}/api/files/user/${receiverId}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setMedia(res.data.images || []);
        setDocs(res.data.docs || []);
      })
      .catch(err => console.error("Error fetching files:", err))
      .finally(() => setLoading(false));
    }
  }, [receiverId, token]);

  // 2. Helper for File Icons
  const getDocIcon = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    
    let Icon = AiOutlineFileUnknown;
    let colorClass = "bg-gray-100 text-gray-500"; 

    if (['pdf'].includes(ext)) {
      Icon = BsFileEarmarkPdf;
      colorClass = "bg-red-100 text-red-600";
    } else if (['env', 'json', 'js', 'jsx', 'ts', 'html', 'css'].includes(ext)) {
      Icon = BsFileEarmarkCode;
      colorClass = "bg-blue-100 text-blue-600"; 
    } else if (['doc', 'docx'].includes(ext)) {
      Icon = FaFileWord;
      colorClass = "bg-blue-100 text-blue-700";
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      Icon = FaFileExcel;
      colorClass = "bg-green-100 text-green-700";
    } else if (['txt'].includes(ext)) {
      Icon = BsFileEarmarkText;
      colorClass = "bg-gray-200 text-gray-700";
    }

    return (
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="text-xl" />
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "d MMM");
    } catch (e) {
      return "";
    }
  };

  const filteredMedia = media.filter(item => 
    item.file.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDocs = docs.filter(item => 
    item.file.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading files...</div>
      </div>
    );
  }

  return (
    // FIX 1: Changed w-[50%] to w-full so it fits the container
    <div className="w-full h-full bg-white flex flex-col">
      
      {/* Header / Search Bar Container */}
      {/* FIX 2: Added flex-none so header doesn't shrink, cleaned up styling */}
      <div className="flex-none px-4 py-3 border-b border-gray-200 bg-white">
        <div className="relative">
          {/* FIX 3: Centered icon vertically using top-1/2 -translate-y-1/2 */}
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-md text-sm transition-all outline-none placeholder-gray-500"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Photos and Videos Section */}
          {filteredMedia.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-sm font-bold text-gray-700">Photos and videos</h3>
                <span className="text-sm text-blue-600 cursor-pointer hover:underline">See all</span>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {filteredMedia.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 w-48 aspect-video relative group rounded-lg overflow-hidden border bg-gray-100 cursor-pointer">
                    {item.type === 'video' ? (
                      <video src={item.file.url} className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={item.file.url} 
                        alt={item.file.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = "https://via.placeholder.com/300?text=No+Image"}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Documents</h3>
              
              <div className="border rounded-lg divide-y divide-gray-100">
                {filteredDocs.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center p-3 hover:bg-gray-50 transition-colors relative"
                  >
                    {/* Icon */}
                    <div className="mr-4">
                      {getDocIcon(item.file.name || "file")}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <a href={item.file.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-900 truncate block hover:text-blue-600 hover:underline">
                        {item.file.name || "Untitled Document"}
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Shared by <span className="font-medium">{item.message.sender?.name}</span> on {formatDate(item.message.createdAt)}
                      </p>
                    </div>

                    {/* Hover Actions */}
                    <div className="hidden group-hover:flex items-center gap-1 bg-white shadow-sm border rounded-md absolute right-4 px-2 py-1">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Share"><AiOutlineShareAlt /></button>
                        <a href={item.file.url} target="_blank" rel="noreferrer" className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Open"><MdOutlineOpenInNew /></a>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Star"><CiStar /></button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="More"><BsThreeDots /></button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredMedia.length === 0 && filteredDocs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <div className="bg-gray-100 p-4 rounded-full mb-4">
                 <BsSearch className="text-2xl" />
               </div>
               <p>No files found {searchQuery && `matching "${searchQuery}"`}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FilterMsgPage;
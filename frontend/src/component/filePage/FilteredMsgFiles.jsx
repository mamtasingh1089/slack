import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverURL } from "../../main";
import { format } from "date-fns"; // You might need to install date-fns or use native Date
import { BsFileEarmarkText, BsFileEarmarkCode, BsFileEarmarkPdf } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import useClickOutside from "../../hook/useClickOutside"; // Assuming you have this hook

export default function FilteredMsgFiles({ conversationId, onClose, parentRef ,receiverId}) {
  const [media, setMedia] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const modalRef = useRef(null);

   const token = localStorage.getItem("token");

  useEffect(() => {
    if (receiverId) {
      setLoading(true);
      // CALL THE NEW ROUTE
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
  
  // Close when clicking outside
  useClickOutside(modalRef, onClose);

  useEffect(() => {
    setLoading(true);
    if (conversationId) {
      axios.get(`${serverURL}/api/files/conversations/${conversationId}/files`)
        .then(res => {
          setMedia(res.data.images || []); // API returns 'images' key for media
          setDocs(res.data.docs || []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [conversationId]);

  // Helper to determine icon based on file extension/type
  const getDocIcon = (filename) => {
    if (filename.endsWith('.pdf')) return <BsFileEarmarkPdf className="text-red-500 text-xl" />;
    if (filename.endsWith('.env') || filename.endsWith('.json') || filename.endsWith('.js')) return <BsFileEarmarkCode className="text-green-600 text-xl" />;
    return <BsFileEarmarkText className="text-blue-500 text-xl" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d MMM");
  };

   if (loading) return <div className="absolute z-50 top-[45px] left-[80px] w-[350px] bg-white p-4 shadow-xl border rounded-lg">Loading...</div>;// Or a small spinner

  return (
    <div className="absolute z-50 top-[45px] left-[80px] w-[350px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="font-bold text-gray-700">Files</h3>
        <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded-full">
          <RxCross2 />
        </button>
      </div>

      <div className="overflow-y-auto p-4 custom-scrollbar">
        
        {/* Photos and Videos Section */}
        {media.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Photos and videos</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {media.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-24 h-20 relative group cursor-pointer rounded-md overflow-hidden border">
                  {item.type === 'video' ? (
                    <video src={item.file.url} className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={item.file.url} 
                      alt="media" 
                      className="w-full h-full object-cover" 
                      onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {docs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Documents</h4>
            <div className="flex flex-col gap-3">
              {docs.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.file.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  {/* Icon Box */}
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getDocIcon(item.file.name || "")}
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                      {item.file.name || "Untitled"}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                       <span>Shared by {item.message.sender?.name?.split(" ")[0] || "User"}</span>
                       <span>•</span>
                       <span>{formatDate(item.message.createdAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {media.length === 0 && docs.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No files shared yet
          </div>
        )}
      </div>
    </div>
  );
}
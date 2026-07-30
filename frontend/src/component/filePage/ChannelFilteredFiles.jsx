import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverURL } from "../../main";
import { format } from "date-fns";
import { BsFileEarmarkText, BsFileEarmarkCode, BsFileEarmarkPdf } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";

export default function ChannelFilteredFiles({ channelId, onClose }) {
  const [media, setMedia] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Auth Token
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (channelId) {
      setLoading(true);
      // Ensure you have this route in your backend
      axios.get(`${serverURL}/api/channel/${channelId}/files`, {
        withCredentials: true 
      })
      .then(res => {
        // Backend usually returns { images: [], videos: [], documents: [] }
        // We combine images and videos for the top section
        const images = res.data.images || [];
        const videos = res.data.videos || [];
        setMedia([...images, ...videos]);
        setDocs(res.data.documents || []);
      })
      .catch(err => console.error("Error fetching channel files:", err))
      .finally(() => setLoading(false));
    }
  }, [channelId, token]);

  const getDocIcon = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <BsFileEarmarkPdf className="text-red-500 text-xl" />;
    if (['env', 'json', 'js', 'html'].includes(ext)) return <BsFileEarmarkCode className="text-green-600 text-xl" />;
    return <BsFileEarmarkText className="text-blue-500 text-xl" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try { return format(new Date(dateString), "d MMM"); } catch(e) { return ""; }
  };

  if (loading) return <div className="p-4 bg-white shadow-xl rounded-lg border w-[350px]">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col w-[350px] max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="font-bold text-gray-700">Files</h3>
        <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded-full">
          <RxCross2 />
        </button>
      </div>

      <div className="overflow-y-auto p-4 custom-scrollbar">
        
        {/* Photos and Videos */}
        {media.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Photos and videos</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {media.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-24 h-20 relative group cursor-pointer rounded-md overflow-hidden border bg-gray-100">
                  {item.type?.startsWith('video') || item.url.match(/\.(mp4|webm)$/) ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={item.url} 
                      alt="media" 
                      className="w-full h-full object-cover" 
                      onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {docs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Documents</h4>
            <div className="flex flex-col gap-3">
              {docs.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getDocIcon(item.name || "")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                      {item.name || "Untitled"}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                       <span>Shared by {item.sender?.name?.split(" ")[0] || "User"}</span>
                       <span>•</span>
                       <span>{formatDate(item.createdAt)}</span>
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
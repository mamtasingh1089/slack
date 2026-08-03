import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../main";
import { format } from "date-fns"; 
import { BsSearch, BsFileEarmarkText, BsFileEarmarkCode, BsFileEarmarkPdf, BsThreeDots } from "react-icons/bs";
import { AiOutlineFileUnknown, AiOutlineShareAlt } from "react-icons/ai";
import { FaFileWord, FaFileExcel } from "react-icons/fa";
import { MdOutlineOpenInNew } from "react-icons/md";
import { CiStar } from "react-icons/ci";

const ChannelFilterPage = ({ channelId }) => {
  const [media, setMedia] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (channelId) {
      setLoading(true);
      axios.get(`${serverURL}/api/channel/${channelId}/files`, { withCredentials: true })
      .then(res => {
        const images = res.data.images || [];
        const videos = res.data.videos || [];
        setMedia([...images, ...videos]);
        setDocs(res.data.documents || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [channelId]);

  const getDocIcon = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    let Icon = AiOutlineFileUnknown;
    let color = "bg-gray-100 text-gray-500";
    if (['pdf'].includes(ext)) { Icon = BsFileEarmarkPdf; color = "bg-red-100 text-red-600"; }
    else if (['js','json','env'].includes(ext)) { Icon = BsFileEarmarkCode; color = "bg-blue-100 text-blue-600"; }
    else if (['doc','docx'].includes(ext)) { Icon = FaFileWord; color = "bg-blue-100 text-blue-700"; }
    return <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon className="text-xl"/></div>;
  };

  const formatDate = (d) => { try { return format(new Date(d), "d MMM"); } catch(e){ return ""; }};

  const filteredMedia = media.filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDocs = docs.filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="w-full h-full flex items-center justify-center bg-white">Loading...</div>;

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex-none px-4 py-3 border-b border-gray-200 bg-white">
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-md text-sm outline-none focus:bg-white border border-transparent focus:border-blue-500"
            placeholder="Search channel files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Photos */}
        {filteredMedia.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Photos and videos</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredMedia.map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-48 aspect-video relative group rounded-lg overflow-hidden border bg-gray-100">
                   {item.type?.startsWith('video') ? <video src={item.url} className="w-full h-full object-cover"/> : <img src={item.url} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Documents */}
        {filteredDocs.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Documents</h3>
            <div className="border rounded-lg divide-y divide-gray-100">
               {filteredDocs.map((item, idx) => (
                 <div key={idx} className="group flex items-center p-3 hover:bg-gray-50 relative">
                    <div className="mr-4">{getDocIcon(item.name)}</div>
                    <div className="flex-1 min-w-0">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-900 truncate block hover:underline">{item.name}</a>
                      <p className="text-xs text-gray-500">Shared by {item.sender?.name} on {formatDate(item.createdAt)}</p>
                    </div>
                    {/* Hover Actions */}
                    <div className="hidden group-hover:flex items-center gap-1 bg-white shadow-sm border rounded-md absolute right-4 px-2 py-1">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded"><AiOutlineShareAlt /></button>
                        <a href={item.url} target="_blank" className="p-2 text-gray-600 hover:bg-gray-100 rounded"><MdOutlineOpenInNew /></a>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded"><CiStar /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChannelFilterPage;
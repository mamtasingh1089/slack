// src/pages/Files.jsx

import React, { useState } from 'react';
import Topbar from '../../pages/Topbar';      // Assuming these paths are correct
import Sidebar from '../../pages/Sidebar';    // Assuming these paths are correct
import { FiPlus, FiSearch } from 'react-icons/fi';
import { BsFileEarmarkText, BsBrush, BsListUl, BsThreeDots, BsFillGridFill } from 'react-icons/bs';
import { FaStar, FaRegCheckCircle } from 'react-icons/fa';
import { MdOutlineKeyboardArrowDown, MdCheck } from 'react-icons/md';

// --- MOCK DATA ---
const canvasTemplates = [
  { title: "Welcome [name]! We're happy you're here.", desc: "Your First Week Tasks", desc2: "Make sure to complete these tasks before the end of the week.", color: "bg-green-100", icon: <FaRegCheckCircle className="text-green-600" /> },
  { title: "Hello Women @ Acme Community", desc: "Welcome to the latest edition of our Women's Equality Group newsletter! We're thrilled to share with you some exciting...", color: "bg-blue-100", icon: "👋" },
  { title: "Employee Onboarding", desc: "Welcome new people.", color: "bg-gray-100", icon: "👤" },
  { title: "OOO Details", desc: "Dates offline: Add your dates here", desc2: "Availability: Will you be completely off the grid? Or checking your phone every once in...", color: "bg-red-100", icon: "✈️" },
];

const listTemplates = [
  { title: "Project tracker", desc: "Manage and monitor tasks as a team", color: "bg-yellow-100", icon: "📝" },
  { title: "Feedback tracker", desc: "A streamlined approach to keeping track of feedback from colleagues", color: "bg-orange-100", icon: "🗣️" },
  { title: "Quarterly plan", desc: "A simple format for planning which projects to tackle", color: "bg-purple-100", icon: "🎯" },
];

const allFiles = [
  { type: 'canvas', title: "Untitled", author: "Open file", icon: '📄' },
  { type: 'canvas', title: "Weekly 1:1", author: "Slackbot", viewed: "Last viewed on 12 August - 1 min read", template: true, icon: '📋' },
];


// --- REUSABLE SUB-COMPONENTS ---
const TemplateCard = ({ template }) => (
  <div className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow bg-white flex flex-col">
    <div className={`w-10 h-10 rounded-md flex items-center justify-center text-xl mb-3 shrink-0 ${template.color}`}>{template.icon}</div>
    <h3 className="font-semibold text-gray-800 mb-1">{template.title}</h3>
    <p className="text-sm text-gray-500 line-clamp-2 flex-grow">{template.desc}</p>
    {template.desc2 && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{template.desc2}</p>}
  </div>
);

const FileListItem = ({ file }) => (
  <div className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 group">
    <span className="text-2xl mr-4">{file.icon}</span>
    <div className="flex-1">
      <p className="font-medium text-gray-800">{file.title} {file.template && <span className="ml-2 text-xs font-semibold text-gray-500 border rounded-md px-1.5 py-0.5">Template</span>}</p>
      <p className="text-sm text-gray-500">
        {file.author} {file.viewed && `- ${file.viewed}`}
      </p>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-2 rounded-full hover:bg-gray-200"><FaStar className="text-gray-500" /></button>
      <button className="p-2 rounded-full hover:bg-gray-200"><BsThreeDots /></button>
    </div>
  </div>
);


// --- CONDITIONAL PAGE VIEWS ---
const AllFilesView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">All files</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"><FiPlus /> New</button>
      </div>
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search files" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-8">
        <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">Templates <span className="ml-2 px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">NEW</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...canvasTemplates, ...listTemplates].slice(0, 4).map((template, index) => <TemplateCard key={index} template={template} />)}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">All</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-semibold">Created by you</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-semibold">Shared with you</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100"><BsListUl /> 5 Types <MdOutlineKeyboardArrowDown /></button>
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100">Recently viewed <MdOutlineKeyboardArrowDown /></button>
            <button className="p-2 border rounded-md text-gray-600 hover:bg-gray-100"><BsFillGridFill /></button>
          </div>
        </div>
        <div className="border rounded-lg bg-white">{allFiles.map((file, index) => <FileListItem key={index} file={file} />)}</div>
      </div>
    </>
);

const CanvasesView = () => {
    const canvasFiles = allFiles.filter(file => file.type === 'canvas');
    return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Canvases</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"><FiPlus /> New</button>
      </div>
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search canvases" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
            <h2 className="flex items-center text-lg font-semibold text-gray-800">Templates <span className="ml-2 px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">NEW</span></h2>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {canvasTemplates.map((template, index) => <TemplateCard key={index} template={template} />)}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">All Canvases</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-semibold">Created by you</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-semibold">Shared with you</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100">Recently viewed <MdOutlineKeyboardArrowDown /></button>
          </div>
        </div>
        <div className="border rounded-lg bg-white">{canvasFiles.map((file, index) => <FileListItem key={index} file={file} />)}</div>
      </div>
    </>
    );
};

const ListsView = () => {
    const listFiles = allFiles.filter(file => file.type === 'list');
    return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Lists</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"><FiPlus /> New</button>
      </div>
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search lists" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
       <div className="mb-8">
         <div className="flex justify-between items-center mb-3">
            <h2 className="flex items-center text-lg font-semibold text-gray-800">Templates <span className="ml-2 px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">NEW</span></h2>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listTemplates.map((template, index) => <TemplateCard key={index} template={template} />)}
        </div>
      </div>
       <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">All Lists</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-semibold">Created by you</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-semibold">Shared with you</button>
          </div>
           <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100">Recently viewed <MdOutlineKeyboardArrowDown /></button>
          </div>
        </div>
        <div className="text-center py-20 bg-white border rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-2">No lists yet</h3>
            <p className="text-sm text-gray-500 mb-4">Your recently viewed or updated lists will be shown here.</p>
            <button className="flex items-center mx-auto gap-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"><FiPlus/> New List</button>
        </div>
      </div>
    </>
    );
};

// --- MAIN PAGE COMPONENT ---
const Files = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'canvases', or 'lists'

  const renderContent = () => {
    switch (activeTab) {
      case 'canvases':
        return <CanvasesView />;
      case 'lists':
        return <ListsView />;
      case 'all':
      default:
        return <AllFilesView />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-gray-100">
      <Topbar />
      <div className="flex flex-1 overflow-hidden pt-12">
        <Sidebar />
        <div className="pl-[72px] w-full h-full flex flex-row">
          {/* Files Page Sidebar */}
          <aside className="w-[280px] h-full bg-[#3f0c41] text-gray-300 flex-shrink-0 flex flex-col">
            <div className='flex justify-between items-center p-4'>
              <h1 className='font-bold text-xl text-white'>Files</h1>
              <button className='text-xl p-1 rounded hover:bg-white/10'><FiPlus /></button>
            </div>
            <nav className='flex flex-col gap-1 p-2'>
              <button onClick={() => setActiveTab('all')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${activeTab === 'all' ? 'bg-purple-900 text-white font-semibold' : 'hover:bg-white/10'}`}>
                <BsFileEarmarkText /> All files
              </button>
              <button onClick={() => setActiveTab('canvases')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${activeTab === 'canvases' ? 'bg-purple-900 text-white font-semibold' : 'hover:bg-white/10'}`}>
                <BsBrush /> Canvases
              </button>
              <button onClick={() => setActiveTab('lists')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${activeTab === 'lists' ? 'bg-purple-900 text-white font-semibold' : 'hover:bg-white/10'}`}>
                <BsListUl /> Lists
              </button>
            </nav>
            <div className="mt-6 p-4 border-t border-white/20">
              <h2 className="font-semibold text-white mb-2">Starred</h2>
              <p className="text-sm text-gray-400">
                Click the <FaStar className="inline mx-1 text-yellow-400" /> star on any canvas or list to add it here for later.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Files;
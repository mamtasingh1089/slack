import React, { useEffect } from "react";
import { HiArrowRight } from "react-icons/hi";
import { BsStars } from "react-icons/bs";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setWorkspace,setAllWorkspaces } from "../redux/workspaceSlice"; 
import axios from "axios";
import { serverURL } from "../main";

const SlackWelcomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

 
 const allWorkspaces = useSelector(
    (state) => state.workspace.allWorkspaces
  );


 
const handleSelectWorkspace = (ws) => {
  dispatch(setWorkspace(ws));
  navigate("/home");
};


  
useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ FIXED await
        const res = await axios.get(`${serverURL}/api/workspace/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API response:", res.data);

dispatch(setAllWorkspaces(res.data.workspaces || res.data));
      } catch (error) {
        console.error("Failed to fetch workspaces", error.response?.data || error.message);
      }
    };

    fetchWorkspaces();
  }, [dispatch]);



  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1c1d]">
    
      <nav className="bg-[#4a154b] px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 text-white font-bold text-2xl">
             <img src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" className="w-6 h-6 mr-1" alt="logo" />
             slack
          </div>
          <div className="hidden md:flex gap-6 text-white/80 text-sm font-medium">
            <span>Features</span> <span>Solutions</span> <span>Enterprise</span> <span>Resources</span> <span>Pricing</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="text-white text-sm font-bold border border-white px-4 py-2 rounded uppercase tracking-wider">Talk to Sales</button>
          <button 
            onClick={() => navigate("/create-workspace")} 
            className="bg-white text-[#4a154b] text-sm font-bold px-4 py-2 rounded uppercase tracking-wider"
          >
            Create a New Workspace
          </button>
        </div>
      </nav>

      <header className="bg-[#4a154b] text-white pt-16 pb-32 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome back</h1>
        <p className="text-lg opacity-90">Choose a workspace to get started.</p>
      </header>

     
      <main className="max-w-6xl mx-auto px-4 -mt-20 flex flex-col lg:flex-row gap-8 pb-20">
        <section className="flex-1">
          <div className="flex items-center gap-2 mb-4 text-white">
            <span className="text-xs font-bold uppercase tracking-widest">My workspaces</span>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b px-6 pt-4 bg-[#fcfcfc]">
              <button className="border-b-2 border-[#1264a3] pb-3 px-2 font-bold text-sm">Workspaces</button>
              <button className="pb-3 px-4 text-sm text-gray-500 flex items-center gap-2">
                Pending invitations <span className="bg-[#e01e5a] text-white text-[10px] px-2 py-0.5 rounded-full">1</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-[11px] font-bold text-gray-500 uppercase mb-4 tracking-tighter">Ready to launch</p>
              <div className="space-y-4">
            
  {allWorkspaces && allWorkspaces.length > 0 ? (
        allWorkspaces.map((ws, index) => (
    <div 
      key={ws._id || index}
      onClick={() => handleSelectWorkspace(ws)}
      className="flex items-center justify-between p-4 border rounded-md hover:border-blue-400 group cursor-pointer transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#36c5f0] rounded-lg flex items-center justify-center text-white font-bold text-xl uppercase">
          {ws.name ? ws.name.charAt(0) : "W"}
        </div>

        <div>
          <h3 className="font-bold text-lg">{ws.name}</h3>
          <p className="text-sm text-gray-500">
            {ws.members?.length || 1} member
            {ws.members?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <HiArrowRight className="text-2xl text-gray-400 group-hover:text-blue-500" />
    </div>
  ))
) : (
  <p className="text-center text-gray-500 py-4">No workspaces found.</p>
)}

              </div>
              
              <div className="mt-8 pt-6 border-t">
                <button 
                  onClick={() => navigate("/create-workspace")}
                  className="text-[#1264a3] text-sm font-medium hover:underline block mb-2"
                >
                  Create a new workspace
                </button>
                <p className="text-xs text-gray-500">
                  Not seeing your workspace? <button className="text-[#1264a3] hover:underline">Try a different email address</button>
                </p>
              </div>
            </div>
          </div>
        </section>

       
        <aside className="lg:w-80 space-y-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Supercharge with AI.</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">Explore AI features in your subscription.</p>
                <button className="border border-gray-300 px-4 py-1.5 rounded font-bold text-xs hover:bg-gray-50 shadow-sm transition">See features</button>
             </div>
             <div className="absolute top-10 right-4 p-4 bg-purple-50 rounded-full text-purple-600 text-3xl opacity-80 group-hover:scale-110 transition duration-300"><BsStars /></div>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm relative overflow-hidden group">
             <h3 className="font-bold text-lg mb-2">Invite external partners.</h3>
             <p className="text-sm text-gray-600 mb-4 leading-relaxed">Speed up work with outside teams.</p>
             <button className="border border-gray-300 px-4 py-1.5 rounded font-bold text-xs hover:bg-gray-50 shadow-sm transition">Invite partners</button>
             <div className="absolute top-12 right-4 text-purple-300 text-4xl transform rotate-12 opacity-40">✈</div>
          </div>
        </aside>
      </main>

      {/* 3. DISCOVER MORE SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8 flex items-center gap-2">
          <BsStars className="text-purple-600" /> Discover more
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Get started with a template.", desc: "Ready-made for you. Bye-bye, blank slate.", btn: "Browse templates" },
            { title: "Connect your apps.", desc: "Choose from over 2,600 apps, or build your own.", btn: "Browse apps" },
            { title: "What's new in Slack", desc: "Discover new features available now.", btn: "Learn more" }
          ].map((item, i) => (
            <div key={i} className="bg-[#f8f8f8] p-8 rounded-xl flex flex-col justify-between hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{item.desc}</p>
              </div>
              <button className="border border-gray-300 bg-white px-4 py-2 rounded font-bold text-xs w-fit hover:border-gray-400">
                {item.btn}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOOTER LINKS */}
      <footer className="bg-white px-8 py-20 border-t">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-20">
          <div className="col-span-1"><img src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" className="w-14" alt="logo" /></div>
          <div><h4 className="font-bold text-xs uppercase mb-6">Product</h4><ul className="text-gray-500 text-sm space-y-3"><li>Watch demo</li><li>Pricing</li><li>Paid vs Free</li></ul></div>
          <div><h4 className="font-bold text-xs uppercase mb-6">Features</h4><ul className="text-gray-500 text-sm space-y-3"><li>Channels</li><li>Slack Connect</li><li>Messaging</li></ul></div>
          <div><h4 className="font-bold text-xs uppercase mb-6">Resources</h4><ul className="text-gray-500 text-sm space-y-3"><li>Help Centre</li><li>Slack blog</li><li>Community</li></ul></div>
          <div><h4 className="font-bold text-xs uppercase mb-6">Company</h4><ul className="text-gray-500 text-sm space-y-3"><li>About us</li><li>News</li><li>Careers</li></ul></div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
           <div className="flex gap-4 font-bold text-gray-900">
             <span>Download Slack</span> <span>Privacy</span> <span>Terms</span> <span>Cookie preferences</span>
           </div>
           <p>©2026 Slack Technologies, LLC, a Salesforce company.</p>
        </div>
      </footer>
    </div>
  );
};

export default SlackWelcomePage;
import React from 'react';
import { useSelector } from 'react-redux';
import AllUser from './AllUser';
import FullProfile from './FullProfile';
import Topbar from '../../pages/Topbar';
import Sidebar from '../../pages/Sidebar';
import HomePageSidebar from '../sidebar/HomePageSidebar';

const ProfilePage = () => {
  const singleUser = useSelector((state) => state.user.singleUser);

  return (
    <div className="w-full h-screen bg-[#f3f4f6] overflow-hidden font-sans">
      <Topbar />
      <Sidebar />
      <HomePageSidebar />

      {/* Main container: Fixed height (screen - topbar) */}
      <div className="mt-12 md:ml-[30%] ml-[30%] md:w-[70%] h-[calc(100vh-48px)] bg-white flex flex-row border-l border-gray-200 overflow-hidden relative">
        
        {/* LEFT SIDE: All User List */}
        {/* We use overflow-y-auto here so this specific section scrolls independently */}
        <div 
          className={`
            flex-1 
            h-full 
            min-w-0 
            bg-[#f8f8f8] 
            overflow-y-auto 
            ${singleUser ? 'hidden md:block' : 'block'}
          `}
        >
           <AllUser />
        </div>

        {/* RIGHT SIDE: Full Profile */}
        {/* 
           1. We REMOVED 'overflow-y-auto' from here. 
           2. We use 'overflow-hidden' to ensure the wrapper doesn't scroll.
           3. 'FullProfile.js' has 'flex-col' and 'overflow-y-auto' inside it, 
              which keeps the Header fixed and scrolls the body content.
        */}
        {singleUser && (
          <div className="h-full bg-white border-l border-gray-200 shadow-xl z-20 w-full md:w-auto md:flex-shrink-0 overflow-hidden">
            <FullProfile />
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
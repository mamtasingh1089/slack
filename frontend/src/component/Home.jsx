import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Topbar from '../pages/Topbar';
import Sidebar from '../pages/Sidebar';
import HomeRight from '../pages/HomeRight';
import Channel from './channelPage/Channel';
import Directories from '../pages/Directories'; 
import DraftsSend from '../pages/DraftsSend';
import Huddles from './Huddles';
import useListenMessages from '../hook/useListenMessages';

const HomePage = () => {
    useListenMessages();
  return (
    <div className="w-full h-screen bg-[#f3f4f6]"> 
      <Topbar />
      <div className="flex h-full">
   
        <Sidebar />
        <HomePageSidebar />

  
        <main className="flex-1 h-full pl-[calc(5%+25%)]">
          <Routes>
            <Route index element={<WelcomeScreen />} />
            <Route path="/dm/:id" element={<HomeRight />} />
            <Route path='/huddles' element={<Huddles/>}/>
            <Route path='/draftssend' element={<DraftsSend />} />
            <Route path='/draftssend/dm/:id' element={<HomeRight />} />
            <Route path='/directories' element={<Directories />} />
            <Route path='/draftssend/channel/:channelId' element={<Channel />} />
            <Route path="/channel/:channelId" element={<Channel />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const WelcomeScreen = () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
            <p className="text-gray-500 mt-2">Select a channel or conversation to begin.</p>
        </div>
    </div>
);

export default HomePage;
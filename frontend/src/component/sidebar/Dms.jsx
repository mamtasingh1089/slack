import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../pages/Sidebar';  
import DmsLeft from '../../pages/DmsLeft';  
import HomeRight from '../../pages/HomeRight'; 
import Topbar from '../../pages/Topbar';    

const Dms = () => {
  const { id } = useParams();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DmsLeft />
        <main className="flex-1 h-full">
          <HomeRight key={id} /> 
        </main>
      </div>
    </div>
  );
};

export default Dms;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Right from '../pages/Right';

const ConversationLayout = () => {
  return (
    <div className="w-full h-full flex flex-row">

      <Outlet />

      <div className="flex-grow overflow-hidden">
        <Right />
      </div>
    </div>
  );
};

export default ConversationLayout;
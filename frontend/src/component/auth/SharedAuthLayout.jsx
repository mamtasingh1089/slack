import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SharedAuthBrandPanel from './SharedAuthBrandPanel';

const SharedAuthLayout = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <div className={`flex w-full h-full min-h-screen bg-[#F8FAF9] text-[#16231F] font-sans ${isRegister ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Brand Panel (slides left/right automatically via layout prop) */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="hidden lg:block lg:w-1/2 h-screen relative z-10"
      >
        <SharedAuthBrandPanel isRegister={isRegister} />
      </motion.div>

      {/* Form Panel (slides left/right automatically via layout prop) */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-white relative overflow-y-auto z-20"
      >
        <div className="w-full max-w-md flex flex-col gap-6">
          <Outlet />
        </div>
      </motion.div>
      
    </div>
  );
};

export default SharedAuthLayout;

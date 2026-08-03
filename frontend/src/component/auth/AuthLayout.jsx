import React from 'react';
import AuthBrandPanel from './AuthBrandPanel';
import AuthFormPanel from './AuthFormPanel';

const AuthLayout = ({ children, brandPanel, reverse = false }) => {
  return (
    <div className={`flex w-full h-full min-h-screen bg-[#F8FAF9] text-[#16231F] font-sans ${reverse ? 'flex-row-reverse' : ''}`}>
      {/* Brand Panel */}
      {brandPanel || <AuthBrandPanel />}

      {/* Form Panel */}
      <AuthFormPanel>
        {children}
      </AuthFormPanel>
    </div>
  );
};

export default AuthLayout;

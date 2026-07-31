import React from 'react';
import AuthBrandPanel from './AuthBrandPanel';
import AuthFormPanel from './AuthFormPanel';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex w-full h-full min-h-screen bg-[#F8FAF9] text-[#16231F] font-sans">
      {/* Brand Panel (left side on lg screens) */}
      <AuthBrandPanel />

      {/* Form Panel (right side) */}
      <AuthFormPanel>
        {children}
      </AuthFormPanel>
    </div>
  );
};

export default AuthLayout;

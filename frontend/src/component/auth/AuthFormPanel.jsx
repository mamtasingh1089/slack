import React from 'react';

const AuthFormPanel = ({ children }) => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-white relative overflow-y-auto">
      {/* Container for form/children to restrict max width */}
      <div className="w-full max-w-md flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
};

export default AuthFormPanel;

import React from "react";
import {serverURL } from '../main'


const getImageUrl = (path) => {
  if (!path) {
    return null;
  }

  if (path.startsWith('http')) {
    return path;
  }

  return `${serverURL}/${path}`;
};

const Avatar = ({ user, size = 'md' }) => {
   
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    if (!user) {
        return <div className={`${sizeClasses[size]} bg-gray-300 rounded-full`}></div>;
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
    

    const imageUrl = getImageUrl(user.profileImage);
// const imageUrl = getImageUrl(user.profilePic);

    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} bg-gray-400 text-white rounded-full font-bold`}>
            {imageUrl ? (
                <img src={imageUrl} alt={user.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
};

export default Avatar;
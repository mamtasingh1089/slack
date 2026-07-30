import React, { useEffect, useState } from 'react';
import { IoClose, IoChevronBack } from "react-icons/io5";
import { FaLink } from "react-icons/fa6";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAllChannels, setChannel } from '../../redux/channelSlice.js'
import {setUser} from '../../redux/userSlice.js'
import {serverURL} from '../../main.jsx'

const NewChannel = ({ isVisible, onClose }) => {
   
     const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [channelsOpen, setChannelsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [channelName, setChannelName] = useState('slack-group');
    const [visibility, setVisibility] = useState('public');
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    const [openAddChannel, setOpenAddChannel] = useState();


    const dispatch = useDispatch();
    // This will now work because the store is configured correctly
    const { channel, allChannels } = useSelector((state) => state.channel);

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);
   const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep(1); // Reset internal state for next time
            setError(null);
        }, 300);
    };


const fetchAllChannels = async () => {
    try {
        const token = localStorage.getItem("token");

        // --- DEBUGGING: Let's see what the token is ---
        console.log("Attempting to fetch channels. Token found:", token);

        // --- CRITICAL CHECK: Do not make the call if there is no token ---
        if (!token) {
            console.error("No token found in localStorage. Aborting API call.");
            // Optionally, you could redirect to login here or show an error message.
            return; 
        }

        const result = await axios.get(`${serverURL}/api/channel/getAllChannel`, {
            headers: {
                // Ensure the token is sent correctly in the header
                Authorization: `Bearer ${token}`
            }
        });

        dispatch(setAllChannels(result.data));
        console.log("Successfully fetched channels:", result.data);

    } catch (error) {
        // This will now give us a more detailed error from the backend
        console.error("Error fetching channels:", error.response?.data || error.message);
    }
};

   const handleChannel = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true at the start

    try {
        // --- FIX: Get the token from localStorage ---
        const token = localStorage.getItem("token");

        // --- FIX: Add a check for the token ---
        if (!token) {
            console.error("Cannot create channel, no token found.");
            setError("You must be logged in to create a channel.");
            setLoading(false);
            return;
        }

        const result = await axios.post(
            `${serverURL}/api/channel/create`,
            { name: channelName, visibility: visibility },
            { 
                // --- FIX: Add the Authorization header ---
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        dispatch(setChannel(result.data));
        await fetchAllChannels(); // This is great, it refetches the list
        console.log("Created channel:", result.data);
        handleClose();

    } catch (error) {
        console.error("Error creating channel:", error.response?.data || error.message);
        setError(error.response?.data?.msg || "Failed to create channel.");
    } finally {
        setLoading(false); // Ensure loading is set to false in the end
    }
};

    const user=useSelector((state)=>state.user.user)
   useEffect(() => {
    // Only fetch channels if the user object exists (meaning they are logged in)
    if (user) {
        fetchAllChannels();
    }
}, [user]);

  if (!isVisible) {
        return null;
    }

    return (
        <div>
           

       

        

            {isVisible && (
                // ... your modal JSX ...
                 <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
                 <div className="bg-white w-[90%] max-w-[800px] h-[500px] rounded-lg shadow-lg z-50 flex relative">
                     {/* Right Side Buttons */}
                     <div className="absolute top-4 right-4 flex items-center space-x-4 text-gray-500">
                          {step === 2 && <FaLink size={20} className="hover:text-gray-800 cursor-pointer" />}
                         <button className="hover:text-gray-800" onClick={handleClose}>
                             <IoClose size={24} />
                         </button>
                     </div>

                     {/* Left side */}
                     <div className='bg-white text-black p-6 w-[45%] h-full flex flex-col rounded-l-lg'>
                         {step === 1 ? (
                             <>
                                 <h1 className='font-bold text-2xl mb-4'>Create a channel</h1>
                                 <div className='flex-grow overflow-y-auto pr-2'>
                                     <div className='bg-blue-600 p-2 text-white rounded cursor-pointer ring-2 ring-blue-300'>Blank channel</div>
                                     <div className='mt-3 space-y-1 text-gray-800'>
                                         {/* Templates */}
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Project starter kit</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Help requests process</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Team support</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Feedback intake and triage</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>New hire onboarding</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>1:1 coaching</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Sales deal tracking</div>
                                         <button className='text-blue-600 font-semibold hover:underline mt-1 p-2 w-full text-left' onClick={() => setShowAllTemplates(p => !p)}>
                                             {showAllTemplates ? "Show fewer templates" : "Show all templates"}
                                         </button>
                                     </div>
                                 </div>
                                 <div className="mt-auto pt-4 flex justify-end">
                                     <button className="bg-green-700 text-white font-bold py-2 px-6 rounded hover:bg-green-800" onClick={handleNext}>Next</button>
                                 </div>
                             </>
                         ) : (
                             <>
                                 <button onClick={handleBack} className="flex items-center text-sm font-semibold mb-3 hover:underline">
                                     <IoChevronBack className="mr-1" /> Back
                                 </button>
                                 <h1 className='font-bold text-2xl mb-4'>Channel details</h1>
                                 <div className='flex-grow pr-2'>
                                     <label htmlFor="channel-name" className='font-semibold'>Channel name</label>
                                     <div className="relative mt-1">
                                         <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>#</span>
                                          <input
                                             id="channel-name"
                                             type="text"
                                             value={channelName}
                                             onChange={(e) => setChannelName(e.target.value.replace(/\s/g, '-').toLowerCase())}
                                             className='w-full border-2 border-gray-400 rounded p-2 pl-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                         />
                                         <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
                                             {80 - channelName.length}
                                         </span>
                                     </div>
                                     <p className="text-xs text-gray-500 mt-2">
                                         Channels are where conversations happen around a topic. Use a name that is easy to find and understand.
                                     </p>

                                     <div className='mt-6'>
                                         <p className='font-semibold'>Visibility</p>
                                         <div className='mt-2 space-y-3'>
                                             <label className='flex items-start cursor-pointer'>
                                                 <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="mt-1 mr-2" />
                                                 <div>
                                                     <p className='font-semibold'>Public - <span className='font-normal'>Anyone in Koalaliving</span></p>
                                                 </div>
                                             </label>
                                              <label className='flex items-start cursor-pointer'>
                                                 <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="mt-1 mr-2" />
                                                 <div>
                                                     <p className='font-semibold'>Private - <span className='font-normal'>Only specific people</span></p>
                                                     <p className="text-xs text-gray-500">Can only be viewed or joined by invitation</p>
                                                 </div>
                                             </label>
                                         </div>
                                     </div>
                                 </div>
                                  <div className="mt-auto pt-4 flex justify-center">
                                 {error ? <p className="text-red-600 text-sm mb-2">{error}</p> : null}
                                    <button 
                                        className="bg-green-700 text-white font-bold py-2 px-6 rounded hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                                        disabled={!channelName || loading} 
                                        onClick={handleChannel}
                                      >
                                          {loading ? "Creating..." : "Create"}
                                      </button>
                                 </div>
                             </>
                         )}
                     </div>

                     {/* Right side (Preview) */}
                     <div className='bg-[#F8F3FA] w-[55%] h-full p-6 flex flex-col rounded-r-lg'>
                         <div className='flex items-center text-gray-800 mb-4 font-bold text-lg truncate'>
                             <span>#</span>
                             <span className='ml-1 truncate'>{channelName || 'channel-name'}</span>
                         </div>
                         <div className='flex space-x-4 border-b mb-4'>
                             <button className='font-semibold text-gray-900 border-b-2 border-gray-900 pb-2'>Messages</button>
                             <button className='text-gray-500 pb-2'>Canvas</button>
                         </div>
                         <div className="flex-grow space-y-4 animate-pulse">
                             {[...Array(3)].map((_, i) => (
                                 <div key={i} className="flex items-start space-x-3">
                                     <div className="w-9 h-9 bg-gray-300 rounded"></div>
                                     <div className="flex-1 space-y-2 py-1">
                                         <div className="w-3/4 h-3 bg-gray-300 rounded"></div>
                                         <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-auto pt-4 relative">
                             <div className="border rounded-lg bg-white p-3 flex justify-between items-center text-gray-300">
                                 <span>&#43;</span>
                                 <div className="flex-grow mx-2"></div>
                                 <span className='text-xl'>&#10148;</span>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
            )}
        </div>
    );
};

export default NewChannel;
import React, { useRef, useEffect } from 'react';
import Avatar from './Avatar';
// ✅ FIX: Corrected the icon names below
import { RiPhoneFill, RiMicFill, RiMicOffFill, RiVideoFill, RiVideoOffFill } from 'react-icons/ri';

const VideoCallUI = ({
  callState,
  localStream,
  remoteStream,
  acceptCall,
  hangUp,
  otherUser,
  isLocalAudioMuted,
  isLocalVideoMuted,
  toggleAudio,
  toggleVideo,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    console.log('[VideoCallUI] localStream updated:', !!localStream, localStream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('[VideoCallUI] Local video element srcObject set');
    }
  }, [localStream]);

  useEffect(() => {
    console.log('[VideoCallUI] remoteStream updated:', !!remoteStream, remoteStream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('[VideoCallUI] Remote video element srcObject set');
    }
  }, [remoteStream]);

  useEffect(() => {
    console.log('[VideoCallUI] Current state:', {
      callState,
      hasLocalStream: !!localStream,
      hasRemoteStream: !!remoteStream,
      localTracks: localStream?.getTracks().length || 0,
      remoteTracks: remoteStream?.getTracks().length || 0,
    });
  }, [callState, localStream, remoteStream]);

  const renderContent = () => {
    // Show avatar screen only when receiving or calling WITHOUT streams yet
    if ((callState === 'receiving' || callState === 'calling') && !localStream && !remoteStream) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <Avatar user={otherUser} size="xl" />
          <h2 className="mt-4 text-2xl font-semibold">{otherUser?.name || 'Unknown User'}</h2>
          <p className="mt-2 text-lg">{callState === 'receiving' ? 'Incoming Call...' : 'Calling...'}</p>
          {callState === 'receiving' && (
            <div className="mt-8 flex gap-6">
              <button
                onClick={hangUp}
                className="bg-red-500 hover:bg-red-600 rounded-full p-4 transition-colors"
                title="Decline"
              >
                <RiPhoneFill className="text-2xl" />
              </button>
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-colors"
                title="Accept"
              >
                <RiPhoneFill className="text-2xl" />
              </button>
            </div>
          )}
        </div>
      );
    }

    // Show video interface when we have streams OR in connecting/connected state
    if (callState === 'connecting' || callState === 'connected' || callState === 'calling' || localStream || remoteStream) {
      return (
        <div className="relative w-full h-full">
          {/* Remote Video (Fullscreen) - show placeholder if no remote stream yet */}
          {remoteStream ? (
            <>
              {/* Always render video element for audio playback */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={remoteStream.getVideoTracks().length > 0 && remoteStream.getVideoTracks()[0].readyState === 'live' 
                  ? "w-full h-full object-cover bg-gray-900" 
                  : "w-0 h-0 opacity-0 absolute"}
                onLoadedMetadata={() => console.log('[VideoCallUI] Remote video metadata loaded')}
                onPlay={() => console.log('[VideoCallUI] Remote video playing')}
              />
              {/* Show audio-only placeholder if no video */}
              {!(remoteStream.getVideoTracks().length > 0 && remoteStream.getVideoTracks()[0].readyState === 'live') && (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Avatar user={otherUser} size="xl" />
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <RiMicFill className="text-2xl" />
                      <p className="text-lg">Audio Only</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
              <div className="text-center">
                <Avatar user={otherUser} size="xl" />
                <p className="mt-4 text-lg">Connecting...</p>
              </div>
            </div>
          )}
          
          {/* Local Video (Picture-in-Picture) */}
          {localStream && (
            <>
              {/* Always render video element (muted for local) */}
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={localStream.getVideoTracks().length > 0 && localStream.getVideoTracks()[0].readyState === 'live'
                  ? "absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-gray-500 shadow-lg bg-gray-800"
                  : "w-0 h-0 opacity-0 absolute"}
                onLoadedMetadata={() => console.log('[VideoCallUI] Local video metadata loaded')}
                onPlay={() => console.log('[VideoCallUI] Local video playing')}
              />
              {/* Show audio-only indicator if no video */}
              {!(localStream.getVideoTracks().length > 0 && localStream.getVideoTracks()[0].readyState === 'live') && (
                <div className="absolute top-4 right-4 w-48 h-36 rounded-lg border-2 border-gray-500 shadow-lg bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <RiMicFill className="text-4xl mx-auto mb-2" />
                    <p className="text-xs">Audio Only</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-3 rounded-full">
            <button onClick={toggleAudio} className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors" title={isLocalAudioMuted ? 'Unmute Audio' : 'Mute Audio'}>
              {isLocalAudioMuted ? <RiMicOffFill className="text-2xl text-white" /> : <RiMicFill className="text-2xl text-white" />}
            </button>
            <button onClick={toggleVideo} className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors" title={isLocalVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}>
              {isLocalVideoMuted ? <RiVideoOffFill className="text-2xl text-white" /> : <RiVideoFill className="text-2xl text-white" />}
            </button>
            <button onClick={hangUp} className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" title="Hang Up">
              <RiPhoneFill className="text-2xl text-white" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90">
      {renderContent()}
    </div>
  );
};

export default VideoCallUI;
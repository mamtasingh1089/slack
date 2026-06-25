import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setIncomingCall, clearIncomingCall, addCallHistory } from "../redux/callSlice";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (socket, remoteUser) => {
  const dispatch = useDispatch();

  // Local State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle"); // idle, calling, receiving, connecting, connected
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);
  const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(false);
  const [isLocalVideoMuted, setIsLocalVideoMuted] = useState(false);

  // Refs for persistent data across renders without triggering re-renders
  const peerConnectionRef = useRef(null);
  const offerRef = useRef(null);
  const iceCandidateBuffer = useRef([]);
  const isProcessingCall = useRef(false);
  const callTimeoutRef = useRef(null);
  const callStateRef = useRef("idle");
  
  // Ref to track call duration
  const startTimeRef = useRef(null);

  // Get current logged-in user from Redux
  const { user: currentUser } = useSelector((state) => state.user);

  // Keep callStateRef in sync with state for use inside event listeners
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // --- HELPER: Format Duration (e.g., "5 minutes", "20 seconds") ---
  const calculateDuration = (startTime) => {
    if (!startTime) return "0s";
    const diff = Date.now() - startTime;
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)));

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes} minutes`;
    return `${seconds} seconds`;
  };

  // --- CLEANUP FUNCTION ---
  const cleanupCall = useCallback(() => {
    console.log("[WebRTC] cleanupCall triggered.");

    // 1. Save Call History before resetting
    const targetUser = incomingCallFrom || remoteUser;
    
    // Only save history if we had a target user AND the call actually connected (startTime exists)
    if (targetUser && startTimeRef.current) {
        const durationStr = calculateDuration(startTimeRef.current);
        
        dispatch(addCallHistory({
            id: Date.now().toString(),
            user: targetUser,
            timestamp: new Date().toISOString(),
            duration: durationStr,
            type: incomingCallFrom ? 'incoming' : 'outgoing'
        }));
    }

    // 2. Clear Global Redux Call State
    dispatch(clearIncomingCall());

    // 3. Clear Timeouts
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    // 4. Close Peer Connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // 5. Stop Media Tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // 6. Reset State
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setIncomingCallFrom(null);
    offerRef.current = null;
    iceCandidateBuffer.current = [];
    isProcessingCall.current = false;
    startTimeRef.current = null; // Reset timer
    setIsLocalAudioMuted(false);
    setIsLocalVideoMuted(false);
  }, [localStream, dispatch, incomingCallFrom, remoteUser]);

  // --- INITIALIZE PEER CONNECTION ---
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const targetUser = callState === "calling" ? remoteUser : incomingCallFrom;
        if (targetUser?._id) {
          socket.emit("webrtc:ice-candidate", {
            to: targetUser._id,
            candidate: event.candidate,
          });
        }
      }
    };

    // Handle Remote Stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log("[WebRTC] Received remote stream");
        setRemoteStream(event.streams[0]);
      }
    };

    // Handle Connection State Changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${pc.connectionState}`);
      if (pc.connectionState === "connected") {
        console.log("[WebRTC] Peer connection established!");
        isProcessingCall.current = false;
        
        // Start the timer when connected
        startTimeRef.current = Date.now(); 
        
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
        }
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
         // Optional: Auto cleanup on failure
         // cleanupCall(); 
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, callState, remoteUser, incomingCallFrom]);

  // --- START CALL (Caller) ---
  const startCall = useCallback(async (selectedUserId) => {
    if (callState !== "idle") return;
    if (isProcessingCall.current) return;

    // Use selectedUserId if passed (from Huddles page), otherwise use remoteUser (from DM)
    // Note: ensure Redux singleUser is updated before this runs if relying on remoteUser
    const targetUserId = selectedUserId || remoteUser?._id;

    if (!socket || !targetUserId) {
      console.error("[WebRTC] Cannot start call: Missing socket or target user.");
      return;
    }

    console.log("[WebRTC] Starting call...");
    isProcessingCall.current = true;

    try {
      setCallState("calling");

      // Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      setLocalStream(stream);

      // Initialize PC
      const pc = initializePeerConnection();
      
      // Add Tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Create Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Emit Signal
    socket.emit("webrtc:start-call", {
  to: targetUserId,
  from: {
    _id: currentUser._id,
    name: currentUser.name,
    avatar: currentUser.avatar
  }, 
  offer: offer,
});

      // Set timeout for no answer
      callTimeoutRef.current = setTimeout(() => {
        if (callState === "calling") {
          console.log("[WebRTC] No answer timeout.");
          alert("Call was not answered");
          cleanupCall();
        }
      }, 60000); // 60 seconds

    } catch (error) {
      console.error("[WebRTC] Error starting call:", error);
      alert("Could not access camera/microphone.");
      isProcessingCall.current = false;
      cleanupCall();
    }
  }, [socket, remoteUser, currentUser, callState, initializePeerConnection, cleanupCall]);

  // --- ACCEPT CALL (Receiver) ---
  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCallFrom || !offerRef.current) {
      console.error("[WebRTC] Cannot accept call: Missing data.");
      return;
    }

    if (isProcessingCall.current) return;
    console.log("[WebRTC] Accepting call...");
    isProcessingCall.current = true;

    try {
      setCallState("connecting");

      // Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      
      setLocalStream(stream);

      // Initialize PC
      const pc = initializePeerConnection();
      
      // Add Tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set Remote Description (The Offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offerRef.current));

      // Handle Buffered ICE Candidates
      if (iceCandidateBuffer.current.length > 0) {
        for (const candidate of iceCandidateBuffer.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding buffered ICE candidate", e);
          }
        }
        iceCandidateBuffer.current = [];
      }

      // Create Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Emit Answer
    socket.emit("webrtc:answer-call", {
  to: incomingCallFrom._id,
  from: {
    _id: currentUser._id,
    name: currentUser.name,
    avatar: currentUser.avatar
  },
  answer: answer,
});

      // Set state to connected manually here, though connectionstatechange will also handle logic
      setCallState("connected");
      isProcessingCall.current = false;

    } catch (error) {
      console.error("[WebRTC] Error accepting call:", error);
      alert("Could not access camera/microphone.");
      isProcessingCall.current = false;
      cleanupCall();
    }
  }, [socket, incomingCallFrom, currentUser, initializePeerConnection, cleanupCall]);

  // --- HANG UP ---
  const hangUp = useCallback(() => {
    const targetUser = callStateRef.current === "receiving" || callStateRef.current === "connected" 
      ? incomingCallFrom 
      : remoteUser;

    if (socket && targetUser) {
      console.log(`[WebRTC] Hanging up call with ${targetUser.name}`);
      socket.emit("webrtc:hang-up", { to: targetUser._id });
    }
    cleanupCall();
  }, [socket, remoteUser, incomingCallFrom, cleanupCall]);

  // --- TOGGLES ---
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsLocalAudioMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsLocalVideoMuted(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  // --- SOCKET EVENT LISTENERS ---
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, offer }) => {
      console.log(`[WebRTC] Incoming call from ${from.name}`);
      
      // Save offer ref immediately
      offerRef.current = offer;
      
      if (callStateRef.current === "idle" && !isProcessingCall.current) {
        // Dispatch to Redux for global UI
        dispatch(setIncomingCall({ from, offer }));
        
        setIncomingCallFrom(from);
        setCallState("receiving");
      } else {
        console.warn("User busy, ignoring incoming call.");
        // Optional: Emit busy signal
      }
    };

    const handleCallAnswered = async ({ answer }) => {
      console.log("[WebRTC] Call answered");
      if (peerConnectionRef.current) {
        try {
          const remoteDesc = new RTCSessionDescription(answer);
      await peerConnectionRef.current.setRemoteDescription(remoteDesc);
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          
          // Process candidates that arrived before answer
          if (iceCandidateBuffer.current.length > 0) {
             for (const candidate of iceCandidateBuffer.current) {
               await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
             }
             iceCandidateBuffer.current = [];
          }
          
          setCallState("connected");
        } catch (error) {
          console.error("Error setting remote description (answer):", error);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      } else {
        iceCandidateBuffer.current.push(candidate);
      }
    };

    const handleHangUp = () => {
      console.log("[WebRTC] Remote user hung up");
      cleanupCall();
    };

    const handleUserOffline = () => {
      alert("User is offline");
      cleanupCall();
    };

    socket.on("webrtc:incoming-call", handleIncomingCall);
    socket.on("webrtc:call-answered", handleCallAnswered);
    socket.on("webrtc:ice-candidate", handleIceCandidate);
    socket.on("webrtc:hang-up", handleHangUp);
    socket.on("webrtc:user-offline", handleUserOffline);

    return () => {
      socket.off("webrtc:incoming-call", handleIncomingCall);
      socket.off("webrtc:call-answered", handleCallAnswered);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
      socket.off("webrtc:hang-up", handleHangUp);
      socket.off("webrtc:user-offline", handleUserOffline);
    };
  }, [socket, cleanupCall, dispatch]);

  // Unmount Cleanup
  useEffect(() => {
    return () => {
      if (callStateRef.current !== "idle") {
        cleanupCall();
      }
    };
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    hangUp,
    incomingCallFrom,
    isLocalAudioMuted,
    isLocalVideoMuted,
    toggleAudio,
    toggleVideo,
  };
};
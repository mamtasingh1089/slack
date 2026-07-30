import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverURL } from "../main";
import { isManualPauseActive, isOutsideNotificationSchedule } from "../../../backend/config/notificationHelper.js";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; 

const useListenMessages = () => {
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user); 
  const [preferences, setPreferences] = useState(null);

  // Fetch preferences when user changes to get the "muteAll" and "schedule" settings
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        if (user?._id) {
          const res = await axios.get(`${serverURL}/api/preferences/${user._id}`);
          setPreferences(res.data);
        }
      } catch (err) {
        console.error("Hook: Error fetching preferences", err);
      }
    };
    fetchPrefs();
  }, [user?._id]);

useEffect(() => {
  if (!socket || !user) return;

  const handleNotificationSound = (payload) => {
    // normalize message
    const msg =
      payload?.message ||
      payload?.newMessage ||
      payload;

    if (!msg) return;

    // ❌ Don't play sound for own message
    const senderId = msg?.sender?._id || msg?.sender || payload?.senderId;
    if (String(senderId) === String(user._id)) return;

    // 🔕 1. MUTE ALL
    if (preferences?.notifications?.sounds?.muteAll) return;

    // 🔕 2. SCHEDULE CHECK
    const outsideSchedule = isOutsideNotificationSchedule(preferences);

    // 🔕 3. MANUAL DND
    const manualPaused = isManualPauseActive(user);

    // 🌟 4. VIP LOGIC
    const vipEnabled =
      preferences?.notifications?.messagingDefaults?.vipMessages;

    const isVipSender = user?.vips?.some(
      vipId => String(vipId) === String(senderId)
    );

    if ((outsideSchedule || manualPaused) && !(vipEnabled && isVipSender)) {
      return;
    }

    // 🔊 5. PLAY SOUND
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.play().catch(() => {});
  };

  // ✅ DM MESSAGE SOUND
  socket.on("newMessage", handleNotificationSound);

  // ✅ CHANNEL MESSAGE SOUND (ADDED)
  socket.on("newChannelMessage", handleNotificationSound);

  // ✅ CHANNEL NOTIFICATION SOUND (KEPT)
  socket.on("channelNotification", handleNotificationSound);

  return () => {
    socket.off("newMessage", handleNotificationSound);
    socket.off("newChannelMessage", handleNotificationSound);
    socket.off("channelNotification", handleNotificationSound);
  };
}, [socket, user, preferences]);

};

export default useListenMessages;
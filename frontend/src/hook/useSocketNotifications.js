// Example: src/hooks/useSocketNotifications.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../redux/notificationSlice";

export default function useSocketNotifications() {
  const dispatch = useDispatch();
  const { socket } = useSelector(s => s.socket || {});

  useEffect(() => {
    if (!socket) return;

    const handler = (payload) => {
      // payload shape we used on server: { id, type, title, body, data, createdAt }
      // normalize
      const notif = {
        id: payload.id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        createdAt: payload.createdAt || new Date().toISOString(),
        isRead: false
      };
      dispatch(addNotification(notif));
    };

    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket, dispatch]);
}

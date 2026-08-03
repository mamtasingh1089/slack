// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { setNotifications } from '../redux/notification.js'; // Assuming you have this action

// const NotificationDropdown = () => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [notifications, setLocalNotifications] = useState([]);

//     // 1. Fetch notifications when the component loads
//     useEffect(() => {
//         const fetchNotifications = async () => {
//             try {
//                 // Use the new, clean API route
//                 const res = await axios.get(`${serverURL}/api/notifications/`, authHeaders());
//                 setLocalNotifications(res.data.notifications);
//                 // Optionally update Redux store
//                 dispatch(setNotifications(res.data.notifications));
//             } catch (error) {
//                 console.error("Failed to fetch notifications:", error);
//             }
//         };
//         fetchNotifications();
//     }, [dispatch]);

//     // 2. Handle clicking a notification
//     const handleNotificationClick = async (notification) => {
//         try {
//             // Mark it as read on the backend
//             await handleMarkNotification(notification._id);
//             // Navigate the user to the relevant chat
//             navigate(`/dm/${notification.actorId}`);
//         } catch (error) {
//             console.error("Error handling notification click:", error);
//         }
//     };

//     // 3. Handle marking a notification as read (can be called by the click handler)
//     const handleMarkNotification = async (notificationId) => {
//         try {
//             // Use the new, clean API route
//             await axios.put(`${serverURL}/api/notifications/${notificationId}/read`, {}, authHeaders());
//             // Update the local UI to show it as read
//             setLocalNotifications(prev =>
//                 prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
//             );
//         } catch (error) {
//             console.error("Error marking notification as read:", error);
//         }
//     };

//     return (
//         <div className="notification-dropdown">
//             <h3>Notifications</h3>
//             {notifications.length === 0 ? (
//                 <p>No new notifications.</p>
//             ) : (
//                 <ul>
//                     {notifications.map(notif => (
//                         <li
//                             key={notif._id}
//                             className={notif.isRead ? 'read' : 'unread'}
//                             onClick={() => handleNotificationClick(notif)}
//                         >
//                             <p>{notif.title}</p>
//                             <span>{notif.body}</span>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// // Helper function, should be in a utility file
// const authHeaders = () => {
//     const token = localStorage.getItem("token");
//     return { headers: { Authorization: `Bearer ${token}` } };
// };

// export default NotificationDropdown;
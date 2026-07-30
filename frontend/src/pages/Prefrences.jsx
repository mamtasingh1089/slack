import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverURL } from "../main";
// Added Redux to update the global user state so the "z" icon disappears immediately
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

// --- HELPER FUNCTIONS FOR DETECTION ---
// These allow the Preferences panel to know if notifications are currently silenced
const isManualPauseActive = (user) => {
  if (!user || !user.notificationPausedUntil) return false;
  const pausedUntil = new Date(user.notificationPausedUntil);
  const now = new Date();
  return now < pausedUntil;
};

const isOutsideNotificationSchedule = (preferences) => {
  if (!preferences || !preferences.notifications?.schedule) return false;
  const { schedule } = preferences.notifications;
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[now.getDay()];
  const todaySchedule = schedule.days?.find(d => d.day === currentDayName);
  
  if (!todaySchedule || todaySchedule.enabled === false) return true;

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    let hoursInt = parseInt(hours, 10);
    const minutesInt = parseInt(minutes, 10);
    if (modifier === 'PM' && hoursInt < 12) hoursInt += 12;
    if (modifier === 'AM' && hoursInt === 12) hoursInt = 0;
    const d = new Date();
    d.setHours(hoursInt, minutesInt, 0, 0);
    return d;
  };

  const startTime = parseTime(todaySchedule.start);
  const endTime = parseTime(todaySchedule.end);
  return now < startTime || now > endTime;
};

const Preferences = ({ onClose, userId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // Get user for live pause status
  const [activeTab, setActiveTab] = useState("Notifications");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const sidebarItems = [
    { name: "Notifications", icon: "🔔" },
    { name: "VIP", icon: "⭐" },
    { name: "Navigation", icon: "🧭" },
    { name: "Home", icon: "🏠" },
    { name: "Appearance", icon: "✨" },
    { name: "Messages & media", icon: "💬" },
    { name: "Language & region", icon: "🌐" },
    { name: "Accessibility", icon: "♿" },
    { name: "Mark as read", icon: "✔️" },
    { name: "Audio and video", icon: "🎥" },
    { name: "Salesforce", icon: "☁️" },
    { name: "Connected accounts", icon: "🔗" },
    { name: "Privacy and visibility", icon: "🔒" },
    { name: "Slack AI", icon: "✨" },
    { name: "Advanced", icon: "⚙️" },
  ];

  const defaultSettingsSkeleton = {
    messagingDefaults: {
      desktopNotifications: true,
      mobileNotifications: true,
      notifyAbout: "Everything",
      threadReplies: true,
      vipMessages: false,
      newHuddles: true,
      includeThreadBadge: true,
      mobileOverrides: false,
    },
    channelKeywords: "",
    schedule: {
      type: "Every day",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => ({
        day: d,
        start: "9:00 AM",
        end: "6:00 PM",
        enabled: true
      }))
    },
    reminderTime: "9:00 AM",
    inactivity: {
      mobileNotifyMode: "As soon as I'm inactive",
      twoWeekSummary: true
    },
    sounds: {
      includeThreadBadge: true,
      includePreview: true,
      muteAll: false,
      notificationSound: "Knock Brush",
      vipSound: "Knock Brush",
      sendingSound: "None",
      receivingSound: "None",
      muteHuddles: false,
      huddleSound: "Boop Plus",
      flashWindow: "When left idle",
      deliverVia: "Windows Action Centre"
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverURL}/api/preferences/${userId}`);
        
        if (res.data && res.data.notifications) {
          setSettings({
            ...defaultSettingsSkeleton,
            ...res.data.notifications,
            inactivity: { ...defaultSettingsSkeleton.inactivity, ...res.data.notifications.inactivity },
            messagingDefaults: { ...defaultSettingsSkeleton.messagingDefaults, ...res.data.notifications.messagingDefaults }
          });
        } else {
          setSettings(defaultSettingsSkeleton);
        }
      } catch (err) {
        setSettings(defaultSettingsSkeleton);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  // --- NEW RESUME FUNCTION FOR PREFERENCES ---
const handleResumeFromPrefs = async () => {
  try {
    // 1. Check if we are outside work hours
    const isOutside = isOutsideNotificationSchedule({ notifications: settings });
    let payload = { resumeNotifications: true };

    if (isOutside) {
      // 2. Set override until tomorrow morning 9AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      payload.scheduleOverrideUntil = tomorrow.toISOString();
    }

    const res = await axios.patch(`${serverURL}/api/preferences/${userId}`, payload);
    
    // 3. Update Redux immediately
    if (res.data.user) {
      dispatch(setUser(res.data.user)); // This clears the "z" badge globally
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  } catch (err) {
    console.error("Resume error:", err);
  }
};

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`${serverURL}/api/preferences/${userId}`, {
        notifications: settings
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving preferences. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1c1d]/70 backdrop-blur-[2px]">
      <div className="bg-white p-6 rounded-lg shadow-xl font-bold">Loading Preferences...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1c1d]/70 backdrop-blur-[2px] p-4 font-sans">
      <div className="flex h-full max-h-[850px] w-full max-w-[920px] overflow-hidden rounded-lg bg-white shadow-2xl border border-gray-300">
        
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-[#f8f8f8] py-8 flex flex-col">
          <h2 className="px-6 mb-4 text-[26px] font-black text-[#1d1c1d]">Preferences</h2>
          <nav className="overflow-y-auto flex-1 scrollbar-hide">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-center gap-3 px-6 py-1 text-[15px] transition-colors ${
                  activeTab === item.name ? "bg-[#1264a3] text-white font-medium" : "text-[#1d1c1d] hover:bg-[#e8e8e8]"
                }`}
              >
                <span>{item.icon}</span> {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col bg-white overflow-hidden">
          <button onClick={onClose} className="absolute right-6 top-6 z-10 text-gray-400 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="flex-1 overflow-y-auto p-10 pt-14 custom-scrollbar text-left">
            {activeTab === "Notifications" ? (
                <>
                  {/* RESUME BANNER: Shows only if DND is active either manually or by schedule */}
                  {(isManualPauseActive(user) || isOutsideNotificationSchedule({ notifications: settings })) && (
                    <div className="mb-8 flex items-center justify-between rounded-md bg-[#fdf2d0] p-4 border border-[#f3d371]">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🔕</span>
                        <div className="text-[15px] text-[#1d1c1d]">
                          <strong>Notifications are paused.</strong> You aren't receiving notifications right now.
                        </div>
                      </div>
                      <button 
                        onClick={handleResumeFromPrefs}
                        className="text-[15px] font-bold text-[#1264a3] hover:underline"
                      >
                        Resume notifications
                      </button>
                    </div>
                  )}
                  <NotificationSettings settings={settings} setSettings={setSettings} />
                </>
            ) : (
               <div className="flex h-64 items-center justify-center text-gray-400 italic">Settings for {activeTab} coming soon...</div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="border-t p-4 px-10 bg-[#f8f8f8] flex justify-end">
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`px-8 py-2 rounded-md font-bold text-white transition-all shadow-sm ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 
                  saveSuccess ? 'bg-green-600' : 'bg-[#1264a3] hover:bg-[#0e4a78]'
                }`}
             >
                {isSaving ? "Saving..." : saveSuccess ? "Saved! ✓" : "Save Changes"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = ({ settings, setSettings }) => {
  const updateField = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-10 text-[#1d1c1d]">
      {/* 1. Messaging Defaults */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">Messaging defaults</h3>
            <button className="text-[#1264a3] text-sm hover:underline flex items-center gap-1">
                <span className="border border-[#1264a3] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">?</span> About notifications
            </button>
        </div>
        <p className="text-[15px] text-gray-600 mb-6">Tell us what you'd generally like to be notified about. You can also set specific rules for specific conversations.</p>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-[15px] mb-3">How to notify you</h4>
            <div className="space-y-3">
              <Checkbox label="Desktop notifications" checked={settings.messagingDefaults.desktopNotifications} onChange={e => updateField('messagingDefaults.desktopNotifications', e.target.checked)} />
              <Checkbox label="Mobile notifications" checked={settings.messagingDefaults.mobileNotifications} onChange={e => updateField('messagingDefaults.mobileNotifications', e.target.checked)} />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[15px] mb-2">What to notify you about</h4>
            <CustomSelect options={["Everything", "Direct messages, mentions & keywords", "Nothing"]} value={settings.messagingDefaults.notifyAbout} onChange={e => updateField('messagingDefaults.notifyAbout', e.target.value)} icon="🔔" />
          </div>

          <div>
            <h4 className="font-bold text-[15px] mb-3">Also notify you about:</h4>
            <div className="space-y-3">
              <Checkbox label="Thread replies" checked={settings.messagingDefaults.threadReplies} onChange={e => updateField('messagingDefaults.threadReplies', e.target.checked)} />
              <Checkbox label="Messages from VIPs, even if notifications are paused" checked={settings.messagingDefaults.vipMessages} onChange={e => updateField('messagingDefaults.vipMessages', e.target.checked)} />
              <Checkbox label="New huddles" checked={settings.messagingDefaults.newHuddles} onChange={e => updateField('messagingDefaults.newHuddles', e.target.checked)} />
              <Checkbox label="Include thread replies in badge counts on Activity" checked={settings.messagingDefaults.includeThreadBadge} onChange={e => updateField('messagingDefaults.includeThreadBadge', e.target.checked)} />
              <Checkbox label="Set up mobile overrides" checked={settings.messagingDefaults.mobileOverrides} onChange={e => updateField('messagingDefaults.mobileOverrides', e.target.checked)} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Channel Keywords */}
      <section>
        <h4 className="font-bold text-[15px] mb-1">Channel keywords</h4>
        <p className="text-sm text-gray-500 mb-2">These act like mentions, but can be set for topics that are important to you. <span className="text-[#1264a3] cursor-pointer hover:underline">Learn more.</span></p>
        <textarea 
            className="w-full border border-gray-300 rounded p-3 h-24 focus:ring-1 focus:ring-[#1264a3] outline-none" 
            placeholder="e.g. status, design, meeting"
            value={settings.channelKeywords}
            onChange={(e) => updateField('channelKeywords', e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">Use commas to separate each keyword. Keywords are not case sensitive.</p>
      </section>

      {/* 3. Notification Schedule */}
      <section className="pt-8 border-t border-gray-200">
        <h3 className="text-lg font-black mb-4">Notification schedule</h3>
        <div className="mb-4">
          <label className="block text-[15px] font-bold mb-2">Allow notifications:</label>
          <select className="border border-gray-300 rounded px-3 py-1.5 w-44 outline-none focus:ring-1 focus:ring-[#1264a3]" value={settings.schedule.type} onChange={e => updateField('schedule.type', e.target.value)}>
            <option>Every day</option>
            <option>Custom</option>
          </select>
        </div>
        <div className="space-y-2">
          {daysList.map((day, idx) => (
            <div key={day} className="flex items-center gap-4">
              <span className="w-24 text-[15px] text-gray-700">{day}</span>
              <TimeSelect value={settings.schedule.days[idx]?.start || "9:00 AM"} onChange={v => {
                const newDays = [...settings.schedule.days];
                newDays[idx].start = v;
                updateField('schedule.days', newDays);
              }} />
              <span className="text-gray-400">to</span>
              <TimeSelect value={settings.schedule.days[idx]?.end || "6:00 PM"} onChange={v => {
                const newDays = [...settings.schedule.days];
                newDays[idx].end = v;
                updateField('schedule.days', newDays);
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Reminder & Desktop Activity */}
      <section className="pt-8 border-t border-gray-200 space-y-8">
        <div>
            <h4 className="font-bold text-[15px] mb-2">Set a default time for reminder notifications:</h4>
            <TimeSelect width="w-48" value={settings.reminderTime} onChange={v => updateField('reminderTime', v)} />
            <p className="text-sm text-gray-500 mt-2"><span className="text-[#1264a3] cursor-pointer hover:underline">Reminders that you set</span> for a specific day will be sent at the time that you select.</p>
        </div>

        <div>
            <h4 className="font-bold text-[15px] mb-1">When you’re not active on desktop...</h4>
            <p className="text-sm text-gray-500 mb-3">Send notifications to my <span className="font-bold text-gray-900">mobile devices</span>:</p>
            <select className="border border-gray-300 rounded px-3 py-2 w-full max-w-md mb-4 outline-none focus:ring-1 focus:ring-[#1264a3]" value={settings.inactivity?.mobileNotifyMode ||  "As soon as I'm inactive"} onChange={e => updateField('inactivity.mobileNotifyMode', e.target.value)}>
                <option>As soon as I'm inactive</option>
                <option>After I'm inactive for 2 minutes</option>
                <option>After I'm inactive for 5 minutes</option>
            </select>
            <Checkbox label="If I'm not active for more than two weeks, send me a mobile notification, summarising activity that I've missed" checked={settings.inactivity.twoWeekSummary} onChange={e => updateField('inactivity.twoWeekSummary', e.target.checked)} />
            <div className="mt-4">
                <button className="border border-gray-300 rounded px-4 py-1.5 text-sm font-bold hover:bg-gray-50 transition-colors">Set email notifications ↗</button>
            </div>
        </div>
      </section>

      {/* 5. Sounds & Appearance */}
      <section className="pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black">Sounds & appearance</h3>
            <button className="text-[#1264a3] text-sm hover:underline">Get help</button>
        </div>
        <button className="border border-gray-300 rounded px-4 py-1.5 text-sm font-bold mb-6 hover:bg-gray-50">Show an example</button>
        
        <div className="space-y-4 mb-8">
            <Checkbox label="Include thread replies in badge count on Activity" checked={settings.sounds.includeThreadBadge} onChange={e => updateField('sounds.includeThreadBadge', e.target.checked)} />
            <Checkbox label="Include a preview of the message in each notification (disable this for extra privacy)" checked={settings.sounds.includePreview} onChange={e => updateField('sounds.includePreview', e.target.checked)} />
            <Checkbox label="Mute all messaging sounds from Slack" checked={settings.sounds.muteAll} onChange={e => updateField('sounds.muteAll', e.target.checked)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <SoundRow label="Notification sound" value={settings.sounds.notificationSound} onChange={v => updateField('sounds.notificationSound', v)} />
            <SoundRow label="Notification sound (VIP messages only)" value={settings.sounds.vipSound} onChange={v => updateField('sounds.vipSound', v)} subtext="Add to your VIP list to enable sound" />
            <SoundRow label="Notification sound (sending a message)" value={settings.sounds.sendingSound} onChange={v => updateField('sounds.sendingSound', v)} />
            <SoundRow label="Notification sound (receiving a message while in conversation)" value={settings.sounds.receivingSound} onChange={v => updateField('sounds.receivingSound', v)} />
        </div>

        <div className="mt-8 space-y-6">
            <Checkbox label="Mute all huddle sounds from Slack" checked={settings.sounds.muteHuddles} onChange={e => updateField('sounds.muteHuddles', e.target.checked)} />
            <SoundRow label="Notification sound (huddles)" value={settings.sounds.huddleSound} onChange={v => updateField('sounds.huddleSound', v)} />
            
            <div>
                <h4 className="font-bold text-[15px] mb-2">Flash window when a notification is received</h4>
                <div className="space-y-2">
                    {["Never", "When left idle", "Always"].map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="flash" checked={settings.sounds.flashWindow === opt} onChange={() => updateField('sounds.flashWindow', opt)} className="w-4 h-4 accent-[#1264a3] cursor-pointer" />
                            <span className="text-[15px]">{opt} {opt === "When left idle" && <span className="text-xs text-gray-400 ml-1">(inactive for at least ten seconds)</span>}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-[15px] mb-2">Deliver notifications via...</h4>
                <select className="border border-gray-300 rounded px-3 py-2 w-full max-w-md outline-none focus:ring-1 focus:ring-[#1264a3]" value={settings.sounds.deliverVia} onChange={e => updateField('sounds.deliverVia', e.target.value)}>
                    <option>Windows Action Centre</option>
                    <option>Slack Built-in</option>
                </select>
            </div>
        </div>
      </section>
    </div>
  );
};

// Reusable Sub-components
const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className="relative flex items-center mt-[3px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer h-[16px] w-[16px] rounded border border-gray-400 checked:bg-[#007a5a] checked:border-[#007a5a] appearance-none cursor-pointer" />
      <svg className="absolute w-3 h-3 text-white left-[2px] hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>
    </div>
    <span className="text-[15px] text-[#1d1c1d] leading-tight">{label}</span>
  </label>
);

const CustomSelect = ({ options, value, onChange, icon }) => (
  <div className="relative w-full max-w-md">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px]">{icon}</span>
    <select value={value} onChange={onChange} className="w-full appearance-none border border-gray-300 rounded-md pl-10 pr-10 py-2.5 outline-none focus:ring-1 focus:ring-[#1264a3] text-[15px] bg-white">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </div>
  </div>
);

const TimeSelect = ({ value, onChange, width = "w-32" }) => {
   const times = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    const ampm = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${min} ${ampm}`;
   });
   return (
        <select className={`border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none focus:ring-1 focus:ring-[#1264a3] ${width}`} value={value} onChange={e => onChange(e.target.value)}>
           {times.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
    );
};

const SoundRow = ({ label, value, onChange, subtext }) => (
    <div className="space-y-1.5">
        <label className="block text-[14px] font-bold text-[#1d1c1d]">{label}</label>
        {subtext && <p className="text-[13px] text-[#1264a3] cursor-pointer hover:underline mb-1">{subtext}</p>}
        <div className="relative">
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none bg-white outline-none focus:ring-1 focus:ring-[#1264a3]" value={value} onChange={e => onChange(e.target.value)}>
                <option>Knock Brush</option>
                <option>Boop Plus</option>
                <option>Ding</option>
                <option>None</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </div>
    </div>
);

export default Preferences;
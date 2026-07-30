import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export default function Invite({ workspaceName = "Koalaliving", onClose }) {
  // Access 'allChannels' from Redux safely
  const allChannels = useSelector((state) => state.channel.allChannels) || [];
  
  const [emailText, setEmailText] = useState("");
  const [emails, setEmails] = useState([]);
  
  const [role, setRole] = useState("Member");
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [channelSearch, setChannelSearch] = useState("");
  const [message, setMessage] = useState("");

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 50);

    // Handle Escape key
    const onKey = (e) => {
      if (e.key === "Escape") {
        if(onClose) onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const addEmailToken = (raw) => {
    if (!raw) return;
    const split = raw
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!split.length) return;
    setEmails((prev) => {
      const next = [...prev];
      for (const e of split) {
        if (!next.some((t) => t.value.toLowerCase() === e.toLowerCase())) {
          next.push({ value: e, valid: isValidEmail(e) });
        }
      }
      return next;
    });
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addEmailToken(emailText);
      setEmailText("");
    } else if (e.key === "Backspace" && !emailText && emails.length) {
      setEmails((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const removeEmail = (value) => {
    setEmails((prev) => prev.filter((t) => t.value !== value));
  };

  const toggleChannel = (id) => {
    setSelectedChannels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCopyInviteLink = async () => {
    const link = `${window.location.origin}/invite/${workspaceName.toLowerCase()}`; 
    try {
      await navigator.clipboard.writeText(link);
      alert("Invite link copied to clipboard");
    } catch {
      alert("Unable to copy link");
    }
  };

  const handleSend = async () => {
    const valid = emails.filter((e) => e.valid).map((e) => e.value);
    if (!valid.length) {
      alert("Please add at least one valid email.");
      return;
    }
    try {
      const payload = {
        emails: valid,
        role,
        channels: selectedChannels,
        message,
        workspace: workspaceName,
      };
      
      const res = await axios.post(
        "/api/invite/invitelink",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Invite response:", res.data);
      alert(`Invites sent to ${valid.length} user(s).`);

      // Reset form
      setEmails([]);
      setEmailText("");
      setMessage("");
      setSelectedChannels([]);
      
      // Close modal on success
      if(onClose) onClose();

    } catch (err) {
      console.error("Invite request failed:", err);
      const msg = err?.response?.data?.error || err.message || "Unknown error";
      alert("Error sending invites: " + msg);
    }
  };

  const filteredChannels = allChannels.filter((c) => 
    c.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const validCount = emails.filter((e) => e.valid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4">
      {/* 
         1. BACKDROP CLICK CLOSES MODAL 
      */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl z-60 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Invite people to {workspaceName}</h3>
          {/* 
             2. X BUTTON CLOSES MODAL
          */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-800 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          {/* Email Section */}
          <div>
            <label className="text-sm font-bold">Send to</label>
            <div className="mt-2">
              <div className="min-h-[56px] border rounded-md p-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-500">
                {emails.map((t) => (
                  <div
                    key={t.value}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      t.valid ? "bg-indigo-100 text-indigo-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span>{t.value}</span>
                    <button
                      onClick={() => removeEmail(t.value)}
                      className="text-xs font-bold ml-1 hover:text-black"
                      aria-label={`Remove ${t.value}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <input
                  ref={inputRef}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={() => {
                    addEmailToken(emailText);
                    setEmailText("");
                  }}
                  placeholder="name@gmail.com"
                  className="flex-1 min-w-[160px] outline-none px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Role select */}
          <div>
            <label className="text-sm font-medium text-gray-700">Invite as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option>Member</option>
              <option>Guest</option>
              <option>Admin</option>
            </select>
          </div>

          {/* Channels */}
          <div>
            <label className="text-sm font-medium text-gray-700">Add to team channels (optional)</label>
            <p className="text-xs text-gray-500 mt-1 mb-2">Make sure your teammates are in the right conversations from the get go.</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {allChannels.slice(0, 3).map((c) => (
                <button
                  key={c._id}
                  onClick={() => toggleChannel(c._id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedChannels.includes(c._id) ? "bg-sky-100 border-sky-400 text-sky-700" : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {selectedChannels.includes(c._id) ? "✓ " : "+ "}{c.name}
                </button>
              ))}
            </div>

            <div>
              <input
                placeholder="Search channels"
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              {channelSearch && (
                <div className="mt-2 max-h-36 overflow-auto border rounded-md p-1 bg-white shadow-sm">
                  {filteredChannels.length ? (
                    filteredChannels.map((c) => (
                      <div key={c._id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded">
                        <div className="text-sm text-gray-700"># {c.name}</div>
                        <button
                          onClick={() => toggleChannel(c._id)}
                          className={`text-xs px-2 py-1 rounded border ${
                            selectedChannels.includes(c._id) ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          {selectedChannels.includes(c._id) ? "Added" : "Add"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 px-3 py-2">No channels match</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Optional message */}
          <div>
            <label className="text-sm font-medium text-gray-700">Add a message (optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a short note to the people you are inviting"
              className="mt-2 w-full border rounded-md p-2 text-sm resize-none"
            />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 mt-auto">
            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-2 text-gray-600 font-medium text-sm hover:underline"
            >
              🔗 Copy invite link
            </button>

            <div className="flex items-center gap-3">
              {/* 
                 3. CANCEL BUTTON CLOSES MODAL
              */}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 bg-white font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSend}
                disabled={validCount === 0}
                className={`px-4 py-2 rounded-md text-sm text-white font-medium shadow-sm transition-colors ${
                    validCount > 0 ? "bg-green-700 hover:bg-green-800" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Send
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
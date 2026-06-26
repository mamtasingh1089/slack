// src/pages/Team.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";
import { CiSaveDown2 } from "react-icons/ci";
import { FiSend } from "react-icons/fi";
import { LuLink } from "react-icons/lu";
import googlelogo from "../assets/googlelogo.webp";
import dp from "../assets/dp.webp";
import { useSelector, useDispatch } from "react-redux";
import { setWorkspace } from "../redux/workspaceSlice";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_API_URL || "";
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "";

const Team = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const workspace = useSelector((state) => state.workspace.workspace);
  const slackUser = useSelector((state) => state.slackUser.slackUser);

  // local state
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [emails, setEmails] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const fileInputRef = useRef(null);

  // headers with token
  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // photo choose
  const onChoosePhoto = () => fileInputRef.current?.click();

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleAddEmail = (email) => {
    const cleaned = email.trim();
    if (!isValidEmail(cleaned)) return;
    if (emails.includes(cleaned)) {
      setEmailInput("");
      return;
    }
    setEmails((prev) => [...prev, cleaned]);
    setEmailInput("");
  };

  const getHelperMessage = (input) => {
    const val = input.trim();
    if (!val) return "";
    if (isValidEmail(val)) return "";
    if (!val.includes("@"))
      return "Keep typing a full email (e.g. name@company.com)";
    const afterAt = val.split("@")[1] || "";
    if (!afterAt.includes(".")) return "Add a domain after @ (e.g. gmail.com)";
    return "Keep typing a full email";
  };

  const handleRemoveEmail = (email) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  // photo change
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    const id = workspace?._id || workspace?.id;
    if (!id) {
      alert("Please create the workspace first.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("profileImage", file);

      const res = await axios.patch(`${SERVER_URL}/api/workspace/${id}`, fd, {
        headers: { ...authHeader() },
      });

      const updated = res?.data?.workspace ?? res?.data;
      if (updated) {
        dispatch(setWorkspace(updated));
        setPhotoPreview(null);
        setPhotoFile(null);
        alert("Profile photo updated");
      }
    } catch (err) {
      console.error("Failed to upload photo:", err);
      alert(
        err?.response?.data?.message || err.message || "Photo upload failed"
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = async () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ Invite link
  const makeInviteLink = (wsId, email = "") =>
    `${CLIENT_URL}/join?workspace=${wsId}${
      email ? `&email=${encodeURIComponent(email)}` : ""
    }`;

  // create workspace
  const handleNext = async () => {
    if (!workspaceName.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${SERVER_URL}/api/workspace/createworkspace`,
        { name: workspaceName.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const created = res?.data?.workspace ?? res?.data;
      if (!created) throw new Error("Invalid create workspace response");
      dispatch(setWorkspace(created));
      navigate("/slackpro");
    } catch (err) {
      console.error("Failed to create workspace", err);
      alert(
        err?.response?.data?.message || err.message || "Create workspace failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // send invites
  const handleSend = async () => {
    const valid = emails.filter((e) => isValidEmail(e));
    if (!valid.length) {
      alert("Please add at least one valid email.");
      return;
    }

    const id = workspace?._id || workspace?.id;
    if (!id) {
      alert("Create the workspace first (click Next)");
      return;
    }

    try {
      setLoading(true);
      const payload = { emails: valid };

      const res = await axios.post(
        `${SERVER_URL}/api/workspace/${id}/invite`,
        payload,
        { headers: { "Content-Type": "application/json", ...authHeader() } }
      );

      console.log("Invite response:", res.data);
      alert(`Invites sent to ${valid.length} user(s).`);
      setEmails([]);
    } catch (err) {
      console.error("Invite request failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Unknown error";
      alert("Error sending invites: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLinkForEmail = async (email) => {
    const id = workspace?._id || workspace?.id;
    if (!id) {
      alert("Create the workspace first (click Next)");
      return;
    }
    const link = makeInviteLink(id, email);
    try {
      await navigator.clipboard.writeText(link);
      alert(`Invite link for ${email} copied!`);
    } catch {
      prompt("Copy this invite link", link);
    }
  };

  const handleCopyInviteLinkAll = async () => {
    const id = workspace?._id || workspace?.id;
    if (!id) {
      alert("Create the workspace first (click Next)");
      return;
    }
    if (emails.length === 0) {
      alert("No emails added");
      return;
    }
    const links = emails.map((e) => makeInviteLink(id, e)).join("\n");
    try {
      await navigator.clipboard.writeText(links);
      alert("Invite links copied!");
    } catch {
      prompt("Copy these invite links", links);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isValidEmail(emailInput)) handleAddEmail(emailInput);
    }
  };

  const avatarBgClass = workspaceName.trim() ? "bg-[#724875]" : "bg-[#1f1a2a]";

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#0b0b0b]">
      <div className="flex-shrink-0 bg-[#2b0f2b] w-full h-[56px]" />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="hidden md:flex bg-[#2b0f2b] w-[72px] h-full flex-col py-[20px] items-center">
          <div
            className={`w-10 h-10 rounded-2xl ${avatarBgClass} text-white border border-[#2f1030] font-bold flex items-center justify-center`}
          >
            {workspace?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="mt-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onChoosePhoto}
              className="text-xs text-gray-300 hover:text-white"
            >
              Change Photo
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          <div className="flex flex-col py-[30px] mt-6">
            <button
              onClick={() => navigate("/home")}
              className="flex flex-col items-center my-[10px] bg-[#481349] justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
            >
              <RiHome4Fill className="text-2xl" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button
              onClick={() => navigate("/saved")}
              className="flex flex-col items-center bg-[#481349] justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
            >
              <CiSaveDown2 className="text-2xl" />
              <span className="text-xs mt-1">Later</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden md:flex flex-col bg-gradient-to-b from-[#481349] to-[#4f1147] w-[340px] px-4 pt-3">
          <div className="text-white font-medium truncate">
            {workspace?.name || ""}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${avatarBgClass} text-white border border-[#2f1030] font-bold flex items-center justify-center`}
            >
              {workspace?.profileImage ? (
                <img
                  src={workspace.profileImage}
                  alt="workspace avatar"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                workspaceName?.charAt(0)?.toUpperCase() || ""
              )}
            </div>
            <div className="text-white">
              <div className="font-semibold">{slackUser?.name || "You"}</div>
              <div className="text-sm opacity-80">{workspace.name}</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-grow overflow-auto bg-white flex justify-center">
          <div className="w-full h-full px-10 py-10">
            <div className="text-sm text-gray-400 mb-6">Step 3 of 4</div>

            <h1 className="text-5xl font-bold mb-4 leading-tight">
              What’s the name of your <br /> company or team?
            </h1>

            <div className="flex flex-row gap-[230px]">
              <p className="mb-4 max-w-2xl font-semibold">
                Add coworker by email
              </p>
              <div className="flex justify-end gap-[10px]">
                <img src={googlelogo} className="w-6 h-6" alt="google" />
                <p className="text-blue-700">Add from Google Contact</p>
              </div>
            </div>

            {/* Email input area */}
            <div className="mb-6 relative max-w-2xl">
              <div className="w-full border rounded-lg p-3 text-black text-lg min-h-[105px] focus-within:ring-4 focus-within:ring-[#2ea7e0]">
                <div className="flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 bg-[#e6f3ff] text-sm px-3 py-1 rounded-full"
                    >
                      <FiSend className="text-lg" />
                      <span>{email}</span>
                      <button
                        onClick={() => handleCopyInviteLinkForEmail(email)}
                        className="px-1 hover:bg-gray-200 rounded"
                      >
                        <LuLink />
                      </button>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="px-1 text-gray-600 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <input
                    id="email-input"
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type an email and press Enter"
                    className="flex-1 min-w-[200px] outline-none text-lg p-1"
                  />
                </div>
              </div>

              {/* helper / suggestion */}
              {isValidEmail(emailInput) ? (
                <div
                  className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow cursor-pointer hover:bg-gray-100 p-3 text-blue-600 max-w-2xl"
                  onClick={() => handleAddEmail(emailInput)}
                >
                  Invite {emailInput}
                </div>
              ) : (
                (() => {
                  const helper = getHelperMessage(emailInput);
                  return helper ? (
                    <div className="absolute left-0 right-0 mt-2 bg-[#f6f4f2] border rounded-lg shadow p-3 text-gray-600 max-w-2xl">
                      {helper}
                    </div>
                  ) : null;
                })()
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-row gap-[15px] items-center">
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-10 py-2 bg-[#2ea7e0] text-white rounded-md font-semibold hover:bg-[#1f91c6] disabled:bg-gray-400"
              >
                {loading ? "Sending..." : "Send invites"}
              </button>
              <button
                onClick={handleCopyInviteLinkAll}
                className="border rounded-xl px-[10px] py-2 flex items-center gap-2 hover:bg-gray-100"
              >
                <LuLink /> Copy Invite Link
              </button>
              <div
                onClick={() => navigate("/slackpro")}
                className="flex items-center cursor-pointer text-sm text-gray-700 hover:underline"
              >
                Skip this step
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;

// src/pages/NameStep.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";
import { CiSaveDown2 } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { setWorkspace } from "../redux/workspaceSlice";
import axios from "axios";
import { serverURL } from "../main.jsx";

const Company = () => {
  const navigate = useNavigate();
  // const [name, setName] = useState("");
  const [owners, setOwners] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const workspace = useSelector((state) => state.workspace.workspace);
  const maxLength = 80;

  // Try to load workspace from localStorage or server on mount if Redux empty
  useEffect(() => {
    const loadWorkspace = async () => {
      if (workspace) return;

      // 1) try localStorage
      const cached = localStorage.getItem("workspace");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          dispatch(setWorkspace(parsed));
          return;
        } catch (e) {
          console.warn("failed to parse cached workspace", e);
        }
      }

      // 2) try server endpoint (optional - may or may not exist)
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${serverURL}/api/workspace/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data?.workspace) {
          dispatch(setWorkspace(res.data.workspace));
          localStorage.setItem("workspace", JSON.stringify(res.data.workspace));
        }
      } catch (err) {
        // it's fine if server call fails; we will create workspace later if needed
        console.warn(
          "no workspace from server (or endpoint not available)",
          err?.message
        );
      }
    };

    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const onChoosePhoto = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // replace your handleSaveCompany with this function
  const handleSaveCompany = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token; user may not be logged in");
        alert("Please sign in before continuing.");
        navigate("/login");
        return;
      }

      // ensure we have a workspace (existing Redux or create it)
      let ws = workspace;
      if (!ws) {
        console.warn("Workspace not loaded yet — creating a new workspace");
        const createBody = {
          name:
            owners && owners.trim()
              ? `${owners.trim()}'s workspace`
              : "My Workspace",
        };
        const createRes = await axios.post(
          `${serverURL}/api/workspace/createworkspace`,
          createBody,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        ws = createRes?.data?.workspace;
        if (!ws) {
          console.error("Failed to create workspace");
          return;
        }
        dispatch(setWorkspace(ws));
        localStorage.setItem("workspace", JSON.stringify(ws));
      }

      // send owners + optional profileImage
      const fd = new FormData();
      // ensure owners is a single string append
      fd.append("owners", owners);
      if (photoFile) fd.append("profileImage", photoFile);

      // dev-only debug: list FormData entries
      for (const pair of fd.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      const patchRes = await axios.patch(
        `${serverURL}/api/workspace/${ws._id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`, // DO NOT set Content-Type — browser will set it
          },
          timeout: 20000,
        }
      );

      const updated = patchRes?.data?.workspace ?? patchRes?.data;
      if (updated) {
        dispatch(setWorkspace(updated));
        localStorage.setItem("workspace", JSON.stringify(updated));
      }

      navigate("/team");
    } catch (err) {
      console.error("Failed to update workspace or create it", err);
      // friendly user feedback
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save. See console."
      );
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#0b0b0b]">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-[#2b0f2b]  w-full h-[56px]" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex bg-[#2b0f2b]  w-[72px] h-full flex-col py-[20px] items-center">
          <div className="w-10 h-10 rounded-2xl bg-[#481349] text-white border border-[#2f1030] p-2 px-4 font-bold flex items-center justify-center">
            {workspace?.name || JSON.parse(localStorage.getItem("workspace"))?.name || "Loading..."}
          </div>

          <div className="flex flex-col py-[30px]">
            <button
              type="button"
              className="flex items-center bg-[#481349] my-[10px] justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
              onClick={() => navigate("/home")}
              aria-label="Home"
            >
              <RiHome4Fill className="text-2xl " />
              <span className="text-xs mt-1">Home</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center h-14 bg-[#481349] w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
              onClick={() => navigate("/saved")}
              aria-label="Saved items"
            >
              <CiSaveDown2 className="text-2xl" />
              <span className="text-xs mt-1">Later</span>
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col bg-gradient-to-b from-[#481349] to-[#4f1147] w-[340px]  px-4 pt-3">
          <div className="text-white font-medium ">{workspace?.name || ""}</div>
          <div className="text-white px-[15px] ">Channels</div>
          <div className="text-white px-[15px] ">Direct message</div>
        </div>

        {/* Main content */}
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="w-full h-full bg-white p-10 shadow-lg">
            <div className="text-sm text-gray-400 mb-6">Step 1 of 4</div>

            <h1 className="text-5xl font-semibold mb-4 leading-tight">
              What’s your name?
            </h1>

            <p className="text-gray-700 mb-8 max-w-2xl">
              Adding your name and profile photo helps your teammates recognize
              and connect with you more easily.
            </p>

            {/* Name input */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={owners}
                  onChange={(e) =>
                    setOwners(e.target.value.slice(0, maxLength))
                  }
                  placeholder="Enter your full name"
                  className="w-full border rounded-lg px-4 py-3 text-black text-lg focus:outline-none focus:ring-4 focus:ring-[#2ea7e0] transition"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 bg-[#0b1220] px-2 rounded">
                  {owners.length}/{maxLength}
                </div>
              </div>
            </div>

            {/* Profile photo */}
            <div className="mb-8">
              <div className="font-medium mb-2">
                Your profile photo{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </div>
              <div className="text-gray-400 mb-4">
                Help your teammates to know they’re talking to the right person.
              </div>

              <div className="flex items-start gap-6">
                <div className="w-28 h-28 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : workspace?.profileImage ? (
                    <img
                      src={workspace.profileImage}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No photo</span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={onChoosePhoto}
                      className="px-4 py-2 bg-gray-500 border border-[#2b3740] rounded-md text-sm text-white hover:bg-[#111827]"
                    >
                      Upload photo
                    </button>

                    {photoPreview && (
                      <button
                        onClick={removePhoto}
                        className="px-4 py-2 bg-transparent border border-[#2b3740] rounded-md text-sm text-gray-300 hover:bg-[#111827]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    Help your teammates confirm it’s you.
                  </div>
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

            {/* Next button */}
            <div className="mt-6">
              <button
                onClick={handleSaveCompany}
                disabled={!owners.trim()}
                className={`px-6 py-3 rounded-md font-semibold text-white ${
                  owners.trim()
                    ? "bg-[#6f2b72] hover:bg-[#5e265f]"
                    : "bg-gray-500 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;

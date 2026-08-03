// src/pages/Welcome.jsx
import React from "react";
import { FiSearch, FiPlus, FiMoreVertical, FiPaperclip } from "react-icons/fi";
import { RiHome4Fill } from "react-icons/ri";
import { CiSaveDown2 } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaHashtag } from "react-icons/fa";
import { AiOutlineSmile, AiOutlineSend } from "react-icons/ai";
import { BiPaperPlane } from "react-icons/bi";

const TemplateCard = ({ title, subtitle, bg = "bg-white" }) => (
  <div
    className={`w-[220px] rounded-xl p-4 ${bg} border border-gray-200 shadow-sm`}
  >
    <div className="text-sm font-semibold mb-2">{title}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
    <div className="mt-4 h-[86px] bg-gray-100 rounded-md" />
  </div>
);

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0b]">
      {/* Top purple bar */}
      <div className="h-14 bg-[#4a1f4a] flex items-center px-4">
        <div className="hidden sm:flex items-center gap-3">
          <button className="p-1 rounded hover:bg-black/10 text-white">
            ⟵
          </button>
          <button className="p-1 rounded hover:bg-black/10 text-white">
            ⟶
          </button>
        </div>

        <div className="flex-1 mx-4">
          <div className="relative max-w-[700px]">
            <input
              type="text"
              placeholder="Search slack"
              className="w-full rounded-full py-2 px-4 pl-10 text-sm bg-white/10 text-white placeholder:text-white/60 focus:outline-none"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-white bg-white/10 px-3 py-1 rounded">
            ?
          </button>
          <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center">
            M
          </div>
        </div>
      </div>

      {/* Body: left rail, left panel, content */}
      <div className="flex flex-1 overflow-hidden">
        {/* thin left rail */}
        <div className="hidden md:flex flex-col items-center w-[72px] bg-[#2b0f2b] py-6 px-2">
          <div className="w-10 h-10 rounded-full text-white border border-[#2f1030] p-2 font-bold flex items-center justify-center bg-[#724875]">
            S
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <button className="flex flex-col items-center justify-center h-12 w-12 rounded-xl hover:bg-gray-700 text-white transition">
              <RiHome4Fill className="text-2xl" />
              <a href="/">
                <span className="text-[10px] mt-1">Home</span>
              </a>
            </button>
            <button className="flex flex-col items-center justify-center h-12 w-12 rounded-xl hover:bg-gray-700 text-white transition">
              <CiSaveDown2 className="text-2xl" />
              <span className="text-[10px] mt-1">Later</span>
            </button>
          </div>
        </div>

        {/* left wide purple panel */}
        <aside className="hidden lg:flex flex-col w-[300px] bg-gradient-to-b from-[#3d0d3e] to-[#4f1147] px-4 pt-6 text-white overflow-auto">
          <div className="text-lg font-semibold">slack</div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="p-3 rounded-md bg-[#5b1f5b]/20">
              30 days left in trial
            </div>

            <div className="mt-4 text-gray-200">Huddles</div>
            <div className="mt-2 text-gray-200">Directories</div>

            <div className="mt-4 text-gray-300 font-medium">Channels</div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
                # all-slack
              </div>
              <div className="flex items-center gap-2 px-2 bg-white/10 rounded-md">
                <FaHashtag />
                <span className="font-medium">new-channel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
                # social
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
                + Add channels
              </div>
            </div>

            <div className="mt-4 text-gray-300 font-medium">
              Direct messages
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="px-2">mamta252002singh</div>
              <div className="px-2">mamta700singh (you)</div>
              <div className="px-2">+ Invite people</div>
            </div>

            <div className="mt-6">
              <div className="text-xs text-gray-300">Apps</div>
              <div className="mt-2 text-sm">Slackbot</div>
            </div>
          </div>
        </aside>

        {/* main content */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="max-w-[1150px] mx-auto px-6 py-6">
            {/* Header row: channel name + right controls */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-semibold flex items-center gap-3">
                  <span className="text-2xl">#</span>
                  <span>new-channel</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Messages &nbsp;•&nbsp; Add canvas
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-3 py-2 rounded border text-sm">
                  Invite teammates
                </button>
                <button className="px-3 py-2 rounded border text-sm">
                  Huddle ▾
                </button>
                <button className="p-2 rounded hover:bg-gray-100">
                  <FiMoreVertical />
                </button>
              </div>
            </div>

            {/* big welcome / template cards */}
            <div className="bg-white rounded-md">
              <h2 className="text-3xl font-extrabold mb-2">
                👋 Welcome to your first channel!
              </h2>
              <p className="text-gray-600 mb-6">
                Channels keep work focused around a specific topic. Pick a
                template to get started, or{" "}
                <span className="text-blue-600">see all</span>.
              </p>

              <div className="flex gap-4 mb-6">
                <TemplateCard
                  title="Run a project"
                  subtitle="Project starter kit template"
                  bg="bg-[#dff7f2]"
                />
                <TemplateCard
                  title="Chat with your team"
                  subtitle="Team support template"
                  bg="bg-[#e8f7e9]"
                />
                <TemplateCard
                  title="Collaborate with external partners"
                  subtitle="External partner template"
                  bg="bg-[#fff0dc]"
                />
                <TemplateCard
                  title="Invite teammates"
                  subtitle="Add your whole team"
                  bg="bg-[#f6e9ff]"
                />
              </div>

              {/* message composer box */}
              <div className="mt-4 border rounded-md">
                {/* formatting toolbar */}
                <div className="flex items-center gap-3 px-3 py-2 border-b bg-gray-50">
                  <button className="text-sm px-2 py-1 rounded hover:bg-gray-100">
                    B
                  </button>
                  <button className="text-sm px-2 py-1 rounded hover:bg-gray-100">
                    I
                  </button>
                  <button className="text-sm px-2 py-1 rounded hover:bg-gray-100">
                    S
                  </button>
                  <button className="text-sm px-2 py-1 rounded hover:bg-gray-100">
                    •
                  </button>
                  <div className="flex-1" />
                  <button className="text-sm px-2 py-1 rounded hover:bg-gray-100">
                    Today ▾
                  </button>
                </div>

                {/* composer */}
                <div className="p-3">
                  <textarea
                    rows={3}
                    placeholder="Message #new-channel"
                    className="w-full resize-none rounded-md p-3 border border-gray-200 focus:outline-none"
                  />

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <button className="p-2 rounded hover:bg-gray-100">
                        <AiOutlineSmile />
                      </button>
                      <button className="p-2 rounded hover:bg-gray-100">
                        <FiPaperclip />
                      </button>
                      <button className="p-2 rounded hover:bg-gray-100">
                        <BiPaperPlane />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 rounded bg-[#5b1f5b] text-white">
                        Send
                      </button>
                      <button className="p-2 rounded hover:bg-gray-100">
                        <AiOutlineSend />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* blue banner bottom (like "AI turned on" in screenshot) */}
              <div className="mt-6 bg-[#0f66d6] text-white px-4 py-3 rounded-b-md">
                AI is turned on for slack.{" "}
                <span className="underline">Learn more</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

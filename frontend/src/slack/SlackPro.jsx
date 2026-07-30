import React from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";
import { CiSaveDown2 } from "react-icons/ci";
import { HiOutlineCheck } from "react-icons/hi";
import { VscTriangleRight } from "react-icons/vsc";


const Feature = ({ title, subtitle, open = false }) => (
  <div className="border-b last:border-b-0 py-4">
    <div className="flex items-start gap-4">
      <div>
        <div className="font-medium text-gray-800">{title}</div>
        {subtitle && (
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  </div>
);

export default function SlackPro() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen flex flex-col bg-[#0b0b0b]">
      {/* Top bar */}
      <div className="h-[56px] bg-[#481349] flex-shrink-0" />

      <div className="flex flex-1 overflow-hidden">
        {/* left thin vertical bar */}
        <aside className="hidden md:flex flex-col items-center w-[72px] bg-[#2b0f2b] py-6 px-2">
          <div className="w-10 h-10 rounded-full text-white border border-[#2f1030] p-2 font-bold flex items-center justify-center bg-[#724875]">
            S
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
            >
              <RiHome4Fill className="text-2xl" />
              <a href="/">
                <span className="text-xs mt-1">Home</span>
              </a>
            </button>

             <button
  onClick={() => navigate("/slackwelcomepage")} // Change "/" to your actual route path
  className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
>
  <RiHome4Fill className="text-2xl" />
  <span className="text-xs mt-1">Workspace</span>
</button>

            <button
              onClick={() => navigate("/saved")}
              className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
            >
              <CiSaveDown2 className="text-2xl" />
              <span className="text-xs mt-1">Later</span>
            </button>
          </div>

          <div className="mt-auto mb-6">
            <div className="w-10 h-10 rounded-full bg-[#2d0e2d] flex items-center justify-center text-xs text-gray-300">
              •••
            </div>
          </div>
        </aside>

        {/* wide purple left panel (like screenshot) */}
        <div className="hidden lg:flex w-[320px] bg-gradient-to-b from-[#3d0d3e] to-[#4f1147] px-6 pt-6 flex-col text-white">
          <div className="text-xl font-semibold">slack</div>
          <nav className="mt-8 space-y-3 text-sm text-gray-200">
            <div className="py-2">Channels</div>
            <div className="py-2">Direct messages</div>
          </nav>

          <div className="mt-auto pb-6">
            <div className="text-xs text-gray-300">More</div>
          </div>
        </div>

        {/* main content and right mock */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="max-w-[1200px] mx-auto px-10 py-5 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* center-left column for content (col-span 7) */}
            <section className="lg:col-span-7">
              <div className="text-sm text-gray-400 mb-2">
                Your workspace is ready to go! ✨
              </div>
              <h1 className="text-5xl font-extrabold mb-4">
                Start with Slack Pro
              </h1>

              <div className="flex gap-[15px]">
                <div className="mt-1 flex-shrink-0 ">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-5 ">
                    <HiOutlineCheck className="text-green-600 w-4 h-4" />
                  </div>
                </div>
                <Feature
                  title="Unlimited message history"
                  subtitle="Search and view all of your team's public messages and files, which are stored indefinitely on a paid plan."
                />
              </div>

              <div className="rounded-lg border border-gray-100 divide-y">
                <div className=" flex items-center gap-[10px]">
                  <VscTriangleRight />{" "}
                  <Feature title="Group meetings with AI notes" />
                </div>
                <div className=" flex items-center gap-[10px]">
                  <VscTriangleRight />{" "}
                  <Feature title="Work with people at other organizations" />
                </div>
                <div className=" flex items-center gap-[10px]">
                  <VscTriangleRight />{" "}
                  <Feature title="AI conversation summaries" />
                </div>

                <div className="p-4">
                  <button className="text-sm text-[#4b2ca1] font-medium">
                    + Compare plans
                  </button>
                </div>
              </div>

              {/* pricing card */}
              <div className="mt-2 max-w-sm">
                <div className="rounded-xl border border-gray-200 p-2 bg-[#f3ecf6]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-white p-2">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect width="24" height="24" rx="6" fill="#FFDEB5" />
                        <path
                          d="M7 11h10M7 15h6"
                          stroke="#9C6B2B"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#6b2d7d]">
                        55% off*
                      </div>
                      <div className="text-xs text-gray-600">
                        ₹294.75 per person/month
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => navigate("/checkout")}
                      className="w-full py-3 rounded-md text-white font-semibold bg-[#0f7a63] hover:bg-[#0e6b55] transition"
                    >
                      Start with Pro
                    </button>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => navigate("/welcome")}
                      className="w-full py-3 rounded-md border border-gray-300 bg-white font-medium"
                    >
                      Start with the Limited Free Version
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    *Limited-time offer subject to change at Slack's discretion.
                  </p>
                </div>
              </div>
            </section>

            {/* right column mock screenshot (col-span 5) */}
            <aside className="lg:col-span-5 flex items-start justify-center">
              {/* If you have a real image, replace the placeholder div with an <img src={mockup} /> */}
              <div className="w-full max-w-[380px] rounded-xl p-6 bg-[#faf6f8] border border-gray-100">
                <div className="h-16 w-full rounded-md bg-gray-200 mb-6" />

                <div className="h-4 w-2/3 rounded-md bg-gray-200 mb-2" />
                <div className="h-4 w-full rounded-md bg-gray-200 mb-2" />
                <div className="h-4 w-5/6 rounded-md bg-gray-200 mb-5" />

                <div className="rounded-md border border-gray-200 p-4 bg-white">
                  <div className="h-8 rounded bg-gray-100 mb-3" />
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                </div>

                <div className="mt-6">
                  <div className="h-3 w-1/3 rounded bg-gray-200 mb-2" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

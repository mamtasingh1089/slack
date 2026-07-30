import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAllWorkspaces } from "../redux/workspaceSlice";
import axios from "axios";
import { serverURL } from "../main";

const Avatar = ({ children, size = 8, style }) => (
  <div
    className="flex items-center justify-center rounded-full text-xs font-semibold text-white"
    style={{
      width: `${size * 4}px`,
      height: `${size * 4}px`,
      ...(style || {}),
    }}
  >
    {children}
  </div>
);

const Workspace = () => {
  const navigate = useNavigate();
  const dispatch=useDispatch();
  const allworkspace=useSelector((state)=>state.Workspace.allworkspace);

  useEffect(() => {
  const fetchWorkspaces = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${serverURL}/api/workspace/myworkspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch(setAllWorkspaces(res.data.workspaces));
  };

  fetchWorkspaces();
}, []);

  return (
    <div className="min-h-screen bg-[#3b1336] text-white">
      {/* NAV */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex flex-row items-center gap-2 mb-6">
          <img
            src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
            alt="Slack logo"
            className="w-8 h-8"
          />
          <p className="font-bold text-2xl">Slack</p>
        </div>
        <nav className="hidden md:flex gap-6 items-center text-sm text-white/90">
          <a className="hover:underline cursor-pointer">Features</a>
          <a className="hover:underline cursor-pointer">Solutions</a>
          <a className="hover:underline cursor-pointer">Enterprise</a>
          <a className="hover:underline cursor-pointer">Resources</a>
          <a className="hover:underline cursor-pointer">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden md:inline-block px-4 py-2 border border-white/30 rounded text-sm">
            TALK TO SALES
          </button>
          <button
            className="px-4 py-2 bg-white text-[#4a0f3a] rounded font-medium text-sm"
            onClick={() => navigate("/namestep")}
          >
            CREATE A NEW WORKSPACE
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="mt-6 text-[48px] md:text-[64px] leading-tight font-extrabold flex items-center gap-4">
          <span className="inline-block transform -translate-y-1">👋</span>
          <span>Welcome back</span>
        </h1>

        {/* Workspaces card */}
        <section className="mt-8">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-[#f7eaff] px-8 py-6 text-[#3b1336] text-lg">
              Workspaces for{" "}
              <span className="font-semibold">mamta252002singh@gmail.com</span>
            </div>

            <div className="bg-white text-gray-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-[#c8f0ef] flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#7dd3c6] rounded-sm" />
                  </div>

{allworkspace.map((ws) => (
  <div key={ws._id} className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-xl font-semibold">{ws.name}</h3>
      <p className="text-sm text-gray-500">{ws.owners}</p>
    </div>

    <button
      className="px-6 py-3 bg-[#4a0f3a] text-white rounded-lg"
      onClick={() => navigate(`/workspace/${ws._id}`)}
    >
      LAUNCH SLACK
    </button>
  </div>
))}


                  <div>
                    <h3 className="text-xl font-semibold">Koalaliving</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-2">
                        <Avatar size={6} style={{ backgroundColor: "#2d8656" }}>
                          A
                        </Avatar>
                        <Avatar size={6} style={{ backgroundColor: "#3b82f6" }}>
                          M
                        </Avatar>
                        <Avatar size={6} style={{ backgroundColor: "#f97316" }}>
                          J
                        </Avatar>
                        <Avatar size={6} style={{ backgroundColor: "#ef4444" }}>
                          R
                        </Avatar>
                      </div>
                      <span className="text-sm text-gray-500 ml-3">
                        33 members
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="px-6 py-3 bg-[#4a0f3a] text-white rounded-lg font-semibold hover:bg-[#4e1240]"
                  onClick={() => navigate("/")}
                >
                  LAUNCH SLACK
                </button>
              </div>

              <div className="mt-6 text-center">
                <button className="text-sm text-[#2b6cb0] hover:underline inline-flex items-center gap-1">
                  See more
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 8l5 5 5-5H5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Lower banner */}
        <section className="mt-12">
          <div className="rounded-xl bg-white text-gray-900 p-4 shadow-lg flex items-center gap-6">
            <div
              className="hidden md:flex items-center"
              style={{ minWidth: 160 }}
            >
              <div className="w-40 h-28 rounded-l-lg overflow-hidden bg-[#fbe7e1] flex items-end">
                <div className="p-4">
                  <div className="w-10 h-10 rounded-full bg-[#583b6d] mb-2" />
                  <div className="w-20 h-6 rounded bg-[#e8cbd9]" />
                </div>
              </div>
            </div>

            <div className="flex-1 pl-2">
              <h4 className="text-lg font-semibold">
                Want to use Slack with a different team?
              </h4>
            </div>

            <div className="pr-4">
              <button
                className="px-5 py-3 border-2 border-[#6b2e56] text-[#6b2e56] rounded-lg font-medium hover:bg-[#faf5fb]"
                onClick={() => navigate("/namestep")}
              >
                CREATE A NEW WORKSPACE
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 text-center text-sm text-[#c6a3c2]">
          Not seeing your workspace?{" "}
          <button className="text-[#2ec0d9] hover:underline ml-1">
            Try using a different email address →
          </button>
        </footer>
      </main>
    </div>
  );
};

export default Workspace;

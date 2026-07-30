import React from "react";
import { Link } from "react-router-dom";

const LaunchWorkspace = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex justify-center py-5 p-4">
        <img
          src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
          alt="Slack"
          className="w-10 h-10"
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-grow text-center ">
        <div className="w-11 h-10  rounded-md bg-gray-200 text-2xl font-bold text-gray-700 mb-6">
          NW
        </div>

        <h1 className="text-4xl font-bold mb-5 ">Launching New Workspace</h1>

        <p className="text-gray-800 mb- text-xl">
          Click <span className="font-semibold">"Open Slack"</span> to launch
          the desktop app.
        </p>

        <p className="text-gray-600 text-xl">
          Not working? You can also{" "}
          <Link
            to="/namestep"
            className="text-blue-600 hover:underline"
          >
            use Slack in your browser
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default LaunchWorkspace;
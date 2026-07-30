import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setSlackUser } from "../redux/slackUserSlice";
import mail from "../assets/mail.png";
import outlook from "../assets/outlook.png";
import { serverURL } from "../main.jsx";

const ConfirmEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const slackUser = useSelector((state) => state.slackUser.slackUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auto-send OTP when page loads if email exists
  useEffect(() => {
    const sendOtp = async () => {
      if (!slackUser?.email) return;
      try {
        setInfoMsg("Sending code...");
        const result = await axios.post(`${serverURL}/api/slack/sendotp`, {
          email: slackUser.email,
        });
        setInfoMsg("Code sent. Check your inbox (or spam).");
        console.log("OTP send response:", result.data);
      } catch (err) {
        console.error("Error auto-sending OTP:", err?.response ?? err);
        setErrorMsg(
          err?.response?.data?.message ||
            "Failed to send code. Try again or check server logs."
        );
      }
    };

    sendOtp();
  }, [slackUser?.email]);

  const handleChange = async (e, index) => {
    setErrorMsg("");
    const value = e.target.value.replace(/[^0-9]/g, "");
    const truncated = value.slice(0, 1); // single digit per input
    const newOtp = [...otp];
    newOtp[index] = truncated;
    setOtp(newOtp);

    if (index < otp.length - 1 && truncated) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      if (nextEl) nextEl.focus();
    }

    // if fully entered, try verify
    if (newOtp.join("").length === 6) {
      await handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const prevEl = document.getElementById(`otp-${index - 1}`);
        if (prevEl) prevEl.focus();
      }
    }
  };

  const handleVerify = async (code) => {
    if (!slackUser?.email) {
      setErrorMsg(
        "Email not found — please go back and enter your email again."
      );
      return;
    }
    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("Verifying code...");

    try {
      const result = await axios.post(`${serverURL}/api/slack/verifyotp`, {
        email: slackUser.email,
        otp: code,
      });

      console.log("verifyotp success response:", result.data);

      if (result.data?.success) {
        localStorage.setItem("token", result.data.token);
        dispatch(setSlackUser(result.data.user));
        setInfoMsg("Verified! Redirecting...");
        navigate("/launchworkspace");
      } else {
        // server responded 200 but success flag false
        setErrorMsg(
          result.data?.message || "Verification failed — code invalid."
        );
      }
    } catch (err) {
      // Show server returned error details (status + body) for debugging
      console.error("OTP verification failed:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.log("verifyotp error response body:", data);
      if (status === 400) {
        // common: invalid/expired code or bad request
        setErrorMsg(
          data?.message ||
            "Invalid code or request. Please request a new code and try again."
        );
      } else {
        setErrorMsg(
          data?.message || "Verification failed. Check server logs or network."
        );
      }
    } finally {
      setLoading(false);
      setInfoMsg("");
    }
  };

  const handleResend = async () => {
    if (!slackUser?.email) {
      setErrorMsg("No email to send code to.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("Requesting new code...");
    try {
      const res = await axios.post(`${serverURL}/api/slack/sendotp`, {
        email: slackUser.email,
      });
      console.log("resend response:", res.data);
      setInfoMsg("New code sent. Check your email.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      console.error("Resend failed:", err?.response ?? err);
      setErrorMsg(
        err?.response?.data?.message || "Failed to request new code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-center px-4">
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="flex flex-row items-center gap-2 mb-6">
          <img
            src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
            alt="Slack"
            className="w-8 h-8"
          />
          <p className="font-bold text-2xl">Slack</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          We emailed you a code
        </h1>
        <p className="text-gray-900 mb-6">
          We sent an email to{" "}
          <span className="font-bold">
            {slackUser?.email || "youremail@gmail.com"}
          </span>
          . Enter the code here or tap the button in the email to continue.
        </p>

        <p className="py-3 text-sm text-gray-600">
          If you don't see the email, check your spam or junk folder.
        </p>

        <div className="flex space-x-2 mb-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 border border-gray-400 rounded-md text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          ))}
        </div>

        {errorMsg && <p className="text-sm text-red-600 mb-2">{errorMsg}</p>}
        {infoMsg && <p className="text-sm text-blue-600 mb-2">{infoMsg}</p>}

        <div className="flex flex-row space-x-4 mb-6">
          <button
            className="text-blue-600 flex items-center gap-2 hover:underline disabled:opacity-60"
            onClick={() => window.open("https://mail.google.com", "_blank")}
          >
            <img src={mail} className="w-[30px]" alt="Gmail" /> Open Gmail
          </button>
          <button
            className="text-blue-600 flex items-center gap-2 hover:underline disabled:opacity-60"
            onClick={() => window.open("https://outlook.live.com", "_blank")}
          >
            <img src={outlook} className="w-[30px]" alt="Outlook" /> Open
            Outlook
          </button>
        </div>

        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={handleResend}
            disabled={loading}
          >
            Request a new code
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            onClick={() => handleVerify(otp.join(""))}
            disabled={loading}
          >
            Verify code
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Having trouble?{" "}
          <button className="text-blue-600 hover:underline">
            Try entering a workspace URL
          </button>
        </p>
      </div>

      <footer className="flex justify-center gap-6 py-4 text-gray-500 text-sm">
        <p className="cursor-pointer">Privacy & terms</p>
        <p className="cursor-pointer">Contact us</p>
      </footer>
    </div>
  );
};

export default ConfirmEmail;

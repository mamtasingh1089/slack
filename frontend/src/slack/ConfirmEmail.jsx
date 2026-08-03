import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setSlackUser } from "../redux/slackUserSlice";
import mail from "../assets/mail.png";
import outlook from "../assets/outlook.png";
import BoyGirl from "../assets/9Amfigma/Boy_Girl.svg";
import AM from "../assets/9Amfigma/AM.svg";
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
    <div className="flex flex-col min-h-screen bg-[#F8FAF9] text-center px-4 font-sans justify-between">
      {/* Spacer / Top padding */}
      <div></div>

      {/* Main Container Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-[#DFE7E3] shadow-sm p-8 md:p-10 my-8">
        
        {/* Brand Logo & Name Header (Matched with Auth brand panel layout style) */}
        <div className="flex items-center justify-center gap-0.5 mb-6">
          {/* Giant "9" Illustration */}
          <div className="w-14 flex-shrink-0">
            <img
              src={BoyGirl}
              alt="9"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* AM Logo & Title */}
          <div className="flex flex-col justify-center -ml-2.5">
            <img
              src={AM}
              alt="AM"
              className="w-12 h-auto object-contain"
            />
            <span className="text-[11px] font-extrabold text-[#16231F] tracking-tight -mt-1 text-left pl-0.5">
              nineAm
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#16231F] tracking-tight mb-2">
          We emailed you a code
        </h1>
        
        {/* Description */}
        <p className="text-sm text-[#5F6F69] font-medium leading-relaxed mb-6">
          We sent a 6-digit confirmation code to{" "}
          <span className="font-semibold text-[#0D8F7A] break-all">
            {slackUser?.email || "youremail@gmail.com"}
          </span>
          . Enter the code below to continue.
        </p>

        {/* Warning / Help note */}
        <p className="text-xs text-[#5F6F69] bg-gray-50 border border-gray-100 rounded-md p-3 mb-6">
          If you don't see the email, please check your spam or junk folder.
        </p>

        {/* OTP Input Fields Container */}
        <div className="flex justify-center space-x-2.5 mb-4">
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
              className="w-11 h-11 md:w-12 md:h-12 border-2 border-gray-200 rounded-lg text-center text-xl font-bold bg-white text-[#16231F] focus:outline-none focus:border-[#0D8F7A] focus:ring-2 focus:ring-[#087765]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          ))}
        </div>

        {/* Messaging Area */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-[#D9534F] rounded-md text-xs mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="p-3 bg-green-50 border border-green-150 text-[#219B75] rounded-md text-xs mb-4 text-center font-medium">
            {infoMsg}
          </div>
        )}

        {/* Email Client Links */}
        <div className="flex flex-row justify-center gap-4 mb-6">
          <button
            className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-[#16231F] hover:bg-gray-50 transition-colors disabled:opacity-60"
            onClick={() => window.open("https://mail.google.com", "_blank")}
            disabled={loading}
          >
            <img src={mail} className="w-[18px]" alt="Gmail" /> Open Gmail
          </button>
          <button
            className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-[#16231F] hover:bg-gray-50 transition-colors disabled:opacity-60"
            onClick={() => window.open("https://outlook.live.com", "_blank")}
            disabled={loading}
          >
            <img src={outlook} className="w-[18px]" alt="Outlook" /> Open Outlook
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="w-full sm:w-1/2 py-2.5 rounded-lg text-xs font-semibold text-[#0D8F7A] bg-[#0D8F7A]/10 hover:bg-[#0D8F7A]/20 transition-colors disabled:opacity-60"
            onClick={handleResend}
            disabled={loading}
          >
            Request a new code
          </button>

          <button
            className="w-full sm:w-1/2 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0D8F7A] hover:bg-[#087765] transition-colors disabled:opacity-60"
            onClick={() => handleVerify(otp.join(""))}
            disabled={loading}
          >
            Verify code
          </button>
        </div>

        {/* Trouble Link */}
        <p className="text-xs text-[#5F6F69] mt-6">
          Having trouble?{" "}
          <button 
            onClick={() => navigate("/login")}
            className="text-[#0D8F7A] font-semibold hover:underline"
          >
            Go back to Sign In
          </button>
        </p>
      </div>

      {/* Modern Simple Footer */}
      <footer className="flex justify-center gap-6 py-6 text-[#5F6F69] text-xs">
        <span className="cursor-pointer hover:underline">Privacy & terms</span>
        <span className="cursor-pointer hover:underline">Contact us</span>
      </footer>
    </div>
  );
};

export default ConfirmEmail;

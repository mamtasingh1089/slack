// src/pages/SlackLogin.jsx
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSlackUser } from "../redux/slackUserSlice";
import ReCAPTCHA from "react-google-recaptcha";
import { serverURL } from "../main.jsx";

const SlackLogin = () => {
  const [email, setEmail] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const slackUser = useSelector((state) => state.slackUser.slackUser);

  const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim());

  const handleCaptchaChange = (value) => {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!captchaValue) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting:", { email, captchaValue });

      // inside SlackLogin.handleSubmit after axios response
      const res = await axios.post(`${serverURL}/api/slack/slacklogin`, {
        email,
        captcha: captchaValue,
      });

      console.log("Full API Response:", res.data); // CHECK THIS IN CONSOLE
      const token = res?.data?.token;
      const user = res?.data?.user ?? null;

      if (token) {
        localStorage.setItem("token", token);
        console.log("Token saved to localStorage:", localStorage.getItem("token"));
} else {
        console.error("Token was undefined in the response!");
}

      if (user) {
        dispatch(setSlackUser(user));
      }

      // optional: set default axios header immediately
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // then navigate
      navigate("/email");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/auth/google";
  };

  const handleAppleSignIn = () => {
    window.location.href = "/auth/apple";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white px-4 relative">
      {/* Top-right CTA */}
      <div className="absolute top-6 right-6 text-sm text-gray-600">
        <span className="mr-2 text-gray-500">
          New to Slack?
          <br />
        </span>
        <button
          onClick={() => navigate("/signin")}
          className="text-blue-600 hover:underline focus:outline-none"
        >
          Create an account
        </button>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center py-8">
        <div className="flex flex-row items-center gap-2 mb-6">
          <img
            src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
            alt="Slack logo"
            className="w-8 h-8"
          />
          <p className="font-bold text-2xl">Slack</p>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 text-center max-w-3xl">
          Enter your email to sign in
        </h1>
        <p className="text-gray-600 mt-2 mb-6">
          Or choose another option to sign in.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mt-5 flex flex-col items-center"
        >
          <input
            id="email"
            type="email"
            placeholder="name@work-email.com"
            name="email"
            className="w-full h-[45px] px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "email-error" : undefined}
          />

          {error && (
            <div
              id="email-error"
              role="alert"
              className="w-full text-left mt-2 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* reCAPTCHA checkbox */}
          <div className="mt-4 self-start">
            <ReCAPTCHA
              sitekey="6LcBK8orAAAAAN5v2azDSWpnmI7rfSEj0PMt9hxP"
              onChange={handleCaptchaChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-[45px] mt-5 rounded-md text-white font-medium ${
              loading ? "bg-purple-300" : "bg-[#703578]"
            }`}
          >
            {loading ? "Processing..." : "Sign In With Email"}
          </button>
        </form>

        <div className="flex items-center w-full max-w-md my-6">
          <div className="flex-grow border-t border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">OR SIGN IN WITH</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <div className="w-full max-w-md flex gap-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-1/2 h-[45px] border border-gray-400 rounded-md font-medium hover:bg-gray-50 flex justify-center items-center gap-2"
          >
            <FcGoogle className="text-xl" /> Google
          </button>
          <button
            onClick={handleAppleSignIn}
            className="w-1/2 h-[45px] border border-gray-400 rounded-md font-medium hover:bg-gray-50 flex justify-center items-center gap-2"
          >
            <FaApple className="text-xl" /> Apple
          </button>
        </div>

        <p className="mt-10 text-gray-600">
          Having trouble?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 cursor-pointer"
          >
            Try entering a workspace URL
          </span>
        </p>
      </main>

      <footer className="flex justify-center gap-6 py-4 text-gray-500 text-sm">
        <p className="cursor-pointer">Privacy & terms</p>
        <p className="cursor-pointer">Contact us</p>
        <p className="cursor-pointer">Change region</p>
      </footer>
    </div>
  );
};

export default SlackLogin;

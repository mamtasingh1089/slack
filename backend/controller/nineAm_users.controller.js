//import SlackUser from "../models/slackUser.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import { sendOtpEmail } from "../config/sendOtpEmail.js";
import pool from '../config/postgreDb.js'

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const RECAPTCHA_SECRET = process.env.SECRET_KEY;

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set!');
  }
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const Signin = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase().trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM nineAm_users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert new user
    const newUser = await pool.query(
      `
      INSERT INTO nineAm_users
      (email, team_name, name, profile, created_at)
      VALUES ($1, '', '', '', NOW())
      RETURNING *;
      `,
      [email]
    );

    const nineAm_user = newUser.rows[0];

    const token = createToken(nineAm_user);

    return res.status(201).json({
      message: "User created",
      user: nineAm_user,
      token,
    });

  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Signin failed",
    });
  }
};

export const nineAm_Login = async (req, res) => {
  try {
    let { email, captcha } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase().trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!captcha) {
      return res.status(400).json({ message: "Captcha required" });
    }

    // Verify Google reCAPTCHA
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}`;

    const { data } = await axios.post(verifyURL);

    if (!data.success) {
      return res
        .status(400)
        .json({ message: "Captcha verification failed" });
    }

    // Find user in PostgreSQL
    const result = await pool.query(
      "SELECT * FROM nineAm_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = result.rows[0];

    // Generate JWT
    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

export const SendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM nineAm_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = new Date(Date.now() + 60 * 1000);

    await pool.query(
      `
      UPDATE nineAm_users
      SET otp = $1,
          otp_expiry = $2
      WHERE email = $3
      `,
      [otp, otpExpiry, email]
    );

    await sendOtpEmail({
      to: email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent",
    });
  } catch (error) {
    console.error("SendOtp Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      "SELECT * FROM nineAm_users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    if (
      user.otp !== otp ||
      new Date() > new Date(user.otp_expiry)
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    await pool.query(
      `
      UPDATE nineAm_users
      SET otp = NULL,
          otp_expiry = NULL
      WHERE id = $1
      `,
      [user.id]
    );

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "OTP verified, login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("VerifyOtp Error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = await pool.query(
      `
      SELECT
      id,
      email,
      name,
      team_name,
      profile,
      created_at
      FROM nineAm_users
      WHERE id = $1
      `,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("getMe Error:", error);

    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { name, teamName } = req.body;

    const result = await pool.query(
      `
      UPDATE nineAm_users
      SET
      name = $1,
      team_name = $2
      WHERE id = $3
      RETURNING *
      `,
      [name?.trim(), teamName?.trim(), req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("updateProfile Error:", error);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const publicPath = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `
      UPDATE nineAm_users
      SET profile = $1
      WHERE id = $2
      RETURNING *
      `,
      [publicPath, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      profile: publicPath,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("uploadPhoto Error:", error);

    return res.status(500).json({
      message: "Upload failed",
    });
  }
};

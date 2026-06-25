// controller/workspace.controller.js
import Workspace from "../models/Workspace.model.js";
import SlackUser from "../models/slackUser.model.js";
import Mail from "../config/Mail.js";
//import {uploadOnCloundinary} from '../config/cloudinary.js'
import path from 'path'


export const createWorkspace = async (req, res) => {
  try {
    if (!req.userId) {
      console.warn('createWorkspace: missing req.userId. Is auth middleware applied?');
      return res.status(401).json({ message: 'Authentication required' });
    }
    const { name ,owner,members} = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Workspace name required' });
    }
    const slackUser = await SlackUser.findById(req.userId);
    if (!slackUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const workspace = await Workspace.create({
      name: name.trim(),
      owner: slackUser._id,
      members: [slackUser._id],
    });
    try {
      slackUser.workspace = workspace._id;
      await slackUser.save();
    } catch (userSaveErr) {
      console.error('Failed to update user with workspace id', userSaveErr);
    }
    return res.status(201).json({ success: true, workspace });
  } catch (err) {
    console.error("createWorkspace error:", err && err.stack ? err.stack : err);
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ message: 'Failed to create workspace', error: err?.message || err });
    }
    return res.status(500).json({ message: "Failed to create workspace" });
  }
};

export const inviteToWorkspace = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const { emails } = req.body;
    if (!emails) return res.status(400).json({ message: "emails required" });

    const emailList = Array.isArray(emails)
      ? emails
      : emails.split(",").map(e => e.trim()).filter(Boolean);

    if (!emailList.length) return res.status(400).json({ message: "No valid emails provided" });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const createdOrFound = [];
    for (const email of emailList) {
      let user = await SlackUser.findOne({ email });
      if (!user) {
        user = await SlackUser.create({ email }); // minimal record
      }

      if (!workspace.members.some(m => m.toString() === user._id.toString())) {
        workspace.members.push(user._id);
      }
      createdOrFound.push(user);

    
      try {
        const inviteLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/join?workspace=${workspace._id}&email=${encodeURIComponent(email)}`;
        await Mail({ to: email, workspaceName: workspace.name, inviteLink });
      } catch (e) {
        console.warn("failed to send invite email for", email, e.message);
      }
    }

    await workspace.save();
    return res.json({ success: true, workspace, invited: createdOrFound.map(u => ({ email: u.email, id: u._id })) });
  } catch (err) {
    console.error("inviteToWorkspace error", err);
    return res.status(500).json({ message: "Failed to invite" });
  }
};



export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...(req.body || {}) };

    // 1. Handle the S3 Upload Result
    if (req.file) {
      // With multer-s3, the S3 URL is stored in req.file.location
      updates.profileImage = req.file.location;
    }

    // Normalize owners if it comes as an array from FormData
    if (updates.owners && Array.isArray(updates.owners)) {
      updates.owners = updates.owners[updates.owners.length - 1];
    }

    // 2. Update SlackUser if owners/name info is present
    if (updates.owners && req.userId) {
      try {
        const ownerName = typeof updates.owners === "string" ? updates.owners : String(updates.owners);
        const userUpdates = { name: ownerName };
        
        // Sync the profile image to the user as well if updated
        if (updates.profileImage) {
          userUpdates.profileImage = updates.profileImage;
        }
        
        await SlackUser.findByIdAndUpdate(req.userId, userUpdates, { new: true });
      } catch (userErr) {
        console.warn("Failed to update SlackUser (non-fatal):", userErr.message);
      }
    }

    // Safety: prevent overwriting owner/members lists directly via this endpoint
    delete updates.owner;
    delete updates.members;

    const workspace = await Workspace.findByIdAndUpdate(id, updates, { new: true });
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    return res.json({ 
      success: true, 
      workspace 
    });
  } catch (err) {
    console.error("updateWorkspace error:", err.stack || err);
    return res.status(500).json({ message: "Failed to update workspace" });
  }
};


export const getAllWorkspaces = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // find workspaces where user is owner or member
    const workspaces = await Workspace.find({
     $or: [
    { owner: req.userId },
    { members: req.userId }
  ]
    }).populate("members", "email name");

    return res.status(200).json({ workspaces });
  } catch (error) {
    console.error("getAllWorkspaces error:", error);
    return res.status(500).json({ message: "Failed to fetch workspaces" });
  }
};

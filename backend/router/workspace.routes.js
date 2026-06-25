import express from 'express'
import { createWorkspace, getAllWorkspaces, inviteToWorkspace, updateWorkspace } from '../controller/workspace.controller.js';
import auth from '../middleware/auth.js';
import {upload} from '../middleware/multer.js'
const workspaceRouter = express.Router();

workspaceRouter.post( "/createworkspace",
  auth,
  upload.single("profileImage"), 
  createWorkspace
);
workspaceRouter.post("/:id/invite", auth, inviteToWorkspace);
workspaceRouter.patch("/:id", auth, upload.single("profileImage"), updateWorkspace);
workspaceRouter.get("/all", auth, getAllWorkspaces);

export default workspaceRouter;

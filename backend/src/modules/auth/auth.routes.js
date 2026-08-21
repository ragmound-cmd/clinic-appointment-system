import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import * as controller from "./auth.controller.js";

export const authRouter = Router();
authRouter.post("/register", asyncHandler(controller.register));
authRouter.post("/login", asyncHandler(controller.login));
authRouter.get("/me", authenticate, asyncHandler(controller.me));
authRouter.post("/logout", authenticate, asyncHandler(controller.logout));

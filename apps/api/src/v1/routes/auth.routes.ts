import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as discoveryController from "../controllers/discovery.controller";
import * as oauthController from "../controllers/oauth.controller";
import * as userinfoController from "../controllers/userinfo.controller";
import * as identityController from "../controllers/identity.controller";
import * as sessionController from "../controllers/session.controller";
import * as webauthnController from "../controllers/webauthn.controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/.well-known/openid-configuration", discoveryController.getOIDCConfig);
router.get("/jwks", discoveryController.getJWKS);

router.post("/auth/signups", authController.createSignup);
router.post("/auth/signups/:id/attempt", authController.attemptSignup);

router.get("/auth/oauth/:provider", oauthController.authorize);
router.get("/auth/oauth/:provider/callback", oauthController.callback);

router.get("/userinfo", userinfoController.getUserInfo);

// User Identities
router.get("/users/:user_id/identities", authMiddleware, identityController.listIdentities);
router.post(
  "/users/:user_id/identities/oauth",
  authMiddleware,
  identityController.linkOAuthIdentity,
);
router.delete(
  "/users/:user_id/identities/oauth/:oauth_account_id",
  authMiddleware,
  identityController.unlinkOAuthIdentity,
);

// Sessions
router.get("/sessions", authMiddleware, sessionController.listSessions);
router.delete("/sessions/:session_id", authMiddleware, sessionController.revokeSession);

// WebAuthn
router.get(
  "/auth/webauthn/registration/options",
  authMiddleware,
  webauthnController.getRegistrationOptions,
);
router.post(
  "/auth/webauthn/registration/verify",
  authMiddleware,
  webauthnController.verifyRegistration,
);
router.get("/auth/webauthn/passkeys", authMiddleware, webauthnController.listPasskeys);

export { router as authRoutes };

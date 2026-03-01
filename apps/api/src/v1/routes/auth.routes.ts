import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as discoveryController from "../controllers/discovery.controller";
import * as oauthController from "../controllers/oauth.controller";
import * as userinfoController from "../controllers/userinfo.controller";
import * as identityController from "../controllers/identity.controller";
import * as sessionController from "../controllers/session.controller";
import * as webauthnController from "../controllers/webauthn.controller";
import * as userController from "../controllers/user.controller";
import * as emailController from "../controllers/email.controller";
import * as totpController from "../controllers/totp.controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/.well-known/openid-configuration", discoveryController.getOIDCConfig);
router.get("/jwks", discoveryController.getJWKS);

router.post("/auth/signups", authController.createSignup);
router.post("/auth/signups/:id/attempt", authController.attemptSignup);

router.get("/auth/oauth/:provider", oauthController.authorize);
router.get("/auth/oauth/:provider/callback", oauthController.callback);

router.get("/userinfo", userinfoController.getUserInfo);

// Users
router.get("/users", authMiddleware, userController.listUsers);
router.get("/users/:user_id", authMiddleware, userController.getUser);
router.patch("/users/:user_id", authMiddleware, userController.updateUser);
router.delete("/users/:user_id", authMiddleware, userController.deleteUser);

// User Email Addresses
router.get("/users/:user_id/email_addresses", authMiddleware, emailController.listEmails);
router.post("/users/:user_id/email_addresses", authMiddleware, emailController.addEmail);
router.delete(
  "/users/:user_id/email_addresses/:email_address_id",
  authMiddleware,
  emailController.deleteEmail,
);
router.post(
  "/users/:user_id/email_addresses/:email_address_id/set_primary",
  authMiddleware,
  emailController.setPrimaryEmail,
);

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

// TOTP/MFA
router.post("/users/:user_id/mfa/totp", authMiddleware, totpController.enrollTotp);
router.post("/users/:user_id/mfa/totp/verify", authMiddleware, totpController.verifyTotp);
router.post(
  "/users/:user_id/mfa/backup_codes/regenerate",
  authMiddleware,
  totpController.regenerateBackupCodes,
);
router.delete("/users/:user_id/mfa/totp", authMiddleware, totpController.disableTotp);

export { router as authRoutes };

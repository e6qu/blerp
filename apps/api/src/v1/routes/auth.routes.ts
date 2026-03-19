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
import * as phoneController from "../controllers/phone.controller";
import * as totpController from "../controllers/totp.controller";
import * as restrictionController from "../controllers/restriction.controller";
import * as magicLinkController from "../controllers/magic-link.controller";
import * as redirectController from "../controllers/redirect.controller";
import * as m2mController from "../controllers/m2m.controller";
import { authMiddleware } from "../../middleware/auth";
import { generateCsrfToken } from "../../middleware/csrf";

const router = Router();

// CSRF token endpoint
router.get("/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

router.get("/.well-known/openid-configuration", discoveryController.getOIDCConfig);
router.get("/jwks", discoveryController.getJWKS);

router.post("/auth/signups", authController.createSignup);
router.post("/auth/signups/:id/attempt", authController.attemptSignup);

router.post("/auth/signins", authController.createSignin);
router.post("/auth/signins/:signin_id/attempt", authController.attemptSignin);

router.get("/auth/oauth/:provider", oauthController.authorize);
router.get("/auth/oauth/:provider/callback", oauthController.callback);

router.get("/userinfo", userinfoController.getUserInfo);

// Users (bulk must come before :user_id routes)
router.post("/users/bulk", authMiddleware, userController.bulkUpdateUsers);
router.get("/users", authMiddleware, userController.listUsers);
router.get("/users/:user_id", authMiddleware, userController.getUser);
router.patch("/users/:user_id", authMiddleware, userController.updateUser);
router.delete("/users/:user_id", authMiddleware, userController.deleteUser);
router.post("/users/:user_id/restore", authMiddleware, userController.restoreUser);

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

// User Phone Numbers
router.get("/users/:user_id/phone_numbers", authMiddleware, phoneController.listPhoneNumbers);
router.post("/users/:user_id/phone_numbers", authMiddleware, phoneController.addPhoneNumber);
router.delete(
  "/users/:user_id/phone_numbers/:phone_number_id",
  authMiddleware,
  phoneController.deletePhoneNumber,
);
router.post(
  "/users/:user_id/phone_numbers/:phone_number_id/set_primary",
  authMiddleware,
  phoneController.setPrimaryPhone,
);

// Sessions
router.post("/sessions/revoke-all", authMiddleware, sessionController.revokeAllSessions);
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
router.patch(
  "/auth/webauthn/passkeys/:passkey_id",
  authMiddleware,
  webauthnController.renamePasskey,
);
router.delete(
  "/auth/webauthn/passkeys/:passkey_id",
  authMiddleware,
  webauthnController.deletePasskey,
);

// TOTP/MFA
router.post("/users/:user_id/mfa/totp", authMiddleware, totpController.enrollTotp);
router.post("/users/:user_id/mfa/totp/verify", authMiddleware, totpController.verifyTotp);
router.post(
  "/users/:user_id/mfa/backup_codes/regenerate",
  authMiddleware,
  totpController.regenerateBackupCodes,
);
router.delete("/users/:user_id/mfa/totp", authMiddleware, totpController.disableTotp);

// Signup Restrictions (Allowlist/Blocklist)
router.get("/signup-restrictions", authMiddleware, restrictionController.listRestrictions);
router.post("/signup-restrictions", authMiddleware, restrictionController.createRestriction);
router.delete("/signup-restrictions/:id", authMiddleware, restrictionController.deleteRestriction);

// Magic Links
router.post("/auth/magic-links", magicLinkController.createMagicLink);
router.post("/auth/magic-links/verify", magicLinkController.verifyMagicLink);

// Testing Tokens (dev-only)
router.post("/auth/testing-tokens", authController.createTestingToken);

// Redirect URLs
router.get("/redirect-urls", authMiddleware, redirectController.listRedirectUrls);
router.post("/redirect-urls", authMiddleware, redirectController.createRedirectUrl);
router.delete("/redirect-urls/:id", authMiddleware, redirectController.deleteRedirectUrl);

// M2M Tokens
router.post("/m2m-tokens", authMiddleware, m2mController.createM2MToken);
router.get("/m2m-tokens", authMiddleware, m2mController.listM2MTokens);
router.delete("/m2m-tokens/:id", authMiddleware, m2mController.revokeM2MToken);

// OAuth2 client_credentials grant
router.post("/oauth/token", m2mController.clientCredentialsGrant);

export { router as authRoutes };

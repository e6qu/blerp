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
import { authMiddleware, requireM2M, requireSelfOrM2M } from "../../middleware/auth";

// BUG-147 (codex r33): admin/read endpoints that accept session auth
// from the user themselves use requireSelfOrM2M; pure admin endpoints
// (bulk / list / delete / restore / unlock) stay M2M-only.
const userIdFromParams = (req: { params: { user_id?: string } }) => req.params.user_id;
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

router.get("/userinfo", authMiddleware, userinfoController.getUserInfo);

// Users — admin surfaces.
// BUG-147 (codex r33): all /v1/users/* admin endpoints require an
// M2M token with explicit scope (matches Clerk: User Management API
// is SecretKey-only). Pre-fix any signed-in user could list/read/
// update/delete arbitrary users including their private_metadata —
// a tenant-wide data-exfiltration path.
//
// Scope split:
//   users:read  — GET /v1/users, GET /v1/users/:id
//   users:write — PATCH / DELETE / POST restore / POST bulk
//   users:admin — POST /unlock (account-recovery primitive; gated
//                 higher because it can defeat the lockout policy)
router.post(
  "/users/bulk",
  authMiddleware,
  requireM2M("users:write"),
  userController.bulkUpdateUsers,
);
router.get("/users", authMiddleware, requireM2M("users:read"), userController.listUsers);
// GET / PATCH on a single user_id: self OR admin (matches Clerk's
// user-can-read-and-update-themselves model).
router.get(
  "/users/:user_id",
  authMiddleware,
  requireSelfOrM2M("users:read", userIdFromParams),
  userController.getUser,
);
router.patch(
  "/users/:user_id",
  authMiddleware,
  requireSelfOrM2M("users:write", userIdFromParams),
  userController.updateUser,
);
// Deletion and restore are destructive admin operations: M2M-only.
router.delete(
  "/users/:user_id",
  authMiddleware,
  requireM2M("users:write"),
  userController.deleteUser,
);
router.post(
  "/users/:user_id/restore",
  authMiddleware,
  requireM2M("users:write"),
  userController.restoreUser,
);
router.post(
  "/users/:user_id/unlock",
  authMiddleware,
  requireM2M("users:admin"),
  userController.unlockUser,
);

// BUG-150 (codex r34): nested user routes were left on bare
// authMiddleware so any signed-in user could read/write another
// user's email_addresses / identities / phone_numbers / mfa. Gate
// with requireSelfOrM2M — same self-or-admin model as the main
// /v1/users/:user_id routes (BUG-147).
const readUserResource = requireSelfOrM2M("users:read", userIdFromParams);
const writeUserResource = requireSelfOrM2M("users:write", userIdFromParams);

// User Email Addresses
router.get(
  "/users/:user_id/email_addresses",
  authMiddleware,
  readUserResource,
  emailController.listEmails,
);
router.post(
  "/users/:user_id/email_addresses",
  authMiddleware,
  writeUserResource,
  emailController.addEmail,
);
router.delete(
  "/users/:user_id/email_addresses/:email_address_id",
  authMiddleware,
  writeUserResource,
  emailController.deleteEmail,
);
router.post(
  "/users/:user_id/email_addresses/:email_address_id/set_primary",
  authMiddleware,
  writeUserResource,
  emailController.setPrimaryEmail,
);

// User Identities
router.get(
  "/users/:user_id/identities",
  authMiddleware,
  readUserResource,
  identityController.listIdentities,
);
router.post(
  "/users/:user_id/identities/oauth",
  authMiddleware,
  writeUserResource,
  identityController.linkOAuthIdentity,
);
router.delete(
  "/users/:user_id/identities/oauth/:oauth_account_id",
  authMiddleware,
  writeUserResource,
  identityController.unlinkOAuthIdentity,
);

// User Phone Numbers
router.get(
  "/users/:user_id/phone_numbers",
  authMiddleware,
  readUserResource,
  phoneController.listPhoneNumbers,
);
router.post(
  "/users/:user_id/phone_numbers",
  authMiddleware,
  writeUserResource,
  phoneController.addPhoneNumber,
);
router.delete(
  "/users/:user_id/phone_numbers/:phone_number_id",
  authMiddleware,
  writeUserResource,
  phoneController.deletePhoneNumber,
);
router.post(
  "/users/:user_id/phone_numbers/:phone_number_id/set_primary",
  authMiddleware,
  writeUserResource,
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

// TOTP/MFA — BUG-150 (codex r34): self-or-admin per BUG-147 pattern.
router.post(
  "/users/:user_id/mfa/totp",
  authMiddleware,
  writeUserResource,
  totpController.enrollTotp,
);
router.post(
  "/users/:user_id/mfa/totp/verify",
  authMiddleware,
  writeUserResource,
  totpController.verifyTotp,
);
router.post(
  "/users/:user_id/mfa/backup_codes/regenerate",
  authMiddleware,
  writeUserResource,
  totpController.regenerateBackupCodes,
);
router.delete(
  "/users/:user_id/mfa/totp",
  authMiddleware,
  writeUserResource,
  totpController.disableTotp,
);

// Signup Restrictions (Allowlist/Blocklist) — BUG-169 (codex r43):
// admin-only. The allowlist controls who can sign up; letting any
// signed-in user mutate it is account-takeover via altered ruleset.
// `signup_restrictions:read` / `signup_restrictions:write` M2M scopes.
router.get(
  "/signup-restrictions",
  authMiddleware,
  requireM2M("signup_restrictions:read"),
  restrictionController.listRestrictions,
);
router.post(
  "/signup-restrictions",
  authMiddleware,
  requireM2M("signup_restrictions:write"),
  restrictionController.createRestriction,
);
router.delete(
  "/signup-restrictions/:id",
  authMiddleware,
  requireM2M("signup_restrictions:write"),
  restrictionController.deleteRestriction,
);

// Magic Links
router.post("/auth/magic-links", magicLinkController.createMagicLink);
router.post("/auth/magic-links/verify", magicLinkController.verifyMagicLink);

// Testing Tokens (dev-only)
router.post("/auth/testing-tokens", authController.createTestingToken);

// Redirect URLs — BUG-169 (codex r43): admin-only. Letting any user
// add a redirect URL opens an OAuth-redirect phishing path.
router.get(
  "/redirect-urls",
  authMiddleware,
  requireM2M("redirect_urls:read"),
  redirectController.listRedirectUrls,
);
router.post(
  "/redirect-urls",
  authMiddleware,
  requireM2M("redirect_urls:write"),
  redirectController.createRedirectUrl,
);
router.delete(
  "/redirect-urls/:id",
  authMiddleware,
  requireM2M("redirect_urls:write"),
  redirectController.deleteRedirectUrl,
);

// M2M Tokens
router.post("/m2m-tokens", authMiddleware, m2mController.createM2MToken);
router.get("/m2m-tokens", authMiddleware, m2mController.listM2MTokens);
router.delete("/m2m-tokens/:id", authMiddleware, m2mController.revokeM2MToken);

// OAuth2 client_credentials grant
router.post("/oauth/token", m2mController.clientCredentialsGrant);

export { router as authRoutes };

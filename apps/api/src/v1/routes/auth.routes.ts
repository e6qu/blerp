import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as discoveryController from "../controllers/discovery.controller";
import * as oauthController from "../controllers/oauth.controller";
import * as userinfoController from "../controllers/userinfo.controller";
import * as identityController from "../controllers/identity.controller";

const router = Router();

router.get("/.well-known/openid-configuration", discoveryController.getOIDCConfig);
router.get("/jwks", discoveryController.getJWKS);

router.post("/auth/signups", authController.createSignup);
router.post("/auth/signups/:id/attempt", authController.attemptSignup);

router.get("/auth/oauth/:provider", oauthController.authorize);
router.get("/auth/oauth/:provider/callback", oauthController.callback);

router.get("/userinfo", userinfoController.getUserInfo);

// User Identities
router.get("/users/:user_id/identities", identityController.listIdentities);
router.post("/users/:user_id/identities/oauth", identityController.linkOAuthIdentity);
router.delete(
  "/users/:user_id/identities/oauth/:oauth_account_id",
  identityController.unlinkOAuthIdentity,
);

export { router as authRoutes };

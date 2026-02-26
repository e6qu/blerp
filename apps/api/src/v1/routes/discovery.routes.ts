import { Router } from "express";
import * as discoveryController from "../controllers/discovery.controller";

const router = Router();

router.get("/.well-known/openid-configuration", discoveryController.getOIDCConfig);
router.get("/jwks", discoveryController.getJWKS);

export { router as discoveryRoutes };

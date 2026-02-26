import { Request, Response } from "express";
import { SCIMService } from "../services/scim.service";

export async function createUser(req: Request, res: Response) {
  const service = new SCIMService(req.tenantDb!);
  try {
    const user = await service.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res
      .status(400)
      .json({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        detail: (error as Error).message,
        status: 400,
      });
  }
}

export async function getUser(req: Request, res: Response) {
  const service = new SCIMService(req.tenantDb!);
  const id = req.params.id as string;
  try {
    const user = await service.getUser(id);
    if (!user) {
      res
        .status(404)
        .json({
          schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
          detail: "User not found",
          status: 404,
        });
      return;
    }
    res.json(user);
  } catch (error) {
    res
      .status(400)
      .json({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        detail: (error as Error).message,
        status: 400,
      });
  }
}

export async function listUsers(req: Request, res: Response) {
  const service = new SCIMService(req.tenantDb!);
  try {
    const users = await service.listUsers();
    res.json(users);
  } catch (error) {
    res
      .status(400)
      .json({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        detail: (error as Error).message,
        status: 400,
      });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const service = new SCIMService(req.tenantDb!);
  const id = req.params.id as string;
  try {
    await service.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res
      .status(400)
      .json({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
        detail: (error as Error).message,
        status: 400,
      });
  }
}

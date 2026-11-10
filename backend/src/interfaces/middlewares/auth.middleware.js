import jwt from "jsonwebtoken";
import { env } from "../../infrastructure/config/env.js";

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado", data: null, error: "No autorizado" });
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido", data: null, error: "No autorizado" });
  }
};

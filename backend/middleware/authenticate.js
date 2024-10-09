import "dotenv/config";
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (header) {
      const token = header.split(" ")[1];
      const publicKey = `-----BEGIN PUBLIC KEY-----\n${process.env.KEYCLOAK_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;
      const payload = jwt.verify(token, publicKey, { algorithms: "RS256" });
      req.payload = payload;
      next()
    } else {
      res.status(403).json({ error: "access denied" });
    }
  } catch (error) {
    console.log(error);
  }
};

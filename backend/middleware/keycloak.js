import "dotenv/config";
import KeycloakConnect from "keycloak-connect";

const config = {
  realm: process.env.KEYCLOAK_REALM,
  "auth-server-url": `${process.env.KEYCLOAK_URL}`,
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT,
  "bearer-only": true,
  "realm-public-key": process.env.PUBLIC_KEY,
};

export const keycloak = new KeycloakConnect({}, config);

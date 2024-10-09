import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  clientId: "GED",
  realm: "dev-realm",
  url: "http://localhost:8080",
});

export default keycloak;

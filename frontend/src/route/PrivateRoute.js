import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import { Route } from "react-router-dom";

const PrivateRoute = ({ exact, component: Component, ...rest }) => {
  const { keycloak, initialized } = useKeycloak();
  console.log(keycloak.authenticated);
  

  return (
    <Route
      exact={!!exact} 
      {...rest} 
      render={(props) => {
        if (initialized && !keycloak.authenticated) {
          console.log("hi");
          keycloak.login();
          return null;
        } else {
          return <Component {...props} {...rest} />; // Render the component if authenticated
        }
      }}
    />
  );
};

export default PrivateRoute;

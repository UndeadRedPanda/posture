import React from "https://esm.sh/react@17.0.1";
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "https://jspm.dev/react-router-dom@5.2.0";

import { Messages } from "../screens/Messages.tsx";
import { Header } from "../components/Header.tsx";

export const RootNavigation = () => (
  <Router>
    <Header />
    <Switch>
      <Route path="/settings">
        <div>Settings</div>
      </Route>
      <Route exact path={["/", "/message/:id"]}>
        <div>Messages</div>
        {/* <Messages /> */}
      </Route>
      <Route path="*">
        <div>Error 404</div>
      </Route>
    </Switch>
  </Router>
);

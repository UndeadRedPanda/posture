import React from "https://jspm.dev/react@16.13.1";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
} from "https://jspm.dev/react-router-dom@5.2.0";
import { Messages } from "../Messages/index.tsx";
import { Header } from "../../components/Header/index.tsx";

export const App = () => (
  <Router>
    <Header />

    <Switch>
      <Route path="/settings">
        <div>Settings</div>
      </Route>
      <Route exact path={["/", "/message/:id"]}>
        <Messages />
      </Route>
      <Route path="*">
        <div>Error 404</div>
      </Route>
    </Switch>
  </Router>
);

import React from "https://esm.sh/react@17.0.1";
import ReactDOM from "https://esm.sh/react-dom@17.0.1";
import { RootNavigation } from "./navigations/Root.tsx";

const App: React.FC = () => (
  <RootNavigation />
);

ReactDOM.render(<App />, document.getElementById("app"));

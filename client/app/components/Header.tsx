import React from "https://esm.sh/react@17.0.1";
import { Link } from "https://esm.sh/react-router-dom@5.2.0";

export const Header: React.FC = () => (
  <header>
    <h1>Posture</h1>
    <nav>
      <ul>
        <li>
          {/* <Link to="/">Messages</Link> */}
        </li>
        <li>
          {/* <Link to="/settings">Settings</Link> */}
        </li>
      </ul>
    </nav>
  </header>
);

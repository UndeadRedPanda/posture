import React from "https://jspm.dev/react@16.13.1";
import { Link } from "https:///jspm.dev/react-router-dom@5.2.0";

export const Header: React.FC = () => {
  return (
    <header>
      <h1>Posture</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Messages</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

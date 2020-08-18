import React from 'https://jspm.dev/react@16.13.1';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "https://jspm.dev/react-router-dom@5.2.0";

export const App = () => (
	<Router>
		<h1>Posture</h1>
		<div>We have routes</div>
		<Switch>
			<Route path="/settings">
				<div>Settings</div>
			</Route>
			<Route exact path={["/", "/message/:id"]}>
				<div>Messages</div>
			</Route>
			<Route path="*">
				<div>Error 404</div>
			</Route>
		</Switch>
	</Router>
);
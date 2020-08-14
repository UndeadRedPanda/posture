import React from 'https://jspm.dev/react@16.13.1';
import {
	BrowserRouter as ReactRouter,
	Switch,
	Route,
	Link
} from "https://jspm.dev/react-router-dom@5.2.0";
import {
	RecoilRoot
} from 'https://jspm.dev/recoil@0.0.8';
import { App } from '../App/index.tsx';

export const Root = () => (
	<RecoilRoot>
		<App/>
	</RecoilRoot>
);
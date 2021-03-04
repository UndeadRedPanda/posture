import React from "https://esm.sh/react@17.0.1";
import { RecoilRoot } from "https://cdn.skypack.dev/recoil@0.0.8?dts";
import { App } from "../App/index.tsx";

export const Root = () => (
  <RecoilRoot>
    <App />
  </RecoilRoot>
);

import { execSync } from "node:child_process";

const bundler = process.env.PICH_BUNDLER_FLAG ?? "";
execSync(`next build ${bundler}`, { stdio: "inherit" });

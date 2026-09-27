import { architecturePages } from "./pages/architecture";
import { helpPages } from "./pages/help";
import { proofPages } from "./pages/proof";
import { referencePages } from "./pages/reference";
import { securityPages } from "./pages/security";
import { startPages } from "./pages/start";
import { usingPages } from "./pages/using";

export const DOCS_CONTENT: Record<string, Record<string, React.ReactNode>> = {
  start: startPages,
  "using-pich": usingPages,
  architecture: architecturePages,
  reference: referencePages,
  security: securityPages,
  proof: proofPages,
  help: helpPages,
};

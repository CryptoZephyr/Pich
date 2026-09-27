import bundle from "./fixtures.generated.json";
import type { RepoFiles } from "./engine";

export interface FixtureClient {
  id: string;
  name: string;
  files: RepoFiles;
}

export const FIXTURE_CLIENTS: FixtureClient[] = bundle as unknown as FixtureClient[];

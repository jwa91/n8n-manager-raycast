// src/list-workflows.tsx
// This file serves as the entry point for the "list-workflows" command,
// as expected by the Raycast build system due to the "name" in package.json.
// It re-exports the actual command component from its new location
// in the /commands directory to maintain our structured approach.

import ListWorkflowsCommand from "./commands/list-workflows.command";

export default ListWorkflowsCommand;

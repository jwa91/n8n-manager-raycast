# Project Structure Overview

This document outlines the directory structure of the n8n Raycast extension, designed for clarity, maintainability, and scalability by separating concerns into distinct layers.

## `src/` Directory Tree

```

src/
├── commands/
│   └── list-workflows.command.tsx
├── components/
│   └── WorkflowListItem.tsx
├── logic/
│   └── workflowActions.ts
├── services/
│   └── n8nApiService.ts
├── types.ts
├── utils/
│   ├── formatUtils.ts
│   ├── jsonUtils.ts
│   └── toastUtils.ts
├── views/
│   ├── TriggerWorkflowFormView.tsx
│   ├── WorkflowDetailView.tsx
│   └── WorkflowListView.tsx
└── list-workflows.tsx

```

## Layer Responsibilities

- **`commands/`**:

  - Entry points for Raycast commands (e.g., what users trigger from Raycast).
  - Manages overall state for a command instance (loading states, filters, user inputs).
  - Orchestrates calls to the `logic` layer for actions and data.
  - Renders `views` components, passing necessary data and callbacks.

- **`components/`**:

  - Small, reusable React UI components used across multiple `views` or `commands`.
  - Focused on a specific piece of UI and are highly generic.

- **`logic/` (`workflowActions.ts`):**

  - Houses the core application logic and orchestrates business operations.
  - Functions here represent distinct user-driven actions or logical flows.
  - Acts as a bridge, calling `services` for data and `utils` for helper tasks, then providing results to the `commands` layer.

- **`services/` (`n8nApiService.ts`):**

  - Manages all external API communications, primarily with the n8n instance.
  - Abstracts network request details and API-specific data shaping/error handling.

- **`types.ts`**:

  - Contains global TypeScript type definitions and interfaces used throughout the project, ensuring type safety and consistency.

- **`utils/`**:

  - Modules with common, pure helper functions (e.g., JSON parsing, data formatting, toast notifications).
  - Usable by any other layer.

- **`views/`**:

  - Presentational React components that define the UI for different screens or complex parts of a command (e.g., lists, forms, detail pages).
  - Receive data and action handlers as props from their parent `commands` component.
  - May manage local UI state (e.g., form input values).

- **`list-workflows.tsx` (at `src/` root):**
  - A simple re-export file. It ensures Raycast can find the main `list-workflows` command, which now resides in `src/commands/list-workflows.command.tsx`. This is a common pattern to keep the `src/` root clean while allowing a nested command structure. Other top-level command entry point files would follow this pattern if their logic is moved to `src/commands/`.

This layered structure promotes separation of concerns, making the codebase easier to navigate, test, and extend.

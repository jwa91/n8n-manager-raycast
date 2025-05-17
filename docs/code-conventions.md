# Code Conventions & Principles

This document outlines the key coding conventions and principles followed in this project to ensure a high-quality, readable, and maintainable codebase.

## Core Principles

1.  **Simplicity and Clarity:**

    - Prioritize straightforward code that is easy to understand.
    - Avoid overly complex or "clever" solutions if a simpler one achieves the same result. Code should clearly express its intent.

2.  **Single Responsibility Principle (SRP):**

    - **Functions:** Each function should aim to perform one specific task and do it well.
    - **Modules (Files):** Modules should group closely related functionalities. For instance, `n8nApiService.ts` only handles n8n API calls.

3.  **Layered Architecture Adherence:**

    - **Commands:** Handle user interaction, state, and orchestrate `logic` calls.
    - **Views/Components:** Focus on UI presentation, receiving data and callbacks as props.
    - **Logic:** Orchestrates actions, using `services` for external data and `utils` for helpers.
    - **Services:** Manage external API interactions.
    - **Utils:** Provide pure, reusable helper functions.
    - Maintain clear boundaries: e.g., UI layers should not call `services` directly but go through the `logic` layer.

4.  **Descriptive Naming:**

    - Use clear and descriptive names for variables, functions, components, types, and files. Names should reflect their purpose or the data they hold.

5.  **Modularity and Reusability:**

    - Design components (`src/components/`) and utility functions (`src/utils/`) to be as self-contained and reusable as possible with clear interfaces (props, arguments, return types).

6.  **Type Safety (TypeScript):**

    - Utilize TypeScript effectively with strong typing.
    - Define clear interfaces and types in `src/types.ts` or co-located for local types.
    - Avoid `any` where possible; prefer specific types or `unknown`.

7.  **Code Style & Formatting (Biome):**

    - The project uses Biome for linting and formatting. All code should adhere to the configured Biome rules.
    - Follow conventions from existing code
    - Run `pnpm format` regularly to maintain consistency.

8.  **DRY (Don't Repeat Yourself):**

    - Avoid duplicating code. If the same logic appears in multiple places, extract it into a reusable function or component.

9.  **Break Down Large Functions:**

    - If a function becomes too long or handles too many distinct steps, refactor it into smaller, well-named helper functions, each adhering to SRP.

10. **Minimize Side Effects:**
    - Functions in `utils/` should ideally be pure (output depends only on input, no side effects).
    - When side effects are necessary (e.g., API calls in `services/`, UI updates triggered from `logic/` or `commands/`), they should be explicit and managed.

Adherence to these conventions will help ensure the project remains robust, scalable, and easy for all contributors to work with.

11. **Code comments**
    - Exported functions, classes, etc. should have tsdocs above them
    - dont add comments for code thats clear from the code itself,
    - be to the point and not overly verbose

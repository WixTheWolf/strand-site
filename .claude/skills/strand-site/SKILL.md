```markdown
# strand-site Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `strand-site` TypeScript codebase. You'll learn how to structure files, write imports and exports, follow commit message styles, and understand the project's approach to testing. This guide is ideal for onboarding contributors or automating code review and generation.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.ts`

### Imports
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import { fetchData as getData } from './dataFetcher';
    ```

### Exports
- Use **named exports** for all modules.
  - Example:
    ```typescript
    export function fetchData() { /* ... */ }
    export const API_URL = '...';
    ```

### Commit Messages
- Commit messages are **freeform** (no strict prefixes), with an average length of 64 characters.
  - Example:
    ```
    Add user authentication and session management
    ```

## Workflows

### Code Contribution
**Trigger:** When adding new features or fixing bugs  
**Command:** `/contribute`

1. Create a new file using camelCase naming.
2. Write your TypeScript code, using named exports.
3. Use alias imports for any dependencies.
4. Write or update corresponding test files (see Testing Patterns).
5. Commit your changes with a clear, concise message.
6. Open a pull request for review.

### Testing Code
**Trigger:** Before merging changes or verifying functionality  
**Command:** `/test`

1. Locate or create test files matching the `*.test.*` pattern.
2. Write tests for your new or updated code.
3. Run the test suite using the project's test runner (framework unknown; check project scripts).
4. Ensure all tests pass before merging.

## Testing Patterns

- Test files are named with the pattern `*.test.*` (e.g., `userProfile.test.ts`).
- The specific testing framework is **unknown**; check project documentation or scripts for details.
- Place tests alongside the code they verify or in a dedicated test directory.
- Example test file:
  ```typescript
  import { fetchData } from './dataFetcher';

  test('fetchData returns expected result', () => {
    expect(fetchData()).toBe(/* expected value */);
  });
  ```

## Commands
| Command      | Purpose                                    |
|--------------|--------------------------------------------|
| /contribute  | Start the code contribution workflow       |
| /test        | Run or write tests for your code changes   |
```

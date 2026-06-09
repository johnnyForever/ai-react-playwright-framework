# AI Usage Rules (Copilot / Amazon Q)

## Code Generation Standards

AI-generated code must:

* Follow the project's coding standards and architecture
* Prefer reuse over duplication
* Include comments for assumptions
* Avoid hacks or shortcuts
* Optimize for clarity and maintainability

---

## AI Tooling

This project uses MCP servers to provide AI with structured access to:

* Playwright APIs and best practices
* Repository structure and file system
* (Optional) Git history and diffs

---

## Human-AI Collaboration

* AI is used as a coding assistant, not an autonomous agent
* All architectural decisions remain human-driven
* AI suggestions should be reviewed before committing
* Complex logic requires human validation

---

## Prompting Guidelines

When working with AI assistants:

1. Provide clear context about the task
2. Reference relevant existing code patterns
3. Specify test requirements upfront
4. Request incremental changes over large rewrites

---

## Quality Checklist for AI Code

Before accepting AI-generated code, verify:

- [ ] Follows POM pattern for page objects
- [ ] Uses correct locator strategy
- [ ] No hardcoded test data
- [ ] Proper TypeScript types (no `any`)
- [ ] Includes error handling
- [ ] Matches existing code style

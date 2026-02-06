# Sample Prompt History

This document contains example prompts used to build this AI-powered React + Playwright testing framework with GitHub Copilot.

---

1. Read file `#file:copilot-guidelines.md`. Then act as a senior developer and implement the following feature.

* Keep in mind that we will implement UI tests in the future, so add test-id for all crucial elements.
* The user can log in using email and password.
* Email must be in valid email format (e.g., demo@demo.com).
* The login button submits the form and redirects to the dashboard page if credentials are correct.
* Show error message when login fails.
* The Remember Me toggle keeps the user logged in for a longer period.
* The "Forgot Password" link redirects to the "Forgot Password" page.
* The admin link in the top menu navigates to the admin login page.
* The login link in the top menu navigates to /login or stays on the login page.
* Leaving one of the fields empty will not trigger an unnecessary backend call (frontend validation).
* The navigation component is visible only on the /login and /admin pages.

Use MCP servers server-sequential-thinking and server-filesystem to execute this task.

2. Currently we have no unit tests for our brand-new React app. Act as a developer and implement unit tests for all of the features using Vitest. We want to achieve a robust framework with added business value. Use MCP servers server-sequential-thinking and server-filesystem to achieve this task.
When you finish this task, then perform static analysis according to best practices and standards described in `#file:copilot-guidelines.md`. Finally, execute unit tests and investigate potential failures.

---

## Tips for Effective Prompts

1. **Be specific** - Mention exact file names, technologies, or patterns you want
2. **Chain requests** - You can ask for multiple related features in one prompt
3. **Reference files** - Use `#file:filename` to provide context
4. **Ask for verification** - Request tests or checks to ensure changes work
5. **Iterate** - Build on previous work with follow-up prompts
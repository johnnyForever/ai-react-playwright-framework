# Sample Prompt History

This document contains example prompts used to build this AI-powered React + Playwright testing framework with GitHub Copilot.

---

## Session 1: Initial Framework Setup

```
Create a React + Vite + TypeScript project with Playwright testing framework.
Include login, dashboard, basket/checkout features with Page Object Model pattern.
```

---

## Session 2: Test Infrastructure Enhancements

### Adding Test Tags and Readability
```
Add tag smoke and regression to tests. Add test.step() to tests so that they are more readable.
```

### Custom Logger and Database Analytics
```
Implement custom logger and set up DB for test analytics with HTML dashboard.
```

### CI/CD Pipelines
```
Create pipeline which runs all tests when PR is merged to main branch.
Create on-demand pipeline with options to select browser, tags, and retry count.
```

---

## Session 3: Code Quality and Refactoring

### ESLint Configuration
```
I see we have biome and eslint. Which one should we keep?
```

```
Keep eslint.config.js, update it and document the dual-linting approach in README.
```

### Database Query Separation
```
Keep queries for db in separated file. So the project is more readable. Use MCP server server-filesystem to do it.
```

### Fixing TypeScript Errors
```
I see errors in dashboardGenerator.ts, dbReporter.ts and generateDashboard.ts
```

---

## Session 4: Verification and Cleanup

### Testing the Logger
```
Great now lets test our new logger. How i verify how it works?
```

### Gitignore Update
```
Is our .gitignore up to date?
```

### Documentation
```
Can you create file .github/sample_prompt_history.md and store there all prompts that i gived to you (without your responses)?
```

---

## Tips for Effective Prompts

1. **Be specific** - Mention exact file names, technologies, or patterns you want
2. **Chain requests** - You can ask for multiple related features in one prompt
3. **Reference files** - Use `#file:filename` to provide context
4. **Ask for verification** - Request tests or checks to ensure changes work
5. **Iterate** - Build on previous work with follow-up prompts

Now act as senior developer.

First we want implement simple login poage. Here is feature description:

1. Feature Requirements - Authentication
User can log in using Email and Password.
Email must be in valid email format (e.g., demo@demo.com).
Login button submits the form and redirects to the dashboard page if credentials are correct.
Show error message when login fails.
Remember me toggle keeps user logged in for a longer period.
Forgot Password link redirects to forgot password page.
Admin link in the top menu navigates to the admin login page.
Login link in the top menu navigate to /login or stays on login page.
Leaving one of the fields empty will not trigger unnecessary backend call (frontend validation)
Navigation component is visible only on /login and /admin pages
Use sequentual tinking and filesitem MCP servers to implement this feature.

1. Feature Requirements - Dashboard
After sucessful login user is moved to dashboard
Dashboard contains 4 products
Each product contains photo, name, description and price
products on dashboard could be sorted in order a -z, z -a, price lowst to higher, price highest to lower
detail of each product could be displayed by clicking on its name
when product detail is displayed its contains photo, name, description and price
product detail contains button "back" that redirects user back to main dashboard.
dashboard contains header "demo app"
Only authorized user can reach dashboard
dashboard url contains /dashboard.
When unautorized user enter url /dashboard to browser , then user is not redirected to dashboard.
Use MCP servers playwright/mcp@latest, modelcontextprotocol/server-filesystem and modelcontextprotocol/server-sequential-thinking to execute this task.
# AGENTS.md

## GitHub Actions Security Review

When creating, editing, or reviewing files under `.github/workflows/`, treat the change as security-sensitive and check it against recent GitHub Actions exploitation patterns before finishing.

## Required Checks

- Verify the workflow does not use known-compromised or recently exploited actions, especially `tj-actions/changed-files` affected by CVE-2025-30066. If a workflow uses `tj-actions/changed-files`, require a patched version and explain the risk.
- Check every `uses:` entry. Prefer trusted first-party actions where possible, and call out unpinned third-party actions as a hardening concern.
- Prefer least-privilege workflow permissions, usually `permissions: contents: read` for CI jobs that only need checkout/read access.
- Avoid `pull_request_target` for workflows that check out, install, build, test, lint, or otherwise execute pull request code. If `pull_request_target` is present, explicitly justify why untrusted code cannot run with elevated permissions or secrets.
- Do not expose repository secrets, deployment credentials, cloud credentials, package tokens, or write-capable `GITHUB_TOKEN` permissions to workflows that run untrusted pull request code.
- Confirm `actions/checkout` does not persist credentials unless the workflow truly needs to push back to the repository.
- Be careful with dependency caches on pull request workflows. Ensure cache usage cannot poison trusted branches or later privileged jobs.
- Keep workflow shell commands simple and auditable. Avoid printing environment variables, dumping contexts, or echoing values derived from secrets.
- Treat inline scripts that interpolate GitHub event data, pull request titles, branch names, labels, comments, or issue text as injection-prone unless the data is passed through environment variables and safely quoted.
- Separate privileged jobs from untrusted-code jobs. A job that receives secrets or write permissions must not consume artifacts, caches, build outputs, or scripts produced by an untrusted pull request job without validation.

## Review Output

- When a GitHub Actions change is reviewed, state whether it appears exposed to the recent exploitation patterns.
- Lead with concrete findings and include affected workflow paths and lines.
- If no issue is found, say so clearly and mention which Actions-specific surfaces were checked.
- Distinguish confirmed vulnerabilities from hardening suggestions.

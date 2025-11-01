# Git Workflow: [Task Title]

**Issue/Ticket:** [Link to issue if applicable]

---

## 1. Branch Creation

- [ ] Create a new branch from `develop` with a descriptive name.
      - **Convention:** `feat/<short-description>`, `fix/<issue-number>`, or `docs/<topic>`
      - **Command:** `git checkout -b <branch_name>`

## 2. Development & Testing

- [ ] Implement the required code changes.
- [ ] Write corresponding unit and/or integration tests.
- [ ] Run all relevant tests locally to ensure they pass.
      - **API Tests:** `npm run api -- test`
      - **Web Lint:** `npm run web -- lint`
- [ ] Ensure code adheres to the project's linting and style standards.

## 3. Commit

- [ ] Stage your changes (`git add .`).
- [ ] Commit your changes using the **Conventional Commits** format.
      - **Format:** `<type>(<scope>): <subject>`
      - **Example:** `feat(api): add endpoint for user profile`
      - **Command:** `git commit -m "type(scope): subject"`
- [ ] Write a detailed commit body if the "why" is not obvious from the subject.

## 4. Pull Request (PR)

- [ ] Push your branch to the remote repository (`git push origin <branch_name>`).
- [ ] Create a Pull Request against the `develop` branch.
- [ ] Fill out the PR template, clearly describing the changes and linking any relevant issues.

## 5. Review & Merge

- [ ] Assign reviewers to your PR.
- [ ] Address any feedback or requested changes.
- [ ] Once approved, merge the PR into the `develop` branch.
- [ ] Delete the feature branch after a successful merge.

---
**Task Complete**

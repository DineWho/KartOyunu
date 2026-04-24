# AGENTS.md

This project is primarily documented in `CLAUDE.md`.

Before starting any task, read `CLAUDE.md` and follow it as the main project instruction file.

If `CLAUDE.md` refers to other project documentation files, read those files too before making changes.

Do not assume project architecture, coding style, dependencies, naming conventions, product decisions, or business logic without checking the project documentation first.

The user may ask for both small fixes and major feature work. Codex can work on major tasks, but must handle them in a controlled way.

For any non-trivial task:
- Inspect the relevant files first.
- Check the current git status.
- Understand the existing architecture before changing it.
- Explain the implementation plan before making broad changes.
- Keep changes aligned with the existing project direction.
- Avoid unnecessary rewrites.
- Avoid changing unrelated files.
- Avoid installing new dependencies unless they are clearly useful for the task.
- If a new dependency, native iOS/Android change, data model change, or architecture change is needed, explain why before proceeding.
- Do not overwrite uncommitted work.

After editing code:
- Explain which files changed.
- Explain why they changed.
- Tell the user how to test the change.
- Mention if `npx expo run:ios --device`, `npx expo start -c`, `npm install`, or `pod install` is needed.

When Codex creates a git commit:
- Use this commit subject format: `codex: YYYY-MM-DD HH:mm +03 <short summary>`.
- Use the current Istanbul time for the timestamp.
- Include `Codex-assisted change.` in the commit body.
- Include a short bullet list of what changed and which checks were run.
- Keep this convention even if the user does not explicitly remind Codex.

The user is non-technical. Explain all steps simply and clearly.

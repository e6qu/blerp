# Definition of Done

For every task/phase, mark it “done” only after the following checklist is satisfied.

1. **Plan Alignment**
   - Related item in `PLAN.md` marked `completed` (with intermediate steps updated via agent instructions).
   - Any scope change documented in `PLAN.md` or `FEATURES.md`.

2. **Code & Assets**
   - Code committed to repo with formatting/linting applied.
   - Relevant configs/infrastructure/scripts updated.
   - No leftover TODOs or commented-out code introduced by the task.

3. **Verification**
   - Automated tests added/updated and executed.
   - Manual verification notes captured in `WHAT_WE_DID.md`.
   - Clerk SDK compatibility checks run when applicable.

4. **Docs & Logs**
   - `STATUS.md` updated with date, summary, blockers (if any).
   - `WHAT_WE_DID.md` entry summarizing work, tests run, artifacts touched.
   - `DO_NEXT.md` populated with immediate follow-ups.
   - README/Design/User Story docs updated if functionality or narrative changed.

5. **Reviewability**
   - Changes understandable by another engineer (clear structure, comments where necessary).
   - Acceptance criteria (see `ACCEPTANCE_CRITERIA.md`) confirmed.
   - No unresolved review feedback (if PR-based workflow).

Only once all of the above are true should a task be considered fully done.

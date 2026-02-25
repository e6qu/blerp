# M1-PC-T4 — Redis Session Store & Cookie Helpers

- **Phase**: Milestone 1 — Phase C (Auth & Session APIs)
- **Plan Reference**: PLAN.md › Phase C Task 4
- **Status**: Pending

## Objective
Build a Redis-backed session store plus secure cookie helpers that align with security requirements (httpOnly, sameSite, domain policies) and integrate with the auth controllers.

## Scope
- Implement session persistence in Redis (with TTLs, revocation, metadata) and connect it to login/logout flows.
- Provide cookie serialization/deserialization utilities that respect environment (dev/staging/prod) and domain settings.
- Hook session store instrumentation into OpenTelemetry/logging.

## Related User Stories
- (#26) EndUser expects reliable multi-device sessions.
- (#28) EndUser wants to view/revoke sessions/devices.
- (#30) EndUser uses passwordless sessions requiring strong cookie handling.

## Acceptance & Definition of Done Alignment
- Meets DoD/Acceptance Criteria: Redis store tested (unit + integration), cookie helpers validated, docs/logs updated, security review documented.
- Works with docker-compose Redis instance and documents environment-specific configuration.

## Deliverables
- Session store module, cookie helper utilities, configuration docs, and tests verifying lifecycle behavior.

## Dependencies
- **Depends on**: `M1-PB-T4`, `M1-PC-T1`.
- **Blocking**: `M1-PC-T5`, `M1-PD-T1`, `M1-PD-T3`, `M1-PE-T4`.

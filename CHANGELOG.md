## ANQ-1810: [Sonar] Unexpected negated condition. (set-session-source.mjs:20) (2025-01-15)

- Refactored if-else block to check for positive condition (`session`) first instead of negated condition

## ANQ-1808: [Sonar] Add at least one assertion to this test case. (request-rehydration.spec.ts:89) (2025-01-15)

- Added assertions to verify that invalid request IDs (empty string and null) do not create inflight request records

## ANQ-1796: Add at least one assertion to this test case. (2023-11-15)

- Added an assertion to verify that the handler correctly extracts the identifier from the header in the test case at line 122 in linear-execute-request.spec.ts


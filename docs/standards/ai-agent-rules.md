# AI Agent Rules

Agents working in ANQR 1.0 must:

- respect package ownership
- respect authority boundaries
- respect evidence requirements
- never introduce broad generic sink folders
- never add raw SDK calls outside approved adapters/facades
- never deep-import another package internals
- add logs only through the observability facade
- add analytics only through the analytics facade
- add ads only through approved ad adapters
- preserve release/environment/trace context
- add or update tests for changed public contracts
- keep domain packages runtime-agnostic
- make rollback and risk explicit for non-trivial changes

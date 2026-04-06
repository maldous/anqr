workspace "ANQR Harness Architecture Audit Workspace v2" "Runtime-corrected Structurizr workspace for the ANQR harness. This v2 model realigns the audit around the active systemd services and the externally invoked entrypoints, with direct Codebuff SDK integration as the only modeled Codebuff path." {

    !identifiers hierarchical

    model {
        operator = person "Harness Operator" "Runs the harness, systemd services, reports, and recovery workflows." {
            tags "Verified"
        }
        discordUser = person "Discord User" "Submits interactive requests through Discord/OpenClaw." {
            tags "Verified"
        }
        reviewer = person "Architecture Reviewer" "Uses the workspace for audit, coherence review, and gap finding." {
            tags "Verified"
        }

        anqr = softwareSystem "ANQR Harness" "Repository-local automation, orchestration, integrations, diagnostics, RAG indexing, and recovery tooling for ANQR." {
            tags "Verified"
            !docs ../docs/harness
            !adrs structurizr-adrs

            repo_tooling = container "Repository Tooling" "Externally invoked repository-local CLIs for AST audits, contract checks, API generation, diagnostics, metrics, and exports." "Node.js, Python, Bash CLIs" {
                tags "Service", "Verified", "CrossCutting"
                audit_ast_density = component "audit-ast-density.mjs" "AST density audit CLI invoked from package.json." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                contracts_check = component "contracts-check.mjs" "Contract structure validation CLI invoked from package.json." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                generate_openapi = component "generate-openapi.ts" "OpenAPI generation entrypoint for QR contracts." "TypeScript CLI" {
                    tags "Capability", "Verified"
                }
                list_ast_names = component "list-ast-names.mjs" "AST symbol inventory CLI invoked from package.json." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                harness_doctor = component "harness-doctor.mjs" "Operational diagnostics entrypoint." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                harness_report = component "harness-report.mjs" "Audit/report generation entrypoint." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                show_metrics = component "show-metrics.py" "Provider metrics display utility." "Python CLI" {
                    tags "Capability", "Verified"
                }
                sonar_export = component "sonar-export.sh" "SonarQube export shell entrypoint." "Bash CLI" {
                    tags "Capability", "Verified"
                }
            }

            runtime_and_provider_routing = container "Runtime and Provider Routing" "Active request-routing and model-adapter surface. Handles Discord routing, Symphony routing, Context7 HTTP service, targeted Linear execution dispatch, and direct Codebuff SDK access." "Node.js services" {
                tags "Service", "Verified", "CrossCutting"
                discord_request_router = component "discord-request-router.mjs" "Routes Discord/OpenClaw requests into the harness runtime. Active systemd unit: anqr-discord-router.service." "Node.js service" {
                    tags "Capability", "Verified", "EventConsumer"
                }
                symphony_agent_router = component "symphony-agent-router.mjs" "Provider-aware routing adapter used by Symphony control-plane services and targeted Linear execution dispatch into worktree executors." "Node.js module/service" {
                    tags "Capability", "Verified"
                }
                symphony_router_service = component "symphony-router.service" "Active Symphony router control plane. Active systemd unit: anqr-symphony-router.service." "systemd user service" {
                    tags "Capability", "Verified", "Service"
                }
                context7_mcp_service = component "context7-http-service.mjs" "Context7 MCP HTTP service. Active systemd unit: anqr-context7-mcp.service." "Node.js HTTP service" {
                    tags "Capability", "Verified", "Service"
                }
                codebuff_direct_sdk = component "codebuff-direct" "Current direct Codebuff SDK path retained as the preferred Codebuff integration path in this v2 audit." "Node.js SDK adapter" {
                    tags "Capability", "Verified", "EventProducer"
                }
            }

            orchestration_and_recovery = container "Orchestration and Recovery" "Active control-plane services, timers, executor pool, recovery automation, and health monitors." "Node.js services plus systemd timers" {
                tags "Service", "Verified", "CrossCutting", "Scheduled"
                worktree_health = component "worktree-health.mjs" "Active worktree health service and timer. Active units: anqr-worktree-health.service and anqr-worktree-health.timer." "Node.js service" {
                    tags "Capability", "Verified", "Scheduled"
                }
                nightly_ops_pass = component "nightly-ops-pass.mjs" "Nightly maintenance pass. Active units: anqr-nightly.service and anqr-nightly.timer." "Node.js service" {
                    tags "Capability", "Verified", "Scheduled"
                }
                symphony_integrator = component "symphony-integrator.mjs" "Active integrator service. Active systemd unit: anqr-symphony-integrator.service." "Node.js service" {
                    tags "Capability", "Verified", "Service"
                }
                symphony_worktree_recovery = component "symphony-worktree-recovery.mjs" "Active worktree recovery service. Active systemd unit: anqr-symphony-worktree-recovery.service." "Node.js service" {
                    tags "Capability", "Verified", "Service"
                }
                symphony_queue_control = component "symphony-queue-control.mjs" "Queue control entrypoint for Symphony orchestration." "Node.js service/CLI" {
                    tags "Capability", "Verified", "Service"
                }
                executor_pool = component "anqr-symphony-executor@1..8" "Active executor fleet running across eight systemd user services in app-anqr-symphony-executor.slice." "systemd templated services" {
                    tags "Capability", "Verified", "Service"
                }
                rag_rebuild = component "build-index.mjs" "RAG rebuild entrypoint. Active units: anqr-rag-rebuild.service and anqr-rag-rebuild.timer." "Node.js service" {
                    tags "Capability", "Verified", "Scheduled", "EventProducer"
                }
                bridge_watchdog = component "bridge-watchdog.mjs" "Active watchdog service. Active systemd unit: anqr-watchdog.service." "Node.js watchdog" {
                    tags "Capability", "Verified", "Scheduled", "Service"
                }
            }

            linear_integration = container "Linear Integration" "Webhook handling, exports, governance, and Linear issue automation." "Node.js services and GraphQL automation" {
                tags "Service", "Verified"
                linear_webhook_receiver = component "linear-webhook-receiver.mjs" "Active webhook receiver. Active systemd unit: anqr-linear-webhook.service." "Node.js HTTP service" {
                    tags "Capability", "Verified", "EventConsumer"
                }
                linear_export_jobs = component "Linear export services" "Export jobs. Active units: anqr-linear-export.service and anqr-linear-export.timer." "Node.js service" {
                    tags "Capability", "Verified", "Scheduled", "EventProducer"
                }
                linear_automation = component "ops/integrations/linear/*.mjs" "Externally invoked Linear automation surface used for issue creation, active issue handling, updates, exports, and governance." "Node.js automation" {
                    tags "Capability", "Verified", "Service", "EventProducer"
                }
                linear_guardian = component "linear-guardian.mjs" "Governance and hygiene entrypoint for Linear workflows." "Node.js automation" {
                    tags "Capability", "Verified", "Service"
                }
            }

            email_and_notifications = container "Email and Notifications" "Inbound mail ingestion and outbound email/issue notification paths." "Node.js services" {
                tags "Service", "Verified", "CrossCutting"
                email_ingest = component "email-ingest.mjs" "Active email ingestion service and timer. Active units: anqr-email-ingest.service and anqr-email-ingest.timer." "Node.js service" {
                    tags "Capability", "Verified", "EventConsumer", "Scheduled"
                }
                sonar_linear_mail = component "sonar-linear-mail.mjs" "SonarQube-to-Linear mail/reporting entrypoint." "Node.js automation" {
                    tags "Capability", "Verified", "EventProducer"
                }
            }

            rag_and_search = container "RAG and Search" "RAG indexing, chunking, embeddings, vector storage, and search helpers. The active externally invoked entrypoint is build-index.mjs." "Node.js libraries and batch jobs" {
                tags "Service", "Verified", "CrossCutting"
                rag_build_index = component "build-index.mjs" "Externally invoked RAG index builder used by the active rebuild service/timer." "Node.js batch job" {
                    tags "Capability", "Verified", "Scheduled", "EventProducer"
                }
                search_and_vector_store = component "Search and vector store libraries" "Embeddings, chunking, vector-store, hybrid-search, and linear-search modules." "Node.js libraries" {
                    tags "Capability", "Verified", "CrossCutting"
                }
            }

            reporting_and_diagnostics = container "Reporting and Diagnostics" "Operational reporting, provider probes, and runtime diagnostics." "Node.js and Python CLIs" {
                tags "Service", "Verified", "CrossCutting"
                provider_probe_report = component "provider-probe-report.mjs" "Provider probe and report entrypoint." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                harness_report_component = component "harness-report.mjs" "Operational report generation entrypoint." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                harness_doctor_component = component "harness-doctor.mjs" "Operational diagnostics entrypoint." "Node.js CLI" {
                    tags "Capability", "Verified"
                }
                show_metrics_component = component "show-metrics.py" "Provider metrics dashboard CLI." "Python CLI" {
                    tags "Capability", "Verified"
                }
            }

            state_and_storage = container "State and Storage" "File-backed state, reports, indexes, worktree metadata, and shared low-level state modules used by active services." "Filesystem, JSON, Git worktrees" {
                tags "Service", "Verified", "DataStore", "CrossCutting"
                core_state = component "Core state modules" "ops/core and shared state/validation modules including symphony-state, bridge-result, worktree-config, and validation helpers." "Node.js modules" {
                    tags "Capability", "Verified", "CrossCutting"
                }
                reports_and_indexes = component "Reports, queue state, and indexes" "File-backed reports, queue state, vector indexes, and exports written by active services and CLIs." "Filesystem" {
                    tags "Capability", "Verified", "DataStore"
                }
                worktree_pool = component "Git worktree pool" "Shared worktree fleet used by the active Symphony executor services." "Git worktrees" {
                    tags "Capability", "Verified"
                }
            }
        }

        discord = softwareSystem "Discord" "External chat and voice platform used by end users." {
            tags "External", "Verified"
        }
        openclaw = softwareSystem "OpenClaw" "Gateway/bot runtime that mediates Discord sessions and invokes harness routing." {
            tags "External", "Verified"
        }
        linear = softwareSystem "Linear" "External issue tracking and webhook source." {
            tags "External", "Verified"
        }
        ai_providers = softwareSystem "AI Provider APIs" "External model endpoints used by Symphony routing and non-Codebuff providers." {
            tags "External", "Verified"
        }
        codebuff_service = softwareSystem "Codebuff SDK/API" "External Codebuff service used by the direct SDK path." {
            tags "External", "Verified"
        }
        context7_cloud = softwareSystem "Context7 Cloud API" "External documentation resolution service behind the local Context7 MCP service." {
            tags "External", "Verified"
        }
        sonarqube = softwareSystem "SonarQube" "External static analysis system." {
            tags "External", "Verified"
        }
        mail_store = softwareSystem "Mail Store" "External/local mail store synchronized by mbsync/notmuch." {
            tags "External", "Verified", "DataStore"
        }
        smtp = softwareSystem "SMTP / msmtp" "Outbound email transport." {
            tags "External", "Verified"
        }
        ollama = softwareSystem "Ollama" "Local model or embedding service used by RAG indexing/search support." {
            tags "External", "Verified"
        }
        systemd = softwareSystem "systemd user services and timers" "Host-level service manager running the active ANQR runtime units." {
            tags "External", "Verified", "Scheduled"
        }

        discordUser -> discord "Sends interactive requests" "Discord client"
        discord -> openclaw "Routes sessions" "Discord gateway events"
        openclaw -> anqr.runtime_and_provider_routing.discord_request_router "Forwards Discord/OpenClaw requests" "HTTP/OpenAI-compatible bridge"
        operator -> anqr.repo_tooling "Runs repository CLIs" "Shell/CLI"
        operator -> anqr.reporting_and_diagnostics "Reviews diagnostics and reports" "Shell/CLI"
        operator -> anqr "Operates the harness" "Shell/CLI"
        operator -> systemd "Operates active user services and timers" "systemctl/journalctl"
        reviewer -> anqr "Reviews the architecture and audit model" "Structurizr DSL/CLI"

        linear -> anqr.linear_integration.linear_webhook_receiver "Pushes webhook events" "HTTP webhook"
        linear -> anqr.linear_integration.linear_automation "Backlog and issue API" "GraphQL API"
        anqr.linear_integration.linear_export_jobs -> linear "Exports issues and sync data" "GraphQL API"
        anqr.linear_integration.linear_guardian -> linear "Audits and governs issues" "GraphQL API"
        openclaw -> anqr.runtime_and_provider_routing "Forwards Discord/OpenClaw requests into runtime routing" "HTTP/OpenAI-compatible bridge"
        linear -> anqr.linear_integration "Pushes webhook events and issue traffic into Linear integration" "HTTP webhook + GraphQL API"
        anqr -> linear "Creates and updates issues" "GraphQL API"
        anqr -> codebuff_service "Uses the preferred direct Codebuff integration path" "Codebuff SDK/API"
        anqr -> ai_providers "Calls routed providers" "OpenAI-compatible HTTP APIs"
        anqr -> mail_store "Reads inbound mail" "Maildir/notmuch"
        anqr -> ollama "Uses local model and embedding services" "HTTP API"
        anqr -> context7_cloud "Resolves documentation via local bridge" "HTTP API"
        anqr -> sonarqube "Exports or reads analysis findings" "HTTP API"
        anqr -> smtp "Sends outbound notifications" "SMTP"
        anqr.linear_integration -> anqr.runtime_and_provider_routing "Creates routed work from webhook and issue activity" "In-process module calls"
        anqr.runtime_and_provider_routing -> anqr.orchestration_and_recovery "Submits routed work for execution and control-plane handling" "HTTP dispatch / module calls"
        anqr.runtime_and_provider_routing -> codebuff_service "Uses the preferred direct Codebuff integration path" "Codebuff SDK/API"
        anqr.runtime_and_provider_routing -> ai_providers "Calls model providers through routing surfaces" "OpenAI-compatible HTTP APIs"
        anqr.runtime_and_provider_routing -> context7_cloud "Resolves documentation" "HTTP API"
        anqr.orchestration_and_recovery -> ai_providers "Calls routed non-Codebuff providers" "OpenAI-compatible HTTP APIs"
        anqr.orchestration_and_recovery -> anqr.state_and_storage "Reads and writes worktree state, reports, and indexes" "Filesystem/JSON"
        anqr.orchestration_and_recovery -> anqr.rag_and_search "Triggers rebuild and indexing flows" "CLI/module calls"
        anqr.orchestration_and_recovery -> anqr.runtime_and_provider_routing "Invokes routing and execution surfaces" "HTTP dispatch / module calls"
        anqr.orchestration_and_recovery -> anqr.linear_integration "Uses active issue automation surfaces" "Module calls / GraphQL automation"
        anqr.email_and_notifications -> anqr.linear_integration "Creates or updates issues from inbound email and reporting" "Module calls / GraphQL automation"
        anqr.email_and_notifications -> mail_store "Reads inbound mail" "Maildir/notmuch"
        anqr.email_and_notifications -> sonarqube "Reads analysis findings" "HTTP API"
        anqr.email_and_notifications -> linear "Creates issue-linked notifications" "GraphQL API"
        anqr.email_and_notifications -> smtp "Sends outbound notifications" "SMTP"
        anqr.linear_integration -> linear "Reads and writes issue activity" "GraphQL API"
        anqr.linear_integration -> anqr.runtime_and_provider_routing.symphony_router_service "Submits targeted work" "HTTP dispatch"
        anqr.rag_and_search -> ollama "Generates embeddings or local model output" "HTTP API"
        anqr.rag_and_search -> anqr.state_and_storage "Reads and writes indexes and artifacts" "Filesystem/JSON"
        anqr.reporting_and_diagnostics -> ai_providers "Reads provider probe results" "OpenAI-compatible HTTP APIs"
        anqr.reporting_and_diagnostics -> anqr.state_and_storage "Reads metrics and reports" "Filesystem/JSON"
        anqr.repo_tooling -> sonarqube "Exports findings" "HTTP API"
        systemd -> anqr.email_and_notifications "Runs active email services and timers" "systemd user units"
        systemd -> anqr.orchestration_and_recovery "Runs active orchestration services and timers" "systemd user units"
        systemd -> anqr.runtime_and_provider_routing "Runs active routing services" "systemd user units"
        systemd -> anqr.linear_integration "Runs active Linear services and timers" "systemd user units"
        systemd -> anqr "Runs the harness runtime" "systemd user units"

        anqr.runtime_and_provider_routing.discord_request_router -> anqr.runtime_and_provider_routing.symphony_router_service "Submits routed work" "HTTP dispatch"
        anqr.linear_integration.linear_webhook_receiver -> anqr.runtime_and_provider_routing.symphony_router_service "Triggers automation from webhook events" "HTTP dispatch"
        anqr.runtime_and_provider_routing.symphony_router_service -> anqr.orchestration_and_recovery.executor_pool "Dispatches tasks" "HTTP dispatch"
        anqr.runtime_and_provider_routing.symphony_router_service -> anqr.orchestration_and_recovery "Hands work to orchestration services" "HTTP dispatch / module calls"
        anqr.runtime_and_provider_routing.symphony_router_service -> anqr.orchestration_and_recovery.executor_pool "Submits executor requests" "HTTP dispatch"
        anqr.orchestration_and_recovery.symphony_integrator -> anqr.runtime_and_provider_routing.symphony_router_service "Feeds integrated work into the router" "HTTP dispatch"
        anqr.orchestration_and_recovery.executor_pool -> anqr.state_and_storage.worktree_pool "Uses isolated worktrees" "Git worktrees"
        anqr.orchestration_and_recovery.executor_pool -> anqr.state_and_storage.core_state "Uses shared state helpers" "In-process module calls"
        anqr.orchestration_and_recovery.executor_pool -> anqr.state_and_storage.reports_and_indexes "Writes task state and outputs" "Filesystem/JSON"
        anqr.orchestration_and_recovery.executor_pool -> anqr.runtime_and_provider_routing.codebuff_direct_sdk "Uses current Codebuff path" "In-process SDK adapter"
        anqr.orchestration_and_recovery.executor_pool -> anqr.runtime_and_provider_routing "Uses routed execution helpers" "HTTP dispatch / module calls"
        anqr.orchestration_and_recovery.executor_pool -> ai_providers "Calls non-Codebuff providers when routed" "OpenAI-compatible HTTP APIs"
        anqr.runtime_and_provider_routing.codebuff_direct_sdk -> codebuff_service "Invokes Codebuff directly" "Codebuff SDK/API"
        anqr.runtime_and_provider_routing.symphony_agent_router -> ai_providers "Selects provider endpoints" "OpenAI-compatible HTTP APIs"
        anqr.runtime_and_provider_routing.context7_mcp_service -> context7_cloud "Resolves documentation" "HTTP API"

        anqr.orchestration_and_recovery.worktree_health -> anqr.state_and_storage.worktree_pool "Checks worktree state" "Git worktrees"
        anqr.orchestration_and_recovery.worktree_health -> anqr.state_and_storage.core_state "Uses state validation helpers" "In-process module calls"
        anqr.orchestration_and_recovery.worktree_health -> anqr.state_and_storage "Reads persisted worktree state" "Filesystem/JSON"
        anqr.orchestration_and_recovery.symphony_worktree_recovery -> anqr.state_and_storage.worktree_pool "Repairs or realigns worktrees" "Git worktrees"
        anqr.orchestration_and_recovery.symphony_worktree_recovery -> anqr.state_and_storage "Reads persisted worktree metadata" "Filesystem/JSON"
        anqr.orchestration_and_recovery.nightly_ops_pass -> anqr.linear_integration.linear_automation "Runs nightly issue hygiene" "In-process module calls"
        anqr.orchestration_and_recovery.nightly_ops_pass -> anqr.linear_integration "Uses active Linear automation surfaces" "Module calls / GraphQL automation"
        anqr.orchestration_and_recovery.nightly_ops_pass -> anqr.rag_and_search.rag_build_index "Triggers rebuild work" "CLI/module calls"
        anqr.orchestration_and_recovery.nightly_ops_pass -> anqr.rag_and_search "Requests rebuild and indexing" "CLI/module calls"
        anqr.orchestration_and_recovery.rag_rebuild -> anqr.rag_and_search.rag_build_index "Executes rebuild entrypoint" "CLI invocation"
        anqr.orchestration_and_recovery.rag_rebuild -> anqr.rag_and_search "Triggers rebuild flow" "CLI/module calls"
        anqr.orchestration_and_recovery.bridge_watchdog -> anqr.linear_integration.linear_automation "Creates incident evidence or escalation" "In-process module calls"
        anqr.orchestration_and_recovery.bridge_watchdog -> anqr.linear_integration "Uses active issue escalation surfaces" "Module calls / GraphQL automation"
        anqr.orchestration_and_recovery.symphony_queue_control -> anqr.orchestration_and_recovery.executor_pool "Controls queue dispatch and capacity" "Module calls / systemd coordination"

        anqr.email_and_notifications.email_ingest -> mail_store "Reads inbound mail" "Maildir/notmuch"
        anqr.email_and_notifications.email_ingest -> anqr.linear_integration.linear_automation "Creates or updates issues from mail" "In-process module calls"
        anqr.email_and_notifications.email_ingest -> anqr.linear_integration "Uses active issue automation surfaces" "Module calls / GraphQL automation"
        anqr.email_and_notifications.sonar_linear_mail -> sonarqube "Reads findings" "HTTP API"
        anqr.email_and_notifications.sonar_linear_mail -> linear "Sends issue-linked notifications" "GraphQL API"
        anqr.email_and_notifications.sonar_linear_mail -> smtp "Sends mail" "SMTP"

        operator -> anqr.repo_tooling.audit_ast_density "Runs AST density audit" "Node.js CLI"
        operator -> anqr.repo_tooling.contracts_check "Runs contract validation" "Node.js CLI"
        operator -> anqr.repo_tooling.generate_openapi "Generates OpenAPI" "TypeScript CLI"
        operator -> anqr.repo_tooling.list_ast_names "Lists AST symbols" "Node.js CLI"
        operator -> anqr.repo_tooling.harness_doctor "Runs harness diagnostics" "Node.js CLI"
        operator -> anqr.repo_tooling.harness_report "Runs harness reports" "Node.js CLI"
        operator -> anqr.repo_tooling.show_metrics "Reads provider metrics" "Python CLI"
        operator -> anqr.repo_tooling.sonar_export "Exports Sonar findings" "Bash CLI"
        anqr.repo_tooling.audit_ast_density -> anqr.state_and_storage.reports_and_indexes "Reads AST audit inputs and writes reports" "Filesystem/JSON"
        anqr.repo_tooling.contracts_check -> anqr.state_and_storage.core_state "Uses contract/state validation helpers" "In-process module calls"
        anqr.repo_tooling.generate_openapi -> anqr.state_and_storage.reports_and_indexes "Writes generated OpenAPI artifacts" "Filesystem/JSON"
        anqr.repo_tooling.list_ast_names -> anqr.state_and_storage.reports_and_indexes "Writes AST symbol inventories" "Filesystem/JSON"
        anqr.repo_tooling.harness_doctor -> anqr.state_and_storage.reports_and_indexes "Reads runtime evidence" "Filesystem/JSON"
        anqr.repo_tooling.harness_report -> anqr.state_and_storage.reports_and_indexes "Writes audit and report output" "Filesystem/JSON"
        anqr.repo_tooling.show_metrics -> anqr.state_and_storage.reports_and_indexes "Reads metrics and reports" "Filesystem/JSON"
        anqr.repo_tooling.sonar_export -> sonarqube "Exports findings" "HTTP API"

        operator -> anqr.reporting_and_diagnostics.provider_probe_report "Runs provider probe reports" "Node.js CLI"
        operator -> anqr.reporting_and_diagnostics.harness_report_component "Runs operational reports" "Node.js CLI"
        operator -> anqr.reporting_and_diagnostics.harness_doctor_component "Runs diagnostics" "Node.js CLI"
        operator -> anqr.reporting_and_diagnostics.show_metrics_component "Reads metrics dashboards" "Python CLI"
        anqr.reporting_and_diagnostics.provider_probe_report -> ai_providers "Reads probe results" "OpenAI-compatible HTTP APIs"
        anqr.reporting_and_diagnostics.harness_report_component -> anqr.state_and_storage.reports_and_indexes "Reads and writes reports" "Filesystem/JSON"
        anqr.reporting_and_diagnostics.harness_doctor_component -> anqr.state_and_storage.reports_and_indexes "Reads runtime diagnostics" "Filesystem/JSON"
        anqr.reporting_and_diagnostics.show_metrics_component -> anqr.state_and_storage.reports_and_indexes "Reads provider metrics and reports" "Filesystem/JSON"

        anqr.rag_and_search.rag_build_index -> anqr.rag_and_search.search_and_vector_store "Uses indexing and vector search libraries" "In-process module calls"
        anqr.rag_and_search.rag_build_index -> ollama "Creates embeddings or local model output" "HTTP API"
        anqr.rag_and_search.rag_build_index -> anqr.state_and_storage.reports_and_indexes "Writes indexes" "Filesystem/JSON"

        systemd -> anqr.runtime_and_provider_routing.context7_mcp_service "Runs anqr-context7-mcp.service" "systemd user unit"
        systemd -> anqr.runtime_and_provider_routing.discord_request_router "Runs anqr-discord-router.service" "systemd user unit"
        systemd -> anqr.email_and_notifications.email_ingest "Runs anqr-email-ingest.service and timer" "systemd user units"
        systemd -> anqr.linear_integration.linear_export_jobs "Runs anqr-linear-export.service and timer" "systemd user units"
        systemd -> anqr.linear_integration.linear_webhook_receiver "Runs anqr-linear-webhook.service" "systemd user unit"
        systemd -> anqr.orchestration_and_recovery.nightly_ops_pass "Runs anqr-nightly.service and timer" "systemd user units"
        systemd -> anqr.orchestration_and_recovery.rag_rebuild "Runs anqr-rag-rebuild.service and timer" "systemd user units"
        systemd -> anqr.orchestration_and_recovery.executor_pool "Runs anqr-symphony-executor@1..8.service in app-anqr-symphony-executor.slice" "systemd templated user units"
        systemd -> anqr.orchestration_and_recovery.symphony_integrator "Runs anqr-symphony-integrator.service" "systemd user unit"
        systemd -> anqr.runtime_and_provider_routing.symphony_router_service "Runs anqr-symphony-router.service" "systemd user unit"
        systemd -> anqr.orchestration_and_recovery.symphony_worktree_recovery "Runs anqr-symphony-worktree-recovery.service" "systemd user unit"
        systemd -> anqr.orchestration_and_recovery.bridge_watchdog "Runs anqr-watchdog.service" "systemd user unit"
        systemd -> anqr.orchestration_and_recovery.worktree_health "Runs anqr-worktree-health.service and timer" "systemd user units"
    }

    views {
        systemLandscape "system-landscape" {
            include *
            autoLayout lr
        }

        systemContext anqr "system-context" {
            include *
            autoLayout lr
        }

        container anqr "containers" {
            include *
            autoLayout lr
        }

        component anqr.runtime_and_provider_routing "component-runtime-routing" {
            include *
            autoLayout lr
        }

        component anqr.orchestration_and_recovery "component-orchestration-recovery" {
            include *
            autoLayout lr
        }

        component anqr.linear_integration "component-linear-integration" {
            include *
            autoLayout lr
        }

        component anqr.repo_tooling "component-repo-tooling" {
            include *
            autoLayout lr
        }

        component anqr.email_and_notifications "component-email-notifications" {
            include *
            autoLayout lr
        }

        component anqr.rag_and_search "component-rag-search" {
            include *
            autoLayout lr
        }

        component anqr.reporting_and_diagnostics "component-reporting-diagnostics" {
            include *
            autoLayout lr
        }

        component anqr.state_and_storage "component-state-storage" {
            include *
            autoLayout lr
        }

        dynamic anqr "dynamic-discord-request" {
            title "Discord/OpenClaw request flow"
            discordUser -> discord "Sends request"
            discord -> openclaw "Routes session"
            openclaw -> anqr.runtime_and_provider_routing "Forwards request"
            anqr.runtime_and_provider_routing -> anqr.orchestration_and_recovery "Submits work"
            anqr.runtime_and_provider_routing -> codebuff_service "Uses direct Codebuff SDK"
            anqr.orchestration_and_recovery -> anqr.state_and_storage "Writes state/results"
            autoLayout lr
        }

        dynamic anqr "dynamic-linear-webhook" {
            title "Linear webhook to execution flow"
            linear -> anqr.linear_integration "Sends webhook"
            anqr.linear_integration -> anqr.runtime_and_provider_routing "Creates routed work"
            anqr.runtime_and_provider_routing -> anqr.orchestration_and_recovery "Dispatches task"
            anqr.orchestration_and_recovery -> ai_providers "Calls routed providers"
            anqr.orchestration_and_recovery -> anqr.state_and_storage "Persists results"
            autoLayout lr
        }

        dynamic anqr "dynamic-nightly-ops" {
            title "Nightly maintenance and rebuild flow"
            systemd -> anqr.orchestration_and_recovery "Runs nightly timer"
            anqr.orchestration_and_recovery -> anqr.linear_integration "Runs hygiene and active issue handling"
            anqr.orchestration_and_recovery -> anqr.rag_and_search "Requests rebuild"
            anqr.rag_and_search -> ollama "Generates embeddings"
            anqr.rag_and_search -> anqr.state_and_storage "Writes updated index"
            autoLayout lr
        }

        dynamic anqr "dynamic-email-ingest" {
            title "Email ingest to issue automation flow"
            systemd -> anqr.email_and_notifications "Runs timer/service"
            anqr.email_and_notifications -> mail_store "Reads mail"
            anqr.email_and_notifications -> anqr.linear_integration "Creates or updates issues"
            anqr.linear_integration -> linear "Writes issue activity"
            autoLayout lr
        }

        styles {
            element "Element" {
                color #222222
                background #d6e8ff
                shape roundedbox
            }
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "External" {
                background #999999
                color #ffffff
            }
            element "DataStore" {
                shape cylinder
            }
            element "Scheduled" {
                background #fff2cc
                color #222222
            }
            element "Legacy" {
                background #f4cccc
                color #222222
            }
            element "Deprecated" {
                background #ea9999
                color #222222
            }
            element "Transitional" {
                background #fce5cd
                color #222222
            }
            element "Exception" {
                background #d9d2e9
                color #222222
            }
            element "Gap" {
                background #ffe599
                color #222222
            }
            element "CrossCutting" {
                background #cfe2f3
                color #222222
            }
            relationship "Relationship" {
                thickness 3
            }
        }
    }

    configuration {
        scope softwaresystem
    }
}

workspace "ANQR Harness Production Architecture v4" "Current-runtime and target-architecture workspace for the ANQR harness." {

    !identifiers hierarchical

    model {
        operator = person "Harness Operator" "Runs the services, inspects logs, manages incidents, and controls rollout."
        discord_user = person "Discord User" "Sends interactive requests through Discord and OpenClaw."
        architecture_reviewer = person "Architecture Reviewer" "Uses Structurizr, docs, ADRs, and logs to review the harness."

        anqr_harness = softwareSystem "ANQR Harness" "Repository-local orchestration, execution, integration, recovery, diagnostics, and evidence generation for ANQR." {
            !docs ../docs/harness
            !adrs ../docs/adrs

            ingress = container "Ingress And Routing" "Current ingress and routing surfaces. Accepts Discord and Linear requests, normalizes them, and forwards work into the runtime. Current runtime includes Discord Router, Linear Webhook Receiver, Symphony Router, and OpenClaw integration." "Node.js services"
            scheduler = container "Scheduler And State Authority" "Current runtime state and queue logic. Today this responsibility is split between webhook-triggered dispatch, backlog reconciliation, queue control, runner self-pick, and durable file-backed state. Target state is one authoritative scheduler per repo." "Node.js services plus file-backed JSON state"
            executors = container "Executor Pool" "Eight executor slots backed by git worktrees and worktree-local bridges. wt1-wt4 currently serve Linear. wt5-wt8 currently serve Discord." "systemd templated services plus Node.js execution bridge"
            integration = container "Integration And Repository Control" "Branch publication, candidate admission, and single-writer integration to mainline. Current runtime uses a dedicated integrator service and git-based merge-back flows." "Node.js service plus Git"
            recovery = container "Recovery, Health, And Safety Services" "Watchdog, worktree health, reconciliation support, and recovery automation. Current runtime still performs some git-mutating repair that must be removed for production." "Node.js services and timers"
            evidence = container "Quality, Evidence, And Reporting" "Quality gates, diagnostics, reports, notifications, RAG rebuild, and audit outputs." "Node.js, Python, Bash, reports"

            state_store = container "State Store And Worktree Fleet" "File-backed durable state, evidence artifacts, integration queue state, and the git worktree fleet used by executors." "Filesystem, JSON, Git worktrees" {
                tags "DataStore"
            }
        }

        discord = softwareSystem "Discord" "External chat and voice surface."
        openclaw = softwareSystem "OpenClaw Gateway" "External gateway and bot runtime used to talk to Discord and route into the harness."
        linear = softwareSystem "Linear" "External issue tracker and webhook source."
        ai_providers = softwareSystem "AI Providers" "External AI model providers and SDK endpoints."
        git_remote = softwareSystem "Git Remote" "Remote git origin used for fetch, push, and branch publication."
        sonarqube = softwareSystem "SonarQube" "External static-analysis system."
        context7 = softwareSystem "Context7 Cloud" "External documentation resolution service."
        ollama = softwareSystem "Ollama" "Local or adjacent model and embedding service."
        mail_and_smtp = softwareSystem "Mail And SMTP" "Inbound and outbound mail systems."
        systemd = softwareSystem "systemd User Services" "Host-level service manager for long-running services and timers."

        discord_user -> discord "Sends interactive requests"
        discord -> openclaw "Delivers chat and voice sessions"
        openclaw -> anqr_harness.ingress "Forwards Discord work into the harness"
        operator -> anqr_harness "Operates the harness"
        operator -> systemd "Starts, stops, and inspects services"
        architecture_reviewer -> anqr_harness "Reviews runtime and target design"

        linear -> anqr_harness.ingress "Sends webhook events and exposes issue state"
        anqr_harness.ingress -> anqr_harness.scheduler "Creates desired work and forwards routing decisions"
        anqr_harness.scheduler -> anqr_harness.executors "Assigns claimed work to executor slots"
        anqr_harness.executors -> anqr_harness.integration "Publishes candidates for integration"
        anqr_harness.recovery -> anqr_harness.scheduler "Repairs job state, expires claims, and requests requeue"
        anqr_harness.integration -> anqr_harness.state_store "Reads and writes integration and candidate state"
        anqr_harness.scheduler -> anqr_harness.state_store "Reads and writes durable queue, claim, lease, and worktree state"
        anqr_harness.executors -> anqr_harness.state_store "Uses worktrees and writes execution evidence"
        anqr_harness.recovery -> anqr_harness.state_store "Reads health and quarantine state"
        anqr_harness.evidence -> anqr_harness.state_store "Writes reports and audit outputs"

        anqr_harness.executors -> ai_providers "Calls routed AI providers"
        anqr_harness.executors -> git_remote "Fetches and publishes branch state"
        anqr_harness.integration -> git_remote "Pushes integrated repository state"
        anqr_harness.evidence -> sonarqube "Reads or exports static-analysis findings"
        anqr_harness.ingress -> linear "Reads or writes issue metadata"
        anqr_harness.scheduler -> linear "Reads or writes issue state"
        anqr_harness.evidence -> mail_and_smtp "Reads inbound mail and sends notifications"
        anqr_harness.evidence -> context7 "Resolves documentation"
        anqr_harness.evidence -> ollama "Builds embeddings and local model outputs"
        systemd -> anqr_harness "Runs services and timers"
    }

    views {
        systemContext anqr_harness "system-context" {
            include *
            autoLayout lr
        }

        container anqr_harness "container-view" {
            include *
            autoLayout lr
        }

        styles {
            element "Person" {
                shape Person
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
            element "DataStore" {
                shape Cylinder
                background #2e7d32
                color #ffffff
            }
        }
    }
}

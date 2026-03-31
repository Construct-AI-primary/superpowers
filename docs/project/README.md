# Superpowers

Superpowers is a complete software development workflow for your coding agents, built on top of a set of composable "skills" and some initial instructions that make sure your agent uses them.

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do. 

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. 

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY. 

Next up, once you say "go", it launches a *subagent-driven-development* process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Superpowers.


## Sponsorship

If Superpowers has helped you do stuff that makes money and you are so inclined, I'd greatly appreciate it if you'd consider [sponsoring my opensource work](https://github.com/sponsors/obra).

Thanks! 

- Jesse


## Installation

**Note:** Installation differs by platform. Claude Code or Cursor have built-in plugin marketplaces. Codex and OpenCode require manual setup.

### Claude Code Official Marketplace

Superpowers is available via the [official Claude plugin marketplace](https://claude.com/plugins/superpowers)

Install the plugin from Claude marketplace:

```bash
/plugin install superpowers@claude-plugins-official
```

### Claude Code (via Plugin Marketplace)

In Claude Code, register the marketplace first:

```bash
/plugin marketplace add obra/superpowers-marketplace
```

Then install the plugin from this marketplace:

```bash
/plugin install superpowers@superpowers-marketplace
```

### Cursor (via Plugin Marketplace)

In Cursor Agent chat, install from marketplace:

```text
/add-plugin superpowers
```

or search for "superpowers" in the plugin marketplace.

### Codex

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
```

**Detailed docs:** [docs/README.codex.md](docs/README.codex.md)

### OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

**Detailed docs:** [docs/README.opencode.md](docs/README.opencode.md)

### Gemini CLI

```bash
gemini extensions install https://github.com/obra/superpowers
```

To update:

```bash
gemini extensions update superpowers
```

### Verify Installation

Start a new session in your chosen platform and ask for something that should trigger a skill (for example, "help me plan this feature" or "let's debug this issue"). The agent should automatically invoke the relevant superpowers skill.

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.

6. **requesting-code-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

7. **finishing-a-development-branch** - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## DevForge AI Enterprise Integration

Superpowers integrates with **DevForge AI**, a fully autonomous AI enterprise comprising 51 specialized agents across 7 divisions, enabling enterprise-scale autonomous development operations.

### Architecture Overview

**Multi-Company, Multi-Repository Enterprise System:**
- **DevForge AI** (`docs_devforge_ai/`): 51-agent autonomous enterprise for AI development
- **Loopy AI** (`docs_loopy_ai/`): Creative AI company (scalable to unlimited companies)
- **Construct AI Application** (separate repo): Target codebase with documentation in `docs_construct_ai/` submodule
- **OpenClaw Devices**: Dedicated distributed processing per company via Tailscale VPN

### Enterprise Divisions & Agents

#### Executive Governance (5 Agents)
**Strategic oversight and enterprise coordination:**
- **Orion** — Chief Orchestrator: Central coordination of all 51 agents, task management, conflict resolution
- **Strategos** — Chief Strategy Officer: Strategic planning, product roadmap, resource allocation
- **Insight** — Business Intelligence Director: Requirements engineering, analytics, forecasting
- **Ledger** — Financial Optimization Agent: Cost management, ROI tracking, budget planning
- **Council** — Governance Coordinator: Policy enforcement, ethics, risk management

#### Strategy & Intelligence (7 Agents)
**Market research, competitive analysis, strategic intelligence:**
- **Scout** — Market Research Specialist
- **Compass** — Competitive Intelligence Analyst
- **Oracle** — Predictive Analytics Specialist
- **Analyst** — Requirements Engineer
- **Pathfinder** — Opportunity Discovery Agent
- **Librarian** — Knowledge Graph Manager
- **Mentor** — AI Training Coordinator

#### Product & Experience (7 Agents)
**Product design, UX, and customer success:**
- **Atlas** — System Architect
- **Nova** — UX/Product Design Lead
- **Cartographer** — User Journey Mapping
- **BrandForge** — Brand Identity Manager
- **StoryCraft** — Content & Narrative Specialist
- **Catalyst** — Product Growth Strategy
- **Concierge** — Customer Experience & Onboarding

#### Engineering & AI Systems (11 Agents)
**Software development, AI engineering, quality assurance:**
- **DevCore** — Full Stack Engineering Lead
- **CodeSmith** — Backend Engineer
- **Interface** — Frontend Engineer
- **Cortex** — AI Systems Engineer
- **PromptSmith** — Prompt Engineer
- **Synth** — AI Agent Builder
- **Automata** — Workflow Automation Engineer
- **Vector** — QA & Testing Specialist
- **Fixer** — Autonomous Bug Resolution
- **Forge** — Prototyping Engineer
- **Reviewer** — Code Review Specialist

#### Data & Infrastructure (8 Agents)
**Data engineering, DevOps, monitoring:**
- **DataForge** — Data Engineering Specialist
- **Schema** — Database Architect
- **CloudOps** — DevOps & Deployment Engineer
- **Sentinel** — Cybersecurity Engineer
- **Pulse** — Product Analytics Specialist
- **Navigator** — Observability & Monitoring Engineer
- **Stream** — Real-Time Data Systems Engineer
- **LedgerAI** — Cost Monitoring Specialist

#### Security, Risk & Compliance (6 Agents)
**Security, compliance, and risk management:**
- **Guardian** — Compliance & Legal Specialist
- **Auditor** — Internal Audit Coordinator
- **Gatekeeper** — Access Control Manager
- **Watchtower** — Threat Detection Analyst
- **Archivist** — Data Governance Specialist
- **SentinelX** — Security Incident Response

#### Revenue, Growth & Ecosystem (7 Agents)
**Sales, marketing, partnerships, market expansion:**
- **DealMaker** — Sales Strategy Specialist
- **CatalystX** — Marketing Campaigns Manager
- **Amplifier** — Social Media & Distribution Manager
- **Ally** — Partnership Manager
- **Merchant** — Marketplace Strategy Specialist
- **Ambassador** — Community & Developer Relations
- **Voyager** — Market Expansion Strategist

### Integration Architecture

#### Cross-Repository Enterprise Operations
- **Agent Definitions**: `docs_devforge_ai/` contains 51 agent specifications and orchestration logic
- **Target Codebase**: Separate Construct AI repository for application development
- **Documentation**: `docs_construct_ai/` submodule provides comprehensive application documentation
- **Distributed Processing**: OpenClaw devices provide dedicated compute per company

#### Memory & Knowledge Systems
- **PARA Knowledge Management**: Universal knowledge foundation across all companies
- **Gigabrain**: Intelligent recall and context awareness
- **LCM**: Session continuity and memory persistence
- **OpenStinger**: Cross-session pattern recognition and learning

#### Communication Infrastructure
- **DevForge Messaging Bus**: Inter-agent communication and coordination
- **Task Queue System**: Centralized task distribution and dependency management
- **Knowledge Graph**: Enterprise-wide information sharing and retrieval
- **Tailscale VPN**: Secure distributed networking between OpenClaw devices

### Multi-Company Framework

#### Company Isolation & Federation
- **Resource Isolation**: Dedicated compute, storage, and network per company
- **Knowledge Separation**: Company-specific PARA knowledge bases with optional sharing
- **Security Boundaries**: Complete isolation with configurable federation
- **Scaling Independence**: Each company scales independently based on needs

#### Cross-Company Collaboration
- **Knowledge Marketplace**: Optional sharing of insights and best practices
- **Task Delegation**: Inter-company task assignment for specialized work
- **Federated Orchestration**: Multi-company agent coordination for complex projects
- **Performance Benchmarking**: Comparative analytics across companies

### Enterprise Success Metrics

- **Agent Utilization**: >90% active engagement across all companies
- **Task Completion**: >95% successful autonomous task execution
- **Innovation Rate**: New capabilities developed per company per quarter
- **Quality Assurance**: 100% automated testing and review coverage
- **Scalability**: Support for unlimited companies with linear performance scaling

### Getting Started with DevForge AI

#### Company Registration
```bash
# Register a new autonomous company
openclaw company register --name devforge-ai \
  --repo /Users/_General/superpowers/docs_devforge_ai \
  --agents 51 \
  --orchestrator orion
```

#### Repository Configuration
```bash
# Configure cross-repository access
openclaw repo map --name construct-ai-codebase \
  --url https://github.com/construct-ai/main-app.git \
  --docs-submodule /Users/_General/superpowers/docs_construct_ai
```

#### Enterprise Deployment
```bash
# Deploy complete autonomous enterprise
openclaw company deploy devforge-ai \
  --memory-system full \
  --federation enabled \
  --scaling auto
```

### Enterprise Features

- **Autonomous Operation**: 24/7 development operations without human intervention
- **Quality Assurance**: Built-in testing, review, and validation processes
- **Scalability**: From single-agent tasks to enterprise-scale operations
- **Knowledge Continuity**: Persistent learning and improvement across sessions
- **Multi-Modal Intelligence**: Text, code, design, and strategic capabilities
- **Enterprise Security**: Comprehensive compliance and risk management

This integration transforms Superpowers from an individual developer workflow into a complete autonomous enterprise development platform, capable of managing multiple independent AI companies with sophisticated inter-company collaboration and knowledge sharing.

## What's Inside

### Skills Library

**Testing**
- **test-driven-development** - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**
- **systematic-debugging** - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
- **verification-before-completion** - Ensure it's actually fixed

**Collaboration** 
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback
- **using-git-worktrees** - Parallel development branches
- **finishing-a-development-branch** - Merge/PR decision workflow
- **subagent-driven-development** - Fast iteration with two-stage review (spec compliance, then code quality)

**Meta**
- **writing-skills** - Create new skills following best practices (includes testing methodology)
- **using-superpowers** - Introduction to the skills system

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success

Read more: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

## Contributing

Skills live directly in this repository. To contribute:

1. Fork the repository
2. Clone with submodules: `git clone --recurse-submodules https://github.com/Construct-AI-primary/superpowers.git`
   - Or if you've already cloned: `git submodule update --init --recursive`
   - Or run the setup script: `./setup.sh`
3. Create a branch for your skill
4. Follow the `writing-skills` skill for creating and testing new skills
5. Submit a PR

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Skills update automatically when you update the plugin:

```bash
/plugin update superpowers
```

## License

MIT License - see LICENSE file for details

## Community

Superpowers is built by [Jesse Vincent](https://blog.fsck.com) and the rest of the folks at [Prime Radiant](https://primeradiant.com).

For community support, questions, and sharing what you're building with Superpowers, join us on [Discord](https://discord.gg/Jd8Vphy9jq).

## Support

- **Discord**: [Join us on Discord](https://discord.gg/Jd8Vphy9jq)
- **Issues**: https://github.com/obra/superpowers/issues
- **Marketplace**: https://github.com/obra/superpowers-marketplace

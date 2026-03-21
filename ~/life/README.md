# PARA Knowledge Management System - Workspace Durable Truth

## Overview
This PARA system serves as the **universal durable truth layer** for the entire workspace, providing permanent knowledge storage that survives all memory compaction and session management. It contains atomic facts, fundamental principles, and historical context that form the foundational knowledge base accessed by all tools and systems.

**Location**: `~/life/` - Workspace-universal durable knowledge repository
**Scope**: Universal truths, permanent facts, foundational knowledge (NOT company-specific, page-specific, or app-specific)
**Persistence**: Survives all memory system operations and compaction
**Access**: Available to ALL tools, systems, and agents across the entire workspace

## Relationship to Other PARA Systems

### DevForge AI PARA System (`docs_devforge_ai/para/`)
**Enterprise-specific knowledge management for the 51-agent autonomous system:**
- **Scope**: DevForge AI operations, agent coordination, enterprise governance
- **Content**: Agent specifications, orchestration procedures, quality frameworks
- **Purpose**: Operational knowledge backbone for autonomous enterprise functioning
- **Integration**: Version-controlled repository with distributed synchronization

### Key Distinctions
| Aspect | `~/life/` (Workspace-Universal) | `docs_devforge_ai/para/` (Company-Specific) |
|--------|--------------------------------|--------------------------------------------|
| **Scope** | Universal workspace knowledge | DevForge AI enterprise only |
| **Content** | Atomic facts, fundamental principles | Operational procedures, agent coordination |
| **Access** | ALL tools & systems workspace-wide | DevForge AI agents and orchestration only |
| **Persistence** | Survives all memory operations | Version-controlled repository |
| **Purpose** | Foundational knowledge base | Enterprise operational knowledge |

## Structure

### Projects
Cross-discipline project navigation and portfolio management
- `active-commercial/` → Commercial discipline active projects
- `active-construction/` → Construction discipline active projects
- `active-procurement/` → Procurement discipline active projects

### Areas
Ongoing responsibilities and operational domains
- `agent_orchestration/` → Agent coordination and management
- `quality_assurance/` → Testing and validation processes
- `knowledge_management/` → Documentation and knowledge systems

### Resources
Reference materials and reusable knowledge
- `analyses/` → System analysis documents
- `agents/` → Agent specifications and capabilities
- `templates/` → Standardized project and process templates

### Archives
Historical knowledge and completed work
- `completed_projects/` → Finished project documentation
- `historical_decisions/` → Major architectural decisions
- `lessons_learned/` → Project postmortems and insights

## Navigation

### Finding Projects
```bash
# View all active projects across disciplines
ls ~/life/projects/

# Access commercial projects
ls ~/life/projects/active-commercial/active/

# Find specific project
find ~/life/projects/ -name "*supplier*" -type d
```

### Knowledge Discovery
```bash
# Search for analysis documents
find ~/life/resources/analyses/ -name "*.md" | head -5

# Find agent specifications
ls ~/life/resources/agents/
```

## Usage Guidelines

### For Agents
1. **Consult PARA first** when starting new work
2. **Contribute insights** to appropriate PARA sections
3. **Reference existing knowledge** to avoid duplication

### For Knowledge Management
1. **Regular curation** of PARA content
2. **Cross-linking** related information
3. **Archive maintenance** for completed work

## Integration with Memory System

This PARA structure integrates with the layered memory system:
- **Daily Memory**: `memory/YYYY-MM-DD.md` for operational notes
- **Gigabrain**: Intelligent recall across PARA content
- **LCM**: Session continuity for PARA-based workflows

## Maintenance

### Daily Tasks
- Review and organize new content
- Update cross-references
- Archive completed work

### Weekly Tasks
- Audit PARA structure integrity
- Update navigation documentation
- Review knowledge contribution patterns

### Monthly Tasks
- Comprehensive content curation
- Performance optimization
- User feedback integration
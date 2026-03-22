---
title: Memory System Prompt Template
description: Standardized template for leveraging Construct AI memory system with Gigabrain in Cline
version: 1.0
memory_layer: durable_knowledge
para_section: docs/memory-stack/templates
gigabrain_tags: prompt-template, memory-system, cline-integration, gigabrain-usage, knowledge-management
openstinger_context: prompt-engineering, memory-system-integration, ai-assistant-optimization
last_updated: 2026-03-21
related_docs:
  - docs_construct_ai/Cline Memory System Usage Guide.md
  - WORKSPACE_MEMORY_SYSTEM.md
  - docs_construct_ai/Memory System Quick Reference Methodology.md
---

# Memory System Prompt Template

## Overview

This template provides a standardized structure for prompts that leverage the full power of the Construct AI memory system with Gigabrain integration in Cline. Use this template to ensure comprehensive knowledge access, intelligent search, and contextual awareness.

## Core Template Structure

```
[TASK DESCRIPTION]

Using the Construct AI memory system with Gigabrain:

**PARA Navigation:**
- Access [specific PARA paths, e.g., docs_construct_ai/para/pages/disciplines/01900_procurement/]
- Reference related areas: [additional PARA paths]

**Gigabrain Search:**
- Search gigabrain tags for "[primary-tag], [secondary-tag], [context-tag]"
- Filter by tags: [relevant tags like "security", "procurement", "coding-standards"]

**Memory Context:**
- Include memory headers showing related_docs, para_section, and gigabrain_tags
- Cross-reference with [related disciplines/documents]
- Check memory/YYYY-MM-DD.md for recent session context

**Knowledge Integration:**
- Follow cross-references in memory headers
- Identify patterns across similar procedures
- Build on established organizational knowledge

[SPECIFIC REQUIREMENTS OR QUESTIONS]
```

## Template Variables Guide

| Variable | Purpose | Examples | Required |
|----------|---------|----------|----------|
| `[TASK DESCRIPTION]` | Clear statement of what you want to accomplish | "Implement user authentication system", "Analyze security vulnerabilities" | ✅ |
| `[specific PARA paths]` | Direct paths to relevant knowledge areas | `docs_construct_ai/para/pages/disciplines/01900_procurement/` | ✅ |
| `[additional PARA paths]` | Related knowledge areas for context | `docs_construct_ai/para/pages/codebase/security/` | ❌ |
| `[primary-tag], [secondary-tag]` | Main search terms (2-3 max) | `"security", "compliance", "api"` | ✅ |
| `[relevant tags]` | Additional filtering tags | `"workflow", "implementation", "testing"` | ❌ |
| `[related disciplines/documents]` | Connected knowledge areas | "procurement workflows, safety procedures" | ❌ |
| `[SPECIFIC REQUIREMENTS]` | Detailed instructions or constraints | "Include error handling", "Follow REST API standards" | ❌ |

## Use Case Templates

### Development Implementation
```
Implement [FEATURE] using the memory system:

PARA Navigation:
- Access docs_construct_ai/para/pages/disciplines/[DISCIPLINE_CODE]/
- Reference docs_construct_ai/para/pages/codebase/development/

Gigabrain Search:
- Search gigabrain tags for "[feature-type]", "implementation", "[domain]"

Memory Context:
- Include memory headers and cross-references for context
- Reference coding standards from docs_construct_ai/para/pages/codebase/coding-standards/

Create a complete implementation following established patterns.
```

### Research & Analysis
```
Analyze [TOPIC] using memory system integration:

PARA Navigation:
- Access docs_construct_ai/para/pages/disciplines/[DISCIPLINE_CODE]/
- Reference docs_construct_ai/para/pages/codebase/[RELEVANT_AREA]/

Gigabrain Search:
- Search gigabrain tags for "[topic]", "[subtopic]", "[context]"

Memory Context:
- Include cross-references to related disciplines
- Check memory headers for related_docs and dependencies

Provide comprehensive analysis with organizational context.
```

### Documentation Creation
```
Create [DOCUMENT_TYPE] with memory system integration:

PARA Navigation:
- Use docs_construct_ai/para/pages/codebase/docs/ as template
- Reference docs_construct_ai/para/pages/[RELEVANT_AREA]/

Gigabrain Search:
- Search gigabrain tags for "[doc-type]", "documentation", "[domain]"

Memory Context:
- Include memory headers with appropriate gigabrain_tags
- Cross-reference related documents and procedures

Structure output for future memory system integration.
```

### Troubleshooting & Debugging
```
Troubleshoot [ISSUE] using memory system resources:

PARA Navigation:
- Access docs_construct_ai/para/pages/codebase/errors/
- Reference docs_construct_ai/para/pages/disciplines/[RELEVANT_DISCIPLINE]/

Gigabrain Search:
- Search gigabrain tags for "troubleshooting", "[issue-type]", "[component]"

Memory Context:
- Include cross-references to similar issues and solutions
- Check memory/YYYY-MM-DD.md for recent related work

Provide systematic debugging approach with organizational knowledge.
```

## Best Practices

### Template Usage
1. **Start with Task Description** - Be specific and actionable
2. **Prioritize PARA Paths** - Use the most relevant knowledge areas first
3. **Limit Tags to 2-3** - More focused results, better relevance
4. **Include Memory Context** - Always request headers and cross-references
5. **Add Specific Requirements** - Guide the response format and constraints

### Optimization Tips
- **Be Specific**: Use exact PARA paths and precise gigabrain tags
- **Request Selectively**: Ask for relevant cross-references, not everything
- **Build Context**: Accumulate knowledge across related areas
- **Preserve Relationships**: Maintain cross-reference awareness
- **Structure Output**: Request organized responses with clear sections

### Common Patterns
- **Multi-Discipline**: Access 2-3 PARA areas for comprehensive context
- **Session Continuity**: Reference recent memory/YYYY-MM-DD.md entries
- **Pattern Recognition**: Request identification of similar implementations
- **Future Reference**: Structure outputs for easy memory integration

## Integration Checklist

### For Every Prompt
- [ ] **Task Description**: Clear, specific objective
- [ ] **PARA Navigation**: At least one specific path
- [ ] **Gigabrain Search**: 2-3 relevant tags
- [ ] **Memory Context**: Request headers and cross-references
- [ ] **Knowledge Integration**: Request pattern identification

### For Complex Tasks
- [ ] **Multi-Area Access**: Multiple PARA areas referenced
- [ ] **Cross-Discipline Links**: Related discipline connections
- [ ] **Session Context**: Recent memory integration
- [ ] **Relationship Mapping**: Cross-reference analysis
- [ ] **Structured Output**: Organized response format

## Success Metrics

### Quality Indicators
- **Relevance**: Information directly addresses the task
- **Context**: Includes organizational knowledge and patterns
- **Connections**: Shows relationships between knowledge areas
- **Completeness**: Comprehensive coverage of relevant areas
- **Actionability**: Provides practical, implementable guidance

### Efficiency Indicators
- **Speed**: Quick access to relevant information
- **Accuracy**: Correct application of organizational knowledge
- **Consistency**: Follows established patterns and procedures
- **Integration**: Seamlessly combines multiple knowledge sources

## Troubleshooting

### If Context Seems Incomplete
```
Request: "Expand the context by checking related_docs in memory headers, following cross-references to connected disciplines, and searching gigabrain tags for broader related content."
```

### If Navigation Is Unclear
```
Ask: "Use PARA navigation to explore docs_construct_ai/para/pages/ and identify the most relevant knowledge areas for this task, including cross-discipline connections."
```

### If Search Results Are Too Broad
```
Specify: "Filter gigabrain search results to focus on [specific context] and limit to [2-3 most relevant tags]."
```

## Version History

- **v1.0** (2026-03-21): Initial template creation with core structure and examples
- Comprehensive use case templates and best practices
- Integration checklist and troubleshooting guide

## Related Resources

- [Cline Memory System Usage Guide](docs_construct_ai/Cline Memory System Usage Guide.md)
- [Memory System Quick Reference Methodology](docs_construct_ai/Memory System Quick Reference Methodology.md)
- [WORKSPACE_MEMORY_SYSTEM.md](WORKSPACE_MEMORY_SYSTEM.md)
- [PARA Navigation Structure](PARA.md)
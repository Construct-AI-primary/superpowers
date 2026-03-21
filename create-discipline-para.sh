#!/bin/bash

# Create PARA-focused discipline structures for DevForge AI
# This script generates discipline-specific PARA content instead of symlinks

set -e

# Base directory for DevForge AI disciplines
DISCIPLINE_BASE="docs_devforge_ai/para/pages/disciplines"

# List of disciplines to create PARA structures for
DISCIPLINES=(
    "00250-commercial"
    "00300_construction"
    "00400_contracts"
    "00425_contracts-pre-award"
    "00430_contracts-pre-award"
    "00435_contracts-post-award"
    "00825_architectural"
    "00835_chemical-engineering"
    "00850_civil-engineering"
    "00850_landscaping"
    "00855_geotechnical-engineering"
    "00860_electrical-engineering"
    "00870_mechanical-engineering"
    "00871_process-engineering"
    "00872_structural"
    "00877_sales"
    "00880_board-of-directors"
    "00882_construction-director"
    "00883_contracts-director"
    "00884_engineering-director"
    "00885_hse-director"
    "00886_logistics-director"
    "00888_procurement-director"
    "00889_finance-director"
    "00890_projects-director"
    "00895_project-director"
    "00900-document-control"
    "01000_environmental"
    "01100_ethics"
    "01200_finance"
    "01200_sales"
    "01300_developer"
    "01300_governance"
    "01400_health"
    "01500_human-resources"
    "01500_information-technology"
    "01600_local-content"
    "01700_logistics"
    "01750_legal"
    "01800_operations"
    "01800_public-relations"
    "01850_other-parties"
    "01900_procurement"
    "02000_document-control"
    "02000_project-controls"
    "02025_quantity-surveying"
    "02035_scheduling"
    "02050-information-technology"
    "02075_inspection"
    "02200_quality-assurance"
    "02250_quality-control"
    "02400_safety"
    "02500_security"
    "03000_sundry"
)

# Function to create PARA structure for a discipline
create_discipline_para() {
    local discipline="$1"

    echo "Creating PARA structure for discipline: $discipline"

    # Create directory structure
    mkdir -p "$DISCIPLINE_BASE/$discipline/projects/active"
    mkdir -p "$DISCIPLINE_BASE/$discipline/projects/completed"
    mkdir -p "$DISCIPLINE_BASE/$discipline/projects/on_hold"
    mkdir -p "$DISCIPLINE_BASE/$discipline/areas"
    mkdir -p "$DISCIPLINE_BASE/$discipline/resources"

    # Create README.md for the discipline
    cat > "$DISCIPLINE_BASE/$discipline/README.md" << EOF
# $discipline Discipline - DevForge AI PARA

## Overview
$discipline discipline application within DevForge AI autonomous operations.

## PARA Structure

### Projects
Active $discipline initiatives and projects specific to DevForge AI operations.

### Areas
Ongoing $discipline responsibilities and operational areas.

### Resources
$discipline frameworks, tools, and reference materials for DevForge AI use.

## Integration
- **Documentation**: [$discipline Reference](../../../docs_construct_ai/disciplines/$discipline/)
- **Standards**: $discipline process standards and compliance frameworks
- **Tools**: Specialized tools and templates for $discipline operations

## Key Focus Areas
- DevForge AI specific applications of $discipline practices
- Integration with autonomous AI operations
- Quality assurance and compliance monitoring
- Continuous improvement and optimization

---
*DevForge AI $discipline Operations*
EOF

    # Create projects README
    cat > "$DISCIPLINE_BASE/$discipline/projects/README.md" << EOF
# $discipline Projects - DevForge AI

## Project Status Overview

### Active Projects
**Location**: \`active/\`
**Naming Convention**: \`$discipline-YYYY-NNN-project-description\`
**Status**: Currently in progress, actively worked on

### Completed Projects
**Location**: \`completed/\`
**Naming Convention**: \`$discipline-YYYY-NNN-project-description\`
**Status**: Successfully completed, archived for reference

### On Hold Projects
**Location**: \`on_hold/\`
**Naming Convention**: \`$discipline-YYYY-NNN-project-description\`
**Status**: Paused pending resources, decisions, or dependencies

## Current Active Projects

### $discipline-2026-001-process-automation
**Status**: Active
**Timeline**: Ongoing
**Objective**: Automate $discipline processes using AI agents
**Resources**: [Reference Docs](../../../docs_construct_ai/disciplines/$discipline/)

### $discipline-2026-002-quality-assurance
**Status**: Active
**Timeline**: Q1-Q2 2026
**Objective**: Implement comprehensive QA for $discipline operations
**Resources**: QA frameworks, testing protocols

### $discipline-2026-003-process-optimization
**Status**: Planning
**Timeline**: Q2 2026
**Objective**: Optimize $discipline workflows for efficiency
**Resources**: Process mapping tools, optimization frameworks

## Project Management Guidelines

### Project Naming
- **Format**: \`{DISCIPLINE}-{YEAR}-{SEQUENTIAL_NUMBER}-{DESCRIPTION}\`
- **Example**: \`00250-2026-001-implement-supplier-portal-api\`
- **Sequential**: Numbers increment within each year
- **Description**: Hyphen-separated, descriptive project name

### Project Lifecycle
1. **Planning**: Requirements gathering and design
2. **Active**: Implementation and execution
3. **Review**: Quality assurance and testing
4. **Completed**: Successful delivery and documentation
5. **Archived**: Moved to completed/ directory

### Status Tracking
- **Active**: Daily progress updates required
- **On Hold**: Weekly status reviews
- **Completed**: Post-mortem documentation required

---
*DevForge AI $discipline Project Management*
EOF

    # Create areas README
    cat > "$DISCIPLINE_BASE/$discipline/areas/README.md" << EOF
# $discipline Areas - DevForge AI

## Operational Areas

### Process Management
Ongoing management and oversight of $discipline processes within autonomous operations.

### Quality Assurance
Continuous monitoring and improvement of $discipline quality standards.

### Integration Management
Coordination between $discipline operations and other business functions.

### Compliance Monitoring
Ensuring adherence to $discipline standards and regulatory requirements.

## Key Responsibilities
- Process standardization and documentation
- Quality control and assurance
- Integration with enterprise systems
- Compliance monitoring and reporting

---
*DevForge AI $discipline Operational Areas*
EOF

    # Create resources README
    cat > "$DISCIPLINE_BASE/$discipline/resources/README.md" << EOF
# $discipline Resources - DevForge AI

## Reference Materials

### Standards & Procedures
- $discipline operational standards
- Process documentation templates
- Quality assurance protocols

### Tools & Templates
- Workflow automation tools
- Documentation templates
- Reporting frameworks

### Training Materials
- Process training guides
- Quality assurance training
- Integration best practices

## External References
- [Complete $discipline Documentation](../../../docs_construct_ai/disciplines/$discipline/)
- Industry standards and best practices
- Regulatory compliance frameworks

---
*DevForge AI $discipline Resources*
EOF

    echo "✅ Created PARA structure for $discipline"
}

# Main execution
echo "Creating PARA-focused discipline structures for DevForge AI..."
echo "======================================================="

# Create base directory if it doesn't exist
mkdir -p "$DISCIPLINE_BASE"

# Create PARA structures for each discipline
for discipline in "${DISCIPLINES[@]}"; do
    create_discipline_para "$discipline"
done

echo
echo "🎯 PARA-focused discipline structures created successfully!"
echo "📁 Location: $DISCIPLINE_BASE"
echo "📚 Each discipline now has projects/, areas/, and resources/ directories"
echo "🔗 Reference links to docs_construct_ai maintained for documentation access"
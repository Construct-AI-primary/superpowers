#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillGenerator {
  constructor() {
    this.template = `---
memory_layer: durable_knowledge
para_section: pages/skills/{skillName}
gigabrain_tags: [{tags}]
openstinger_context: [{context}]
last_updated: 2026-03-30
related_docs:
{relatedDocs}
related_skills:
{relatedSkills}
frequency_percent: {frequency}
success_rate_percent: {successRate}
---

# {title}

## Overview
{overview}

## When to Use This Skill
{triggerConditions}

## Step-by-Step Procedure
{procedureSteps}

## Success Criteria
{successCriteria}

## Common Pitfalls
{commonPitfalls}

## Cross-References
{crossReferences}

## Performance Metrics
- **Average Implementation Time:** {avgTime}
- **Success Rate:** {successRate}%
- **Frequency:** {frequency}% of relevant tasks
`;
  }

  generateSkill(options) {
    const content = this.template
      .replace('{skillName}', options.skillName)
      .replace('{tags}', options.tags || 'implementation')
      .replace('{context}', options.context || 'development')
      .replace('{title}', options.title || options.skillName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .replace('{overview}', options.overview || 'Skill overview to be completed')
      .replace('{triggerConditions}', options.triggerConditions || '- When this skill is needed')
      .replace('{procedureSteps}', options.procedureSteps || '### Step 1: Implement feature\nDetailed implementation steps')
      .replace('{successCriteria}', options.successCriteria || '- [ ] Feature implemented successfully')
      .replace('{commonPitfalls}', options.commonPitfalls || '1. **Common Issue** - Solution')
      .replace('{crossReferences}', options.crossReferences || '### Related Procedures\n- Source procedure documentation')
      .replace('{frequency}', options.frequency || '50.0')
      .replace('{successRate}', options.successRate || '85.0')
      .replace('{avgTime}', options.avgTime || '30 minutes')
      .replace(/{relatedDocs}/g, options.relatedDocs || '- docs/procedures/related-procedure.md')
      .replace(/{relatedSkills}/g, options.relatedSkills || '- related-skill');

    return content;
  }

  createSkill(skillName, options = {}) {
    const skillDir = path.join(__dirname, '..', 'skills', skillName);
    const skillFile = path.join(skillDir, 'SKILL.md');

    // Create directory if it doesn't exist
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // Generate skill content
    const content = this.generateSkill({ skillName, ...options });

    // Write file
    fs.writeFileSync(skillFile, content);

    console.log(`✅ Created skill: ${skillName}`);
    console.log(`   Location: ${skillFile}`);

    return skillFile;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const skillName = args[0];

  if (!skillName) {
    console.log('Usage: node generate-skill.js <skill-name> [options]');
    console.log('Example: node generate-skill.js my-new-skill');
    process.exit(1);
  }

  const generator = new SkillGenerator();
  generator.createSkill(skillName);
}

module.exports = SkillGenerator;
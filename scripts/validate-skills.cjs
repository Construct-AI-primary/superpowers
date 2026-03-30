#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillsValidator {
  async validateAllSkills() {
    console.log('🔍 Starting skills validation...\n');

    const skillsDir = path.join(__dirname, '..', 'skills');
    const skillDirs = fs.readdirSync(skillsDir)
      .filter(dir => fs.statSync(path.join(skillsDir, dir)).isDirectory());

    let totalSkills = 0;
    let validSkills = 0;
    const issues = [];

    for (const skillDir of skillDirs) {
      if (skillDir === 'README.md') continue;

      totalSkills++;
      const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');

      try {
        const content = fs.readFileSync(skillPath, 'utf8');

        // Validate frontmatter
        if (!content.startsWith('---')) {
          issues.push(`${skillDir}: Missing frontmatter`);
          continue;
        }

        // Validate required sections
        const requiredSections = ['## Overview', '## When to Use This Skill', '## Step-by-Step Procedure'];
        const missingSections = requiredSections.filter(section => !content.includes(section));

        if (missingSections.length > 0) {
          issues.push(`${skillDir}: Missing sections: ${missingSections.join(', ')}`);
          continue;
        }

        // Validate cross-references
        const crossRefSection = content.indexOf('## Cross-References');
        if (crossRefSection === -1) {
          issues.push(`${skillDir}: Missing cross-references section`);
          continue;
        }

        validSkills++;
        console.log(`✅ ${skillDir}: Valid`);

      } catch (error) {
        issues.push(`${skillDir}: File read error - ${error.message}`);
      }
    }

    console.log(`\n📊 Validation Results:`);
    console.log(`   Total Skills: ${totalSkills}`);
    console.log(`   Valid Skills: ${validSkills}`);
    console.log(`   Issues Found: ${issues.length}`);

    if (issues.length > 0) {
      console.log(`\n❌ Issues:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      process.exit(1);
    } else {
      console.log(`\n🎉 All skills validated successfully!`);
    }
  }
}

// Run validation
const validator = new SkillsValidator();
validator.validateAllSkills().catch(console.error);
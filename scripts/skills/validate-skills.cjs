#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillsValidator {
  constructor() {
    this.skillsDir = path.join(__dirname, '..', 'skills');
    this.docsDir = path.join(__dirname, '..', 'docs_construct_ai');
    this.allSkills = [];
    this.crossReferenceIssues = [];
    this.brokenLinks = [];
  }

  async validateAllSkills() {
    console.log('🔍 Starting comprehensive skills validation...\n');

    const skillDirs = fs.readdirSync(this.skillsDir)
      .filter(dir => fs.statSync(path.join(this.skillsDir, dir)).isDirectory());

    let totalSkills = 0;
    let validSkills = 0;
    const issues = [];

    // First pass: Load all skills
    for (const skillDir of skillDirs) {
      if (skillDir === 'README.md') continue;
      totalSkills++;
      const skillPath = path.join(this.skillsDir, skillDir, 'SKILL.md');

      try {
        const content = fs.readFileSync(skillPath, 'utf8');
        const skillData = this.parseSkillFile(content, skillDir);
        this.allSkills.push(skillData);
      } catch (error) {
        issues.push(`${skillDir}: File read error - ${error.message}`);
      }
    }

    // Second pass: Validate each skill
    for (const skill of this.allSkills) {
      const skillIssues = await this.validateSkill(skill);
      issues.push(...skillIssues);

      if (skillIssues.length === 0) {
        validSkills++;
        console.log(`✅ ${skill.name}: Valid`);
      } else {
        console.log(`❌ ${skill.name}: ${skillIssues.length} issues`);
      }
    }

    // Third pass: Cross-reference validation
    console.log('\n🔗 Validating cross-references...');
    await this.validateCrossReferences();

    // Combine all issues
    const allIssues = [...issues, ...this.crossReferenceIssues, ...this.brokenLinks];

    console.log(`\n📊 Validation Results:`);
    console.log(`   Total Skills: ${totalSkills}`);
    console.log(`   Valid Skills: ${validSkills}`);
    console.log(`   Structural Issues: ${issues.length}`);
    console.log(`   Cross-Reference Issues: ${this.crossReferenceIssues.length}`);
    console.log(`   Broken Links: ${this.brokenLinks.length}`);
    console.log(`   Total Issues: ${allIssues.length}`);

    if (allIssues.length > 0) {
      console.log(`\n❌ Issues Found:`);

      if (issues.length > 0) {
        console.log(`\n   Structural Issues:`);
        issues.forEach(issue => console.log(`     - ${issue}`));
      }

      if (this.crossReferenceIssues.length > 0) {
        console.log(`\n   Cross-Reference Issues:`);
        this.crossReferenceIssues.forEach(issue => console.log(`     - ${issue}`));
      }

      if (this.brokenLinks.length > 0) {
        console.log(`\n   Broken Links:`);
        this.brokenLinks.forEach(issue => console.log(`     - ${issue}`));
      }

      process.exit(1);
    } else {
      console.log(`\n🎉 All skills validated successfully!`);
      console.log(`   ✅ Structural validation passed`);
      console.log(`   ✅ Cross-references validated`);
      console.log(`   ✅ Links verified`);
    }
  }

  parseSkillFile(content, skillName) {
    const skill = {
      name: skillName,
      content: content,
      frontmatter: {},
      relatedDocs: [],
      relatedSkills: []
    };

    // Extract frontmatter
    if (content.startsWith('---')) {
      const endFrontmatter = content.indexOf('---', 3);
      if (endFrontmatter !== -1) {
        const frontmatterText = content.substring(3, endFrontmatter);
        skill.frontmatter = this.parseFrontmatter(frontmatterText);
      }
    }

    // Extract related docs and skills
    const relatedDocsMatch = content.match(/related_docs:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
    if (relatedDocsMatch) {
      skill.relatedDocs = relatedDocsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    const relatedSkillsMatch = content.match(/related_skills:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
    if (relatedSkillsMatch) {
      skill.relatedSkills = relatedSkillsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    return skill;
  }

  parseFrontmatter(text) {
    const frontmatter = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
        }

        frontmatter[key] = value;
      }
    }

    return frontmatter;
  }

  async validateSkill(skill) {
    const issues = [];

    // Validate frontmatter
    if (!skill.frontmatter.memory_layer) {
      issues.push(`${skill.name}: Missing memory_layer in frontmatter`);
    }

    if (!skill.frontmatter.para_section) {
      issues.push(`${skill.name}: Missing para_section in frontmatter`);
    }

    if (!skill.frontmatter.gigabrain_tags) {
      issues.push(`${skill.name}: Missing gigabrain_tags in frontmatter`);
    }

    // Validate required sections
    const requiredSections = [
      '## Overview',
      '## When to Use This Skill',
      '## Step-by-Step Procedure',
      '## Success Criteria',
      '## Common Pitfalls',
      '## Cross-References'
    ];

    for (const section of requiredSections) {
      if (!skill.content.includes(section)) {
        issues.push(`${skill.name}: Missing required section "${section}"`);
      }
    }

    // Validate frequency and success rate
    const frequency = parseFloat(skill.frontmatter.frequency_percent);
    const successRate = parseFloat(skill.frontmatter.success_rate_percent);

    if (isNaN(frequency) || frequency < 0 || frequency > 100) {
      issues.push(`${skill.name}: Invalid frequency_percent (must be 0-100)`);
    }

    if (isNaN(successRate) || successRate < 0 || successRate > 100) {
      issues.push(`${skill.name}: Invalid success_rate_percent (must be 0-100)`);
    }

    return issues;
  }

  async validateCrossReferences() {
    // Check related skills exist
    for (const skill of this.allSkills) {
      for (const relatedSkill of skill.relatedSkills) {
        const relatedSkillExists = this.allSkills.some(s => s.name === relatedSkill);
        if (!relatedSkillExists) {
          this.crossReferenceIssues.push(
            `${skill.name}: Related skill "${relatedSkill}" does not exist`
          );
        }
      }
    }

    // Check related documents exist
    for (const skill of this.allSkills) {
      for (const docPath of skill.relatedDocs) {
        if (!await this.fileExists(docPath)) {
          this.brokenLinks.push(`${skill.name}: Related document "${docPath}" does not exist`);
        }
      }
    }

    // Validate internal consistency
    for (const skill of this.allSkills) {
      // Check if skill references itself
      if (skill.relatedSkills.includes(skill.name)) {
        this.crossReferenceIssues.push(`${skill.name}: Skill references itself in related_skills`);
      }

      // Check for duplicate references
      const uniqueSkills = new Set(skill.relatedSkills);
      if (uniqueSkills.size !== skill.relatedSkills.length) {
        this.crossReferenceIssues.push(`${skill.name}: Duplicate entries in related_skills`);
      }

      const uniqueDocs = new Set(skill.relatedDocs);
      if (uniqueDocs.size !== skill.relatedDocs.length) {
        this.crossReferenceIssues.push(`${skill.name}: Duplicate entries in related_docs`);
      }
    }
  }

  async fileExists(filePath) {
    try {
      // Handle different path formats
      let fullPath;

      if (filePath.startsWith('docs_construct_ai/')) {
        fullPath = path.join(__dirname, '..', filePath);
      } else if (filePath.startsWith('docs/')) {
        fullPath = path.join(__dirname, '..', filePath);
      } else if (filePath.startsWith('https://')) {
        // External links - consider valid for now
        return true;
      } else {
        // Relative path from skills directory
        fullPath = path.join(this.skillsDir, filePath);
      }

      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

// Run validation
const validator = new SkillsValidator();
validator.validateAllSkills().catch(console.error);

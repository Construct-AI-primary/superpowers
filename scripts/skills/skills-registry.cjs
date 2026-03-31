#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillsRegistry {
  constructor() {
    this.skillsDir = path.join(__dirname, '..', 'skills');
    this.registry = {
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalSkills: 0,
        categories: {},
        tags: {}
      },
      skills: {},
      searchIndex: {},
      relationships: {
        skillToSkill: {},
        skillToDocs: {},
        categoryToSkills: {},
        tagToSkills: {}
      }
    };
  }

  async buildRegistry() {
    console.log('🏗️  Building Skills Registry...\n');

    await this.loadAllSkills();
    this.buildSearchIndex();
    this.buildRelationships();
    this.generateMetadata();
    this.saveRegistry();

    console.log('✅ Skills Registry built successfully!');
    return this.registry;
  }

  async loadAllSkills() {
    const skillDirs = fs.readdirSync(this.skillsDir)
      .filter(dir => fs.statSync(path.join(this.skillsDir, dir)).isDirectory());

    for (const skillDir of skillDirs) {
      if (skillDir === 'README.md') continue;

      const skillPath = path.join(this.skillsDir, skillDir, 'SKILL.md');

      try {
        const content = fs.readFileSync(skillPath, 'utf8');
        const skillData = this.parseSkillData(content, skillDir);
        this.registry.skills[skillDir] = skillData;
        this.registry.metadata.totalSkills++;
      } catch (error) {
        console.warn(`⚠️  Failed to load skill ${skillDir}: ${error.message}`);
      }
    }
  }

  parseSkillData(content, skillName) {
    const skill = {
      name: skillName,
      content: content,
      metadata: {},
      relationships: {
        relatedSkills: [],
        relatedDocs: [],
        category: 'uncategorized',
        tags: []
      },
      searchTerms: [],
      lastModified: null
    };

    // Extract frontmatter
    if (content.startsWith('---')) {
      const endFrontmatter = content.indexOf('---', 3);
      if (endFrontmatter !== -1) {
        const frontmatterText = content.substring(3, endFrontmatter);
        skill.metadata = this.parseFrontmatter(frontmatterText);
      }
    }

    // Extract relationships
    const relatedSkillsMatch = content.match(/related_skills:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
    if (relatedSkillsMatch) {
      skill.relationships.relatedSkills = relatedSkillsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    const relatedDocsMatch = content.match(/related_docs:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
    if (relatedDocsMatch) {
      skill.relationships.relatedDocs = relatedDocsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    // Extract tags and category
    if (skill.metadata.gigabrain_tags) {
      skill.relationships.tags = Array.isArray(skill.metadata.gigabrain_tags)
        ? skill.metadata.gigabrain_tags
        : [skill.metadata.gigabrain_tags];

      skill.relationships.category = this.determineCategory(skill.relationships.tags);
    }

    // Build search terms
    skill.searchTerms = this.buildSearchTerms(skill);

    // Get file modification time
    const skillPath = path.join(this.skillsDir, skillName, 'SKILL.md');
    try {
      const stats = fs.statSync(skillPath);
      skill.lastModified = stats.mtime.toISOString();
    } catch (error) {
      skill.lastModified = new Date().toISOString();
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

  determineCategory(tags) {
    if (tags.some(tag => tag.includes('ui-frontend'))) return 'UI/Frontend';
    if (tags.some(tag => tag.includes('agent'))) return 'Agent Development';
    if (tags.some(tag => tag.includes('database'))) return 'Database';
    if (tags.some(tag => tag.includes('i18n'))) return 'Internationalization';
    if (tags.some(tag => tag.includes('testing'))) return 'Testing';
    if (tags.some(tag => tag.includes('git'))) return 'Version Control';
    return 'General Development';
  }

  buildSearchTerms(skill) {
    const terms = new Set();

    // Add skill name parts
    skill.name.split('-').forEach(part => terms.add(part.toLowerCase()));

    // Add tags
    skill.relationships.tags.forEach(tag => {
      tag.split('-').forEach(part => terms.add(part.toLowerCase()));
    });

    // Add category
    skill.relationships.category.split('/').forEach(part => {
      terms.add(part.toLowerCase());
    });

    // Add related skills
    skill.relationships.relatedSkills.forEach(related => {
      related.split('-').forEach(part => terms.add(part.toLowerCase()));
    });

    // Extract keywords from content
    const content = skill.content.toLowerCase();
    const keywordPatterns = [
      /##\s+(.+)/g,  // Section headers
      /\*\*(.+?)\*\*/g,  // Bold text
      /`(.+?)`/g,  // Code snippets
      /(\w+)\s+skill/g,  // "X skill" patterns
    ];

    keywordPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const keyword = match[1].toLowerCase().trim();
        if (keyword.length > 2) {
          terms.add(keyword);
        }
      }
    });

    return Array.from(terms);
  }

  buildSearchIndex() {
    this.registry.searchIndex = {};

    Object.values(this.registry.skills).forEach(skill => {
      skill.searchTerms.forEach(term => {
        if (!this.registry.searchIndex[term]) {
          this.registry.searchIndex[term] = [];
        }
        this.registry.searchIndex[term].push(skill.name);
      });
    });
  }

  buildRelationships() {
    const { relationships } = this.registry;

    // Build skill-to-skill relationships
    Object.values(this.registry.skills).forEach(skill => {
      relationships.skillToSkill[skill.name] = skill.relationships.relatedSkills;
    });

    // Build skill-to-docs relationships
    Object.values(this.registry.skills).forEach(skill => {
      relationships.skillToDocs[skill.name] = skill.relationships.relatedDocs;
    });

    // Build category-to-skills relationships
    Object.values(this.registry.skills).forEach(skill => {
      const category = skill.relationships.category;
      if (!relationships.categoryToSkills[category]) {
        relationships.categoryToSkills[category] = [];
      }
      relationships.categoryToSkills[category].push(skill.name);
    });

    // Build tag-to-skills relationships
    Object.values(this.registry.skills).forEach(skill => {
      skill.relationships.tags.forEach(tag => {
        if (!relationships.tagToSkills[tag]) {
          relationships.tagToSkills[tag] = [];
        }
        relationships.tagToSkills[tag].push(skill.name);
      });
    });
  }

  generateMetadata() {
    const { metadata } = this.registry;

    metadata.lastUpdated = new Date().toISOString();

    // Count skills by category
    metadata.categories = {};
    Object.values(this.registry.skills).forEach(skill => {
      const category = skill.relationships.category;
      metadata.categories[category] = (metadata.categories[category] || 0) + 1;
    });

    // Count skills by tag
    metadata.tags = {};
    Object.values(this.registry.skills).forEach(skill => {
      skill.relationships.tags.forEach(tag => {
        metadata.tags[tag] = (metadata.tags[tag] || 0) + 1;
      });
    });
  }

  saveRegistry() {
    const outputPath = path.join(__dirname, '..', 'skills-registry.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.registry, null, 2));
    console.log(`💾 Registry saved to: ${outputPath}`);
  }

  // Public API methods for using the registry
  searchSkills(query, options = {}) {
    const { category, tags, limit = 10 } = options;
    const queryTerms = query.toLowerCase().split(/\s+/);

    let candidates = Object.keys(this.registry.skills);

    // Filter by category if specified
    if (category) {
      candidates = this.registry.relationships.categoryToSkills[category] || [];
    }

    // Filter by tags if specified
    if (tags && tags.length > 0) {
      candidates = candidates.filter(skillName => {
        const skill = this.registry.skills[skillName];
        return tags.some(tag => skill.relationships.tags.includes(tag));
      });
    }

    // Score and rank results
    const scoredResults = candidates.map(skillName => {
      const skill = this.registry.skills[skillName];
      let score = 0;

      queryTerms.forEach(term => {
        if (skill.searchTerms.includes(term)) score += 10;
        if (skill.name.toLowerCase().includes(term)) score += 5;
        if (skill.relationships.tags.some(tag => tag.includes(term))) score += 3;
      });

      return { skill: skillName, score, data: skill };
    }).filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredResults;
  }

  getSkill(skillName) {
    return this.registry.skills[skillName] || null;
  }

  getRelatedSkills(skillName) {
    const related = this.registry.relationships.skillToSkill[skillName] || [];
    return related.map(name => this.registry.skills[name]).filter(Boolean);
  }

  getSkillsByCategory(category) {
    const skillNames = this.registry.relationships.categoryToSkills[category] || [];
    return skillNames.map(name => this.registry.skills[name]).filter(Boolean);
  }

  getSkillsByTag(tag) {
    const skillNames = this.registry.relationships.tagToSkills[tag] || [];
    return skillNames.map(name => this.registry.skills[name]).filter(Boolean);
  }

  getRegistryStats() {
    return {
      totalSkills: this.registry.metadata.totalSkills,
      categories: Object.keys(this.registry.metadata.categories).length,
      totalTags: Object.keys(this.registry.metadata.tags).length,
      lastUpdated: this.registry.metadata.lastUpdated
    };
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'build') {
    const registry = new SkillsRegistry();
    registry.buildRegistry().catch(console.error);
  } else if (command === 'search') {
    const query = process.argv[3];
    if (!query) {
      console.log('Usage: node skills-registry.cjs search "query"');
      process.exit(1);
    }

    const registry = new SkillsRegistry();
    registry.buildRegistry().then(() => {
      const results = registry.searchSkills(query);
      console.log(`\n🔍 Search Results for "${query}":\n`);
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.skill} (score: ${result.score})`);
        console.log(`   Category: ${result.data.relationships.category}`);
        console.log(`   Tags: ${result.data.relationships.tags.join(', ')}\n`);
      });
    }).catch(console.error);
  } else if (command === 'stats') {
    const registry = new SkillsRegistry();
    registry.buildRegistry().then(() => {
      const stats = registry.getRegistryStats();
      console.log('\n📊 Skills Registry Statistics:\n');
      console.log(`   Total Skills: ${stats.totalSkills}`);
      console.log(`   Categories: ${stats.categories}`);
      console.log(`   Total Tags: ${stats.totalTags}`);
      console.log(`   Last Updated: ${stats.lastUpdated}`);
    }).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node skills-registry.cjs build    # Build/update the registry');
    console.log('  node skills-registry.cjs search "query"  # Search skills');
    console.log('  node skills-registry.cjs stats   # Show registry statistics');
  }
}

module.exports = SkillsRegistry;
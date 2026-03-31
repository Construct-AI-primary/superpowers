#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillsPerformanceDashboard {
  constructor() {
    this.skillsDir = path.join(__dirname, '..', 'skills');
    this.dashboardData = {
      summary: {},
      skills: [],
      categories: {},
      trends: {},
      recommendations: []
    };
  }

  async generateDashboard() {
    console.log('📊 Generating Skills Performance Dashboard...\n');

    await this.loadSkillsData();
    this.analyzePerformance();
    this.generateRecommendations();
    this.displayDashboard();

    // Save dashboard data
    this.saveDashboardData();
  }

  async loadSkillsData() {
    const skillDirs = fs.readdirSync(this.skillsDir)
      .filter(dir => fs.statSync(path.join(this.skillsDir, dir)).isDirectory());

    for (const skillDir of skillDirs) {
      if (skillDir === 'README.md') continue;

      const skillPath = path.join(this.skillsDir, skillDir, 'SKILL.md');

      try {
        const content = fs.readFileSync(skillPath, 'utf8');
        const skillData = this.parseSkillData(content, skillDir);
        this.dashboardData.skills.push(skillData);
      } catch (error) {
        console.warn(`⚠️  Failed to load skill ${skillDir}: ${error.message}`);
      }
    }
  }

  parseSkillData(content, skillName) {
    const skill = {
      name: skillName,
      frequency: 0,
      successRate: 0,
      category: 'uncategorized',
      lastUpdated: null,
      relatedSkills: [],
      relatedDocs: [],
      tags: []
    };

    // Extract frontmatter
    if (content.startsWith('---')) {
      const endFrontmatter = content.indexOf('---', 3);
      if (endFrontmatter !== -1) {
        const frontmatterText = content.substring(3, endFrontmatter);
        const frontmatter = this.parseFrontmatter(frontmatterText);

        skill.frequency = parseFloat(frontmatter.frequency_percent) || 0;
        skill.successRate = parseFloat(frontmatter.success_rate_percent) || 0;
        skill.lastUpdated = frontmatter.last_updated;
        skill.tags = Array.isArray(frontmatter.gigabrain_tags)
          ? frontmatter.gigabrain_tags
          : (frontmatter.gigabrain_tags ? [frontmatter.gigabrain_tags] : []);

        // Determine category from tags
        skill.category = this.determineCategory(skill.tags);
      }
    }

    // Extract related skills and docs
    const relatedSkillsMatch = content.match(/related_skills:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
    if (relatedSkillsMatch) {
      skill.relatedSkills = relatedSkillsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    const relatedDocsMatch = content.match(/related_docs:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
    if (relatedDocsMatch) {
      skill.relatedDocs = relatedDocsMatch[1]
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

  determineCategory(tags) {
    if (tags.some(tag => tag.includes('ui-frontend'))) return 'UI/Frontend';
    if (tags.some(tag => tag.includes('agent'))) return 'Agent Development';
    if (tags.some(tag => tag.includes('database'))) return 'Database';
    if (tags.some(tag => tag.includes('i18n'))) return 'Internationalization';
    if (tags.some(tag => tag.includes('testing'))) return 'Testing';
    if (tags.some(tag => tag.includes('git'))) return 'Version Control';
    return 'General Development';
  }

  analyzePerformance() {
    const skills = this.dashboardData.skills;

    // Summary statistics
    this.dashboardData.summary = {
      totalSkills: skills.length,
      avgFrequency: skills.reduce((sum, s) => sum + s.frequency, 0) / skills.length,
      avgSuccessRate: skills.reduce((sum, s) => sum + s.successRate, 0) / skills.length,
      highFrequencySkills: skills.filter(s => s.frequency > 70).length,
      lowSuccessRateSkills: skills.filter(s => s.successRate < 80).length,
      categories: {}
    };

    // Category analysis
    skills.forEach(skill => {
      if (!this.dashboardData.summary.categories[skill.category]) {
        this.dashboardData.summary.categories[skill.category] = {
          count: 0,
          avgFrequency: 0,
          avgSuccessRate: 0,
          skills: []
        };
      }

      const cat = this.dashboardData.summary.categories[skill.category];
      cat.count++;
      cat.avgFrequency += skill.frequency;
      cat.avgSuccessRate += skill.successRate;
      cat.skills.push(skill.name);
    });

    // Calculate category averages
    Object.keys(this.dashboardData.summary.categories).forEach(cat => {
      const category = this.dashboardData.summary.categories[cat];
      category.avgFrequency /= category.count;
      category.avgSuccessRate /= category.count;
    });

    // Trends analysis
    this.dashboardData.trends = {
      topPerformers: skills
        .filter(s => s.frequency > 50 && s.successRate > 85)
        .sort((a, b) => (b.frequency * b.successRate) - (a.frequency * a.successRate))
        .slice(0, 5),

      needsImprovement: skills
        .filter(s => s.successRate < 80 || s.frequency < 30)
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, 5),

      mostConnected: skills
        .sort((a, b) => (b.relatedSkills.length + b.relatedDocs.length) - (a.relatedSkills.length + a.relatedDocs.length))
        .slice(0, 5)
    };
  }

  generateRecommendations() {
    const { summary, trends } = this.dashboardData;

    // Framework health recommendations
    if (summary.lowSuccessRateSkills > summary.totalSkills * 0.2) {
      this.dashboardData.recommendations.push({
        type: 'critical',
        message: 'High number of low-success-rate skills detected. Review and improve skill procedures.',
        action: 'Audit skills with <80% success rate'
      });
    }

    if (summary.avgFrequency < 40) {
      this.dashboardData.recommendations.push({
        type: 'warning',
        message: 'Overall skill utilization is low. Consider improving skill discoverability.',
        action: 'Enhance skill search and recommendation systems'
      });
    }

    // Category balance recommendations
    const categories = Object.keys(summary.categories);
    if (categories.length < 5) {
      this.dashboardData.recommendations.push({
        type: 'info',
        message: 'Limited skill categories. Consider expanding coverage.',
        action: 'Create skills for underrepresented development areas'
      });
    }

    // Top performer leverage
    if (trends.topPerformers.length > 0) {
      this.dashboardData.recommendations.push({
        type: 'success',
        message: `Leverage top-performing skills: ${trends.topPerformers.map(s => s.name).join(', ')}`,
        action: 'Use these skills as templates for new skill creation'
      });
    }

    // Improvement targets
    if (trends.needsImprovement.length > 0) {
      this.dashboardData.recommendations.push({
        type: 'warning',
        message: `Focus improvement on: ${trends.needsImprovement.map(s => s.name).join(', ')}`,
        action: 'Review procedures and update success criteria'
      });
    }
  }

  displayDashboard() {
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                        🎯 SKILLS PERFORMANCE DASHBOARD                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

    this.displaySummary();
    this.displayCategoryAnalysis();
    this.displayTrends();
    this.displayRecommendations();
  }

  displaySummary() {
    const { summary } = this.dashboardData;

    console.log('📈 OVERVIEW METRICS');
    console.log('─'.repeat(50));
    console.log(`   Total Skills:        ${summary.totalSkills}`);
    console.log(`   Average Frequency:   ${summary.avgFrequency.toFixed(1)}%`);
    console.log(`   Average Success Rate: ${summary.avgSuccessRate.toFixed(1)}%`);
    console.log(`   High-Frequency Skills: ${summary.highFrequencySkills}`);
    console.log(`   Low-Success Skills:  ${summary.lowSuccessRateSkills}`);
    console.log('');
  }

  displayCategoryAnalysis() {
    const { categories } = this.dashboardData.summary;

    console.log('🏷️  CATEGORY ANALYSIS');
    console.log('─'.repeat(50));

    Object.entries(categories).forEach(([category, data]) => {
      console.log(`   ${category}:`);
      console.log(`     • Skills: ${data.count}`);
      console.log(`     • Avg Frequency: ${data.avgFrequency.toFixed(1)}%`);
      console.log(`     • Avg Success: ${data.avgSuccessRate.toFixed(1)}%`);
    });
    console.log('');
  }

  displayTrends() {
    const { trends } = this.dashboardData;

    console.log('📊 PERFORMANCE TRENDS');
    console.log('─'.repeat(50));

    if (trends.topPerformers.length > 0) {
      console.log('   🏆 Top Performers:');
      trends.topPerformers.forEach(skill => {
        console.log(`     • ${skill.name} (${skill.frequency}% freq, ${skill.successRate}% success)`);
      });
    }

    if (trends.needsImprovement.length > 0) {
      console.log('   ⚠️  Needs Improvement:');
      trends.needsImprovement.forEach(skill => {
        console.log(`     • ${skill.name} (${skill.frequency}% freq, ${skill.successRate}% success)`);
      });
    }

    if (trends.mostConnected.length > 0) {
      console.log('   🔗 Most Connected:');
      trends.mostConnected.forEach(skill => {
        const connections = skill.relatedSkills.length + skill.relatedDocs.length;
        console.log(`     • ${skill.name} (${connections} connections)`);
      });
    }
    console.log('');
  }

  displayRecommendations() {
    const { recommendations } = this.dashboardData;

    if (recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('─'.repeat(50));

      recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' :
                    rec.type === 'warning' ? '⚠️' :
                    rec.type === 'success' ? '✅' : 'ℹ️';
        console.log(`   ${icon} ${rec.message}`);
        console.log(`      → ${rec.action}`);
        console.log('');
      });
    }
  }

  saveDashboardData() {
    const outputPath = path.join(__dirname, '..', 'skills-dashboard.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.dashboardData, null, 2));
    console.log(`💾 Dashboard data saved to: ${outputPath}`);
  }
}

// Run dashboard
const dashboard = new SkillsPerformanceDashboard();
dashboard.generateDashboard().catch(console.error);
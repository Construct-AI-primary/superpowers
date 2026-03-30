#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillsUsageTracker {
  constructor() {
    this.usageLogPath = path.join(__dirname, '..', 'skills-usage-log.json');
    this.usageData = this.loadUsageData();
  }

  loadUsageData() {
    try {
      if (fs.existsSync(this.usageLogPath)) {
        const data = fs.readFileSync(this.usageLogPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️  Failed to load usage data:', error.message);
    }

    // Initialize with default structure
    return {
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        totalEvents: 0
      },
      events: [],
      summary: {
        skillsAccessed: {},
        users: {},
        timeRanges: {},
        categories: {}
      }
    };
  }

  saveUsageData() {
    try {
      fs.writeFileSync(this.usageLogPath, JSON.stringify(this.usageData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save usage data:', error.message);
    }
  }

  trackUsage(skillName, userId = 'system', context = {}) {
    const event = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      skillName: skillName,
      userId: userId,
      context: {
        source: context.source || 'direct', // 'search', 'recommendation', 'direct'
        category: context.category || 'unknown',
        tags: context.tags || [],
        searchQuery: context.searchQuery || null,
        success: context.success !== false, // Default to true
        duration: context.duration || null, // Time spent using the skill
        ...context
      }
    };

    this.usageData.events.push(event);
    this.usageData.metadata.totalEvents++;
    this.updateSummary(event);
    this.saveUsageData();

    return event.id;
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateSummary(event) {
    const { summary } = this.usageData;
    const { skillName, userId, context } = event;

    // Track skill access frequency
    summary.skillsAccessed[skillName] = (summary.skillsAccessed[skillName] || 0) + 1;

    // Track user activity
    summary.users[userId] = (summary.users[userId] || 0) + 1;

    // Track category usage
    if (context.category && context.category !== 'unknown') {
      summary.categories[context.category] = (summary.categories[context.category] || 0) + 1;
    }

    // Track time-based usage (by hour)
    const hour = new Date(event.timestamp).getHours();
    const timeKey = `${hour.toString().padStart(2, '0')}:00`;
    summary.timeRanges[timeKey] = (summary.timeRanges[timeKey] || 0) + 1;
  }

  getUsageStats(options = {}) {
    const { skillName, userId, since, category, limit = 50 } = options;
    let events = [...this.usageData.events];

    // Apply filters
    if (skillName) {
      events = events.filter(e => e.skillName === skillName);
    }

    if (userId) {
      events = events.filter(e => e.userId === userId);
    }

    if (since) {
      const sinceDate = new Date(since);
      events = events.filter(e => new Date(e.timestamp) >= sinceDate);
    }

    if (category) {
      events = events.filter(e => e.context.category === category);
    }

    // Sort by timestamp (most recent first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply limit
    events = events.slice(0, limit);

    return {
      totalEvents: events.length,
      events: events,
      summary: this.generateFilteredSummary(events)
    };
  }

  generateFilteredSummary(events) {
    const summary = {
      skills: {},
      users: {},
      categories: {},
      successRate: 0,
      avgDuration: null
    };

    let totalSuccess = 0;
    let totalDuration = 0;
    let durationCount = 0;

    events.forEach(event => {
      // Count skills
      summary.skills[event.skillName] = (summary.skills[event.skillName] || 0) + 1;

      // Count users
      summary.users[event.userId] = (summary.users[event.userId] || 0) + 1;

      // Count categories
      if (event.context.category) {
        summary.categories[event.context.category] = (summary.categories[event.context.category] || 0) + 1;
      }

      // Track success
      if (event.context.success) {
        totalSuccess++;
      }

      // Track duration
      if (event.context.duration) {
        totalDuration += event.context.duration;
        durationCount++;
      }
    });

    summary.successRate = events.length > 0 ? (totalSuccess / events.length) * 100 : 0;
    summary.avgDuration = durationCount > 0 ? totalDuration / durationCount : null;

    return summary;
  }

  getPopularSkills(limit = 10) {
    const skillCounts = Object.entries(this.usageData.summary.skillsAccessed)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);

    return skillCounts.map(([skill, count]) => ({ skill, count }));
  }

  getActiveUsers(limit = 10) {
    const userCounts = Object.entries(this.usageData.summary.users)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);

    return userCounts.map(([user, count]) => ({ user, count }));
  }

  getUsagePatterns() {
    const patterns = {
      peakHours: this.findPeakHours(),
      successTrends: this.calculateSuccessTrends(),
      categoryPreferences: this.getCategoryPreferences(),
      searchEffectiveness: this.analyzeSearchUsage()
    };

    return patterns;
  }

  findPeakHours() {
    const hourCounts = Object.entries(this.usageData.summary.timeRanges)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return hourCounts.map(([hour, count]) => ({ hour, count }));
  }

  calculateSuccessTrends() {
    const recentEvents = this.usageData.events
      .filter(e => {
        const eventDate = new Date(e.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
      });

    const successCount = recentEvents.filter(e => e.context.success).length;
    const successRate = recentEvents.length > 0 ? (successCount / recentEvents.length) * 100 : 0;

    return {
      recentSuccessRate: successRate,
      totalRecentEvents: recentEvents.length,
      trend: successRate > 85 ? 'excellent' : successRate > 70 ? 'good' : 'needs_improvement'
    };
  }

  getCategoryPreferences() {
    return Object.entries(this.usageData.summary.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  analyzeSearchUsage() {
    const searchEvents = this.usageData.events.filter(e => e.context.searchQuery);

    if (searchEvents.length === 0) {
      return { searchUsageRate: 0, avgResults: 0 };
    }

    const searchUsageRate = (searchEvents.length / this.usageData.events.length) * 100;

    // This would need more complex analysis in a real implementation
    return {
      searchUsageRate: searchUsageRate,
      totalSearches: searchEvents.length,
      avgResults: 'unknown' // Would need to track search result counts
    };
  }

  generateReport(options = {}) {
    const { since, format = 'console' } = options;

    const stats = this.getUsageStats({ since });
    const patterns = this.getUsagePatterns();
    const popularSkills = this.getPopularSkills();
    const activeUsers = this.getActiveUsers();

    const report = {
      generated: new Date().toISOString(),
      period: since ? `since ${since}` : 'all time',
      summary: {
        totalEvents: this.usageData.metadata.totalEvents,
        filteredEvents: stats.totalEvents,
        successRate: stats.summary.successRate,
        avgDuration: stats.summary.avgDuration
      },
      topSkills: popularSkills,
      topUsers: activeUsers,
      patterns: patterns,
      recentActivity: stats.events.slice(0, 10)
    };

    if (format === 'console') {
      this.displayConsoleReport(report);
    } else if (format === 'json') {
      return report;
    }

    return report;
  }

  displayConsoleReport(report) {
    console.log('📊 SKILLS USAGE REPORT');
    console.log('═'.repeat(50));
    console.log(`Generated: ${report.generated}`);
    console.log(`Period: ${report.period}`);
    console.log('');

    console.log('📈 SUMMARY');
    console.log(`   Total Events: ${report.summary.totalEvents}`);
    console.log(`   Filtered Events: ${report.summary.filteredEvents}`);
    console.log(`   Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    if (report.summary.avgDuration) {
      console.log(`   Avg Duration: ${report.summary.avgDuration.toFixed(1)}ms`);
    }
    console.log('');

    console.log('🏆 TOP SKILLS');
    report.topSkills.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.skill} (${item.count} uses)`);
    });
    console.log('');

    console.log('👥 TOP USERS');
    report.topUsers.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.user} (${item.count} uses)`);
    });
    console.log('');

    console.log('📊 USAGE PATTERNS');
    console.log('   Peak Hours:');
    report.patterns.peakHours.forEach((item, index) => {
      console.log(`     ${index + 1}. ${item.hour} (${item.count} uses)`);
    });
    console.log(`   Success Trend: ${report.patterns.successTrends.trend}`);
    console.log(`   Search Usage: ${report.patterns.searchEffectiveness.searchUsageRate.toFixed(1)}%`);
    console.log('');

    console.log('🕐 RECENT ACTIVITY');
    report.recentActivity.forEach((event, index) => {
      const time = new Date(event.timestamp).toLocaleString();
      console.log(`   ${index + 1}. ${event.skillName} by ${event.userId} (${time})`);
    });
  }

  cleanupOldData(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalCount = this.usageData.events.length;
    this.usageData.events = this.usageData.events.filter(event => {
      return new Date(event.timestamp) >= cutoffDate;
    });

    const removedCount = originalCount - this.usageData.events.length;
    console.log(`🧹 Cleaned up ${removedCount} old events (keeping last ${daysToKeep} days)`);

    // Rebuild summary
    this.rebuildSummary();
    this.saveUsageData();

    return removedCount;
  }

  rebuildSummary() {
    this.usageData.summary = {
      skillsAccessed: {},
      users: {},
      timeRanges: {},
      categories: {}
    };

    this.usageData.events.forEach(event => {
      this.updateSummary(event);
    });
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const tracker = new SkillsUsageTracker();

  if (command === 'track') {
    const skillName = process.argv[3];
    const userId = process.argv[4] || 'cli-user';
    const context = {};

    if (!skillName) {
      console.log('Usage: node usage-tracker.cjs track <skill-name> [user-id]');
      process.exit(1);
    }

    const eventId = tracker.trackUsage(skillName, userId, context);
    console.log(`✅ Tracked usage: ${skillName} by ${userId} (Event: ${eventId})`);

  } else if (command === 'report') {
    const format = process.argv[3] || 'console';
    const since = process.argv[4]; // Optional date filter

    tracker.generateReport({ format, since });

  } else if (command === 'stats') {
    const stats = tracker.getUsageStats();
    console.log('\n📊 Usage Statistics:');
    console.log(`   Total Events: ${stats.totalEvents}`);
    console.log(`   Success Rate: ${stats.summary.successRate.toFixed(1)}%`);
    console.log(`   Unique Skills: ${Object.keys(stats.summary.skills).length}`);
    console.log(`   Unique Users: ${Object.keys(stats.summary.users).length}`);

  } else if (command === 'popular') {
    const popular = tracker.getPopularSkills();
    console.log('\n🏆 Most Popular Skills:');
    popular.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.skill} (${item.count} uses)`);
    });

  } else if (command === 'cleanup') {
    const days = parseInt(process.argv[3]) || 90;
    tracker.cleanupOldData(days);

  } else {
    console.log('Skills Usage Tracker');
    console.log('Usage:');
    console.log('  node usage-tracker.cjs track <skill> [user]     # Track skill usage');
    console.log('  node usage-tracker.cjs report [format] [since]  # Generate usage report');
    console.log('  node usage-tracker.cjs stats                    # Show basic statistics');
    console.log('  node usage-tracker.cjs popular                   # Show most popular skills');
    console.log('  node usage-tracker.cjs cleanup [days]            # Clean up old data');
  }
}

module.exports = SkillsUsageTracker;
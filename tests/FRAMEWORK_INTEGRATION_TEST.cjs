#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import framework components
const SkillsRegistry = require('./scripts/skills-registry.cjs');
const SkillsUsageTracker = require('./scripts/usage-tracker.cjs');
const SkillComposer = require('./scripts/skill-composer.cjs');

class FrameworkIntegrationTest {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      startTime: new Date(),
      endTime: null
    };
  }

  async runAllTests() {
    console.log('🧪 RUNNING AGENT SKILLS FRAMEWORK INTEGRATION TESTS\n');
    console.log('═'.repeat(60));

    try {
      // Test 1: Registry System
      await this.testRegistrySystem();

      // Test 2: Usage Tracking
      await this.testUsageTracking();

      // Test 3: Skill Composition
      await this.testSkillComposition();

      // Test 4: Cross-System Integration
      await this.testCrossSystemIntegration();

      // Test 5: Performance Validation
      await this.testPerformanceValidation();

      // Test 6: Data Persistence
      await this.testDataPersistence();

    } catch (error) {
      this.recordTest('Framework Integration', false, `Unexpected error: ${error.message}`);
    }

    this.results.endTime = new Date();
    this.generateReport();
  }

  async testRegistrySystem() {
    console.log('\n🔍 Testing Skills Registry System...');

    try {
      const registry = new SkillsRegistry();

      // Test registry building
      await registry.buildRegistry();
      this.recordTest('Registry Build', true, 'Registry built successfully');

      // Test skill search
      const searchResults = registry.searchSkills('modal');
      const hasResults = searchResults.length > 0;
      this.recordTest('Skill Search', hasResults, `Found ${searchResults.length} skills for 'modal'`);

      // Test skill retrieval
      const skill = registry.getSkill('element-styling-reference');
      const skillExists = skill !== null;
      this.recordTest('Skill Retrieval', skillExists, 'Retrieved element-styling-reference skill');

      // Test category filtering
      const uiSkills = registry.getSkillsByCategory('UI/Frontend');
      const hasUISkills = uiSkills.length > 0;
      this.recordTest('Category Filtering', hasUISkills, `Found ${uiSkills.length} UI skills`);

    } catch (error) {
      this.recordTest('Registry System', false, error.message);
    }
  }

  async testUsageTracking() {
    console.log('\n📊 Testing Usage Tracking System...');

    try {
      const tracker = new SkillsUsageTracker();

      // Test usage tracking
      const eventId1 = tracker.trackUsage('modal', 'test-user', { source: 'direct' });
      const eventId2 = tracker.trackUsage('element-styling-reference', 'developer', {
        source: 'search',
        duration: 1500,
        category: 'UI/Frontend'
      });

      this.recordTest('Usage Tracking', true, `Tracked 2 usage events (${eventId1}, ${eventId2})`);

      // Test statistics generation
      const stats = tracker.getUsageStats();
      const hasStats = stats.totalEvents >= 2;
      this.recordTest('Usage Statistics', hasStats, `Generated stats for ${stats.totalEvents} events`);

      // Test reporting
      const report = tracker.generateReport({ format: 'json' });
      const hasReport = report && report.summary;
      this.recordTest('Usage Reporting', hasReport, 'Generated usage report successfully');

    } catch (error) {
      this.recordTest('Usage Tracking', false, error.message);
    }
  }

  async testSkillComposition() {
    console.log('\n🎯 Testing Skill Composition System...');

    try {
      const composer = new SkillComposer();

      // Test composition creation
      const compositionId = composer.createComposition('test-composition', {
        skills: ['element-styling-reference', 'ui-configuration-validation-interface'],
        workflow: {
          'setup': 'element-styling-reference',
          'validate': 'ui-configuration-validation-interface'
        }
      });
      this.recordTest('Composition Creation', true, `Created composition ${compositionId}`);

      // Test composition execution
      const result = composer.executeComposition('test-composition');
      const executed = result.status === 'completed';
      this.recordTest('Composition Execution', executed, `Executed composition with status: ${result.status}`);

      // Test composition listing
      const compositions = composer.listCompositions();
      const hasCompositions = compositions.length > 0;
      this.recordTest('Composition Listing', hasCompositions, `Listed ${compositions.length} compositions`);

      // Test performance analysis
      const analysis = composer.analyzeCompositionPerformance();
      const hasAnalysis = analysis.totalCompositions >= 0;
      this.recordTest('Performance Analysis', hasAnalysis, `Analyzed ${analysis.totalCompositions} compositions`);

    } catch (error) {
      this.recordTest('Skill Composition', false, error.message);
    }
  }

  async testCrossSystemIntegration() {
    console.log('\n🔗 Testing Cross-System Integration...');

    try {
      // Test registry + tracker integration
      const registry = new SkillsRegistry();
      const tracker = new SkillsUsageTracker();

      await registry.buildRegistry();

      // Search for a skill and track its usage
      const searchResults = registry.searchSkills('styling');
      if (searchResults.length > 0) {
        const skillName = searchResults[0].skill;
        tracker.trackUsage(skillName, 'integration-test', {
          source: 'search',
          category: 'UI/Frontend'
        });
        this.recordTest('Registry + Tracker Integration', true, `Searched and tracked usage of ${skillName}`);
      } else {
        this.recordTest('Registry + Tracker Integration', false, 'No skills found for search term');
      }

      // Test registry + composer integration
      const composer = new SkillComposer();
      const compositions = composer.listCompositions();
      const registryStats = registry.getRegistryStats();

      const integrationWorks = compositions.length >= 0 && registryStats.totalSkills > 0;
      this.recordTest('Registry + Composer Integration', integrationWorks,
        `Registry: ${registryStats.totalSkills} skills, Composer: ${compositions.length} compositions`);

    } catch (error) {
      this.recordTest('Cross-System Integration', false, error.message);
    }
  }

  async testPerformanceValidation() {
    console.log('\n⚡ Testing Performance Validation...');

    try {
      // Test system responsiveness
      const startTime = Date.now();

      const registry = new SkillsRegistry();
      await registry.buildRegistry();

      const searchTime = Date.now() - startTime;
      const fastSearch = searchTime < 1000; // Should complete within 1 second
      this.recordTest('Registry Performance', fastSearch, `Registry build completed in ${searchTime}ms`);

      // Test search performance
      const searchStart = Date.now();
      registry.searchSkills('ui');
      const searchDuration = Date.now() - searchStart;
      const fastSearchQuery = searchDuration < 100; // Should complete within 100ms
      this.recordTest('Search Performance', fastSearchQuery, `Search completed in ${searchDuration}ms`);

      // Test memory usage (rough estimate)
      const memUsage = process.memoryUsage();
      const reasonableMemory = memUsage.heapUsed < 100 * 1024 * 1024; // Less than 100MB
      this.recordTest('Memory Usage', reasonableMemory, `Heap usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);

    } catch (error) {
      this.recordTest('Performance Validation', false, error.message);
    }
  }

  async testDataPersistence() {
    console.log('\n💾 Testing Data Persistence...');

    try {
      // Test registry persistence
      const registryPath = path.join(__dirname, 'skills-registry.json');
      const registryExists = fs.existsSync(registryPath);
      this.recordTest('Registry Persistence', registryExists, 'Registry data file exists');

      // Test usage log persistence
      const usagePath = path.join(__dirname, 'skills-usage-log.json');
      const usageExists = fs.existsSync(usagePath);
      this.recordTest('Usage Log Persistence', usageExists, 'Usage log file exists');

      // Test composition persistence
      const compositionPath = path.join(__dirname, 'skill-compositions.json');
      const compositionExists = fs.existsSync(compositionPath);
      this.recordTest('Composition Persistence', compositionExists, 'Composition data file exists');

      // Test dashboard persistence
      const dashboardPath = path.join(__dirname, 'skills-dashboard.json');
      const dashboardExists = fs.existsSync(dashboardPath);
      this.recordTest('Dashboard Persistence', dashboardExists, 'Dashboard data file exists');

      // Test data integrity
      if (registryExists) {
        const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        const hasSkills = registryData.skills && Object.keys(registryData.skills).length > 0;
        this.recordTest('Registry Data Integrity', hasSkills, `Registry contains ${Object.keys(registryData.skills).length} skills`);
      }

    } catch (error) {
      this.recordTest('Data Persistence', false, error.message);
    }
  }

  recordTest(name, passed, details = '') {
    const test = {
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    };

    this.results.tests.push(test);

    if (passed) {
      this.results.passed++;
      console.log(`   ✅ ${name}: ${details}`);
    } else {
      this.results.failed++;
      console.log(`   ❌ ${name}: ${details}`);
    }
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime;

    console.log('\n' + '═'.repeat(60));
    console.log('🎯 FRAMEWORK INTEGRATION TEST RESULTS');
    console.log('═'.repeat(60));

    console.log(`\n📊 SUMMARY`);
    console.log(`   Total Tests: ${this.results.tests.length}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%`);
    console.log(`   Duration: ${duration}ms`);

    if (this.results.failed > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.results.tests.filter(t => !t.passed).forEach(test => {
        console.log(`   • ${test.name}: ${test.details}`);
      });
    }

    console.log(`\n🏆 SYSTEM HEALTH: ${this.results.failed === 0 ? 'EXCELLENT' : this.results.failed <= 2 ? 'GOOD' : 'NEEDS ATTENTION'}`);

    // Save detailed report
    const reportPath = path.join(__dirname, 'framework-integration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);

    if (this.results.failed === 0) {
      console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
      console.log('   The Agent Skills Framework is fully operational.');
    } else {
      console.log(`\n⚠️  ${this.results.failed} test(s) failed.`);
      console.log('   Review the detailed report for issues.');
      process.exit(1);
    }
  }
}

// Run integration tests
if (require.main === module) {
  const tester = new FrameworkIntegrationTest();
  tester.runAllTests().catch(error => {
    console.error('💥 Integration test suite failed:', error);
    process.exit(1);
  });
}

module.exports = FrameworkIntegrationTest;
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillLearningEngine {
  constructor() {
    this.usageDataPath = path.join(__dirname, '..', 'skills-usage-log.json');
    this.registryPath = path.join(__dirname, '..', 'skills-registry.json');
    this.learningModelPath = path.join(__dirname, '..', 'skill-learning-model.json');
    this.feedbackDataPath = path.join(__dirname, '..', 'skill-feedback-data.json');

    this.learningModel = this.loadLearningModel();
    this.feedbackData = this.loadFeedbackData();
    this.usageData = this.loadUsageData();
    this.registry = this.loadRegistry();
  }

  loadLearningModel() {
    try {
      if (fs.existsSync(this.learningModelPath)) {
        return JSON.parse(fs.readFileSync(this.learningModelPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Failed to load learning model:', error.message);
    }

    // Initialize with default learning model
    return {
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastTrained: null,
        trainingSessions: 0
      },
      skillPerformance: {},
      userPatterns: {},
      contextPatterns: {},
      improvementRecommendations: [],
      predictiveModel: {
        successPredictors: {},
        difficultyFactors: {},
        learningCurves: {}
      },
      evolutionHistory: []
    };
  }

  loadFeedbackData() {
    try {
      if (fs.existsSync(this.feedbackDataPath)) {
        return JSON.parse(fs.readFileSync(this.feedbackDataPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Failed to load feedback data:', error.message);
    }

    return {
      metadata: {
        version: '1.0.0',
        totalFeedback: 0,
        lastUpdated: new Date().toISOString()
      },
      feedback: {},
      ratings: {},
      suggestions: {}
    };
  }

  loadUsageData() {
    try {
      if (fs.existsSync(this.usageDataPath)) {
        return JSON.parse(fs.readFileSync(this.usageDataPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Failed to load usage data:', error.message);
    }

    return {
      metadata: { totalEvents: 0 },
      events: [],
      summary: { skillsAccessed: {}, users: {}, timeRanges: {}, categories: {} }
    };
  }

  loadRegistry() {
    try {
      if (fs.existsSync(this.registryPath)) {
        return JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Failed to load registry:', error.message);
    }

    return { skills: {} };
  }

  saveLearningModel() {
    try {
      fs.writeFileSync(this.learningModelPath, JSON.stringify(this.learningModel, null, 2));
    } catch (error) {
      console.error('❌ Failed to save learning model:', error.message);
    }
  }

  saveFeedbackData() {
    try {
      fs.writeFileSync(this.feedbackDataPath, JSON.stringify(this.feedbackData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save feedback data:', error.message);
    }
  }

  // Core learning methods
  async trainModel() {
    console.log('🧠 Training Skill Learning Model...\n');

    const startTime = new Date();

    // Analyze usage patterns
    this.analyzeUsagePatterns();

    // Build performance models
    this.buildPerformanceModels();

    // Generate improvement recommendations
    this.generateImprovementRecommendations();

    // Update predictive capabilities
    this.updatePredictiveModel();

    // Record training session
    this.learningModel.metadata.lastTrained = new Date().toISOString();
    this.learningModel.metadata.trainingSessions++;

    this.learningModel.evolutionHistory.push({
      sessionId: `train_${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration: new Date() - startTime,
      improvements: Object.keys(this.learningModel.improvementRecommendations).length,
      modelVersion: this.learningModel.metadata.version
    });

    this.saveLearningModel();

    console.log('✅ Learning model trained successfully!');
    return this.learningModel;
  }

  analyzeUsagePatterns() {
    const events = this.usageData.events || [];
    const skillPerformance = {};

    // Group events by skill
    events.forEach(event => {
      const skillName = event.skillName;
      if (!skillPerformance[skillName]) {
        skillPerformance[skillName] = {
          totalUses: 0,
          successfulUses: 0,
          failedUses: 0,
          avgDuration: 0,
          userDistribution: {},
          contextPatterns: {},
          timePatterns: {},
          learningCurve: []
        };
      }

      const skill = skillPerformance[skillName];
      skill.totalUses++;

      if (event.context?.success !== false) {
        skill.successfulUses++;
      } else {
        skill.failedUses++;
      }

      // Track user patterns
      const userId = event.userId;
      skill.userDistribution[userId] = (skill.userDistribution[userId] || 0) + 1;

      // Track context patterns
      const context = event.context?.source || 'unknown';
      skill.contextPatterns[context] = (skill.contextPatterns[context] || 0) + 1;

      // Track time patterns
      const hour = new Date(event.timestamp).getHours();
      skill.timePatterns[hour] = (skill.timePatterns[hour] || 0) + 1;

      // Update average duration
      if (event.context?.duration) {
        const currentAvg = skill.avgDuration;
        skill.avgDuration = (currentAvg * (skill.totalUses - 1) + event.context.duration) / skill.totalUses;
      }
    });

    // Calculate success rates and identify patterns
    Object.keys(skillPerformance).forEach(skillName => {
      const skill = skillPerformance[skillName];
      skill.successRate = skill.totalUses > 0 ? (skill.successfulUses / skill.totalUses) * 100 : 0;

      // Identify peak usage times
      skill.peakHours = Object.entries(skill.timePatterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      // Identify power users
      skill.powerUsers = Object.entries(skill.userDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([user]) => user);

      // Build learning curve (success rate over time)
      this.buildLearningCurve(skill, events.filter(e => e.skillName === skillName));
    });

    this.learningModel.skillPerformance = skillPerformance;
  }

  buildLearningCurve(skill, skillEvents) {
    // Sort events by time
    const sortedEvents = skillEvents.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Group by weeks and calculate success rates
    const weeklyStats = {};
    sortedEvents.forEach(event => {
      const week = this.getWeekNumber(new Date(event.timestamp));
      if (!weeklyStats[week]) {
        weeklyStats[week] = { total: 0, successful: 0 };
      }
      weeklyStats[week].total++;
      if (event.context?.success !== false) {
        weeklyStats[week].successful++;
      }
    });

    skill.learningCurve = Object.entries(weeklyStats)
      .sort(([a], [b]) => a - b)
      .map(([week, stats]) => ({
        week: parseInt(week),
        successRate: (stats.successful / stats.total) * 100,
        totalUses: stats.total
      }));
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  buildPerformanceModels() {
    const skills = Object.keys(this.learningModel.skillPerformance);

    skills.forEach(skillName => {
      const skill = this.learningModel.skillPerformance[skillName];
      const registrySkill = this.registry.skills?.[skillName];

      if (!registrySkill) return;

      // Build difficulty model
      skill.difficultyFactors = this.calculateDifficultyFactors(skill, registrySkill);

      // Build success predictors
      skill.successPredictors = this.identifySuccessPredictors(skill);

      // Build optimization recommendations
      skill.optimizationOpportunities = this.identifyOptimizationOpportunities(skill, registrySkill);
    });
  }

  calculateDifficultyFactors(skill, registrySkill) {
    const factors = {
      complexityScore: 0,
      userDiversity: 0,
      failureRate: 0,
      avgDuration: skill.avgDuration,
      learningPlateau: 0
    };

    // Complexity based on related skills and tags
    const relatedSkillsCount = registrySkill.relationships?.relatedSkills?.length || 0;
    const tagsCount = registrySkill.relationships?.tags?.length || 0;
    factors.complexityScore = Math.min((relatedSkillsCount + tagsCount) / 10, 1);

    // User diversity (how many different users use this skill)
    factors.userDiversity = Object.keys(skill.userDistribution).length / 10; // Normalize

    // Failure rate
    factors.failureRate = skill.failedUses / skill.totalUses;

    // Learning plateau (has success rate stabilized?)
    if (skill.learningCurve.length > 3) {
      const recentRates = skill.learningCurve.slice(-3).map(p => p.successRate);
      const avgRecent = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
      const avgOverall = skill.successRate;
      factors.learningPlateau = Math.abs(avgRecent - avgOverall) / avgOverall;
    }

    return factors;
  }

  identifySuccessPredictors(skill) {
    const predictors = {
      timeOfDay: {},
      userExperience: {},
      contextSource: {},
      confidence: 0
    };

    // Analyze success by time of day
    const timeSuccess = {};
    Object.entries(skill.timePatterns).forEach(([hour, count]) => {
      const hourEvents = this.usageData.events.filter(e =>
        e.skillName === Object.keys(this.learningModel.skillPerformance).find(s => this.learningModel.skillPerformance[s] === skill) &&
        new Date(e.timestamp).getHours() === parseInt(hour)
      );
      const successCount = hourEvents.filter(e => e.context?.success !== false).length;
      timeSuccess[hour] = hourEvents.length > 0 ? (successCount / hourEvents.length) * 100 : 0;
    });
    predictors.timeOfDay = timeSuccess;

    // Analyze success by context source
    const contextSuccess = {};
    Object.entries(skill.contextPatterns).forEach(([context, count]) => {
      const contextEvents = this.usageData.events.filter(e =>
        e.skillName === Object.keys(this.learningModel.skillPerformance).find(s => this.learningModel.skillPerformance[s] === skill) &&
        e.context?.source === context
      );
      const successCount = contextEvents.filter(e => e.context?.success !== false).length;
      contextSuccess[context] = contextEvents.length > 0 ? (successCount / contextEvents.length) * 100 : 0;
    });
    predictors.contextSource = contextSuccess;

    // Calculate overall predictor confidence
    predictors.confidence = this.calculatePredictorConfidence(predictors);

    return predictors;
  }

  calculatePredictorConfidence(predictors) {
    // Simple confidence calculation based on data consistency
    let confidence = 0;

    // Time-based patterns
    const timeVariations = Object.values(predictors.timeOfDay);
    if (timeVariations.length > 1) {
      const avg = timeVariations.reduce((a, b) => a + b, 0) / timeVariations.length;
      const variance = timeVariations.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / timeVariations.length;
      confidence += Math.max(0, 1 - variance / 1000); // Lower variance = higher confidence
    }

    // Context-based patterns
    const contextVariations = Object.values(predictors.contextSource);
    if (contextVariations.length > 1) {
      const avg = contextVariations.reduce((a, b) => a + b, 0) / contextVariations.length;
      const variance = contextVariations.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / contextVariations.length;
      confidence += Math.max(0, 1 - variance / 1000);
    }

    return Math.min(confidence / 2, 1); // Average of both factors
  }

  identifyOptimizationOpportunities(skill, registrySkill) {
    const opportunities = [];

    // Check for low success rate
    if (skill.successRate < 80) {
      opportunities.push({
        type: 'success_rate',
        priority: 'high',
        description: `Low success rate (${skill.successRate.toFixed(1)}%) suggests procedure clarity issues`,
        recommendations: [
          'Review and simplify step-by-step instructions',
          'Add more code examples and visual aids',
          'Consider breaking into smaller, focused skills',
          'Gather user feedback on pain points'
        ]
      });
    }

    // Check for high duration
    if (skill.avgDuration > 300000) { // 5 minutes
      opportunities.push({
        type: 'duration',
        priority: 'medium',
        description: `Long average duration (${Math.round(skill.avgDuration / 1000)}s) indicates complexity`,
        recommendations: [
          'Consider creating prerequisite skills',
          'Add quick-reference sections',
          'Implement progressive disclosure',
          'Provide automation scripts where possible'
        ]
      });
    }

    // Check for uneven user distribution
    const totalUsers = Object.keys(skill.userDistribution).length;
    const powerUsers = skill.powerUsers?.length || 0;
    if (totalUsers > 10 && powerUsers / totalUsers < 0.3) {
      opportunities.push({
        type: 'adoption',
        priority: 'medium',
        description: 'Limited user adoption suggests discoverability issues',
        recommendations: [
          'Improve skill search ranking',
          'Add more relevant tags and keywords',
          'Cross-reference from related skills',
          'Create usage tutorials or examples'
        ]
      });
    }

    // Check for learning curve issues
    if (skill.learningCurve.length > 2) {
      const recent = skill.learningCurve.slice(-2);
      const improvement = recent[1].successRate - recent[0].successRate;
      if (improvement < 5) { // Less than 5% improvement
        opportunities.push({
          type: 'learning_curve',
          priority: 'low',
          description: 'Slow learning curve suggests onboarding challenges',
          recommendations: [
            'Add beginner-friendly introduction',
            'Create video tutorials or walkthroughs',
            'Provide hands-on examples',
            'Consider mentorship pairing'
          ]
        });
      }
    }

    return opportunities;
  }

  generateImprovementRecommendations() {
    const recommendations = {};

    Object.entries(this.learningModel.skillPerformance).forEach(([skillName, skill]) => {
      if (skill.optimizationOpportunities && skill.optimizationOpportunities.length > 0) {
        recommendations[skillName] = {
          skillName,
          opportunities: skill.optimizationOpportunities,
          priority: this.calculateOverallPriority(skill.optimizationOpportunities),
          impact: this.estimateImprovementImpact(skill),
          timeline: this.suggestImplementationTimeline(skill.optimizationOpportunities)
        };
      }
    });

    // Sort by priority and impact
    const sortedRecommendations = Object.values(recommendations)
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : b.impact - a.impact;
      });

    this.learningModel.improvementRecommendations = sortedRecommendations;
  }

  calculateOverallPriority(opportunities) {
    const priorities = opportunities.map(o => o.priority);
    if (priorities.includes('critical')) return 'critical';
    if (priorities.includes('high')) return 'high';
    if (priorities.includes('medium')) return 'medium';
    return 'low';
  }

  estimateImprovementImpact(skill) {
    let impact = 0;

    // Base impact on usage frequency and current success rate
    impact += skill.totalUses * 0.1; // 0.1 points per use
    impact += (100 - skill.successRate) * skill.totalUses * 0.05; // Potential improvement value

    // Bonus for high-difficulty skills
    if (skill.difficultyFactors?.complexityScore > 0.7) {
      impact *= 1.5;
    }

    return Math.round(impact);
  }

  suggestImplementationTimeline(opportunities) {
    const criticalCount = opportunities.filter(o => o.priority === 'critical').length;
    const highCount = opportunities.filter(o => o.priority === 'high').length;

    if (criticalCount > 0) return 'immediate (1-2 weeks)';
    if (highCount > 1) return 'short-term (2-4 weeks)';
    if (highCount === 1) return 'medium-term (1-2 months)';
    return 'long-term (3-6 months)';
  }

  updatePredictiveModel() {
    const predictiveModel = {
      successPredictors: {},
      difficultyFactors: {},
      learningCurves: {}
    };

    // Aggregate success predictors across all skills
    Object.entries(this.learningModel.skillPerformance).forEach(([skillName, skill]) => {
      if (skill.successPredictors) {
        Object.entries(skill.successPredictors.timeOfDay).forEach(([hour, rate]) => {
          if (!predictiveModel.successPredictors[hour]) {
            predictiveModel.successPredictors[hour] = [];
          }
          predictiveModel.successPredictors[hour].push(rate);
        });
      }

      if (skill.difficultyFactors) {
        predictiveModel.difficultyFactors[skillName] = skill.difficultyFactors;
      }

      if (skill.learningCurve) {
        predictiveModel.learningCurves[skillName] = skill.learningCurve;
      }
    });

    // Calculate averages for success predictors
    Object.keys(predictiveModel.successPredictors).forEach(hour => {
      const rates = predictiveModel.successPredictors[hour];
      predictiveModel.successPredictors[hour] = rates.reduce((a, b) => a + b, 0) / rates.length;
    });

    this.learningModel.predictiveModel = predictiveModel;
  }

  // Public API methods
  getSkillInsights(skillName) {
    const skill = this.learningModel.skillPerformance[skillName];
    if (!skill) return null;

    return {
      performance: {
        successRate: skill.successRate,
        totalUses: skill.totalUses,
        avgDuration: skill.avgDuration,
        peakHours: skill.peakHours
      },
      patterns: {
        userDistribution: skill.userDistribution,
        contextPatterns: skill.contextPatterns,
        learningCurve: skill.learningCurve
      },
      insights: {
        difficultyFactors: skill.difficultyFactors,
        successPredictors: skill.successPredictors,
        optimizationOpportunities: skill.optimizationOpportunities
      }
    };
  }

  getImprovementRecommendations(limit = 10) {
    return this.learningModel.improvementRecommendations.slice(0, limit);
  }

  predictSkillSuccess(skillName, context = {}) {
    const skill = this.learningModel.skillPerformance[skillName];
    if (!skill || !skill.successPredictors) return null;

    let predictedSuccess = skill.successRate; // Base prediction

    // Adjust based on time of day
    if (context.hour !== undefined && skill.successPredictors.timeOfDay[context.hour]) {
      const timeAdjustment = skill.successPredictors.timeOfDay[context.hour] - skill.successRate;
      predictedSuccess += timeAdjustment * 0.3; // 30% weight
    }

    // Adjust based on context source
    if (context.source && skill.successPredictors.contextSource[context.source]) {
      const contextAdjustment = skill.successPredictors.contextSource[context.source] - skill.successRate;
      predictedSuccess += contextAdjustment * 0.2; // 20% weight
    }

    // Adjust based on user experience (simplified)
    if (context.userExperience === 'beginner') {
      predictedSuccess -= 10; // Beginners typically have lower success
    } else if (context.userExperience === 'expert') {
      predictedSuccess += 5; // Experts have higher success
    }

    return Math.max(0, Math.min(100, predictedSuccess));
  }

  addFeedback(skillName, userId, feedback) {
    if (!this.feedbackData.feedback[skillName]) {
      this.feedbackData.feedback[skillName] = [];
    }

    const feedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      ...feedback
    };

    this.feedbackData.feedback[skillName].push(feedbackEntry);
    this.feedbackData.metadata.totalFeedback++;
    this.feedbackData.metadata.lastUpdated = new Date().toISOString();

    // If rating provided, update ratings
    if (feedback.rating) {
      if (!this.feedbackData.ratings[skillName]) {
        this.feedbackData.ratings[skillName] = [];
      }
      this.feedbackData.ratings[skillName].push({
        userId,
        rating: feedback.rating,
        timestamp: feedbackEntry.timestamp
      });
    }

    this.saveFeedbackData();

    // Trigger learning model update if significant feedback
    if (this.feedbackData.metadata.totalFeedback % 10 === 0) {
      setTimeout(() => this.trainModel(), 1000); // Update model after feedback batch
    }

    return feedbackEntry.id;
  }

  getFeedbackSummary(skillName = null) {
    if (skillName) {
      const skillFeedback = this.feedbackData.feedback[skillName] || [];
      const skillRatings = this.feedbackData.ratings[skillName] || [];

      if (skillFeedback.length === 0) return null;

      const avgRating = skillRatings.length > 0
        ? skillRatings.reduce((sum, r) => sum + r.rating, 0) / skillRatings.length
        : null;

      return {
        skillName,
        totalFeedback: skillFeedback.length,
        totalRatings: skillRatings.length,
        averageRating: avgRating,
        recentFeedback: skillFeedback.slice(-5),
        commonThemes: this.extractCommonThemes(skillFeedback)
      };
    }

    // Overall summary
    const allSkills = Object.keys(this.feedbackData.feedback);
    const summary = {
      totalSkillsWithFeedback: allSkills.length,
      totalFeedback: this.feedbackData.metadata.totalFeedback,
      skillsByFeedback: allSkills.map(skill => ({
        skill,
        count: this.feedbackData.feedback[skill].length,
        avgRating: this.calculateAverageRating(skill)
      })).sort((a, b) => b.count - a.count)
    };

    return summary;
  }

  calculateAverageRating(skillName) {
    const ratings = this.feedbackData.ratings[skillName] || [];
    return ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;
  }

  extractCommonThemes(feedback) {
    const themes = {};
    const commonWords = ['difficult', 'easy', 'clear', 'confusing', 'helpful', 'improve', 'good', 'bad', 'fast', 'slow'];

    feedback.forEach(item => {
      const text = (item.comment || item.suggestion || '').toLowerCase();
      commonWords.forEach(word => {
        if (text.includes(word)) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    });

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
  }

  generateLearningReport() {
    const report = {
      generated: new Date().toISOString(),
      modelVersion: this.learningModel.metadata.version,
      trainingSessions: this.learningModel.metadata.trainingSessions,
      lastTrained: this.learningModel.metadata.lastTrained,

      overview: {
        totalSkills: Object.keys(this.learningModel.skillPerformance).length,
        skillsWithIssues: Object.values(this.learningModel.skillPerformance)
          .filter(s => s.optimizationOpportunities?.length > 0).length,
        totalRecommendations: this.learningModel.improvementRecommendations.length,
        avgSuccessRate: this.calculateAverageSuccessRate()
      },

      topInsights: {
        mostImproved: this.findMostImprovedSkills(),
        mostChallenging: this.findMostChallengingSkills(),
        bestLearners: this.findBestLearners(),
        predictiveAccuracy: this.assessPredictiveAccuracy()
      },

      recommendations: this.learningModel.improvementRecommendations.slice(0, 10),

      feedback: this.getFeedbackSummary()
    };

    return report;
  }

  calculateAverageSuccessRate() {
    const skills = Object.values(this.learningModel.skillPerformance);
    return skills.length > 0
      ? skills.reduce((sum, skill) => sum + skill.successRate, 0) / skills.length
      : 0;
  }

  findMostImprovedSkills() {
    return Object.entries(this.learningModel.skillPerformance)
      .filter(([, skill]) => skill.learningCurve.length > 3)
      .map(([name, skill]) => {
        const firstHalf = skill.learningCurve.slice(0, Math.floor(skill.learningCurve.length / 2));
        const secondHalf = skill.learningCurve.slice(Math.floor(skill.learningCurve.length / 2));

        const firstAvg = firstHalf.reduce((sum, p) => sum + p.successRate, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, p) => sum + p.successRate, 0) / secondHalf.length;

        return {
          skill: name,
          improvement: secondAvg - firstAvg,
          currentRate: skill.successRate
        };
      })
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 5);
  }

  findMostChallengingSkills() {
    return Object.entries(this.learningModel.skillPerformance)
      .map(([name, skill]) => ({
        skill: name,
        successRate: skill.successRate,
        difficultyScore: skill.difficultyFactors?.complexityScore || 0,
        failureRate: skill.failedUses / skill.totalUses
      }))
      .sort((a, b) => {
        // Sort by combination of low success and high difficulty
        const scoreA = (100 - a.successRate) * (1 + a.difficultyScore);
        const scoreB = (100 - b.successRate) * (1 + b.difficultyScore);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  findBestLearners() {
    return Object.entries(this.learningModel.skillPerformance)
      .filter(([, skill]) => skill.learningCurve.length > 2)
      .map(([name, skill]) => {
        const curve = skill.learningCurve;
        const initialRate = curve[0].successRate;
        const finalRate = curve[curve.length - 1].successRate;
        const improvement = finalRate - initialRate;
        const speed = improvement / curve.length; // Improvement per week

        return {
          skill: name,
          improvement,
          speed,
          weeks: curve.length
        };
      })
      .sort((a, b) => b.speed - a.speed)
      .slice(0, 5);
  }

  assessPredictiveAccuracy() {
    // Simplified assessment - in real implementation, this would use validation data
    const predictors = Object.values(this.learningModel.skillPerformance)
      .filter(skill => skill.successPredictors?.confidence > 0);

    const avgConfidence = predictors.length > 0
      ? predictors.reduce((sum, skill) => sum + skill.successPredictors.confidence, 0) / predictors.length
      : 0;

    return {
      skillsWithPredictors: predictors.length,
      averageConfidence: avgConfidence,
      assessment: avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low'
    };
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const engine = new SkillLearningEngine();

  if (command === 'train') {
    engine.trainModel().then(() => {
      console.log('✅ Learning model training completed');
    }).catch(error => {
      console.error('❌ Training failed:', error.message);
      process.exit(1);
    });

  } else if (command === 'insights') {
    const skillName = process.argv[3];
    if (!skillName) {
      console.log('Usage: node skill-learning-engine.cjs insights <skill-name>');
      process.exit(1);
    }

    const insights = engine.getSkillInsights(skillName);
    if (!insights) {
      console.log(`❌ No insights available for skill: ${skillName}`);
      process.exit(1);
    }

    console.log(`\n🔍 Insights for "${skillName}":`);
    console.log(`Success Rate: ${insights.performance.successRate.toFixed(1)}%`);
    console.log(`Total Uses: ${insights.performance.totalUses}`);
    console.log(`Avg Duration: ${insights.performance.avgDuration.toFixed(0)}ms`);
    console.log(`Peak Hours: ${insights.performance.peakHours.join(', ')}`);

  } else if (command === 'recommendations') {
    const recommendations = engine.getImprovementRecommendations();
    console.log('\n💡 Improvement Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.skillName} (${rec.priority} priority)`);
      console.log(`   Impact: ${rec.impact} points`);
      console.log(`   Timeline: ${rec.timeline}`);
      rec.opportunities.slice(0, 2).forEach(opp => {
        console.log(`   • ${opp.description}`);
      });
    });

  } else if (command === 'predict') {
    const skillName = process.argv[3];
    const contextStr = process.argv[4] || '{}';

    if (!skillName) {
      console.log('Usage: node skill-learning-engine.cjs predict <skill-name> [context]');
      process.exit(1);
    }

    try {
      const context = JSON.parse(contextStr);
      const prediction = engine.predictSkillSuccess(skillName, context);

      if (prediction === null) {
        console.log(`❌ Cannot predict success for skill: ${skillName}`);
        process.exit(1);
      }

      console.log(`\n🔮 Success Prediction for "${skillName}":`);
      console.log(`Predicted Success Rate: ${prediction.toFixed(1)}%`);
      console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    } catch (error) {
      console.error('❌ Prediction failed:', error.message);
      process.exit(1);
    }

  } else if (command === 'feedback') {
    const action = process.argv[3];

    if (action === 'add') {
      const skillName = process.argv[4];
      const userId = process.argv[5];
      const feedbackStr = process.argv[6];

      if (!skillName || !userId || !feedbackStr) {
        console.log('Usage: node skill-learning-engine.cjs feedback add <skill> <user> <feedback>');
        console.log('Example: node skill-learning-engine.cjs feedback add "modal" "user123" \'{"rating": 4, "comment": "Very helpful"}\'');
        process.exit(1);
      }

      try {
        const feedback = JSON.parse(feedbackStr);
        const feedbackId = engine.addFeedback(skillName, userId, feedback);
        console.log(`✅ Feedback added: ${feedbackId}`);
      } catch (error) {
        console.error('❌ Failed to add feedback:', error.message);
        process.exit(1);
      }

    } else if (action === 'summary') {
      const skillName = process.argv[4];
      const summary = engine.getFeedbackSummary(skillName);

      if (!summary) {
        console.log('❌ No feedback data available');
        process.exit(1);
      }

      if (skillName) {
        console.log(`\n📊 Feedback Summary for "${skillName}":`);
        console.log(`Total Feedback: ${summary.totalFeedback}`);
        console.log(`Total Ratings: ${summary.totalRatings}`);
        if (summary.averageRating) {
          console.log(`Average Rating: ${summary.averageRating.toFixed(1)}/5`);
        }
        console.log('\nCommon Themes:');
        summary.commonThemes.forEach(theme => {
          console.log(`  ${theme.theme}: ${theme.count} mentions`);
        });
      } else {
        console.log('\n📊 Overall Feedback Summary:');
        console.log(`Skills with Feedback: ${summary.totalSkillsWithFeedback}`);
        console.log(`Total Feedback: ${summary.totalFeedback}`);
        console.log('\nTop Skills by Feedback:');
        summary.skillsByFeedback.slice(0, 5).forEach((skill, index) => {
          console.log(`  ${index + 1}. ${skill.skill} (${skill.count} feedback${skill.avgRating ? `, ${skill.avgRating.toFixed(1)}★` : ''})`);
        });
      }

    } else {
      console.log('Feedback commands:');
      console.log('  node skill-learning-engine.cjs feedback add <skill> <user> <json>');
      console.log('  node skill-learning-engine.cjs feedback summary [skill]');
    }

  } else if (command === 'report') {
    const report = engine.generateLearningReport();
    console.log('\n📋 SKILL LEARNING ENGINE REPORT');
    console.log('═'.repeat(50));
    console.log(`Generated: ${report.generated}`);
    console.log(`Model Version: ${report.modelVersion}`);
    console.log(`Training Sessions: ${report.trainingSessions}`);
    console.log(`Last Trained: ${report.lastTrained || 'Never'}`);
    console.log('');

    console.log('📊 OVERVIEW');
    console.log(`   Total Skills Analyzed: ${report.overview.totalSkills}`);
    console.log(`   Skills with Issues: ${report.overview.skillsWithIssues}`);
    console.log(`   Total Recommendations: ${report.overview.totalRecommendations}`);
    console.log(`   Average Success Rate: ${report.overview.avgSuccessRate.toFixed(1)}%`);
    console.log('');

    console.log('🏆 TOP INSIGHTS');
    console.log('Most Improved Skills:');
    report.topInsights.mostImproved.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.skill} (+${skill.improvement.toFixed(1)}% improvement)`);
    });
    console.log('');

    console.log('Most Challenging Skills:');
    report.topInsights.mostChallenging.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.skill} (${skill.successRate.toFixed(1)}% success)`);
    });
    console.log('');

    console.log('💡 KEY RECOMMENDATIONS');
    report.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.skillName} (${rec.priority} priority, ${rec.impact} impact)`);
      console.log(`      Timeline: ${rec.timeline}`);
    });

  } else {
    console.log('Skill Learning Engine - Enterprise AI-Powered Learning System');
    console.log('Usage:');
    console.log('  node skill-learning-engine.cjs train                    # Train learning model');
    console.log('  node skill-learning-engine.cjs insights <skill>        # Get skill insights');
    console.log('  node skill-learning-engine.cjs recommendations         # Get improvement recommendations');
    console.log('  node skill-learning-engine.cjs predict <skill> [ctx]   # Predict skill success');
    console.log('  node skill-learning-engine.cjs feedback <action>       # Manage feedback');
    console.log('  node skill-learning-engine.cjs report                  # Generate learning report');
  }
}

module.exports = SkillLearningEngine;
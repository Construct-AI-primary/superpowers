#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SkillComposer {
  constructor() {
    this.registryPath = path.join(__dirname, '..', 'skills-registry.json');
    this.compositionsPath = path.join(__dirname, '..', 'skill-compositions.json');
    this.registry = this.loadRegistry();
    this.compositions = this.loadCompositions();
  }

  loadRegistry() {
    try {
      if (fs.existsSync(this.registryPath)) {
        return JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Failed to load skills registry:', error.message);
    }
    return { skills: {} };
  }

  loadCompositions() {
    try {
      if (fs.existsSync(this.compositionsPath)) {
        return JSON.parse(fs.readFileSync(this.compositionsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Failed to load compositions:', error.message);
    }

    return {
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        totalCompositions: 0
      },
      compositions: {},
      templates: {}
    };
  }

  saveCompositions() {
    try {
      fs.writeFileSync(this.compositionsPath, JSON.stringify(this.compositions, null, 2));
    } catch (error) {
      console.error('❌ Failed to save compositions:', error.message);
    }
  }

  createComposition(name, config) {
    const { skills, workflow, metadata = {} } = config;

    // Validate skills exist
    const missingSkills = skills.filter(skill => !this.registry.skills[skill]);
    if (missingSkills.length > 0) {
      throw new Error(`Missing skills: ${missingSkills.join(', ')}`);
    }

    // Validate workflow dependencies
    const workflowSkills = new Set();
    Object.values(workflow).forEach(step => {
      if (Array.isArray(step)) {
        step.forEach(skill => workflowSkills.add(skill));
      } else {
        workflowSkills.add(step);
      }
    });

    const invalidWorkflowSkills = Array.from(workflowSkills).filter(skill => !skills.includes(skill));
    if (invalidWorkflowSkills.length > 0) {
      throw new Error(`Workflow references skills not in composition: ${invalidWorkflowSkills.join(', ')}`);
    }

    const composition = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      skills: skills,
      workflow: workflow,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        category: metadata.category || 'general',
        description: metadata.description || '',
        estimatedDuration: metadata.estimatedDuration || null,
        successCriteria: metadata.successCriteria || [],
        ...metadata
      },
      analytics: {
        usageCount: 0,
        successRate: 0,
        avgExecutionTime: null,
        lastUsed: null
      }
    };

    this.compositions.compositions[name] = composition;
    this.compositions.metadata.totalCompositions++;
    this.saveCompositions();

    return composition.id;
  }

  getComposition(name) {
    return this.compositions.compositions[name] || null;
  }

  listCompositions(category = null) {
    const compositions = Object.values(this.compositions.compositions);

    if (category) {
      return compositions.filter(comp => comp.metadata.category === category);
    }

    return compositions;
  }

  executeComposition(name, context = {}) {
    const composition = this.getComposition(name);
    if (!composition) {
      throw new Error(`Composition '${name}' not found`);
    }

    const execution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      compositionId: composition.id,
      compositionName: name,
      startTime: new Date().toISOString(),
      context: context,
      steps: [],
      status: 'running'
    };

    try {
      // Execute workflow steps in order
      for (const [stepName, stepSkills] of Object.entries(composition.workflow)) {
        const stepResult = {
          name: stepName,
                  skills: Array.isArray(stepSkills) ? stepSkills : [stepSkills],
          startTime: new Date().toISOString(),
          results: [],
          status: 'running'
        };

        // Execute each skill in the step
        for (const skillName of stepResult.skills) {
          const skillResult = this.executeSkill(skillName, {
            ...context,
            compositionId: execution.id,
            stepName: stepName
          });

          stepResult.results.push(skillResult);
        }

        stepResult.endTime = new Date().toISOString();
        stepResult.status = stepResult.results.every(r => r.success) ? 'completed' : 'failed';
        execution.steps.push(stepResult);

        // Stop execution if step failed and we don't have error handling
        if (stepResult.status === 'failed') {
          execution.status = 'failed';
          break;
        }
      }

      execution.endTime = new Date().toISOString();
      execution.status = execution.status === 'running' ? 'completed' : execution.status;

      // Update composition analytics
      this.updateCompositionAnalytics(composition, execution);

      return execution;

    } catch (error) {
      execution.endTime = new Date().toISOString();
      execution.status = 'error';
      execution.error = error.message;
      return execution;
    }
  }

  executeSkill(skillName, context) {
    // Simulate skill execution - in real implementation, this would call the actual skill
    const skill = this.registry.skills[skillName];

    if (!skill) {
      return {
        skill: skillName,
        success: false,
        error: 'Skill not found',
        duration: 0
      };
    }

    // Simulate execution time based on skill complexity
    const baseTime = skill.metadata?.frequency_percent ? (100 - skill.metadata.frequency_percent) * 10 : 500;
    const executionTime = baseTime + Math.random() * 200;

    // Simulate success based on skill success rate
    const successRate = skill.metadata?.success_rate_percent || 85;
    const success = Math.random() * 100 < successRate;

    return {
      skill: skillName,
      success: success,
      duration: executionTime,
      category: skill.relationships?.category,
      tags: skill.relationships?.tags || []
    };
  }

  updateCompositionAnalytics(composition, execution) {
    composition.analytics.usageCount++;
    composition.analytics.lastUsed = execution.endTime;

    if (execution.status === 'completed') {
      const totalTime = new Date(execution.endTime) - new Date(execution.startTime);
      const currentAvg = composition.analytics.avgExecutionTime || 0;
      composition.analytics.avgExecutionTime =
        (currentAvg * (composition.analytics.usageCount - 1) + totalTime) / composition.analytics.usageCount;

      // Calculate success rate
      const successfulSteps = execution.steps.filter(s => s.status === 'completed').length;
      const successRate = (successfulSteps / execution.steps.length) * 100;
      composition.analytics.successRate = successRate;
    }

    this.saveCompositions();
  }

  createTemplate(name, config) {
    const { baseSkills, workflowTemplate, customizationPoints } = config;

    const template = {
      id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      baseSkills: baseSkills,
      workflowTemplate: workflowTemplate,
      customizationPoints: customizationPoints,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        usageCount: 0
      }
    };

    this.compositions.templates[name] = template;
    this.saveCompositions();

    return template.id;
  }

  instantiateFromTemplate(templateName, customizations = {}) {
    const template = this.compositions.templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Apply customizations
    const skills = [...template.baseSkills];
    const workflow = JSON.parse(JSON.stringify(template.workflowTemplate)); // Deep copy

    // Apply skill customizations
    if (customizations.additionalSkills) {
      skills.push(...customizations.additionalSkills);
    }

    if (customizations.replaceSkills) {
      Object.entries(customizations.replaceSkills).forEach(([oldSkill, newSkill]) => {
        const index = skills.indexOf(oldSkill);
        if (index !== -1) {
          skills[index] = newSkill;
        }
      });
    }

    // Apply workflow customizations
    if (customizations.workflowModifications) {
      Object.assign(workflow, customizations.workflowModifications);
    }

    const compositionName = `${templateName}_${Date.now()}`;

    return this.createComposition(compositionName, {
      skills: skills,
      workflow: workflow,
      metadata: {
        category: templateName,
        description: `Instantiated from template: ${templateName}`,
        templateId: template.id,
        customizations: customizations
      }
    });
  }

  analyzeCompositionPerformance() {
    const compositions = Object.values(this.compositions.compositions);

    const analysis = {
      totalCompositions: compositions.length,
      avgSuccessRate: 0,
      avgExecutionTime: 0,
      mostUsed: [],
      successRates: [],
      performanceByCategory: {}
    };

    let totalSuccessRate = 0;
    let totalExecutionTime = 0;
    let validCompositions = 0;

    compositions.forEach(comp => {
      if (comp.analytics.usageCount > 0) {
        validCompositions++;
        totalSuccessRate += comp.analytics.successRate;
        totalExecutionTime += comp.analytics.avgExecutionTime;

        // Category analysis
        const category = comp.metadata.category;
        if (!analysis.performanceByCategory[category]) {
          analysis.performanceByCategory[category] = {
            count: 0,
            avgSuccessRate: 0,
            avgExecutionTime: 0
          };
        }

        const cat = analysis.performanceByCategory[category];
        cat.count++;
        cat.avgSuccessRate += comp.analytics.successRate;
        cat.avgExecutionTime += comp.analytics.avgExecutionTime;
      }
    });

    if (validCompositions > 0) {
      analysis.avgSuccessRate = totalSuccessRate / validCompositions;
      analysis.avgExecutionTime = totalExecutionTime / validCompositions;
    }

    // Calculate category averages
    Object.values(analysis.performanceByCategory).forEach(cat => {
      cat.avgSuccessRate /= cat.count;
      cat.avgExecutionTime /= cat.count;
    });

    // Most used compositions
    analysis.mostUsed = compositions
      .sort((a, b) => b.analytics.usageCount - a.analytics.usageCount)
      .slice(0, 5)
      .map(comp => ({
        name: comp.name,
        usageCount: comp.analytics.usageCount,
        successRate: comp.analytics.successRate
      }));

    return analysis;
  }

  getRecommendations(context = {}) {
    const { taskType, complexity, userHistory } = context;

    const recommendations = {
      suggestedCompositions: [],
      alternativeApproaches: [],
      skillCombinations: []
    };

    // Simple recommendation logic based on task type
    if (taskType === 'ui-development') {
      recommendations.suggestedCompositions.push('ui-component-suite');
      recommendations.skillCombinations.push(['element-styling-reference', 'ui-configuration-validation-interface']);
    }

    if (taskType === 'agent-development') {
      recommendations.suggestedCompositions.push('agent-enhancement-workflow');
      recommendations.skillCombinations.push(['agent-accuracy-enhancement', 'agent-coding-standards']);
    }

    if (complexity === 'high') {
      recommendations.alternativeApproaches.push('Break down into smaller compositions');
      recommendations.alternativeApproaches.push('Use template instantiation');
    }

    return recommendations;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const composer = new SkillComposer();

  if (command === 'create') {
    const name = process.argv[3];
    const skills = process.argv[4]?.split(',') || [];
    const workflowStr = process.argv[5];

    if (!name || !skills.length || !workflowStr) {
      console.log('Usage: node skill-composer.cjs create <name> <skills> <workflow>');
      console.log('Example: node skill-composer.cjs create "ui-workflow" "element-styling-reference,ui-configuration-validation-interface" \'{"setup": "element-styling-reference", "validate": "ui-configuration-validation-interface"}\'');
      process.exit(1);
    }

    try {
      const workflow = JSON.parse(workflowStr);
      const id = composer.createComposition(name, { skills, workflow });
      console.log(`✅ Created composition: ${name} (${id})`);
    } catch (error) {
      console.error('❌ Failed to create composition:', error.message);
      process.exit(1);
    }

  } else if (command === 'execute') {
    const name = process.argv[3];

    if (!name) {
      console.log('Usage: node skill-composer.cjs execute <composition-name>');
      process.exit(1);
    }

    try {
      const result = composer.executeComposition(name);
      console.log(`\n🎯 Executed composition: ${name}`);
      console.log(`Status: ${result.status}`);
      console.log(`Duration: ${new Date(result.endTime) - new Date(result.startTime)}ms`);
      console.log(`Steps completed: ${result.steps.filter(s => s.status === 'completed').length}/${result.steps.length}`);
    } catch (error) {
      console.error('❌ Failed to execute composition:', error.message);
      process.exit(1);
    }

  } else if (command === 'list') {
    const category = process.argv[3];
    const compositions = composer.listCompositions(category);

    console.log('\n📋 Available Compositions:');
    if (category) {
      console.log(`Category: ${category}`);
    }
    console.log('');

    compositions.forEach(comp => {
      console.log(`📦 ${comp.name}`);
      console.log(`   Skills: ${comp.skills.join(', ')}`);
      console.log(`   Category: ${comp.metadata.category}`);
      console.log(`   Usage: ${comp.analytics.usageCount} times`);
      if (comp.analytics.successRate > 0) {
        console.log(`   Success Rate: ${comp.analytics.successRate.toFixed(1)}%`);
      }
      console.log('');
    });

  } else if (command === 'analyze') {
    const analysis = composer.analyzeCompositionPerformance();

    console.log('\n📊 Composition Performance Analysis');
    console.log('═'.repeat(50));
    console.log(`Total Compositions: ${analysis.totalCompositions}`);
    console.log(`Average Success Rate: ${analysis.avgSuccessRate.toFixed(1)}%`);
    console.log(`Average Execution Time: ${analysis.avgExecutionTime.toFixed(0)}ms`);
    console.log('');

    console.log('🏆 Most Used Compositions:');
    analysis.mostUsed.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.name} (${comp.usageCount} uses, ${comp.successRate.toFixed(1)}% success)`);
    });
    console.log('');

    console.log('📈 Performance by Category:');
    Object.entries(analysis.performanceByCategory).forEach(([category, data]) => {
      console.log(`   ${category}:`);
      console.log(`     • Compositions: ${data.count}`);
      console.log(`     • Avg Success: ${data.avgSuccessRate.toFixed(1)}%`);
      console.log(`     • Avg Time: ${data.avgExecutionTime.toFixed(0)}ms`);
    });

  } else if (command === 'template') {
    const action = process.argv[3];

    if (action === 'create') {
      const name = process.argv[4];
      const baseSkills = process.argv[5]?.split(',') || [];
      const workflowStr = process.argv[6];

      if (!name || !baseSkills.length || !workflowStr) {
        console.log('Usage: node skill-composer.cjs template create <name> <base-skills> <workflow-template>');
        process.exit(1);
      }

      try {
        const workflowTemplate = JSON.parse(workflowStr);
        const id = composer.createTemplate(name, {
          baseSkills,
          workflowTemplate,
          customizationPoints: ['additionalSkills', 'workflowModifications']
        });
        console.log(`✅ Created template: ${name} (${id})`);
      } catch (error) {
        console.error('❌ Failed to create template:', error.message);
        process.exit(1);
      }

    } else if (action === 'instantiate') {
      const templateName = process.argv[4];
      const customizationsStr = process.argv[5] || '{}';

      if (!templateName) {
        console.log('Usage: node skill-composer.cjs template instantiate <template-name> [customizations]');
        process.exit(1);
      }

      try {
        const customizations = JSON.parse(customizationsStr);
        const compositionId = composer.instantiateFromTemplate(templateName, customizations);
        console.log(`✅ Instantiated composition from template: ${templateName} -> ${compositionId}`);
      } catch (error) {
        console.error('❌ Failed to instantiate template:', error.message);
        process.exit(1);
      }
    } else {
      console.log('Template commands:');
      console.log('  node skill-composer.cjs template create <name> <skills> <workflow>');
      console.log('  node skill-composer.cjs template instantiate <template> [customizations]');
    }

  } else {
    console.log('Skill Composition System');
    console.log('Usage:');
    console.log('  node skill-composer.cjs create <name> <skills> <workflow>  # Create composition');
    console.log('  node skill-composer.cjs execute <name>                   # Execute composition');
    console.log('  node skill-composer.cjs list [category]                  # List compositions');
    console.log('  node skill-composer.cjs analyze                          # Performance analysis');
    console.log('  node skill-composer.cjs template <action>                # Template management');
  }
}

module.exports = SkillComposer;
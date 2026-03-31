#!/usr/bin/env node

/**
 * Script to systematically add memory system headers to all documentation files
 * that are missing them in the Construct AI repository.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const DOCS_ROOT = path.join(__dirname, '..', 'docs_construct_ai');
const MEMORY_HEADER_TEMPLATE = `---
memory_layer: durable_knowledge
para_section: {para_section}
gigabrain_tags: {gigabrain_tags}
documentation
openstinger_context: {openstinger_context}
last_updated: 2026-03-30
related_docs:
  - {related_docs}
---
`;

// File type mappings for automatic categorization
const FILE_TYPE_MAPPINGS = {
  // Procedures
  'procedures': {
    para_section: 'pages/codebase/procedures',
    gigabrain_tags: 'procedures, codebase',
    openstinger_context: 'operational-procedures',
    related_docs: 'codebase/procedures/'
  },

  // Standards
  'standards': {
    para_section: 'pages/standards',
    gigabrain_tags: 'standards, documentation',
    openstinger_context: 'standards-compliance',
    related_docs: 'docs/standards/'
  },

  // Development docs
  'development': {
    para_section: 'pages/development',
    gigabrain_tags: 'development, codebase',
    openstinger_context: 'development-processes',
    related_docs: 'docs/development/'
  },

  // Dev tools
  'dev-tools': {
    para_section: 'pages/dev-tools',
    gigabrain_tags: 'dev-tools, development',
    openstinger_context: 'development-tools',
    related_docs: 'docs/dev-tools/'
  },

  // Disciplines
  'disciplines': {
    para_section: 'pages/disciplines',
    gigabrain_tags: 'disciplines, documentation',
    openstinger_context: 'discipline-knowledge',
    related_docs: 'disciplines/'
  },

  // Reports
  'reports': {
    para_section: 'pages/reports',
    gigabrain_tags: 'reports, documentation',
    openstinger_context: 'reporting-analysis',
    related_docs: 'docs/reports/'
  },

  // Testing
  'testing': {
    para_section: 'pages/testing',
    gigabrain_tags: 'testing, quality-assurance',
    openstinger_context: 'testing-methodologies',
    related_docs: 'docs/testing/'
  },

  // Architecture
  'architecture': {
    para_section: 'pages/architecture',
    gigabrain_tags: 'architecture, system-design',
    openstinger_context: 'system-architecture',
    related_docs: 'docs/architecture/'
  },

  // Performance
  'performance': {
    para_section: 'pages/performance',
    gigabrain_tags: 'performance, optimization',
    openstinger_context: 'performance-monitoring',
    related_docs: 'docs/performance/'
  },

  // Security
  'security': {
    para_section: 'pages/security',
    gigabrain_tags: 'security, compliance',
    openstinger_context: 'security-practices',
    related_docs: 'docs/security/'
  },

  // Backup
  'backup': {
    para_section: 'pages/backup',
    gigabrain_tags: 'backup, data-management',
    openstinger_context: 'backup-strategies',
    related_docs: 'docs/backup/'
  },

  // Errors
  'errors': {
    para_section: 'pages/errors',
    gigabrain_tags: 'errors, troubleshooting',
    openstinger_context: 'error-handling',
    related_docs: 'docs/errors/'
  },

  // Examples
  'examples': {
    para_section: 'pages/examples',
    gigabrain_tags: 'examples, documentation',
    openstinger_context: 'implementation-examples',
    related_docs: 'docs/examples/'
  },

  // Commands
  'commands': {
    para_section: 'pages/commands',
    gigabrain_tags: 'commands, operations',
    openstinger_context: 'operational-commands',
    related_docs: 'docs/commands/'
  },

  // Guides
  'guides': {
    para_section: 'pages/guides',
    gigabrain_tags: 'guides, documentation',
    openstinger_context: 'implementation-guides',
    related_docs: 'docs/guides/'
  },

  // Templates
  'templates': {
    para_section: 'pages/templates',
    gigabrain_tags: 'templates, documentation',
    openstinger_context: 'template-systems',
    related_docs: 'docs/templates/'
  },

  // Plans
  'plans': {
    para_section: 'pages/plans',
    gigabrain_tags: 'plans, project-management',
    openstinger_context: 'project-planning',
    related_docs: 'docs/plans/'
  },

  // Implementations
  'implementations': {
    para_section: 'pages/implementations',
    gigabrain_tags: 'implementations, development',
    openstinger_context: 'implementation-strategies',
    related_docs: 'docs/implementations/'
  },

  // Outputs
  'outputs': {
    para_section: 'pages/outputs',
    gigabrain_tags: 'outputs, deliverables',
    openstinger_context: 'project-outputs',
    related_docs: 'docs/outputs/'
  },

  // Working
  'working': {
    para_section: 'pages/working',
    gigabrain_tags: 'working, development',
    openstinger_context: 'work-in-progress',
    related_docs: 'docs/working/'
  },

  // Memories
  'memories': {
    para_section: 'pages/memories',
    gigabrain_tags: 'memories, knowledge-management',
    openstinger_context: 'knowledge-preservation',
    related_docs: 'docs/memories/'
  },

  // Audits
  'audits': {
    para_section: 'pages/audits',
    gigabrain_tags: 'audits, compliance',
    openstinger_context: 'audit-processes',
    related_docs: 'docs/audits/'
  },

  // Analysis
  'analysis': {
    para_section: 'pages/analysis',
    gigabrain_tags: 'analysis, research',
    openstinger_context: 'analytical-methods',
    related_docs: 'docs/analysis/'
  },

  // Agent data
  'agent-data': {
    para_section: 'pages/agent-data',
    gigabrain_tags: 'agent-data, ai-systems',
    openstinger_context: 'ai-agent-data',
    related_docs: 'docs/agent-data/'
  },

  // Workflow docs
  'workflow_docs': {
    para_section: 'pages/workflow-docs',
    gigabrain_tags: 'workflow-docs, processes',
    openstinger_context: 'workflow-management',
    related_docs: 'docs/workflow-docs/'
  },

  // Integration
  'integration': {
    para_section: 'pages/integration',
    gigabrain_tags: 'integration, system-integration',
    openstinger_context: 'system-integration',
    related_docs: 'docs/integration/'
  },

  // UI
  'ui': {
    para_section: 'pages/ui',
    gigabrain_tags: 'ui, user-interface',
    openstinger_context: 'ui-design',
    related_docs: 'docs/ui/'
  },

  // Database
  'database': {
    para_section: 'pages/database',
    gigabrain_tags: 'database, data-management',
    openstinger_context: 'database-operations',
    related_docs: 'docs/database/'
  },

  // Chatbot
  'chatbot': {
    para_section: 'pages/chatbot',
    gigabrain_tags: 'chatbot, ai-systems',
    openstinger_context: 'ai-chatbot-systems',
    related_docs: 'docs/chatbot/'
  },

  // Suppliers
  'suppliers': {
    para_section: 'pages/suppliers',
    gigabrain_tags: 'suppliers, procurement',
    openstinger_context: 'supplier-management',
    related_docs: 'docs/suppliers/'
  },

  // Tenders
  'tenders': {
    para_section: 'pages/tenders',
    gigabrain_tags: 'tenders, procurement',
    openstinger_context: 'tender-management',
    related_docs: 'docs/tenders/'
  },

  // Scope of work
  'scope-of-work': {
    para_section: 'pages/scope-of-work',
    gigabrain_tags: 'scope-of-work, procurement',
    openstinger_context: 'sow-management',
    related_docs: 'docs/scope-of-work/'
  },

  // Master guides
  'master-guides': {
    para_section: 'pages/master-guides',
    gigabrain_tags: 'master-guides, documentation',
    openstinger_context: 'comprehensive-guides',
    related_docs: 'docs/master-guides/'
  },

  // Debug
  'debug': {
    para_section: 'pages/debug',
    gigabrain_tags: 'debug, troubleshooting',
    openstinger_context: 'debug-processes',
    related_docs: 'docs/debug/'
  },

  // References
  'references': {
    para_section: 'pages/references',
    gigabrain_tags: 'references, documentation',
    openstinger_context: 'reference-materials',
    related_docs: 'docs/references/'
  }
};

// Special mappings for specific file patterns
const SPECIAL_MAPPINGS = {
  // UI Frontend procedures
  'procedures/ui-frontend': {
    para_section: 'pages/codebase/procedures/ui-frontend',
    gigabrain_tags: 'procedures, ui-frontend, codebase, react, components',
    openstinger_context: 'operational-procedures, ui-frontend-practices',
    related_docs: 'codebase/procedures/ui-frontend/'
  },

  // Database standards
  'database/0000_DATABASE_NAMING_STANDARDS.md': {
    para_section: 'pages/codebase/database',
    gigabrain_tags: 'database, naming-standards, schema-design, data-management, supabase',
    openstinger_context: 'database-standards, naming-conventions, schema-validation',
    related_docs: 'codebase/database/'
  },

  // Agent READMEs
  'agents/0000_README.md': {
    para_section: 'pages/codebase/agents',
    gigabrain_tags: 'agents, ai-systems, documentation',
    openstinger_context: 'ai-agent-documentation',
    related_docs: 'codebase/agents/'
  },

  // Memory system docs
  'memory-docs': {
    para_section: 'pages/codebase/memory-docs',
    gigabrain_tags: 'memory-system, knowledge-management, ai-memory, layered-memory, openclaw',
    openstinger_context: 'memory-management, knowledge-preservation, ai-assistance',
    related_docs: 'codebase/memory-docs/'
  }
};

/**
 * Determine the appropriate memory header configuration for a file
 */
function determineMemoryConfig(filePath) {
  const relativePath = path.relative(DOCS_ROOT, filePath);
  const pathParts = relativePath.split('/');

  // Check for special mappings first
  for (const [pattern, config] of Object.entries(SPECIAL_MAPPINGS)) {
    if (relativePath.includes(pattern)) {
      return config;
    }
  }

  // Determine based on path structure
  const primaryCategory = pathParts[0];
  const secondaryCategory = pathParts[1];

  // Check for combined patterns
  const combinedKey = `${primaryCategory}/${secondaryCategory}`;
  if (FILE_TYPE_MAPPINGS[combinedKey]) {
    return FILE_TYPE_MAPPINGS[combinedKey];
  }

  // Check primary category
  if (FILE_TYPE_MAPPINGS[primaryCategory]) {
    return FILE_TYPE_MAPPINGS[primaryCategory];
  }

  // Default fallback
  return {
    para_section: 'pages/documentation',
    gigabrain_tags: 'documentation',
    openstinger_context: 'general-documentation',
    related_docs: 'docs/'
  };
}

/**
 * Check if a file already has memory headers
 */
function hasMemoryHeaders(content) {
  return content.trim().startsWith('---') &&
         content.includes('memory_layer:') &&
         content.includes('gigabrain_tags:');
}

/**
 * Generate memory header for a file
 */
function generateMemoryHeader(filePath) {
  const config = determineMemoryConfig(filePath);

  return MEMORY_HEADER_TEMPLATE
    .replace('{para_section}', config.para_section)
    .replace('{gigabrain_tags}', config.gigabrain_tags)
    .replace('{openstinger_context}', config.openstinger_context)
    .replace('{related_docs}', config.related_docs);
}

/**
 * Add memory header to a file
 */
function addMemoryHeaderToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (hasMemoryHeaders(content)) {
      console.log(`⏭️  Skipping ${path.relative(DOCS_ROOT, filePath)} - already has headers`);
      return false;
    }

    const header = generateMemoryHeader(filePath);
    const newContent = header + '\n' + content;

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added memory header to ${path.relative(DOCS_ROOT, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${path.relative(DOCS_ROOT, filePath)}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Scanning for documentation files missing memory headers...\n');

  try {
    // Find all .md files in docs_construct_ai directory
    const pattern = path.join(DOCS_ROOT, '**/*.md');
    const files = await glob(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**'
      ]
    });

    console.log(`📁 Found ${files.length} markdown files to check\n`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const file of files) {
      processed++;

      // Skip files that are templates or special files
      const relativePath = path.relative(DOCS_ROOT, file);
      if (relativePath.includes('templates/') ||
          relativePath.includes('_memory_header.md') ||
          relativePath.startsWith('.')) {
        skipped++;
        continue;
      }

      if (addMemoryHeaderToFile(file)) {
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total files processed: ${processed}`);
    console.log(`   Files updated: ${updated}`);
    console.log(`   Files skipped: ${skipped}`);
    console.log(`\n✅ Memory header addition complete!`);

  } catch (error) {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { addMemoryHeaderToFile, determineMemoryConfig, hasMemoryHeaders };
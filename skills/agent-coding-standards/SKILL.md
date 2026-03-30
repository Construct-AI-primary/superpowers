---
memory_layer: durable_knowledge
para_section: pages/skills/agent-coding-standards
gigabrain_tags: coding-standards, agent-development, codebase-standards, development-practices
openstinger_context: coding-standards-practices, agent-development-standards
last_updated: 2026-03-30
related_docs:
  - docs_construct_ai/codebase/coding-standards/
  - docs_construct_ai/codebase/architecture/
related_skills:
  - writing-plans
  - test-driven-development
  - verification-before-completion
frequency_percent: 95.0
success_rate_percent: 92.0
---

# Agent Coding Standards

## Overview

**Core principle:** Follow Construct AI coding standards for consistent, maintainable, and secure agent development.

**Technical stack:** React.js frontend, Node.js/Express.js backend, Supabase PostgreSQL database, custom authentication.

## When to Use This Skill

**Trigger Conditions:**
- When developing or modifying AI agents for Construct AI
- Before implementing any agent functionality
- When reviewing agent code for standards compliance
- When setting up new agent development environments
- When integrating agents with existing Construct AI systems
- When debugging agent-related issues
- When deploying agents to production

**Mandatory Application:**
- Required for all agent development work
- Must be applied before any agent implementation
- Required for both new agents and agent modifications
- Must be verified before agent deployment

## Step-by-Step Procedure

### Step 1: Environment Setup Verification
**Ensure development environment follows standards:**

```javascript
// Verify environment setup
const environmentCheck = {
  nodeVersion: process.version,
  npmVersion: await getNpmVersion(),
  databaseConnection: await testDatabaseConnection(),
  authenticationConfigured: checkAuthSetup(),
  environmentVariables: validateEnvVars()
};

// Required versions and configurations
const requiredSetup = {
  nodeVersion: '>=18.0.0',
  database: 'Supabase PostgreSQL',
  auth: 'Custom with dev bypass',
  envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET']
};

if (!environmentCheck.allRequirementsMet) {
  throw new Error(`Environment setup incomplete: ${environmentCheck.missing.join(', ')}`);
}
```

**Environment Requirements:**
- Node.js 18+ with ES6+ syntax
- Supabase PostgreSQL database connection
- Custom authentication with development bypass
- Required environment variables configured

### Step 2: Code Structure Standards Application
**Apply Construct AI file organization and naming conventions:**

```javascript
// File structure validation
const fileStructureStandards = {
  serverCode: 'server/',
  clientCode: 'client/',
  documentation: 'docs/',
  databaseSchemas: 'server/sql/',
  routes: 'server/src/routes/',
  components: 'client/src/components/',
  services: 'client/src/services/',
  utilities: 'client/src/utils/'
};

// Naming conventions
const namingConventions = {
  variables: 'camelCase',
  functions: 'camelCase',
  files: 'camelCase',
  components: 'PascalCase',
  classes: 'PascalCase',
  databaseColumns: 'snake_case',
  apiEndpoints: 'kebab-case'
};

// Validate current file structure
function validateFileStructure(projectRoot) {
  const requiredDirs = Object.values(fileStructureStandards);
  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(projectRoot, dir)));
  
  if (missingDirs.length > 0) {
    console.warn('Missing standard directories:', missingDirs);
    // Create missing directories
    missingDirs.forEach(dir => fs.mkdirSync(path.join(projectRoot, dir), { recursive: true }));
  }
}
```

**File Organization:**
- Server code in `/server` directory
- Client code in `/client` directory
- Documentation in `/docs` directory
- Database schemas in `/server/sql`
- Routes organized by feature in `/server/src/routes`

### Step 3: Import/Export Standards Implementation
**Apply ES6 import/export conventions:**

```javascript
// Import grouping standards
import { useState, useEffect } from 'react';        // Standard library
import { createClient } from '@supabase/supabase-js'; // Third-party
import { apiService } from '../services/api';       // Local modules
import { formatDate } from '../../utils/dateUtils'; // Relative paths

// Export patterns
export const AGENT_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  ERROR: 'error'
};

export function validateAgentInput(input) {
  // Validation logic
}

export default function AgentProcessor() {
  // Component logic
}

// Group related exports
export {
  validateAgentInput,
  processAgentOutput,
  handleAgentError
} from './agentUtils';
```

**Import/Export Rules:**
- Use ES6 imports: `import module from 'path'`
- Group imports: standard libraries, third-party, local modules
- Use relative paths with `../` for parent directories
- Export functions/objects at the end of files

### Step 4: Error Handling Implementation
**Implement comprehensive error handling patterns:**

```javascript
// Async operation error handling
export async function processAgentRequest(request) {
  try {
    // Validate input
    const validation = validateAgentInput(request);
    if (!validation.isValid) {
      throw new AgentValidationError(validation.errors);
    }

    // Process request
    const result = await performAgentProcessing(request);
    
    // Log success
    logger.info('Agent request processed successfully', { 
      requestId: request.id,
      processingTime: Date.now() - request.timestamp 
    });
    
    return result;
  } catch (error) {
    // Log error with context
    logger.error('Agent request processing failed', {
      requestId: request.id,
      error: error.message,
      stack: error.stack
    });

    // Handle specific error types
    if (error instanceof AgentValidationError) {
      return { success: false, error: 'Invalid input', details: error.details };
    }
    
    if (error instanceof DatabaseError) {
      return { success: false, error: 'Database operation failed', retry: true };
    }

    // Generic error response
    return { success: false, error: 'Internal processing error' };
  }
}

// Middleware error handling
export function errorHandlingMiddleware(err, req, res, next) {
  // Log error
  logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });

  // Determine appropriate response
  const statusCode = getHttpStatusCode(err);
  const errorResponse = formatErrorResponse(err);

  res.status(statusCode).json(errorResponse);
}
```

**Error Handling Standards:**
- Use try/catch for async operations
- Log errors with context
- Return appropriate HTTP status codes
- Use middleware for centralized error handling

### Step 5: Database Standards Application
**Implement secure database interaction patterns:**

```javascript
// Parameterized query usage
export async function getAgentById(agentId) {
  const query = `
    SELECT id, name, status, created_at, updated_at
    FROM agents
    WHERE id = $1 AND organization_id = $2
  `;
  
  const values = [agentId, getCurrentOrganizationId()];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Database query failed', { agentId, error: error.message });
    throw new DatabaseError('Failed to retrieve agent', error);
  }
}

// Transaction handling
export async function createAgentWithPermissions(agentData, permissions) {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    // Insert agent
    const agentResult = await client.query(`
      INSERT INTO agents (name, type, organization_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [agentData.name, agentData.type, agentData.organizationId, agentData.createdBy]);
    
    const agentId = agentResult.rows[0].id;
    
    // Insert permissions
    for (const permission of permissions) {
      await client.query(`
        INSERT INTO agent_permissions (agent_id, permission_type, resource)
        VALUES ($1, $2, $3)
      `, [agentId, permission.type, permission.resource]);
    }
    
    await client.query('COMMIT');
    
    logger.info('Agent created with permissions', { agentId, permissionCount: permissions.length });
    
    return { agentId, success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Agent creation failed', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
}
```

**Database Standards:**
- Use parameterized queries to prevent SQL injection
- Follow naming conventions: snake_case for columns, camelCase for JS
- Include foreign key constraints
- Add indexes for frequently queried columns
- Use transactions for multi-step operations

### Step 6: API Design Standards Implementation
**Apply RESTful API design patterns:**

```javascript
// RESTful endpoint structure
export function setupAgentRoutes(app) {
  const router = express.Router();
  
  // GET /api/agents - List agents
  router.get('/agents', async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const agents = await agentService.getAgents({ page, limit, status });
      
      res.json({
        success: true,
        data: agents,
        pagination: { page, limit, total: agents.length }
      });
    } catch (error) {
      logger.error('Failed to retrieve agents', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  // POST /api/agents - Create agent
  router.post('/agents', async (req, res) => {
    try {
      const agentData = req.body;
      const createdAgent = await agentService.createAgent(agentData);
      
      res.status(201).json({
        success: true,
        data: createdAgent,
        message: 'Agent created successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        logger.error('Failed to create agent', { error: error.message });
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  });
  
  // GET /api/agents/:id - Get specific agent
  router.get('/agents/:id', async (req, res) => {
    try {
      const agent = await agentService.getAgentById(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }
      
      res.json({ success: true, data: agent });
    } catch (error) {
      logger.error('Failed to retrieve agent', { id: req.params.id, error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  // PUT /api/agents/:id - Update agent
  router.put('/agents/:id', async (req, res) => {
    try {
      const updatedAgent = await agentService.updateAgent(req.params.id, req.body);
      
      if (!updatedAgent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }
      
      res.json({
        success: true,
        data: updatedAgent,
        message: 'Agent updated successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        logger.error('Failed to update agent', { id: req.params.id, error: error.message });
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  });
  
  // DELETE /api/agents/:id - Delete agent
  router.delete('/agents/:id', async (req, res) => {
    try {
      const deleted = await agentService.deleteAgent(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }
      
      res.json({ success: true, message: 'Agent deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete agent', { id: req.params.id, error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'agent-api'
    });
  });
  
  app.use('/api', router);
}
```

**API Design Standards:**
- RESTful endpoints with consistent naming
- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Include request logging middleware
- Health check endpoint at `/health`
- Version API endpoints when needed

### Step 7: Security Standards Implementation
**Apply security best practices:**

```javascript
// Input validation middleware
export function validateAgentInput(req, res, next) {
  const { name, type, configuration } = req.body;
  
  // Required field validation
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid name: must be string, max 100 characters' 
    });
  }
  
  if (!type || !['document-analysis', 'data-extraction', 'workflow'].includes(type)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid type: must be one of document-analysis, data-extraction, workflow' 
    });
  }
  
  // Sanitize configuration object
  if (configuration) {
    req.body.configuration = sanitizeConfiguration(configuration);
  }
  
  next();
}

// Authentication middleware
export function requireAuthentication(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid JWT token', { error: error.message });
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// SQL injection prevention
export async function getAgentWithPermissions(agentId) {
  // Use parameterized queries
  const query = `
    SELECT a.*, array_agg(ap.permission_type) as permissions
    FROM agents a
    LEFT JOIN agent_permissions ap ON a.id = ap.agent_id
    WHERE a.id = $1 AND a.organization_id = $2
    GROUP BY a.id
  `;
  
  const values = [agentId, getCurrentOrganizationId()];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

// Rate limiting
export function createRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}
```

**Security Standards:**
- Validate user input
- Use authentication middleware
- Sanitize database inputs
- Log security events
- Implement rate limiting

### Step 8: Testing Standards Application
**Implement comprehensive testing patterns:**

```javascript
// Unit test structure
describe('AgentService', () => {
  let mockDb;
  let agentService;
  
  beforeEach(() => {
    mockDb = createMockDatabase();
    agentService = new AgentService(mockDb);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAgentById', () => {
    it('should return agent when found', async () => {
      const mockAgent = { id: 1, name: 'Test Agent', status: 'active' };
      mockDb.query.mockResolvedValue({ rows: [mockAgent] });
      
      const result = await agentService.getAgentById(1);
      
      expect(result).toEqual(mockAgent);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1, expect.any(String)]
      );
    });
    
    it('should return null when agent not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      
      const result = await agentService.getAgentById(999);
      
      expect(result).toBeNull();
    });
    
    it('should throw DatabaseError on query failure', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(agentService.getAgentById(1)).rejects.toThrow(DatabaseError);
    });
  });
});

// Integration test structure
describe('Agent API Integration', () => {
  let app;
  let server;
  let testDb;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = createTestApp(testDb);
    server = app.listen(3001);
  });
  
  afterAll(async () => {
    await testDb.cleanup();
    server.close();
  });
  
  describe('POST /api/agents', () => {
    it('should create agent successfully', async () => {
      const agentData = {
        name: 'Integration Test Agent',
        type: 'document-analysis',
        configuration: { model: 'gpt-4', temperature: 0.7 }
      };
      
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${testToken}`)
        .send(agentData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(agentData.name);
    });
    
    it('should return 400 for invalid input', async () => {
      const invalidData = { name: '', type: 'invalid-type' };
      
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });
  });
});
```

**Testing Standards:**
- Write unit tests for utility functions
- Integration tests for API endpoints
- Use descriptive test names
- Mock external dependencies

### Step 9: Prompt Key Standards Implementation
**Apply standardized prompt key naming conventions:**

```javascript
// Prompt key validation
class PromptKeyValidator {
  constructor() {
    this.pattern = /^[a-z]+_[a-z]+_[a-z0-9]+_[a-z]+$/;
    this.categories = ['agent', 'specialist', 'function', 'system'];
  }
  
  validate(key) {
    if (!this.pattern.test(key)) {
      return {
        isValid: false,
        error: 'Key must be lowercase with underscore separation'
      };
    }
    
    const parts = key.split('_');
    const category = parts[0];
    
    if (!this.categories.includes(category)) {
      return {
        isValid: false,
        error: `Invalid category. Must be one of: ${this.categories.join(', ')}`
      };
    }
    
    return { isValid: true, category, subcategory: parts[1] };
  }
  
  generateKey(category, subcategory, identifier, purpose) {
    return `${category}_${subcategory}_${identifier}_${purpose}`;
  }
}

// Usage examples
const validator = new PromptKeyValidator();

// Valid keys
console.log(validator.validate('agent_correspondence_01_document_analysis')); // { isValid: true }
console.log(validator.validate('specialist_discipline_civil_engineering')); // { isValid: true }

// Invalid keys
console.log(validator.validate('AGENT_CORRESPONDENCE_01')); // { isValid: false }
console.log(validator.validate('invalid_key')); // { isValid: false }

// Generate keys
const key = validator.generateKey('agent', 'correspondence', '07', 'professional_formatting');
// Result: 'agent_correspondence_07_professional_formatting'
```

**Prompt Key Standards:**
- Always lowercase with underscore separation
- Hierarchical structure: category_subcategory_identifier_purpose
- Valid categories: agent, specialist, function, system
- Use PromptKeyValidator for validation

### Step 10: Governance Integration Implementation
**Integrate with 11-Agent Governance Swarm:**

```javascript
// Governance integration
import { with_governance } from 'deep-agents/agents/shared/governance';

class ConstructAIAgent {
  constructor() {
    this.jurisdiction = 'FI'; // Primary jurisdiction
    this.strictMode = true;
  }
  
  @with_governance({ jurisdiction: 'FI', strict_mode: true })
  async processRequest(request) {
    // Agent logic with automatic governance validation
    const complianceCheck = await this.checkCompliance(request);
    
    if (complianceCheck.blocked) {
      return {
        success: false,
        error: 'Request blocked by governance policy',
        reason: complianceCheck.reason
      };
    }
    
    // Process request with governance monitoring
    const result = await this.executeWithAuditing(request);
    
    // Log for compliance
    await this.logGovernanceEvent('request_processed', {
      requestId: request.id,
      jurisdiction: this.jurisdiction,
      compliance: result.compliance
    });
    
    return result;
  }
  
  async checkCompliance(request) {
    // Check against AIUC-1, ISO 42001, ISO 27701, EU AI Act, NIS2
    const complianceResult = await governanceSwarm.evaluateCompliance(request, {
      jurisdiction: this.jurisdiction,
      strictMode: this.strictMode
    });
    
    return complianceResult;
  }
}

// Governance compliance checklist verification
function verifyGovernanceCompliance(agent) {
  const checklist = {
    governanceDecorator: agent.hasGovernanceDecorator,
    jurisdictionSpecified: agent.jurisdiction !== undefined,
    strictModeEnabled: agent.strictMode === true,
    auditLogging: agent.hasAuditLogging,
    complianceHandling: agent.handlesBlockedRequests
  };
  
  const passed = Object.values(checklist).every(item => item === true);
  
  if (!passed) {
    const failedItems = Object.entries(checklist)
      .filter(([_, passed]) => !passed)
      .map(([item, _]) => item);
    
    throw new Error(`Governance compliance failed: ${failedItems.join(', ')}`);
  }
  
  return { passed: true, checklist };
}
```

**Governance Standards:**
- Use @with_governance decorator
- Specify primary jurisdiction
- Enable strict mode for compliance
- Implement audit logging
- Handle governance_blocked results

## Success Criteria

- [ ] Environment setup verified and compliant
- [ ] File structure follows Construct AI standards
- [ ] ES6 import/export conventions applied
- [ ] Comprehensive error handling implemented
- [ ] Database interactions use parameterized queries
- [ ] API endpoints follow RESTful design
- [ ] Security measures implemented
- [ ] Testing standards applied
- [ ] Prompt key naming conventions followed
- [ ] Governance integration completed

## Common Pitfalls

1. **Inconsistent Naming** - Always use camelCase for JS, snake_case for DB
2. **Missing Input Validation** - Validate all user inputs before processing
3. **SQL Injection Vulnerabilities** - Always use parameterized queries
4. **Inadequate Error Handling** - Log errors with context and return appropriate responses
5. **Security Oversights** - Implement authentication and authorization
6. **Poor API Design** - Follow RESTful conventions and proper HTTP status codes
7. **Missing Tests** - Write unit and integration tests for all functionality
8. **Invalid Prompt Keys** - Use PromptKeyValidator to ensure proper naming
9. **Governance Non-Compliance** - Always integrate with governance swarm

## Cross-References

### Related Procedures
- [Agent Development Standards](docs_construct_ai/codebase/coding-standards/0000_AGENT_DEVELOPMENT_STANDARDS.md) - Development workflow standards
- [Code Standardization Master Plan](docs_construct_ai/codebase/coding-standards/0000_CODE_STANDARDIZATION_MASTER_PLAN.md) - Overall standardization approach

### Related Skills
- `writing-plans` - Planning agent development
- `test-driven-development` - Testing approach for agents
- `verification-before-completion` - Quality assurance for agent development

### Related Agents
- `DevForge_AI_Team` - Agent development assistance
- `QualityForge_AI_Team` - Code quality verification
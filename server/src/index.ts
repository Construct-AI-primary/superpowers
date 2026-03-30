import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { z } from 'zod';

// Configuration schema
const ConfigSchema = z.object({
  port: z.number().default(3000),
  host: z.string().default('0.0.0.0'),
  databaseUrl: z.string(),
  authMode: z.enum(['local_trusted', 'authenticated']).default('authenticated'),
  apiKey: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

// Paperclip server class
class PaperclipServer {
  private app: express.Application;
  private pool: Pool;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.app = express();
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Authentication middleware for authenticated mode
    if (this.config.authMode === 'authenticated') {
      this.app.use((req, res, next) => {
        const apiKey = req.headers['x-api-key'] || req.query.apiKey;
        
        // Skip auth for health check
        if (req.path === '/health') {
          return next();
        }
        
        if (this.config.apiKey && apiKey !== this.config.apiKey) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        next();
      });
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', mode: this.config.authMode });
    });

    // Paperclip API routes
    this.app.get('/api/projects', async (req, res) => {
      try {
        const result = await this.pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.post('/api/projects', async (req, res) => {
      try {
        const { name, description } = req.body;
        const result = await this.pool.query(
          'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
          [name, description]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/api/projects/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.put('/api/projects/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description } = req.body;
        const result = await this.pool.query(
          'UPDATE projects SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
          [name, description, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.delete('/api/projects/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
      } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  async start(): Promise<void> {
    try {
      // Validate configuration
      ConfigSchema.parse(this.config);
      
      // Test database connection
      await this.pool.query('SELECT NOW()');
      console.log('Database connection established');
      
      // Start server
      this.app.listen(this.config.port, this.config.host, () => {
        console.log(`Paperclip server running on ${this.config.host}:${this.config.port}`);
        console.log(`Auth mode: ${this.config.authMode}`);
      });
    } catch (error) {
      console.error('Paperclip server failed to start:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.pool.end();
  }
}

// Main entry point
async function main(): Promise<void> {
  const config: Config = {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/paperclip',
    authMode: (process.env.AUTH_MODE as 'local_trusted' | 'authenticated') || 'authenticated',
    apiKey: process.env.API_KEY,
  };

  // Validate auth mode for non-loopback deployments
  if (config.authMode === 'local_trusted' && config.host !== '127.0.0.1' && config.host !== 'localhost') {
    throw new Error('local_trusted mode requires loopback host binding (received: ' + config.host + '). Use authenticated mode for non-loopback deployments.');
  }

  const server = new PaperclipServer(config);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await server.stop();
    process.exit(0);
  });

  await server.start();
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Paperclip server failed to start:', error);
    process.exit(1);
  });
}

export { PaperclipServer, Config };
import express from 'express';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('docs')); // Serve documentation

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content - browsers handle this gracefully
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'superpowers-api',
    version: '5.0.4',
    timestamp: new Date().toISOString()
  });
});

// Get all available skills
app.get('/api/skills', async (req, res) => {
  try {
    const skillsPath = path.join(__dirname, 'skills');
    const skillFiles = await glob('**/*.md', { cwd: skillsPath });

    const skills = skillFiles.map(file => {
      const skillPath = path.dirname(file);
      const skillName = path.basename(skillPath); // Use directory name as skill name
      const category = skillPath.split('/')[0] || 'general';
      return {
        name: skillName,
        path: skillPath,
        fullPath: file,
        category: category
      };
    });

    res.json({
      total: skills.length,
      skills: skills
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load skills', details: error.message });
  }
});

// Get specific skill content
app.get('/api/skills/:category/:skill', async (req, res) => {
  try {
    const { category, skill } = req.params;
    // Skills are stored as skills/{category}/{skill}/SKILL.md
    const skillPath = path.join(__dirname, 'skills', category, skill, 'SKILL.md');

    // Check if file exists
    const fs = await import('fs');
    if (!fs.existsSync(skillPath)) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    res.json({
      name: skill,
      category: category,
      content: content,
      path: `${category}/${skill}/SKILL.md`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load skill', details: error.message });
  }
});

// Get project information
app.get('/api/project', (req, res) => {
  res.json({
    name: 'Superpowers',
    version: '5.0.4',
    description: 'Complete software development workflow for coding agents',
    repository: 'https://github.com/Construct-AI-primary/superpowers',
    skills: {
      total: 25, // Approximate count
      categories: ['brainstorming', 'testing', 'debugging', 'collaboration', 'meta']
    }
  });
});

// Root endpoint - serve HTML interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Superpowers API server running on port ${PORT}`);
  console.log(`📚 Documentation available at http://localhost:${PORT}/docs/project/README.md`);
  console.log(`🔗 Health check at http://localhost:${PORT}/health`);
  console.log(`📅 Deployed at: ${new Date().toISOString()}`);
});

export default app;
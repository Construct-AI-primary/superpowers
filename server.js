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

// Serve documentation as HTML
app.get('/docs/:category/:file', async (req, res) => {
  try {
    const { category, file } = req.params;
    const docPath = path.join(__dirname, 'docs', category, file);

    const fs = await import('fs');
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({ error: 'Documentation not found' });
    }

    const content = fs.readFileSync(docPath, 'utf8');

    // Simple HTML wrapper for markdown content
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Superpowers Documentation - ${file}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4 {
            color: #667eea;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h1 { font-size: 2rem; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.3rem; }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 15px 0;
        }
        pre code { background: none; padding: 0; }
        ul, ol { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 5px; }
        blockquote {
            border-left: 4px solid #667eea;
            padding-left: 15px;
            margin: 15px 0;
            color: #666;
        }
        a { color: #667eea; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <a href="/" class="back-link">← Back to Superpowers API</a>
    <div class="content">
        ${formatMarkdown(content)}
    </div>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load documentation', details: error.message });
  }
});

// Root endpoint - serve HTML interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Format markdown content to HTML
function formatMarkdown(content) {
  // Remove frontmatter
  content = content.replace(/^---[\s\S]*?---\n/, '');

  // Basic markdown formatting
  let html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '').replace(/<p><br><\/p>/g, '');

  return html;
}

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
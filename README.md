# Superpowers API

A web API wrapper for the Superpowers plugin system, providing REST endpoints to access Superpowers skills and documentation.

## Quick Start

```bash
npm install
npm start
```

The server will start on port 3000 (or PORT environment variable).

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### List Skills
```
GET /api/skills
```
Returns all available Superpowers skills with metadata.

### Get Skill Content
```
GET /api/skills/:category/:skill
```
Returns the full content of a specific skill.

Example: `/api/skills/brainstorming/brainstorming`

### Project Information
```
GET /api/project
```
Returns information about the Superpowers project.

### Documentation
```
GET /
```
API overview and endpoint documentation.

## Deployment on Render

### Service Configuration
- **Service Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher

### Environment Variables
```bash
NODE_ENV=production
PORT=10000  # Render will set this automatically
```

### Health Check
- **Path**: `/health`
- **Interval**: 30 seconds

## Development

The API serves the Superpowers skills as a web service, making them accessible via HTTP requests instead of requiring installation as coding agent plugins.

## License

MIT License - see LICENSE file for details
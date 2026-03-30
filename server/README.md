# Paperclip Server

A production-ready Paperclip server with authenticated mode for non-loopback deployments.

## Features

- **Authenticated Mode**: Secure API access with API key authentication
- **PostgreSQL Integration**: Full database support with connection pooling
- **RESTful API**: Complete CRUD operations for projects
- **Health Checks**: Built-in health monitoring endpoint
- **Docker Support**: Multi-stage Docker build for production
- **Render Deployment**: Ready-to-deploy configuration for Render

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export DATABASE_URL="postgresql://localhost:5432/paperclip"
export AUTH_MODE="local_trusted"
export HOST="127.0.0.1"
```

3. Run the development server:
```bash
npm run dev
```

### Production Deployment on Render

1. Push this `server/` directory to your Git repository
2. Connect your repository to Render
3. Render will automatically detect the `render.yaml` configuration
4. The server will be deployed with:
   - `AUTH_MODE=authenticated` (secure for production)
   - `HOST=0.0.0.0` (accessible from outside)
   - Auto-generated API key
   - PostgreSQL database

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get a specific project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

## Authentication

When `AUTH_MODE=authenticated`, include the API key in requests:

```bash
# Using header
curl -H "X-API-Key: your-api-key" https://your-server.onrender.com/api/projects

# Using query parameter
curl "https://your-server.onrender.com/api/projects?apiKey=your-api-key"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `AUTH_MODE` | Authentication mode (`local_trusted` or `authenticated`) | `authenticated` |
| `API_KEY` | API key for authenticated mode | Auto-generated on Render |

## Database Schema

The server automatically creates the following table:

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Error Handling

The server includes comprehensive error handling:

- **401 Unauthorized**: Invalid or missing API key
- **404 Not Found**: Project not found
- **500 Internal Server Error**: Database or server errors

## Security Features

- CORS enabled for cross-origin requests
- API key authentication for production deployments
- Non-root Docker user for container security
- SSL/TLS support for database connections
- Input validation with Zod schemas

## Troubleshooting

### Common Issues

1. **"local_trusted mode requires loopback host binding"**
   - This error occurs when using `local_trusted` mode with `0.0.0.0` host
   - Solution: Use `authenticated` mode for production deployments

2. **Database connection errors**
   - Verify `DATABASE_URL` is correctly formatted
   - Ensure database server is accessible
   - Check SSL configuration for remote databases

3. **Authentication failures**
   - Verify API key is included in requests
   - Check `API_KEY` environment variable is set
   - Ensure `AUTH_MODE` is set to `authenticated` for production

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Health check
curl http://localhost:3000/health

# List projects
curl http://localhost:3000/api/projects
```

## License

MIT
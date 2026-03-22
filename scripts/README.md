# Scripts Directory

This directory contains all executable scripts and Python programs for the Construct AI superpowers system, organized by functional area and language.

## Directory Structure

```
scripts/
├── setup/           # Initial setup and configuration scripts
├── organization/    # PARA and discipline organization scripts
├── qa/             # Quality assurance and validation scripts
├── integration/    # Knowledge synchronization and integration scripts
├── memory/         # Memory stack installation and management scripts
├── python/         # Python programs and utilities
│   ├── agents/     # Agent-related Python scripts
│   ├── deployment/ # Deployment and production scripts
│   ├── testing/    # Testing and validation scripts
│   └── integration/# Integration and coordination scripts
└── README.md       # This file
```

## Categories

### Shell Scripts (Bash)

#### setup/
- `setup.sh` - Basic system setup
- `setup-company.sh` - Company-specific configuration

#### organization/
- `para-organize.sh` - PARA system organization and management
- `create-discipline-para.sh` - Create discipline-specific PARA structures
- `create-disciplines-non-para.sh` - Create non-PARA discipline structures

#### qa/
- `qa-monitor.sh` - Quality assurance monitoring
- `qa-validate.sh` - Validation and testing scripts

#### integration/
- `knowledge-sync.sh` - Knowledge synchronization across systems

#### memory/
- `preflight.sh` - Memory stack preflight checks
- `apply.sh` - Memory stack installation and application
- `package.sh` - Memory stack packaging for distribution

### Python Scripts

#### python/agents/
- `agent-wrapper-framework.py` - Agent wrapper and framework utilities

#### python/deployment/
- `production-deployment.py` - Production deployment automation

#### python/testing/
- `end-to-end-testing.py` - End-to-end testing framework

#### python/integration/
- `distributed-coordination.py` - Distributed system coordination
- `openclaw-registration.py` - OpenClaw system registration

## Usage

All scripts are executable and should be run from the repository root directory:

```bash
# Example: Run PARA organization
./scripts/organization/para-organize.sh

# Example: Run memory stack preflight
./scripts/memory/preflight.sh /path/to/target/workspace
```

## Maintenance

- Keep scripts organized by their primary function
- Update this README when adding new script categories
- Ensure all scripts have appropriate execute permissions
- Document script parameters and usage in script headers

## Related Documentation

- [Memory System Documentation](../docs/memory-stack/)
- [PARA System Documentation](../PARA.md)
- [Setup Instructions](../README.md)
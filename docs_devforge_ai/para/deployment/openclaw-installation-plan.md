# OpenClaw Device Memory System Installation Plan

## Overview
This plan provides comprehensive instructions for deploying the DevForge AI memory system on the OpenClaw device. The installation establishes a distributed memory architecture with bidirectional synchronization between the repository and OpenClaw device.

## Prerequisites

### System Requirements
- **OpenClaw Device**: Network-accessible device with sufficient storage
- **Network Access**: Tailscale VPN connectivity to repository network
- **Permissions**: Administrative access for installation and configuration
- **Repository Access**: SSH/git access to DevForge AI repository

### Pre-Installation Checklist
- [ ] OpenClaw device powered on and network accessible
- [ ] Tailscale installed and configured on device
- [ ] SSH access established to device
- [ ] Repository access credentials available
- [ ] Backup of existing device data (if any) completed

## Phase 1: Device Preparation

### Step 1.1: Network Configuration
```bash
# Install Tailscale on OpenClaw device
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Verify Tailscale connection
tailscale status
tailscale ip -4
```

### Step 1.2: Repository Access Setup
```bash
# Clone DevForge AI repository
git clone https://github.com/DevForge-AI/repository.git ~/devforge-ai
cd ~/devforge-ai

# Verify repository structure
ls -la docs_devforge_ai/para/
```

### Step 1.3: System Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# OR
sudo yum update -y  # CentOS/RHEL

# Install required dependencies
sudo apt install -y git curl wget python3 python3-pip nodejs npm
```

## Phase 2: Memory System Installation

### Step 2.1: Memory Stack Deployment
```bash
# Navigate to repository
cd ~/devforge-ai

# Deploy memory stack in core-plus-guidance mode
bash docs/memory-stack/scripts/apply.sh ~/devforge-ai --mode core-plus-guidance

# Verify deployment
ls -la memory/
cat memory/$(date +%Y-%m-%d).md
```

### Step 2.2: PARA Mirror Setup
```bash
# Create PARA mirror directory
mkdir -p ~/PARA_Mirror

# Initial PARA synchronization
rsync -av --delete docs_devforge_ai/para/ ~/PARA_Mirror/

# Verify mirror structure
find ~/PARA_Mirror -type d | head -10
```

### Step 2.3: Memory Tools Installation
```bash
# Install Gigabrain (intelligent recall)
pip3 install gigabrain-memory

# Install LCM (session continuity)
npm install -g lcm-session-manager

# Install OpenStinger (cross-session recall)
pip3 install openstinger

# Verify installations
gigabrain --version
lcm --version
openstinger --version
```

## Phase 3: Configuration

### Step 3.1: Memory Tools Configuration
```bash
# Configure Gigabrain
cat > ~/.gigabrain/config.json << EOF
{
  "para_path": "~/PARA_Mirror",
  "memory_path": "~/devforge-ai/memory",
  "recall_depth": 100,
  "cross_session": true
}
EOF

# Configure LCM
cat > ~/.lcm/config.json << EOF
{
  "session_timeout": 3600,
  "memory_integration": true,
  "para_sync": true
}
EOF

# Configure OpenStinger
cat > ~/.openstinger/config.json << EOF
{
  "memory_store": "~/devforge-ai/memory",
  "para_index": "~/PARA_Mirror",
  "session_recall": true
}
EOF
```

### Step 3.2: Synchronization Setup
```bash
# Create sync configuration
cat > ~/PARA_Mirror/sync/config/device-config.json << EOF
{
  "device_name": "openclaw-main",
  "repository_path": "~/devforge-ai",
  "para_mirror_path": "~/PARA_Mirror",
  "sync_interval": 300,
  "conflict_resolution": "repository-wins",
  "tailscale_network": true
}
EOF

# Set up automated sync script
cat > ~/sync-para.sh << 'EOF'
#!/bin/bash
# PARA Synchronization Script
REPO_PATH="$HOME/devforge-ai"
MIRROR_PATH="$HOME/PARA_Mirror"

# Bidirectional sync with conflict resolution
rsync -av --delete --backup --backup-dir="$MIRROR_PATH/conflicts" \
  "$REPO_PATH/docs_devforge_ai/para/" "$MIRROR_PATH/"

rsync -av --delete --backup --backup-dir="$REPO_PATH/para-conflicts" \
  --exclude="sync/logs/*" "$MIRROR_PATH/" "$REPO_PATH/docs_devforge_ai/para/"

echo "PARA sync completed at $(date)" >> ~/PARA_Mirror/sync/logs/sync-$(date +%Y%m%d).log
EOF

chmod +x ~/sync-para.sh
```

### Step 3.3: Automated Sync Scheduling
```bash
# Add to crontab for automated sync every 5 minutes
(crontab -l ; echo "*/5 * * * * $HOME/sync-para.sh") | crontab -

# Verify crontab
crontab -l
```

## Phase 4: Testing and Validation

### Step 4.1: Memory System Tests
```bash
# Test daily memory capture
echo "Testing memory capture" >> memory/test-$(date +%Y-%m-%d).md

# Test Gigabrain recall
gigabrain query "test memory integration"

# Test LCM session continuity
lcm start-session test-session
lcm save-state
lcm restore-state

# Test OpenStinger cross-session recall
openstinger recall "test patterns"
```

### Step 4.2: PARA Access Tests
```bash
# Test PARA navigation
ls ~/PARA_Mirror/pages/disciplines/ | head -5
ls ~/PARA_Mirror/pages/disciplines-non/ | head -5

# Test knowledge discovery
find ~/PARA_Mirror -name "*.md" | wc -l

# Test cross-discipline access
ls ~/PARA_Mirror/pages/disciplines/00250-commercial/
ls ~/PARA_Mirror/pages/disciplines/01900_procurement/
```

### Step 4.3: Synchronization Tests
```bash
# Manual sync test
~/sync-para.sh

# Verify sync logs
tail ~/PARA_Mirror/sync/logs/sync-$(date +%Y%m%d).log

# Test bidirectional sync
echo "Device test content" > ~/PARA_Mirror/test-device.md
~/sync-para.sh
ls ~/devforge-ai/docs_devforge_ai/para/test-device.md
```

## Phase 5: Production Deployment

### Step 5.1: Service Startup
```bash
# Start memory services
sudo systemctl enable gigabrain
sudo systemctl start gigabrain

sudo systemctl enable lcm-manager
sudo systemctl start lcm-manager

sudo systemctl enable openstinger
sudo systemctl start openstinger

# Verify services
sudo systemctl status gigabrain lcm-manager openstinger
```

### Step 5.2: Monitoring Setup
```bash
# Install monitoring tools
pip3 install prometheus-client

# Set up health checks
cat > ~/health-check.sh << 'EOF'
#!/bin/bash
# Memory System Health Check

echo "=== Memory System Health Check ==="
echo "Date: $(date)"
echo

# Check services
echo "Service Status:"
sudo systemctl is-active gigabrain && echo "✅ Gigabrain: RUNNING" || echo "❌ Gigabrain: STOPPED"
sudo systemctl is-active lcm-manager && echo "✅ LCM: RUNNING" || echo "❌ LCM: STOPPED"
sudo systemctl is-active openstinger && echo "✅ OpenStinger: RUNNING" || echo "❌ OpenStinger: STOPPED"
echo

# Check sync status
echo "Sync Status:"
if [ -f ~/PARA_Mirror/sync/logs/sync-$(date +%Y%m%d).log ]; then
    LAST_SYNC=$(tail -1 ~/PARA_Mirror/sync/logs/sync-$(date +%Y%m%d).log)
    echo "✅ Last sync: $LAST_SYNC"
else
    echo "❌ No sync log found for today"
fi
echo

# Check memory activity
echo "Memory Activity:"
MEMORY_FILES=$(find ~/devforge-ai/memory -name "*.md" -mtime -1 | wc -l)
echo "📝 Memory files updated today: $MEMORY_FILES"

PARA_FILES=$(find ~/PARA_Mirror -name "*.md" -mtime -1 | wc -l)
echo "📚 PARA files updated today: $PARA_FILES"
echo

echo "=== Health Check Complete ==="
EOF

chmod +x ~/health-check.sh

# Add to crontab for daily health checks
(crontab -l ; echo "0 6 * * * $HOME/health-check.sh >> $HOME/health-check-$(date +\%Y\%m\%d).log 2>&1") | crontab -
```

### Step 5.3: Backup Configuration
```bash
# Set up automated backups
cat > ~/backup-memory.sh << 'EOF'
#!/bin/bash
# Memory System Backup Script

BACKUP_DIR="$HOME/backups/memory-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup memory data
cp -r ~/devforge-ai/memory "$BACKUP_DIR/"

# Backup PARA mirror
cp -r ~/PARA_Mirror "$BACKUP_DIR/"

# Backup configurations
cp ~/.gigabrain/config.json "$BACKUP_DIR/"
cp ~/.lcm/config.json "$BACKUP_DIR/"
cp ~/.openstinger/config.json "$BACKUP_DIR/"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$HOME/backups" "$(basename $BACKUP_DIR)"
rm -rf "$BACKUP_DIR"

echo "Memory system backup completed: $BACKUP_DIR.tar.gz"
EOF

chmod +x ~/backup-memory.sh

# Add weekly backup to crontab
(crontab -l ; echo "0 2 * * 0 $HOME/backup-memory.sh") | crontab -
```

## Phase 6: Troubleshooting

### Common Issues and Solutions

#### Issue: Tailscale Connection Failed
```bash
# Check Tailscale status
tailscale status

# Re-authenticate if needed
tailscale login

# Restart service
sudo systemctl restart tailscaled
```

#### Issue: Memory Tools Not Starting
```bash
# Check service logs
sudo journalctl -u gigabrain -n 50
sudo journalctl -u lcm-manager -n 50
sudo journalctl -u openstinger -n 50

# Manual start for testing
gigabrain --config ~/.gigabrain/config.json
```

#### Issue: PARA Sync Conflicts
```bash
# Check conflict directories
ls ~/PARA_Mirror/conflicts/
ls ~/devforge-ai/para-conflicts/

# Manual conflict resolution
# Review and merge conflicting files
# Remove from conflict directories after resolution
```

#### Issue: Performance Degradation
```bash
# Check system resources
top
df -h
free -h

# Clear memory caches if needed
sudo sync; sudo echo 3 > /proc/sys/vm/drop_caches

# Restart memory services
sudo systemctl restart gigabrain lcm-manager openstinger
```

## Phase 7: Maintenance Procedures

### Daily Maintenance
- Monitor health check logs: `tail ~/health-check-$(date +%Y%m%d).log`
- Review sync logs: `tail ~/PARA_Mirror/sync/logs/sync-$(date +%Y%m%d).log`
- Check memory activity: `find ~/devforge-ai/memory -name "*.md" -mtime -1`

### Weekly Maintenance
- Review backup integrity: `ls ~/backups/ | tail -5`
- Clean old logs: `find ~/PARA_Mirror/sync/logs -name "*.log" -mtime +30 -delete`
- Update system packages: `sudo apt update && sudo apt upgrade`

### Monthly Maintenance
- Full system backup verification
- Memory performance analysis
- PARA structure audit
- Security updates and patches

## Success Criteria

### Installation Complete When:
- [ ] All memory services running: `sudo systemctl status gigabrain lcm-manager openstinger`
- [ ] PARA mirror synchronized: `ls ~/PARA_Mirror/pages/disciplines/ | wc -l` shows 54
- [ ] Daily memory capture working: `ls memory/ | grep $(date +%Y-%m-%d)`
- [ ] Automated sync active: `crontab -l | grep sync-para`
- [ ] Health monitoring operational: `~/health-check.sh`
- [ ] Backup system configured: `ls ~/backups/`

### Validation Tests Pass:
- [ ] Memory recall: `gigabrain query "test query"` returns results
- [ ] Session continuity: LCM maintains state across sessions
- [ ] Cross-session recall: OpenStinger finds patterns across sessions
- [ ] PARA access: All 54 disciplines accessible through mirror
- [ ] Bidirectional sync: Changes propagate between repository and device

## Emergency Procedures

### Complete System Reset
```bash
# Stop all services
sudo systemctl stop gigabrain lcm-manager openstinger

# Backup current state
~/backup-memory.sh

# Reset to clean state
rm -rf ~/PARA_Mirror
rm -rf ~/.gigabrain ~/.lcm ~/.openstinger
git checkout -- docs_devforge_ai/para/

# Re-run installation from Phase 1
```

### Repository Resync
```bash
# Force full resync from repository
cd ~/devforge-ai
git pull origin main
rsync -av --delete docs_devforge_ai/para/ ~/PARA_Mirror/
~/sync-para.sh
```

## Support and Documentation

### Log Locations
- Memory service logs: `sudo journalctl -u [service-name]`
- Sync logs: `~/PARA_Mirror/sync/logs/`
- Health check logs: `~/health-check-*.log`
- Backup logs: Check script output in cron logs

### Configuration Files
- Gigabrain: `~/.gigabrain/config.json`
- LCM: `~/.lcm/config.json`
- OpenStinger: `~/.openstinger/config.json`
- Sync: `~/PARA_Mirror/sync/config/device-config.json`

### Key Contacts
- Repository: DevForge AI technical team
- Device Access: OpenClaw device administrator
- Network: Tailscale network administrator

---

**Installation Time Estimate**: 2-3 hours
**Testing Time Estimate**: 1 hour
**Go-Live Ready**: When all success criteria met

**Document Version**: 1.0
**Last Updated**: $(date)
**Prepared By**: DevForge AI Memory System Team
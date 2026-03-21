# OpenClaw Device Setup Instructions

## Prerequisites
- OpenClaw device with network access
- Tailscale installed and configured
- Repository access permissions

## Setup Steps
1. Connect device to Tailscale network: https://login.tailscale.com/admin/machines
2. Clone repository or establish sync connection
3. Run memory stack deployment: `bash docs/memory-stack/scripts/apply.sh <device-path> --mode core-plus-guidance`
4. Configure memory tools (Gigabrain, LCM, OpenStinger)
5. Test PARA synchronization
6. Validate cross-device communication

## Configuration
- Device IP: [to be determined]
- Tailscale node: [to be determined]  
- Sync endpoint: [repository]/~/life/sync/
- Memory tools: core-plus-guidance mode

## Testing Checklist
- [ ] Tailscale connectivity established
- [ ] PARA mirror synchronized
- [ ] Memory tools operational
- [ ] Cross-device queries working
- [ ] Fallback modes functional

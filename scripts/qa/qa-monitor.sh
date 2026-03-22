#!/bin/bash

# Knowledge Quality Assurance Monitoring Script
# Automated quality monitoring and alerting system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_quality() {
    echo -e "${PURPLE}[QUALITY]${NC} $1"
}

log_governance() {
    echo -e "${CYAN}[GOVERNANCE]${NC} $1"
}

# Configuration
REPOSITORIES=("docs_devforge_ai" "docs_loopy_ai" "docs_construct_ai")
MONITORING_INTERVAL="daily"  # daily, weekly, monthly
ALERT_THRESHOLDS=("freshness:85" "accuracy:90" "completeness:80" "consistency:95")
NOTIFICATION_EMAIL="devops@devforge.ai"
LOG_DIR="/var/log/knowledge-qa"
METRICS_DIR="/var/metrics/knowledge-qa"

# Quality thresholds
FRESHNESS_THRESHOLD=85
ACCURACY_THRESHOLD=90
COMPLETENESS_THRESHOLD=80
CONSISTENCY_THRESHOLD=95

# Create required directories
setup_directories() {
    log_info "Setting up monitoring directories..."

    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "$METRICS_DIR"

    # Set permissions
    sudo chown $(whoami) "$LOG_DIR"
    sudo chown $(whoami) "$METRICS_DIR"

    log_success "Monitoring directories configured"
}

# Quick quality assessment (simplified for monitoring)
quick_assess_quality() {
    local repo_path="$1"
    local repo_name="$2"

    log_info "Performing quick quality assessment for $repo_name..."

    # Quick freshness check (files modified in last 30 days)
    local recent_files=$(find "$repo_path" -name "*.md" -mtime -30 | wc -l)
    local total_files=$(find "$repo_path" -name "*.md" | wc -l)

    local freshness_score=0
    if [ "$total_files" -gt 0 ]; then
        freshness_score=$(( recent_files * 100 / total_files ))
    fi

    # Quick completeness check (README files)
    local readme_count=$(find "$repo_path" -name "README.md" | wc -l)
    local dir_count=$(find "$repo_path" -type d | wc -l)

    local completeness_score=0
    if [ "$dir_count" -gt 0 ]; then
        completeness_score=$(( readme_count * 100 / dir_count ))
    fi

    # Simplified accuracy check (just check if files exist and are readable)
    local valid_files=$(find "$repo_path" -name "*.md" -readable | wc -l)

    local accuracy_score=0
    if [ "$total_files" -gt 0 ]; then
        accuracy_score=$(( valid_files * 100 / total_files ))
    fi

    # Simplified consistency check (basic header format)
    local consistent_headers=0
    local total_headers=0

    while IFS= read -r file; do
        if [ -f "$file" ] && [ -r "$file" ]; then
            local headers=$(grep -c '^#' "$file")
            total_headers=$((total_headers + headers))

            # Check for proper header capitalization
            local proper_headers=$(grep -c '^#[[:space:]][A-Z]' "$file")
            consistent_headers=$((consistent_headers + proper_headers))
        fi
    done < <(find "$repo_path" -name "*.md" | head -50)  # Limit to first 50 files for speed

    local consistency_score=0
    if [ "$total_headers" -gt 0 ]; then
        consistency_score=$(( consistent_headers * 100 / total_headers ))
    fi

    # Return results as JSON
    echo "{\"freshness\": $freshness_score, \"accuracy\": $accuracy_score, \"completeness\": $completeness_score, \"consistency\": $consistency_score}"
}

# Check for quality degradation
check_quality_degradation() {
    local repo_name="$1"
    local current_scores="$2"

    log_info "Checking for quality degradation in $repo_name..."

    local metrics_file="$METRICS_DIR/${repo_name}-metrics.json"

    # Read previous metrics if they exist
    local previous_scores="{}"
    if [ -f "$metrics_file" ]; then
        previous_scores=$(cat "$metrics_file")
    fi

    # Compare current vs previous scores
    local alerts=()

    # Check freshness
    local current_freshness=$(echo "$current_scores" | jq -r '.freshness')
    local previous_freshness=$(echo "$previous_scores" | jq -r '.freshness // 100')

    if (( $(echo "$current_freshness < $previous_freshness - 5" | bc -l) )); then
        alerts+=("freshness_degraded:$current_freshness:$previous_freshness")
    fi

    # Check accuracy
    local current_accuracy=$(echo "$current_scores" | jq -r '.accuracy')
    local previous_accuracy=$(echo "$previous_scores" | jq -r '.accuracy // 100')

    if (( $(echo "$current_accuracy < $previous_accuracy - 5" | bc -l) )); then
        alerts+=("accuracy_degraded:$current_accuracy:$previous_accuracy")
    fi

    # Check completeness
    local current_completeness=$(echo "$current_scores" | jq -r '.completeness')
    local previous_completeness=$(echo "$previous_scores" | jq -r '.completeness // 100')

    if (( $(echo "$current_completeness < $previous_completeness - 5" | bc -l) )); then
        alerts+=("completeness_degraded:$current_completeness:$previous_completeness")
    fi

    # Check consistency
    local current_consistency=$(echo "$current_scores" | jq -r '.consistency')
    local previous_consistency=$(echo "$previous_scores" | jq -r '.consistency // 100')

    if (( $(echo "$current_consistency < $previous_consistency - 5" | bc -l) )); then
        alerts+=("consistency_degraded:$current_consistency:$previous_consistency")
    fi

    echo "${alerts[@]}"
}

# Send alerts
send_alerts() {
    local repo_name="$1"
    local alerts="$2"

    if [ -z "$alerts" ]; then
        return 0
    fi

    log_warning "Sending quality alerts for $repo_name..."

    local alert_message="Knowledge Quality Alert for $repo_name

Alert Time: $(date)
Repository: $repo_name

Quality Degradation Detected:
"

    for alert in $alerts; do
        IFS=':' read -r metric current previous <<< "$alert"
        alert_message="${alert_message}
- $metric: $current% (previous: $previous%)
"
    done

    alert_message="${alert_message}
Please review and address quality issues promptly.

Knowledge QA Monitoring System
"

    # Log alert
    echo "$alert_message" >> "$LOG_DIR/alerts-$(date +%Y%m%d).log"

    # Send email alert (if mail is available)
    if command -v mail &> /dev/null; then
        echo "$alert_message" | mail -s "Knowledge Quality Alert: $repo_name" "$NOTIFICATION_EMAIL"
        log_info "Alert email sent to $NOTIFICATION_EMAIL"
    else
        log_warning "Mail command not available - alert logged only"
    fi
}

# Update metrics
update_metrics() {
    local repo_name="$1"
    local scores="$2"

    log_info "Updating metrics for $repo_name..."

    local metrics_file="$METRICS_DIR/${repo_name}-metrics.json"

    # Add timestamp to scores
    local timestamped_scores=$(echo "$scores" | jq --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '. + {timestamp: $timestamp}')

    # Save current metrics
    echo "$timestamped_scores" > "$metrics_file"

    log_success "Metrics updated for $repo_name"
}

# Generate monitoring report
generate_monitoring_report() {
    local report_date="$1"

    log_info "Generating monitoring report for $report_date..."

    local report_file="$METRICS_DIR/monitoring-report-${report_date}.json"

    # Collect all repository metrics
    local all_metrics="{"
    local first=true

    for repo in "${REPOSITORIES[@]}"; do
        local metrics_file="$METRICS_DIR/${repo}-metrics.json"

        if [ -f "$metrics_file" ]; then
            if [ "$first" = true ]; then
                first=false
            else
                all_metrics="${all_metrics},"
            fi

            local metrics=$(cat "$metrics_file")
            all_metrics="${all_metrics}\"$repo\": $metrics"
        fi
    done

    all_metrics="${all_metrics}}"

    # Save report
    cat > "$report_file" << EOF
{
  "report_date": "$report_date",
  "monitoring_interval": "$MONITORING_INTERVAL",
  "repositories_monitored": [
    "docs_devforge_ai",
    "docs_loopy_ai",
    "docs_construct_ai"
  ],
  "metrics": $all_metrics,
  "alert_thresholds": {
    "freshness": $FRESHNESS_THRESHOLD,
    "accuracy": $ACCURACY_THRESHOLD,
    "completeness": $COMPLETENESS_THRESHOLD,
    "consistency": $CONSISTENCY_THRESHOLD
  },
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

    log_success "Monitoring report generated: $report_file"
}

# Main monitoring process
main() {
    log_info "Knowledge Quality Assurance Monitoring Started"
    echo "==================================================="

    # Setup directories
    setup_directories

    local report_date=$(date +%Y%m%d)

    # Process each repository
    for repo in "${REPOSITORIES[@]}"; do
        log_info "Monitoring repository: $repo"

        # Quick quality assessment
        local quality_scores=$(quick_assess_quality "$repo" "$repo")

        # Check for degradation
        local alerts=$(check_quality_degradation "$repo" "$quality_scores")

        # Send alerts if any
        if [ -n "$alerts" ]; then
            send_alerts "$repo" "$alerts"
        fi

        # Update metrics
        update_metrics "$repo" "$quality_scores"

        # Display current scores
        local freshness=$(echo "$quality_scores" | jq -r '.freshness')
        local accuracy=$(echo "$quality_scores" | jq -r '.accuracy')
        local completeness=$(echo "$quality_scores" | jq -r '.completeness')
        local consistency=$(echo "$quality_scores" | jq -r '.consistency')

        log_quality "$repo Quality Scores:"
        echo "  📅 Freshness: $freshness% (target: ${FRESHNESS_THRESHOLD}%)"
        echo "  🎯 Accuracy: $accuracy% (target: ${ACCURACY_THRESHOLD}%)"
        echo "  📋 Completeness: $completeness% (target: ${COMPLETENESS_THRESHOLD}%)"
        echo "  📏 Consistency: $consistency% (target: ${CONSISTENCY_THRESHOLD}%)"

        # Check if all metrics meet thresholds
        if [ $freshness -ge $FRESHNESS_THRESHOLD ] && \
           [ $accuracy -ge $ACCURACY_THRESHOLD ] && \
           [ $completeness -ge $COMPLETENESS_THRESHOLD ] && \
           [ $consistency -ge $CONSISTENCY_THRESHOLD ]; then
            log_success "✅ $repo meets all quality thresholds"
        else
            log_warning "⚠️ $repo has quality metrics below thresholds"
        fi

        echo
    done

    # Generate monitoring report
    generate_monitoring_report "$report_date"

    # Summary
    log_success "Quality monitoring completed for $(date)"
    log_info "Reports saved to: $METRICS_DIR"
    log_info "Logs saved to: $LOG_DIR"

    echo
    log_quality "🎯 Monitoring Summary:"
    echo "  📊 Metrics updated for ${#REPOSITORIES[@]} repositories"
    echo "  📁 Reports: $METRICS_DIR/monitoring-report-${report_date}.json"
    echo "  📝 Logs: $LOG_DIR/alerts-${report_date}.log"
    echo "  ⏰ Next monitoring run: $(date -d "+1 day" +%Y-%m-%d) (based on $MONITORING_INTERVAL interval)"
}

# Run main function
main "$@"
#!/bin/bash

# Knowledge Quality Assurance Validation Script
# Comprehensive quality assessment and validation of knowledge bases

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
QUALITY_THRESHOLDS=("freshness:90" "accuracy:95" "completeness:85" "consistency:98")
REPORT_DIR="/tmp/qa-reports-$(date +%Y%m%d_%H%M%S)"

# Quality assessment functions
assess_freshness() {
    local repo_path="$1"
    local repo_name="$2"

    log_info "Assessing knowledge freshness for $repo_name..."

    # Check file modification dates (last 90 days)
    local stale_files=$(find "$repo_path" -name "*.md" -mtime +90 | wc -l)
    local total_files=$(find "$repo_path" -name "*.md" | wc -l)

    if [ "$total_files" -eq 0 ]; then
        echo "0.0"
        return
    fi

    local freshness_score=$(( (total_files - stale_files) * 100 / total_files ))

    log_quality "Freshness Score: $freshness_score% ($((total_files - stale_files))/$total_files files current)"

    echo "$freshness_score"
}

assess_accuracy() {
    local repo_path="$1"
    local repo_name="$2"

    log_info "Assessing knowledge accuracy for $repo_name..."

    # Check for common accuracy indicators
    local broken_links=0
    local total_links=0

    # Find markdown link patterns and check if targets exist
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Extract relative links from markdown
            local links=$(grep -o '\[.*\](\.\./.*\.md)' "$file" | sed 's/.*(\(.*\))/\1/')
            for link in $links; do
                total_links=$((total_links + 1))
                # Resolve relative path
                local link_target="$repo_path/$(dirname "$file" | sed "s|$repo_path||")/$link"
                link_target=$(realpath -m "$link_target" 2>/dev/null || echo "$link_target")

                if [ ! -f "$link_target" ]; then
                    broken_links=$((broken_links + 1))
                fi
            done
        fi
    done < <(find "$repo_path" -name "*.md")

    if [ "$total_links" -eq 0 ]; then
        echo "100.0"
        return
    fi

    local accuracy_score=$(( (total_links - broken_links) * 100 / total_links ))

    log_quality "Accuracy Score: $accuracy_score% ($broken_links/$total_links broken links)"

    echo "$accuracy_score"
}

assess_completeness() {
    local repo_path="$1"
    local repo_name="$2"

    log_info "Assessing knowledge completeness for $repo_name..."

    # Check for required documentation elements
    local missing_readmes=0
    local total_dirs=0

    while IFS= read -r dir; do
        total_dirs=$((total_dirs + 1))
        if [ ! -f "$dir/README.md" ]; then
            missing_readmes=$((missing_readmes + 1))
        fi
    done < <(find "$repo_path" -type d)

    if [ "$total_dirs" -eq 0 ]; then
        echo "100.0"
        return
    fi

    local completeness_score=$(( (total_dirs - missing_readmes) * 100 / total_dirs ))

    log_quality "Completeness Score: $completeness_score% ($missing_readmes/$total_dirs dirs missing README)"

    echo "$completeness_score"
}

assess_consistency() {
    local repo_path="$1"
    local repo_name="$2"

    log_info "Assessing knowledge consistency for $repo_name..."

    # Check for consistent formatting and structure
    local inconsistent_headers=0
    local total_headers=0

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Check header formatting consistency
            local headers=$(grep -c '^#' "$file")
            total_headers=$((total_headers + headers))

            # Check for inconsistent header patterns
            if grep -q '^#\{2,\} [a-z]' "$file"; then
                inconsistent_headers=$((inconsistent_headers + 1))
            fi
        fi
    done < <(find "$repo_path" -name "*.md")

    if [ "$total_headers" -eq 0 ]; then
        echo "100.0"
        return
    fi

    local consistency_score=$(( (total_headers - inconsistent_headers) * 100 / total_headers ))

    log_quality "Consistency Score: $consistency_score% ($inconsistent_headers/$total_headers inconsistent headers)"

    echo "$consistency_score"
}

generate_improvements() {
    local repo_path="$1"
    local repo_name="$2"
    local quality_scores="$3"

    log_info "Generating improvement recommendations for $repo_name..."

    local recommendations=""

    # Parse quality scores
    local freshness=$(echo "$quality_scores" | jq -r '.freshness')
    local accuracy=$(echo "$quality_scores" | jq -r '.accuracy')
    local completeness=$(echo "$quality_scores" | jq -r '.completeness')
    local consistency=$(echo "$quality_scores" | jq -r '.consistency')

    # Generate recommendations based on scores
    if (( $(echo "$freshness < 90" | bc -l) )); then
        recommendations="${recommendations}- Update stale documentation (freshness: ${freshness}%)\n"
    fi

    if (( $(echo "$accuracy < 95" | bc -l) )); then
        recommendations="${recommendations}- Fix broken links and references (accuracy: ${accuracy}%)\n"
    fi

    if (( $(echo "$completeness < 85" | bc -l) )); then
        recommendations="${recommendations}- Add missing README files (completeness: ${completeness}%)\n"
    fi

    if (( $(echo "$consistency < 98" | bc -l) )); then
        recommendations="${recommendations}- Standardize documentation formatting (consistency: ${consistency}%)\n"
    fi

    if [ -z "$recommendations" ]; then
        recommendations="- All quality metrics meet standards - maintain current practices\n"
    fi

    echo -e "$recommendations"
}

check_governance_compliance() {
    local repo_path="$1"
    local repo_name="$2"

    log_governance "Checking governance compliance for $repo_name..."

    local violations=0
    local total_checks=0

    # Check for required governance files
    local required_files=("LICENSE" "README.md" ".gitignore")
    for file in "${required_files[@]}"; do
        total_checks=$((total_checks + 1))
        if [ ! -f "$repo_path/$file" ]; then
            violations=$((violations + 1))
            log_warning "Missing required file: $file"
        fi
    done

    # Check for proper git configuration
    total_checks=$((total_checks + 1))
    if [ ! -d "$repo_path/.git" ]; then
        violations=$((violations + 1))
        log_warning "Not a git repository"
    fi

    # Check for recent commits (last 30 days)
    total_checks=$((total_checks + 1))
    if [ -d "$repo_path/.git" ]; then
        local recent_commits=$(git -C "$repo_path" log --since="30 days ago" --oneline | wc -l)
        if [ "$recent_commits" -eq 0 ]; then
            violations=$((violations + 1))
            log_warning "No commits in the last 30 days"
        fi
    fi

    local compliance_score=0
    if [ "$total_checks" -gt 0 ]; then
        compliance_score=$(( (total_checks - violations) * 100 / total_checks ))
    fi

    log_governance "Governance Compliance: $compliance_score% ($violations/$total_checks violations)"

    echo "$compliance_score"
}

generate_report() {
    local repo_name="$1"
    local quality_scores="$2"
    local governance_score="$3"
    local improvements="$4"

    mkdir -p "$REPORT_DIR"

    cat > "$REPORT_DIR/${repo_name}-qa-report.json" << EOF
{
  "repository": "$repo_name",
  "assessment_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "quality_scores": $quality_scores,
  "governance_compliance": $governance_score,
  "overall_quality_score": $(echo "$quality_scores" | jq '(.freshness + .accuracy + .completeness + .consistency) / 4'),
  "recommendations": $(echo "$improvements" | jq -R -s 'split("\n") | map(select(. != ""))'),
  "thresholds": {
    "freshness": 90,
    "accuracy": 95,
    "completeness": 85,
    "consistency": 98,
    "governance": 100
  }
}
EOF

    # Generate human-readable report
    cat > "$REPORT_DIR/${repo_name}-qa-report.md" << EOF
# Quality Assurance Report: $repo_name

**Assessment Date:** $(date)
**Repository:** $repo_name

## Quality Scores

| Metric | Score | Threshold | Status |
|--------|-------|-----------|--------|
| Freshness | $(echo "$quality_scores" | jq -r '.freshness')% | 90% | $([ $(echo "$quality_scores" | jq -r '.freshness') -ge 90 ] && echo "✅ PASS" || echo "❌ FAIL") |
| Accuracy | $(echo "$quality_scores" | jq -r '.accuracy')% | 95% | $([ $(echo "$quality_scores" | jq -r '.accuracy') -ge 95 ] && echo "✅ PASS" || echo "❌ FAIL") |
| Completeness | $(echo "$quality_scores" | jq -r '.completeness')% | 85% | $([ $(echo "$quality_scores" | jq -r '.completeness') -ge 85 ] && echo "✅ PASS" || echo "❌ FAIL") |
| Consistency | $(echo "$quality_scores" | jq -r '.consistency')% | 98% | $([ $(echo "$quality_scores" | jq -r '.consistency') -ge 98 ] && echo "✅ PASS" || echo "❌ FAIL") |

**Overall Quality Score:** $(echo "$quality_scores" | jq '(.freshness + .accuracy + .completeness + .consistency) / 4')%

## Governance Compliance

**Compliance Score:** ${governance_score}%

## Recommendations

$improvements

---
*Generated by Knowledge Quality Assurance System*
EOF
}

# Main quality assessment process
main() {
    log_info "Knowledge Quality Assurance Assessment Started"
    echo "=================================================="

    mkdir -p "$REPORT_DIR"

    # Overall results tracking
    local total_quality_score=0
    local repo_count=0

    for repo in "${REPOSITORIES[@]}"; do
        repo_count=$((repo_count + 1))
        log_info "Processing repository: $repo"

        # Perform quality assessments
        local freshness=$(assess_freshness "$repo" "$repo")
        local accuracy=$(assess_accuracy "$repo" "$repo")
        local completeness=$(assess_completeness "$repo" "$repo")
        local consistency=$(assess_consistency "$repo" "$repo")

        # Create quality scores JSON
        local quality_scores="{\"freshness\": $freshness, \"accuracy\": $accuracy, \"completeness\": $completeness, \"consistency\": $consistency}"

        # Check governance compliance
        local governance_score=$(check_governance_compliance "$repo" "$repo")

        # Generate improvement recommendations
        local improvements=$(generate_improvements "$repo" "$repo" "$quality_scores")

        # Generate reports
        generate_report "$repo" "$quality_scores" "$governance_score" "$improvements"

        # Calculate overall quality score for this repo
        local repo_quality_score=$(echo "$quality_scores" | jq '(.freshness + .accuracy + .completeness + .consistency) / 4')
        total_quality_score=$(echo "$total_quality_score + $repo_quality_score" | bc -l)

        log_success "Completed quality assessment for $repo"
        echo
    done

    # Generate summary report
    local average_quality_score=$(echo "scale=2; $total_quality_score / $repo_count" | bc -l)

    cat > "$REPORT_DIR/summary-report.json" << EOF
{
  "assessment_summary": {
    "total_repositories": $repo_count,
    "average_quality_score": $average_quality_score,
    "assessment_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "quality_thresholds": {
      "excellent": 95,
      "good": 85,
      "needs_improvement": 75
    }
  },
  "repositories_assessed": [
    "docs_devforge_ai",
    "docs_loopy_ai",
    "docs_construct_ai"
  ]
}
EOF

    # Generate summary markdown
    cat > "$REPORT_DIR/summary-report.md" << EOF
# Knowledge Quality Assurance Summary Report

**Assessment Date:** $(date)
**Total Repositories Assessed:** $repo_count
**Average Quality Score:** ${average_quality_score}%

## Quality Score Interpretation

- **95%+**: Excellent - Knowledge base is well-maintained and high quality
- **85-94%**: Good - Knowledge base meets standards with minor improvements needed
- **75-84%**: Needs Improvement - Significant quality enhancements required
- **<75%**: Critical - Immediate quality improvement actions needed

## Assessment Results

$(for repo in "${REPOSITORIES[@]}"; do
    if [ -f "$REPORT_DIR/${repo}-qa-report.json" ]; then
        local score=$(jq '.overall_quality_score' "$REPORT_DIR/${repo}-qa-report.json")
        echo "- **$repo**: ${score}%"
    fi
done)

## Next Steps

1. Review individual repository reports for detailed findings
2. Implement recommended improvements
3. Schedule regular quality assessments (weekly/monthly)
4. Monitor quality trends over time

## Reports Location

All detailed reports are available in: \`$REPORT_DIR\`

---
*Generated by Knowledge Quality Assurance System*
EOF

    log_success "Quality assurance assessment completed!"
    log_info "Summary report: $REPORT_DIR/summary-report.md"
    log_info "Individual reports: $REPORT_DIR/*-qa-report.md"

    # Display summary
    echo
    log_quality "🎯 Quality Assessment Summary:"
    echo "  📊 Average Quality Score: ${average_quality_score}%"
    echo "  📁 Reports saved to: $REPORT_DIR"

    if (( $(echo "$average_quality_score >= 95" | bc -l) )); then
        log_success "✅ Excellent quality - all standards met!"
    elif (( $(echo "$average_quality_score >= 85" | bc -l) )); then
        log_quality "✅ Good quality - meets standards with minor improvements"
    elif (( $(echo "$average_quality_score >= 75" | bc -l) )); then
        log_warning "⚠️ Needs improvement - significant enhancements required"
    else
        log_error "❌ Critical - immediate quality improvement actions needed"
    fi
}

# Run main function
main "$@"
#!/bin/bash

# Setup script for automated publishing workflow
# This script helps configure the repository for automated publishing

set -e

echo "🚀 Setting up automated publishing workflow for PHX ERP n8n node..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  Warning: GitHub CLI (gh) is not installed."
    echo "   You can install it from: https://cli.github.com/"
    echo "   This is optional but recommended for easier workflow management."
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Repository structure looks good!"

# Check for required files
echo "📋 Checking for required workflow files..."

required_files=(
    ".github/workflows/ci.yml"
    ".github/workflows/publish.yml"
    ".github/workflows/release.yml"
    ".github/workflows/dependabot.yml"
    ".github/dependabot.yml"
    ".github/PULL_REQUEST_TEMPLATE.md"
    ".github/ISSUE_TEMPLATE/bug_report.md"
    ".github/ISSUE_TEMPLATE/feature_request.md"
    "WORKFLOW.md"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required workflow files are present!"
else
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

# Check package.json scripts
echo "📦 Checking package.json scripts..."

required_scripts=(
    "build"
    "lint"
    "format"
    "version:patch"
    "version:minor"
    "version:major"
    "release:patch"
    "release:minor"
    "release:major"
    "precommit"
)

missing_scripts=()
for script in "${required_scripts[@]}"; do
    if ! npm run "$script" --dry-run &> /dev/null; then
        missing_scripts+=("$script")
    fi
done

if [ ${#missing_scripts[@]} -eq 0 ]; then
    echo "✅ All required npm scripts are present!"
else
    echo "❌ Missing required npm scripts:"
    for script in "${missing_scripts[@]}"; do
        echo "   - $script"
    done
    exit 1
fi

# Check if NPM_TOKEN secret is configured (if GitHub CLI is available)
if command -v gh &> /dev/null; then
    echo "🔐 Checking GitHub secrets..."
    
    if gh secret list | grep -q "NPM_TOKEN"; then
        echo "✅ NPM_TOKEN secret is configured!"
    else
        echo "⚠️  NPM_TOKEN secret is not configured."
        echo "   You need to add your npm token as a GitHub secret:"
        echo "   1. Go to your repository on GitHub"
        echo "   2. Navigate to Settings → Secrets and variables → Actions"
        echo "   3. Add a new secret named 'NPM_TOKEN'"
        echo "   4. Use your npm automation token as the value"
        echo ""
        echo "   You can get an npm token from: https://www.npmjs.com/settings/tokens"
    fi
else
    echo "⚠️  Cannot check GitHub secrets without GitHub CLI."
    echo "   Please manually verify that NPM_TOKEN secret is configured in your repository."
fi

# Test build
echo "🔨 Testing build process..."
if npm run build; then
    echo "✅ Build test successful!"
else
    echo "❌ Build test failed. Please fix build issues before setting up the workflow."
    exit 1
fi

# Test linting
echo "🔍 Testing linting..."
if npm run lint; then
    echo "✅ Linting test successful!"
else
    echo "⚠️  Linting issues found. Run 'npm run lintfix' to auto-fix them."
fi

echo ""
echo "🎉 Setup complete! Your automated publishing workflow is ready."
echo ""
echo "📚 Next steps:"
echo "   1. Make sure NPM_TOKEN secret is configured in GitHub"
echo "   2. Push your changes to the main branch"
echo "   3. The workflow will automatically run on the next push"
echo "   4. You can manually trigger releases from the GitHub Actions tab"
echo ""
echo "📖 For more information, see WORKFLOW.md"
echo ""
echo "🚀 Happy publishing!"

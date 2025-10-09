# Automated Publishing Workflow

This document describes the automated publishing workflow for the PHX ERP n8n node package.

## Overview

The project uses GitHub Actions to automatically build, test, and publish the package to npm when changes are made to the main branch or when manually triggered.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

**What it does:**
- Runs on multiple Node.js versions (20.15, 21)
- Installs dependencies
- Runs linting and formatting checks
- Builds the project
- Verifies build output structure
- Validates package.json structure
- Tests that the built node can be loaded
- Uploads build artifacts

### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Triggers:**
- Push to `main` or `master` branches (when specific files change)
- Manual workflow dispatch with version bump type selection

**What it does:**
- Builds and tests the project
- Automatically bumps version (patch for automatic, configurable for manual)
- Commits version changes
- Publishes to npm
- Creates GitHub release with changelog

**Files that trigger automatic publishing:**
- `package.json`
- `package-lock.json`
- `dist/**`
- `nodes/**`
- `credentials/**`
- `tsconfig.json`
- `gulpfile.js`

### 3. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- When a GitHub release is published

**What it does:**
- Generates changelog from git commits
- Updates release notes with installation instructions
- Provides links to npm package and documentation

## Setup Requirements

### 1. NPM Token

You need to add an NPM token to your GitHub repository secrets:

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Go to Access Tokens → Generate New Token
3. Select "Automation" token type
4. Copy the token
5. In your GitHub repository, go to Settings → Secrets and variables → Actions
6. Add a new secret named `NPM_TOKEN` with the token value

### 2. GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and doesn't need manual setup.

## Usage

### Automatic Publishing

The package will automatically publish when you:

1. Push changes to the main branch that modify:
   - Source code files (`nodes/**`, `credentials/**`)
   - Build configuration (`tsconfig.json`, `gulpfile.js`)
   - Package configuration (`package.json`, `package-lock.json`)

2. The workflow will:
   - Run tests and linting
   - Build the project
   - Bump the patch version
   - Commit the version change
   - Publish to npm
   - Create a GitHub release

### Manual Publishing

You can manually trigger a release with a specific version bump:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Publish to npm" workflow
4. Click "Run workflow"
5. Choose the version bump type:
   - **patch**: Bug fixes (0.1.6 → 0.1.7)
   - **minor**: New features (0.1.6 → 0.2.0)
   - **major**: Breaking changes (0.1.6 → 1.0.0)

### Local Development

For local development, use these npm scripts:

```bash
# Development with watch mode
npm run dev

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lintfix

# Format code
npm run format

# Run all checks before commit
npm run precommit

# Manual version bumping (without publishing)
npm run version:patch   # 0.1.6 → 0.1.7
npm run version:minor   # 0.1.6 → 0.2.0
npm run version:major   # 0.1.6 → 1.0.0

# Version bump and push (triggers automatic publishing)
npm run release:patch
npm run release:minor
npm run release:major
```

## Version Management

### Semantic Versioning

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Version Bumping Rules

- **Automatic pushes**: Always bump patch version
- **Manual dispatch**: Choose patch, minor, or major
- **Package.json changes**: Automatically detected and triggers publishing

## Monitoring

### Workflow Status

You can monitor workflow runs in the GitHub Actions tab:

1. Go to your repository
2. Click "Actions" tab
3. View workflow runs and their status
4. Click on individual runs to see detailed logs

### Notifications

The workflows include success/failure notifications in the logs. For more advanced notifications, you can:

1. Set up email notifications in GitHub repository settings
2. Add Slack/Discord webhooks to the workflow
3. Use GitHub's built-in notification system

## Troubleshooting

### Common Issues

1. **Build fails**: Check TypeScript compilation errors
2. **Linting fails**: Run `npm run lintfix` to auto-fix issues
3. **Publishing fails**: Verify NPM_TOKEN secret is set correctly
4. **Version conflicts**: Ensure package.json version is unique

### Debugging

1. Check workflow logs in GitHub Actions
2. Run `npm run precommit` locally to catch issues early
3. Verify build output with `npm run build`
4. Test the built node in n8n before publishing

## Security

- NPM token is stored as encrypted secret
- Workflows run in isolated containers
- No sensitive data is logged
- Dependencies are locked with package-lock.json

## Contributing

When contributing to this project:

1. Create a feature branch
2. Make your changes
3. Run `npm run precommit` to ensure everything passes
4. Create a pull request
5. The CI workflow will run automatically
6. After merge, the publish workflow will handle the release

## Support

If you encounter issues with the automated workflow:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review the workflow logs for specific error messages
3. Open an issue in the repository with workflow details
4. Contact the maintainers for assistance

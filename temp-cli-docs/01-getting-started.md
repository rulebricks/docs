# Getting Started

This guide will help you get started with the Rulebricks CLI, from installation to your first deployment.

## What is Rulebricks CLI?

The Rulebricks CLI is a deployment and management tool that automates the creation of production-ready Rulebricks rule engine clusters. It handles:

- **Infrastructure provisioning** - Creates Kubernetes clusters, networks, and security groups
- **Application deployment** - Deploys all Rulebricks services with proper configuration
- **Database setup** - Configures PostgreSQL (self-hosted or managed)
- **Monitoring & logging** - Sets up Prometheus, Grafana, and Vector
- **Security** - Configures TLS certificates, secrets management, and network policies
- **Auto-scaling** - Configures KEDA for dynamic worker scaling based on load

## Prerequisites

Before you begin, ensure you have the following tools installed:

### Required for All Deployments

- **kubectl** - Kubernetes command-line tool
  - macOS: `brew install kubectl`
  - Linux: See [official docs](https://kubernetes.io/docs/tasks/tools/)

### Cloud Provider Requirements

#### AWS
- **AWS CLI**: `brew install awscli` (macOS) or see [AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **eksctl**: `brew tap weaveworks/tap && brew install weaveworks/tap/eksctl` (macOS) or see [eksctl docs](https://eksctl.io/installation/)

#### Google Cloud Platform
- **Google Cloud SDK**: `brew install --cask google-cloud-sdk` (macOS) or see [GCP docs](https://cloud.google.com/sdk/docs/install)

#### Azure
- **Azure CLI**: `brew install azure-cli` (macOS) or see [Azure docs](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

### Cloud Provider Authentication

You'll need to authenticate with your chosen cloud provider:

- **AWS**: Configure credentials using `aws configure` or environment variables
- **GCP**: Run `gcloud auth login` and `gcloud auth application-default login`
- **Azure**: Run `az login`

> **Note**: The CLI will check for required dependencies and provide installation instructions if any are missing.

## Installation

### Quick Install (Recommended)

**macOS and Linux:**
```bash
curl -sSfL https://raw.githubusercontent.com/rulebricks/cli/main/install.sh | sh
```

**Windows:**
Download the latest Windows binary from the [releases page](https://github.com/rulebricks/cli/releases/latest) and add it to your PATH.

### Install from Source

Requires Go 1.21+:
```bash
git clone https://github.com/rulebricks/cli.git
cd cli
make install
```

### Verify Installation

```bash
rulebricks version
```

You should see output showing the CLI version, git commit, and build information.

## License Key

The Rulebricks CLI requires a valid license key. You can provide it in several ways:

1. **Environment variable** (recommended):
   ```bash
   export RULEBRICKS_LICENSE_KEY="your-license-key"
   ```

2. **In configuration file** (see [Initial Setup](./02-initial-setup.md)):
   ```yaml
   project:
     license: env:RULEBRICKS_LICENSE_KEY
   ```

3. **Directly in config** (less secure):
   ```yaml
   project:
     license: "your-license-key"
   ```

Contact support@rulebricks.com for licensing information.

## Your First Deployment

### Step 1: Initialize Your Project

Run the interactive wizard to create your configuration:

```bash
rulebricks init
```

This will guide you through:
- Project naming and domain configuration
- Cloud provider selection
- Database deployment options
- Email provider setup
- Security and monitoring preferences

The wizard creates a `rulebricks.yaml` file in your current directory.

### Step 2: Review Your Configuration

Before deploying, review the generated `rulebricks.yaml` file. You can edit it directly or re-run `rulebricks init` to make changes.

Key things to verify:
- **Domain**: Ensure your domain DNS is configured (or will be configured) to point to your cloud provider
- **Cloud credentials**: Make sure you're authenticated with your chosen provider
- **License key**: Verify your license key is set correctly

### Step 3: Deploy

Deploy your Rulebricks cluster:

```bash
rulebricks deploy
```

This single command will:
1. Provision cloud infrastructure using Terraform
2. Create a managed Kubernetes cluster
3. Deploy and configure all required services
4. Set up DNS and SSL certificates
5. Initialize the database with migrations

The deployment process typically takes 15-30 minutes depending on your cloud provider and configuration.

### Step 4: Verify Deployment

Check the status of your deployment:

```bash
rulebricks status
```

This shows:
- Infrastructure health and cluster endpoint
- Kubernetes node status
- Pod distribution and health
- Database availability
- Application deployment status
- Service endpoints and versions
- Certificate validity

### Step 5: Access Your Deployment

Once deployment is complete, you can access:

- **Main Application**: `https://your-domain.com`
- **Grafana Dashboard** (if enabled): `https://grafana.your-domain.com`
- **Supabase Studio** (if self-hosted): `https://supabase.your-domain.com`

## Next Steps

- **Configure Monitoring**: See [Monitoring & Logging](./05-monitoring-logging.md)
- **Set Up Logging**: See [Vector Logging Setup](./08-vector-logging.md)
- **Customize Configuration**: See [Configuration Reference](./04-configuration-reference.md)
- **Upgrade Your Deployment**: See [Upgrades & Maintenance](./06-upgrades-maintenance.md)

## Common Issues

### Cloud Authentication Errors

If you see authentication errors:
- **AWS**: Run `aws configure` or check your `~/.aws/credentials` file
- **GCP**: Run `gcloud auth login` and `gcloud auth application-default login`
- **Azure**: Run `az login`

### DNS Not Configured

If certificate generation fails, ensure your domain DNS points to the load balancer. You can find the load balancer address in the deployment output or by running `rulebricks status`.

### Resource Quotas

If deployment fails due to resource limits:
- **AWS**: Check your service quotas in the AWS Console
- **GCP**: Ensure billing is enabled and quotas are sufficient
- **Azure**: Check your subscription quotas

For more troubleshooting help, see [Status & Troubleshooting](./07-status-troubleshooting.md).


# Developer Customization Guide

This guide is for developers who want to fork and customize the Rulebricks CLI for their organization. It covers key files, architecture, and customization points.

## Overview

The Rulebricks CLI is a Go-based command-line tool that orchestrates Terraform and Helm to deploy Rulebricks on Kubernetes. Understanding the codebase structure will help you customize it for your needs.

## Codebase Structure

The CLI codebase is located in the `cli/` directory. This is the only open-source folder in the repository.

```
cli/
├── src/                    # Go source code
│   ├── main.go            # CLI entry point, command definitions
│   ├── config.go           # Configuration file parsing and validation
│   ├── init_wizard.go      # Interactive initialization wizard
│   ├── deployer.go         # Deployment orchestration
│   ├── deployment_steps.go # Individual deployment steps
│   ├── destroyer.go        # Teardown logic
│   ├── upgrade_manager.go  # Upgrade handling
│   ├── status.go           # Status checking
│   ├── log_viewer.go       # Log viewing
│   ├── operations.go       # Kubernetes operations
│   ├── chart_manager.go    # Helm chart management
│   ├── asset_manager.go    # Asset management
│   ├── vector_iam_setup.go # Vector IAM configuration
│   ├── vector_dependencies.go # Vector dependency checks
│   ├── utils.go            # Utility functions
│   └── shared_types.go     # Shared data structures
└── examples/               # Example configurations
```

### Runtime Resources

When the CLI runs, it creates a hidden directory in your home directory:

```
~/.rulebricks/
├── charts/                 # Downloaded Helm charts (created by ChartManager)
│   ├── rulebricks-*.tgz   # Cached Rulebricks chart archives
│   └── supabase-*.tgz     # Cached Supabase chart archives
└── [other runtime files]   # Other CLI runtime resources
```

**Important Notes:**
- Charts are **not** in the CLI source code - they're downloaded from GitHub releases
- The `~/.rulebricks/` directory is created automatically when you first run the CLI
- Charts are cached locally after first download to speed up subsequent deployments
- Terraform templates are also downloaded/extracted at runtime (not stored in CLI folder)

To view the charts after running the CLI:
```bash
ls ~/.rulebricks/charts/
```

## Key Files for Customization

### Configuration Management

**`src/config.go`**
- Configuration file structure (`Config` struct)
- Validation logic (`Validate()` method)
- Default values (`ApplyDefaults()` method)
- YAML marshaling/unmarshaling

**Customization points:**
- Add new configuration fields
- Modify validation rules
- Change default values
- Add custom configuration sections

**Example: Adding a custom field**
```go
type Config struct {
    // ... existing fields
    Custom CustomConfig `yaml:"custom,omitempty"`
}

type CustomConfig struct {
    Enabled bool   `yaml:"enabled"`
    Value   string `yaml:"value"`
}
```

### Deployment Logic

**`src/deployer.go`**
- Main deployment orchestration
- Deployment step execution
- Error handling and rollback

**`src/deployment_steps.go`**
- Individual deployment steps
- Terraform execution
- Helm chart installation
- Service configuration

**Customization points:**
- Add custom deployment steps
- Modify existing steps
- Change deployment order
- Add pre/post deployment hooks

**Example: Adding a custom step**
```go
func (d *Deployer) executeCustomStep() error {
    // Your custom logic here
    return nil
}
```

### Initialization Wizard

**`src/init_wizard.go`**
- Interactive configuration wizard
- User prompts and validation
- Configuration file generation

**Customization points:**
- Add new wizard steps
- Modify prompts
- Change default selections
- Add custom validation

### Helm Chart Management

**`src/chart_manager.go`**
- Helm chart installation/upgrade
- Values file generation
- Chart version management

**Customization points:**
- Modify Helm values generation
- Add custom chart repositories
- Change chart installation logic

### Kubernetes Operations

**`src/operations.go`**
- Kubernetes resource creation
- Service configuration
- Resource management

**Customization points:**
- Add custom Kubernetes resources
- Modify resource creation logic
- Add custom service configurations

## What Gets Deployed

Understanding what the CLI deploys is critical for customization:

### Infrastructure (Terraform)

**Location:** `terraform/{aws,azure,gcp}/`

**What it creates:**
- VPC/Virtual Network
- Subnets (public/private)
- Internet Gateway / NAT Gateway
- Security Groups / Network Security Groups
- Kubernetes cluster (EKS/AKS/GKE)
- Node groups / Node pools
- IAM roles and policies

**Key files:**
- `main.tf` - Main infrastructure definitions
- `variables.tf` - Input variables
- `outputs.tf` - Output values

### Kubernetes Resources (Helm Charts)

**Location:** Charts are downloaded from GitHub releases and cached in `~/.rulebricks/charts/` when the CLI runs.

**Note:** The charts are not part of the CLI source code. They're managed separately and downloaded by the `ChartManager` during deployment.

**What gets deployed:**

1. **Core Services:**
   - Traefik (ingress controller)
   - cert-manager (TLS certificates)
   - KEDA (autoscaling)

2. **Application:**
   - Rulebricks app (API + frontend)
   - HPS service (rule processing)
   - Worker pods (background jobs)
   - Redis (caching)
   - Kafka (message queue)

3. **Database (if self-hosted):**
   - PostgreSQL
   - Supabase services (Auth, Storage, Realtime, etc.)

4. **Monitoring (if enabled):**
   - Prometheus
   - Grafana

5. **Logging (if enabled):**
   - Vector (log aggregation)

**Chart Management:**
- Charts are downloaded from `https://github.com/rulebricks/charts/releases`
- Cached in `~/.rulebricks/charts/` after first download
- Managed by `ChartManager` in `src/chart_manager.go`
- To view chart contents, extract the `.tgz` files from the cache directory

**Note:** If you need to customize charts, you'll need to:
1. Fork the charts repository
2. Modify the `ChartManager` to point to your chart repository
3. Or extract and modify charts locally before deployment

## Critical Configuration Locations

### Configuration File Schema

**File:** `src/config.go`

The `Config` struct defines the complete configuration schema. All configuration options flow through this structure.

### Helm Values Generation

**File:** `src/operations.go` (look for `generateHelmValues` or similar)

This is where the CLI converts your `rulebricks.yaml` into Helm values. Customize this to add new Helm values or modify existing ones.

### Terraform Variables

**Files:** `terraform/{aws,azure,gcp}/variables.tf`

Terraform variables map to your configuration. Add new variables here to expose new infrastructure options.

### Resource Definitions

**Location:** Charts are downloaded at runtime. To modify templates:

1. **Extract cached charts:**
   ```bash
   cd ~/.rulebricks/charts/
   tar -xzf rulebricks-*.tgz
   # Modify templates in the extracted directory
   ```

2. **Or fork the charts repository:**
   - Fork `https://github.com/rulebricks/charts`
   - Modify templates in your fork
   - Update `ChartManager` to use your repository

3. **Or use custom values:**
   - Use `advanced.custom_values` in your config
   - Override template values without modifying charts

## Resource Management

### Resource Requirements

The CLI manages resource allocation based on performance tiers. Key locations:

**File:** `src/init_wizard.go` (look for `configurePerformance`)

This function sets resource requests/limits based on `volume_level`:
- **Small**: Development/testing (<1000 rules/sec)
- **Medium**: Production (1,000-10,000 rules/sec)
- **Large**: High performance (>10,000 rules/sec)

### Resource Calculations

**Reference:** See `RESOURCE_REQUIREMENTS.md` in the project root for detailed resource calculations.

**Key components:**
- **Rulebricks App**: 512m CPU, 512Mi RAM (requests)
- **HPS Service**: 500m CPU, 256Mi RAM per replica
- **Workers**: 100m CPU, 128Mi RAM per worker
- **Redis**: 200m CPU, 256Mi RAM
- **Kafka**: 500m CPU, 2Gi RAM (JVM heap)
- **Traefik**: 500m CPU, 1Gi RAM

### Customizing Resources

**Location:** `src/operations.go` or `charts/charts/rulebricks/values.yaml`

To customize resources:

1. **Modify default values** in Helm chart
2. **Override in operations.go** when generating values
3. **Add to configuration schema** in `config.go` to make it user-configurable

**Example:**
```go
// In operations.go
resources := map[string]interface{}{
    "requests": map[string]string{
        "cpu":    "1000m",  // Custom CPU
        "memory": "2Gi",    // Custom memory
    },
}
```

## Customization Examples

### Adding a Custom Service

1. **Add to configuration:**
   ```go
   // In config.go
   type Config struct {
       CustomService CustomServiceConfig `yaml:"custom_service,omitempty"`
   }
   ```

2. **Add deployment step:**
   ```go
   // In deployment_steps.go
   func (d *Deployer) deployCustomService() error {
       // Deploy your service
       return nil
   }
   ```

3. **Add Helm chart** (if needed):
   - Create chart in `charts/charts/custom-service/`
   - Install in deployment step

### Modifying Default Values

**Location:** `src/config.go` - `ApplyDefaults()` method

```go
func (c *Config) ApplyDefaults() {
    // ... existing defaults
    
    // Your custom defaults
    if c.CustomService.Enabled {
        if c.CustomService.Replicas == 0 {
            c.CustomService.Replicas = 2
        }
    }
}
```

### Adding Cloud Provider Support

1. **Add to configuration:**
   ```go
   type CloudConfig struct {
       Provider string       `yaml:"provider"`
       // ... existing
       CustomCloud *CustomCloudConfig `yaml:"custom_cloud,omitempty"`
   }
   ```

2. **Add Terraform:**
   - Create `terraform/custom-cloud/`
   - Add infrastructure definitions

3. **Add deployment logic:**
   - Update `deployer.go` to handle new provider
   - Add provider-specific steps

### Customizing Helm Charts

**Location:** `charts/charts/rulebricks/templates/`

Modify templates to:
- Add new resources
- Change resource configurations
- Add custom annotations/labels
- Modify service configurations

**Example:** Adding a custom ConfigMap
```yaml
# In templates/custom-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "rulebricks.fullname" . }}-custom
data:
  custom.conf: |
    # Your custom configuration
```

## Building and Testing

### Building the CLI

```bash
cd cli
make build
# or
go build -o rulebricks ./src
```

### Testing Changes

1. **Test configuration parsing:**
   ```bash
   go test ./src -run TestConfig
   ```

2. **Test deployment (dry-run):**
   ```bash
   ./rulebricks deploy --dry-run
   ```

3. **Test in development environment:**
   - Use a separate cloud project/region
   - Test with minimal resources
   - Verify all functionality

## Important Considerations

### Configuration Compatibility

When adding new configuration fields:
- Use `omitempty` YAML tags for optional fields
- Provide sensible defaults
- Maintain backward compatibility
- Update validation logic

### Error Handling

The CLI uses structured error handling:
- Return errors from functions
- Use `fmt.Errorf` with `%w` for wrapping
- Log errors appropriately
- Provide user-friendly error messages

### State Management

The CLI may create `.rulebricks-state.yaml` to track deployment state. If you modify deployment logic, ensure state is updated correctly.

### Secrets Management

Secrets are handled via:
- Environment variables (`env:VAR_NAME`)
- Kubernetes secrets
- Cloud secret managers (via backend config)

When adding new secrets:
- Use environment variable references
- Never log or expose secrets
- Validate secret sources

## Architecture Decisions

### Why Terraform + Helm?

- **Terraform**: Infrastructure provisioning (VPC, clusters, etc.)
- **Helm**: Application deployment (Kubernetes resources)

This separation allows:
- Infrastructure to be managed separately
- Applications to be upgraded independently
- Clear separation of concerns

### Why Go?

- Single binary deployment
- Cross-platform support
- Good Kubernetes client libraries
- Fast execution

### Configuration File Format

YAML was chosen for:
- Human-readable
- Easy to edit
- Good tooling support
- Common in Kubernetes ecosystem

## Getting Help

- **Code comments**: Review inline code comments
- **GitHub Issues**: Check existing issues and discussions
- **Code structure**: Follow existing patterns
- **Testing**: Write tests for new functionality

## Next Steps

1. **Fork the repository**
2. **Set up development environment**
3. **Make small changes first** to understand the flow
4. **Test thoroughly** in development
5. **Document your changes**
6. **Consider contributing back** if changes are generally useful

## Key Takeaways

- **Configuration flows through `config.go`** - Start here for new options
- **Deployment logic in `deployer.go` and `deployment_steps.go`** - Modify here for deployment changes
- **Helm charts define what gets deployed** - Modify templates to change resources
- **Terraform defines infrastructure** - Modify for infrastructure changes
- **Resource management is tier-based** - Understand the performance tiers
- **Test in development first** - Always test changes before production

Remember: The CLI is designed to be configurable via `rulebricks.yaml`. Only add code-level customizations when configuration isn't sufficient.


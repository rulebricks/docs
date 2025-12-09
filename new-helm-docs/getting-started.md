# Getting Started with Rulebricks

Deploy Rulebricks to your Kubernetes cluster using our official Helm charts.

---

## How to Deploy Rulebricks

Our unified Helm chart deploys Rulebricks and all its dependencies in a single command. You'll need:

- **Kubernetes 1.19+** (EKS, GKE, AKS, or self-managed)
- **Helm 3.2.0+**
- **kubectl** configured for your cluster
- A **domain name** you control

> **Note:** The chart handles all service dependencies, configurations, and migrations automatically. You provide a values file with your settings, and Helm coordinates the rest.

### Quick Start

```bash
# 1. Create your values file (see Configuration below)
# 2. Install the chart
helm install rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --create-namespace \
  -f your-values.yaml

# 3. Follow the on-screen instructions for DNS setup
# 4. Enable TLS once DNS is configured
helm upgrade rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --reuse-values \
  --set global.tlsEnabled=true
```

### Single-Phase Installation (with external-dns)

If you're on AWS, GCP, or Azure and want fully automated DNS:

```bash
helm install rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --create-namespace \
  -f your-values.yaml \
  --set external-dns.enabled=true \
  --set global.externalDnsEnabled=true \
  --set global.tlsEnabled=true
```

DNS records are created automatically—no manual configuration needed.

### Minimum Configuration

```yaml
# your-values.yaml
global:
  domain: "rulebricks.yourdomain.com"
  email: "admin@yourdomain.com"
  licenseKey: "your-license-key"

  smtp:
    host: "smtp.yourdomain.com"
    port: 587
    user: "smtp-user"
    pass: "smtp-password"
    from: "no-reply@yourdomain.com"
    fromName: "Rulebricks"

# Change these for production!
supabase:
  secret:
    db:
      password: "secure-db-password"
    dashboard:
      password: "secure-dashboard-password"
```

See [Configuration Reference](./configuration-reference.md) for all available options.

---

## What Am I Deploying?

You're deploying a complete Rulebricks stack to your existing Kubernetes cluster. The chart installs multiple integrated services, pre-configured for production workloads.

```mermaid
flowchart TD
    LB("Load Balancer<br/>Cloud Provider LB") --> Traefik("Traefik Ingress<br/>TLS Termination & Routing")

    Traefik --> RB("Rulebricks App<br/>API & Management")
    Traefik -.-> SB("Supabase Dashboard<br/>Optional Admin UI")
    Traefik -.-> GF("Grafana Dashboard<br/>Optional Monitoring")

    RB --> Redis[("Redis<br/>Cache Layer")]
    RB --> PG[("PostgreSQL<br/>Primary Database")]
    Redis -.->|"Cache miss<br/>fallback"| PG
    SB -.-> PG

    %% Rule execution flow
    RB -->|"Rule Execution<br/>Requests"| Kafka("Kafka Cluster<br/>Event Streaming & Job Queue")

    %% Worker scaling and execution
    KEDA("KEDA<br/>Auto Scaler") -.->|"Scales based on<br/>Kafka queue depth"| WorkerPool

    subgraph WorkerPool [" "]
        direction LR
        W1("Worker 1<br/>Rule Executor")
        W2("Worker 2<br/>Rule Executor")
        W3("Worker N<br/>Rule Executor")
    end

    Kafka -->|"Consumes execution<br/>requests"| WorkerPool

    %% Logging flows
    RB -->|"Rule execution<br/>logs & metrics"| Vector("Vector<br/>Log Processing & Forwarding")
    Kafka -->|"Event logs<br/>(with lag)"| Vector

    %% Simplified sinks
    Vector --> Sinks("External Log Sinks<br/>S3, Elasticsearch, Datadog, etc.")

    %% Styling
    classDef primary fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef secondary fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef storage fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
    classDef processing fill:#fff8e1,stroke:#f57c00,stroke-width:2px,color:#000
    classDef scaling fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef optional stroke-dasharray: 5 5,color:#fff

    class LB,Traefik primary
    class RB secondary
    class PG,Redis,Kafka,Sinks storage
    class WorkerPool,W1,W2,W3,Vector processing
    class KEDA scaling
    class SB,GF optional
```

### Components Deployed

| Component         | Purpose                                    | Enabled by Default |
| ----------------- | ------------------------------------------ | :----------------: |
| **Rulebricks**    | Core application and high-performance solver |         ✓          |
| **Supabase**      | PostgreSQL database and authentication     |         ✓          |
| **Kafka**         | Message queue for async rule execution     |         ✓          |
| **Traefik**       | Ingress controller with automatic TLS      |         ✓          |
| **cert-manager**  | Let's Encrypt certificate provisioning     |         ✓          |
| **KEDA**          | Event-driven autoscaling for workers       |         ✓          |
| **Vector**        | Log aggregation and forwarding             |         ✓          |
| **external-dns**  | Automatic DNS record management            |         ✗          |
| **Prometheus**    | Metrics collection and alerting            |         ✗          |

### Database Options

**Self-hosted (default):** PostgreSQL runs in your cluster with persistent storage. You have full control and data never leaves your infrastructure.

**Managed Supabase:** Use Supabase Cloud instead. Set `supabase.enabled: false` and provide your project credentials. The chart automatically configures your managed project.

---

## I'm Having Trouble Deploying

### Standard Troubleshooting

```bash
# Check pod status
kubectl get pods -n rulebricks

# View events for issues
kubectl get events -n rulebricks --sort-by='.lastTimestamp'

# Check specific component logs
kubectl logs -n rulebricks -l app.kubernetes.io/name=rulebricks --tail=100

# Check migration job status
kubectl get jobs -n rulebricks
kubectl logs job/rulebricks-db-migrate-1 -n rulebricks
```

### Common Issues

**Pods stuck in Pending:**
- Check node resources: `kubectl describe nodes`
- Verify StorageClass exists: `kubectl get storageclass`

**Certificate not issuing:**
- Verify DNS resolves to your LoadBalancer
- Check cert-manager logs: `kubectl logs -n cert-manager -l app=cert-manager`
- View certificate status: `kubectl describe certificate -n rulebricks`

**Database connection errors:**
- Wait for PostgreSQL to be ready (can take 2-3 minutes)
- Check database pod: `kubectl logs -n rulebricks -l app.kubernetes.io/name=supabase-db`

### Clean Reinstall

```bash
# Uninstall and clean up
helm uninstall rulebricks -n rulebricks
kubectl delete pvc --all -n rulebricks

# Reinstall
helm install rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  -f your-values.yaml
```

---

## Caveats & Limits

### 1. Requests vs. Executions

There's a key distinction: whether Rulebricks handles high volumes of rule *requests* or rule *executions*.

By default, Rulebricks handles very large volumes of the latter, but managing network overhead requires extra resources. This is easy to overlook since we often talk about "rule executions per second"—it can be unclear if this means QPS or actual solution counts.

### 2. Cluster Requirements

The Helm chart deploys to your **existing** Kubernetes cluster. You're responsible for:

- Cluster provisioning and scaling
- Node pool configuration
- Storage provisioner (e.g., AWS EBS CSI driver)
- Network policies and security

See [example-min-cluster.yaml](../example-min-cluster.yaml) for minimum EKS cluster specifications.

### 3. Air-Gapped Deployments

Rulebricks can run nearly air-gapped with these exceptions:

| Feature              | External Dependency       | Can Disable?                   |
| -------------------- | ------------------------- | ------------------------------ |
| Managed Supabase     | Supabase Cloud API        | Yes—use self-hosted            |
| AI Features          | OpenAI API                | Yes—set `global.ai.enabled: false` |
| Log Forwarding       | External sinks (S3, etc.) | Yes—use console sink only      |
| TLS Certificates     | Let's Encrypt             | Yes—bring your own certs       |

### 4. Updates Are Manual

Rule engines usually take critical roles, so we don't release updates continuously. We make upgrades easy with zero downtime, but you control when they happen:

```bash
# Upgrade to latest version
helm upgrade rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  -f your-values.yaml
```

This is by design—ensures consistent execution API behavior across your deployments.

### 5. Customization

The Helm chart exposes extensive configuration through `values.yaml`, but we can't provide 100% flexibility. For deep customizations:

- Fork the chart repository
- Modify templates directly
- Use Helm post-renderers

The chart source is available and documented for infrastructure engineers needing extensive modifications.

---

## Next Steps

- **[Configuration Reference](./configuration-reference.md)** — Complete values.yaml documentation
- **[Architecture & Operations](./architecture-and-operations.md)** — System internals and migration flows
- **[Deployment Guide](./deployment-guide.md)** — Production patterns and cloud-specific configs


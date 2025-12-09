# Deployment Guide

This guide covers common deployment patterns and the essential values you need to configure for production.

## Table of Contents

- [Essential Values Checklist](#essential-values-checklist)
- [Deployment Patterns](#deployment-patterns)
- [Production Hardening](#production-hardening)
- [Cloud-Specific Configuration](#cloud-specific-configuration)

---

## Essential Values Checklist

### Must Change Before Production

These values **must** be changed from defaults for any production deployment:

| Value                                | Why                       | Risk if Unchanged                   |
| ------------------------------------ | ------------------------- | ----------------------------------- |
| `global.domain`                      | Your actual domain        | Application won't be accessible     |
| `global.email`                       | Certificate notifications | Let's Encrypt issues                |
| `global.licenseKey`                  | Enterprise features       | Evaluation mode limits              |
| `global.smtp.*`                      | Authentication emails     | Users can't sign up/reset passwords |
| `supabase.secret.db.password`        | Database security         | **Critical security risk**          |
| `supabase.secret.dashboard.password` | Admin access              | **Unauthorized access**             |
| `global.supabase.jwtSecret`          | Auth tokens               | **Token forgery possible**          |

### Should Review

| Value                                         | Default  | Consider Changing When      |
| --------------------------------------------- | -------- | --------------------------- |
| `global.supabase.anonKey`                     | Demo key | Always for production       |
| `global.supabase.serviceKey`                  | Demo key | Always for production       |
| `kafka.controller.replicaCount`               | 1        | High availability needed    |
| `rulebricks.hps.workers.keda.maxReplicaCount` | 8        | Higher throughput needed    |
| `supabase.db.persistence.size`                | 10Gi     | Large data volumes expected |

---

## Deployment Patterns

### Pattern 1: Quick Start (Development/Testing)

Minimal configuration for evaluation:

```yaml
# dev-values.yaml
global:
  domain: "rulebricks.dev.example.com"
  email: "dev@example.com"
  tlsEnabled: false # Enable after DNS setup

# Everything else uses defaults
```

```bash
helm install rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --create-namespace \
  -f dev-values.yaml
```

### Pattern 2: Production with Self-Hosted Database

Full control over all components:

```yaml
# production-selfhosted.yaml
global:
  domain: "rulebricks.acme.com"
  email: "devops@acme.com"
  licenseKey: "your-license-key"
  tlsEnabled: true
  externalDnsEnabled: true # If using external-dns

  smtp:
    host: "email-smtp.us-east-1.amazonaws.com"
    port: 587
    user: "${SMTP_USER}" # Set via --set or CI/CD
    pass: "${SMTP_PASS}"
    from: "no-reply@acme.com"
    fromName: "Acme - Rulebricks"

  supabase:
    # Generate new keys for production!
    anonKey: "your-production-anon-key"
    serviceKey: "your-production-service-key"
    jwtSecret: "your-production-jwt-secret-at-least-32-chars"

supabase:
  enabled: true
  secret:
    db:
      password: "${DB_PASSWORD}" # Strong password
    dashboard:
      password: "${DASHBOARD_PASSWORD}"
  db:
    resources:
      requests:
        cpu: "1000m"
        memory: "2Gi"
    persistence:
      size: 50Gi

rulebricks:
  hps:
    replicas: 3
    workers:
      keda:
        minReplicaCount: 4
        maxReplicaCount: 16

kafka:
  controller:
    replicaCount: 3
    persistence:
      size: 50Gi

external-dns:
  enabled: true
  provider: route53
```

### Pattern 3: Production with Supabase Cloud

Simplified operations with managed database:

```yaml
# production-managed.yaml
global:
  domain: "rulebricks.acme.com"
  email: "devops@acme.com"
  licenseKey: "your-license-key"
  tlsEnabled: true
  externalDnsEnabled: true

  smtp:
    host: "email-smtp.us-east-1.amazonaws.com"
    port: 587
    user: "${SMTP_USER}"
    pass: "${SMTP_PASS}"
    from: "no-reply@acme.com"
    fromName: "Acme - Rulebricks"

  supabase:
    url: "https://abcd1234.supabase.co"
    anonKey: "from-supabase-dashboard"
    serviceKey: "from-supabase-dashboard"
    accessToken: "${SUPABASE_ACCESS_TOKEN}"

supabase:
  enabled: false # Don't deploy self-hosted

rulebricks:
  hps:
    replicas: 3
    workers:
      keda:
        minReplicaCount: 4
        maxReplicaCount: 16

external-dns:
  enabled: true
  provider: route53
```

### Pattern 4: Air-Gapped / Private Network

No external dependencies:

```yaml
# airgapped.yaml
global:
  domain: "rulebricks.internal.acme.com"
  email: "devops@acme.com"
  tlsEnabled: false # Use internal CA or skip TLS

  ai:
    enabled: false # No external API calls

cert-manager:
  enabled: false # Use your own certificate management

external-dns:
  enabled: false # Manual DNS

# Private registry
rulebricks:
  app:
    image:
      repository: "registry.internal.acme.com/rulebricks/app"
```

---

## Production Hardening

### Resource Limits

Always set explicit resource limits in production:

```yaml
rulebricks:
  redis:
    resources:
      requests:
        cpu: "500m"
        memory: "1Gi"
      limits:
        cpu: "1000m"
        memory: "4Gi"

traefik:
  resources:
    requests:
      cpu: "500m"
      memory: "512Mi"
    limits:
      cpu: "2000m"
      memory: "2Gi"

kafka:
  controller:
    resources:
      requests:
        cpu: "1000m"
        memory: "4Gi"
      limits:
        cpu: "4000m"
        memory: "8Gi"
```

### High Availability

For production HA:

```yaml
kafka:
  controller:
    replicaCount: 3
  overrideConfiguration:
    default.replication.factor: "3"
    min.insync.replicas: "2"

traefik:
  autoscaling:
    minReplicas: 2
    maxReplicas: 5

rulebricks:
  hps:
    replicas: 3
    workers:
      keda:
        minReplicaCount: 6
        maxReplicaCount: 24

vector:
  replicas: 3
```

### Backup Configuration

Ensure persistent volumes are backed up:

```yaml
supabase:
  db:
    persistence:
      storageClassName: "gp3-backup" # StorageClass with snapshots

kafka:
  controller:
    persistence:
      storageClassName: "gp3-backup"
```

### Network Policies

Consider adding network policies to restrict traffic:

```yaml
# Example: Restrict database access
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgres-access
  namespace: rulebricks
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: supabase-db
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/instance: rulebricks
      ports:
        - port: 5432
```

---

## Cloud-Specific Configuration

### AWS EKS

```yaml
# AWS-specific settings
storageClass:
  create: true
  provisioner: ebs.csi.aws.com
  type: gp3

external-dns:
  enabled: true
  provider: route53
  # Uses IRSA - create IAM role and service account
# Recommended: Use IRSA for all AWS integrations
# eksctl create iamserviceaccount ...
```

**Prerequisites:**

- EBS CSI driver installed
- IRSA configured for external-dns and Vector (if using S3)
- ALB/NLB annotations if not using Traefik

### Google GKE

```yaml
storageClass:
  create: true
  provisioner: pd.csi.storage.gke.io
  type: pd-ssd

external-dns:
  enabled: true
  provider: google
  google:
    project: "your-gcp-project"
# GKE uses Workload Identity
# Annotate service accounts accordingly
```

### Azure AKS

```yaml
storageClass:
  create: true
  provisioner: disk.csi.azure.com
  type: Premium_LRS

external-dns:
  enabled: true
  provider: azure
  azure:
    resourceGroup: "your-resource-group"
    subscriptionId: "your-subscription-id"
```

### On-Premises / Generic Kubernetes

```yaml
storageClass:
  create: false # Use existing StorageClass
  name: "your-storage-class"

external-dns:
  enabled: false # Manual DNS management

cert-manager:
  enabled: true
  # Or use your own certificate management

traefik:
  service:
    type: NodePort # Or LoadBalancer if available
    # Adjust based on your ingress strategy
```

---

## Deployment Commands

### Initial Installation

```bash
# With values file
helm install rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --create-namespace \
  -f production.yaml

# With secrets via --set
helm install rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --create-namespace \
  -f production.yaml \
  --set global.smtp.user="$SMTP_USER" \
  --set global.smtp.pass="$SMTP_PASS" \
  --set supabase.secret.db.password="$DB_PASSWORD"
```

### Enable TLS (Phase 2)

```bash
helm upgrade rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  --reuse-values \
  --set global.tlsEnabled=true
```

### Upgrade to New Version

```bash
helm upgrade rulebricks oci://ghcr.io/rulebricks/charts/stack \
  --namespace rulebricks \
  -f production.yaml \
  --set global.smtp.user="$SMTP_USER" \
  --set global.smtp.pass="$SMTP_PASS"
```

### Rollback

```bash
# List history
helm history rulebricks -n rulebricks

# Rollback to previous
helm rollback rulebricks -n rulebricks

# Rollback to specific revision
helm rollback rulebricks 3 -n rulebricks
```

### Uninstall

```bash
# Remove release (keeps PVCs)
helm uninstall rulebricks -n rulebricks

# Full cleanup including data
helm uninstall rulebricks -n rulebricks
kubectl delete pvc --all -n rulebricks
kubectl delete namespace rulebricks
```

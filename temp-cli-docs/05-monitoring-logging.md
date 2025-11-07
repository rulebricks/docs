# Monitoring & Logging

This guide covers configuring monitoring and centralized logging for your Rulebricks deployment.

## Monitoring Overview

Rulebricks supports flexible monitoring configurations:

- **Local Mode**: Full Prometheus and Grafana stack in your cluster
- **Remote Mode**: Minimal Prometheus that forwards to external monitoring
- **Disabled**: No monitoring infrastructure (use alternative solutions)

## Monitoring Modes

### Local Mode (Default)

Deploys a complete monitoring stack in your cluster:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Retention**: 30 days (configurable)
- **Storage**: 50Gi (configurable)

**Access:**
- Grafana: `https://grafana.your-domain.com`
- Default credentials: Check your deployment notes or secrets

**Best for:**
- Development environments
- Isolated deployments
- Full control over monitoring

**Configuration:**
```yaml
monitoring:
  enabled: true
  mode: local
  local:
    prometheus_enabled: true
    grafana_enabled: true
    retention: "30d"
    storage_size: "50Gi"
```

### Remote Mode

Deploys minimal Prometheus that forwards metrics to external systems:

- **Prometheus**: Lightweight deployment (7-day retention, 10Gi storage)
- **Remote Write**: Forwards all metrics to external endpoint
- **No Grafana**: Use your existing monitoring dashboards

**Best for:**
- Production environments
- Existing monitoring infrastructure
- Cost optimization (no local storage)

**Supported Providers:**
- **Grafana Cloud**: Full Prometheus remote write support
- **New Relic**: Native Prometheus integration
- **Generic Prometheus**: Any Prometheus-compatible endpoint
- **Custom**: Your own remote write endpoint

**Configuration Example (Grafana Cloud):**
```yaml
monitoring:
  enabled: true
  mode: remote
  remote:
    provider: grafana-cloud
    prometheus_write:
      url: https://prometheus-us-central1.grafana.net/api/prom/push
      username: "123456"
      password_from: env:MONITORING_PASSWORD
```

**Configuration Example (New Relic):**
```yaml
monitoring:
  enabled: true
  mode: remote
  remote:
    provider: newrelic
    newrelic:
      license_key_from: env:NEWRELIC_LICENSE_KEY
      region: "US"  # or "EU"
```

**Configuration Example (Custom Prometheus):**
```yaml
monitoring:
  enabled: true
  mode: remote
  remote:
    provider: prometheus
    prometheus_write:
      url: https://prometheus.example.com/api/v1/write
      bearer_token_from: env:PROMETHEUS_TOKEN
```

### Disabled

No monitoring infrastructure deployed:

```yaml
monitoring:
  enabled: false
```

Use this if you have alternative monitoring solutions or don't need monitoring.

## Metrics Configuration

> **Note**: The `monitoring.metrics` configuration section exists in the schema but is not fully implemented. Retention is configured via `monitoring.local.retention` for local mode, and defaults are used for remote mode.

For local mode, configure retention:

```yaml
monitoring:
  enabled: true
  mode: local
  local:
    retention: "30d"    # Metrics retention period
    storage_size: "50Gi"
```

The `monitoring.metrics.interval` field (scrape interval) is defined in the schema but not currently used - Prometheus uses its default scrape interval.

### Filtering Metrics (Remote Mode)

Reduce costs by filtering metrics sent to remote endpoints:

```yaml
monitoring:
  enabled: true
  mode: remote
  remote:
    provider: grafana-cloud
    prometheus_write:
      url: https://prometheus-us-central1.grafana.net/api/prom/push
      username: "123456"
      password_from: env:MONITORING_PASSWORD
      write_relabel_configs:
        - source_labels: [__name__]
          regex: "kubernetes_.*|node_.*|up|traefik_.*"
          action: keep
```

This example only sends Kubernetes, node, and Traefik metrics.

## Logging Overview

Rulebricks uses Vector for centralized log collection and forwarding. Logs are collected from all components and can be forwarded to various destinations.

## Enabling Logging

Enable centralized logging:

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: console  # Default: output to stdout
```

## Log Sink Types

### API Key/Token Based (No IAM Required)

These sinks don't require cloud provider IAM setup:

#### Elasticsearch

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: elasticsearch
      endpoint: "https://elastic.example.com:9200"
      api_key: env:ELASTIC_API_KEY
      config:
        index: "rulebricks-logs"
        auth_user: "elastic"  # Optional
```

#### Datadog

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: datadog_logs
      api_key: env:DATADOG_API_KEY
      config:
        site: "datadoghq.com"  # or "datadoghq.eu"
```

#### Splunk HEC

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: splunk_hec
      endpoint: "https://splunk.example.com:8088"
      api_key: env:SPLUNK_HEC_TOKEN
      config:
        index: "main"
```

#### New Relic Logs

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: new_relic_logs
      api_key: env:NEW_RELIC_LICENSE_KEY
      config:
        region: "US"  # or "EU"
```

### Cloud Storage (IAM Required)

These sinks require cloud provider IAM setup. See [Vector Logging Setup](./08-vector-logging.md) for IAM configuration.

#### AWS S3

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: aws_s3
      config:
        bucket: "my-logs-bucket"
        region: "us-east-1"
        setup_iam: true  # Enable automatic IAM setup prompt
```

After deployment, run:
```bash
rulebricks vector setup-s3
```

#### Google Cloud Storage

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: gcp_cloud_storage
      config:
        bucket: "my-gcs-bucket"
        use_workload_identity: true
        setup_iam: true
```

After deployment, run:
```bash
rulebricks vector setup-gcs
```

#### Azure Blob Storage

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: azure_blob
      config:
        container_name: "logs"
        storage_account: "mylogs"
        use_managed_identity: true
        setup_iam: true
```

After deployment, run:
```bash
rulebricks vector setup-azure
```

### Other Sinks

#### Loki

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: loki
      endpoint: "http://loki.example.com:3100"
```

#### HTTP Endpoint

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: http
      endpoint: "https://logs.example.com/ingest"
      config:
        auth_header: "Bearer <token>"
```

#### Console (Default)

```yaml
logging:
  enabled: true
  vector:
    sink:
      type: console
```

Outputs logs to stdout (viewable via `rulebricks logs`).

## Log Configuration

Configure log collection behavior:

```yaml
monitoring:
  logs:
    level: info        # Log level: debug, info, warn, error
    retention: "7d"    # Log retention period
```

## Viewing Logs

### Using the CLI

View logs from any component:

```bash
# View app logs
rulebricks logs app

# Follow logs in real-time
rulebricks logs app -f

# View last 500 lines
rulebricks logs app --tail 500

# View all components
rulebricks logs all -f
```

### Available Components

- `app` - Main Rulebricks application
- `hps` - HPS service (rule processing)
- `workers` - Worker pods
- `database` - PostgreSQL database
- `supabase` - All Supabase services
- `traefik` - Ingress controller
- `prometheus` - Metrics collection
- `grafana` - Monitoring dashboards
- `all` - Combined logs from all components

### Using kubectl

You can also use kubectl directly:

```bash
# List pods
kubectl get pods --all-namespaces

# View logs
kubectl logs <pod-name> -n <namespace> -f

# View logs from all pods in a deployment
kubectl logs -l app=rulebricks-app -n <namespace> -f
```

## Monitoring Best Practices

1. **Production**: Use remote mode with external monitoring
2. **Development**: Use local mode for full visibility
3. **Cost Optimization**: Filter metrics in remote mode
4. **Retention**: Adjust retention based on your needs
5. **Alerts**: Set up alerts in your monitoring system

## Logging Best Practices

1. **Use cloud storage** for production (S3, GCS, Azure Blob)
2. **Set up IAM properly** for cloud storage sinks
3. **Use API key sinks** for simplicity (Elasticsearch, Datadog)
4. **Monitor log volume** to control costs
5. **Retain logs appropriately** based on compliance needs

## Troubleshooting

### Prometheus Not Collecting Metrics

- Check Prometheus pod status: `kubectl get pods -n <monitoring-namespace>`
- Review Prometheus logs: `rulebricks logs prometheus`
- Verify service discovery: Check Prometheus targets in Grafana

### Remote Write Failing

- Verify endpoint URL is correct
- Check authentication credentials
- Review network connectivity
- Check Prometheus logs for errors

### Logs Not Appearing in Sink

- Verify Vector pod is running: `kubectl get pods -n <logging-namespace>`
- Check Vector logs: `rulebricks logs vector`
- Verify sink configuration
- For cloud storage: Ensure IAM is configured correctly

### High Log Volume

- Review log levels (reduce from `debug` to `info`)
- Filter logs at the Vector level
- Consider log sampling for high-volume components
- Review retention policies

## Next Steps

- **Set up cloud storage logging**: See [Vector Logging Setup](./08-vector-logging.md)
- **Configure alerts**: Set up alerts in your monitoring system
- **Customize dashboards**: Create custom Grafana dashboards (local mode)
- **Review metrics**: Understand what metrics are available


# Upgrades & Maintenance

This guide covers upgrading your Rulebricks deployment and managing versions.

## Upgrade Overview

The Rulebricks CLI provides safe, zero-downtime upgrades with automatic rollback capabilities. Upgrades are performed using Helm chart updates with rolling updates.

## Checking Current Version

Check your current deployment version and available updates:

```bash
rulebricks upgrade status
```

This shows:
- Current deployed version
- Latest available version
- Available updates

## Listing Available Versions

List all available versions:

```bash
rulebricks upgrade list
```

This shows all available chart versions you can upgrade to.

## Performing an Upgrade

### Upgrade to Latest

Upgrade to the latest available version:

```bash
rulebricks upgrade run
```

### Upgrade to Specific Version

Upgrade to a specific version:

```bash
rulebricks upgrade run 1.2.3
```

### Dry Run

Preview what would change without making changes:

```bash
rulebricks upgrade run --dry-run
```

This shows:
- Current version
- Target version
- Resources that would be updated
- Configuration changes

## Upgrade Process

The upgrade process follows these steps:

1. **Backup Current Configuration**: Automatically backs up your current Helm release
2. **Validate New Version**: Checks compatibility and validates configuration
3. **Rolling Update**: Performs zero-downtime rolling updates
4. **Health Checks**: Verifies all pods are healthy after upgrade
5. **Rollback on Failure**: Automatically rolls back if health checks fail

### Zero-Downtime Upgrades

Upgrades use Kubernetes rolling updates:

- **Application**: New pods are created before old ones are terminated
- **Database**: Migrations run automatically (if needed)
- **Services**: Service endpoints remain available during upgrade

### Automatic Rollback

If health checks fail after upgrade:

- Automatically rolls back to previous version
- Restores previous configuration
- Ensures service availability

## Upgrade Best Practices

### 1. Test in Development First

Always test upgrades in a development environment:

```bash
# In development environment
rulebricks upgrade run --dry-run
rulebricks upgrade run
```

### 2. Review Release Notes

Before upgrading, review:
- Release notes for the target version
- Breaking changes
- Migration requirements
- New features

### 3. Backup Before Upgrading

While the CLI automatically backs up configuration, consider:

- **Database backups**: Backup your database before major upgrades
- **Configuration backup**: Keep a copy of your `rulebricks.yaml`
- **State backup**: Backup `.rulebricks-state.yaml` if present

### 4. Monitor During Upgrade

Watch the upgrade process:

```bash
# In one terminal
rulebricks upgrade run

# In another terminal
rulebricks status
rulebricks logs app -f
```

### 5. Verify After Upgrade

After upgrade completes:

1. **Check status**:
   ```bash
   rulebricks status
   ```

2. **Test application**:
   - Access the web UI
   - Test rule execution
   - Verify all features work

3. **Check logs**:
   ```bash
   rulebricks logs all
   ```

## Manual Rollback

If you need to manually rollback:

### Using Helm

```bash
# List releases
helm list -n <namespace>

# Rollback to previous version
helm rollback <release-name> -n <namespace>

# Rollback to specific revision
helm rollback <release-name> <revision-number> -n <namespace>
```

### Using kubectl

```bash
# Scale down new deployment
kubectl scale deployment <deployment> --replicas=0 -n <namespace>

# Scale up previous deployment (if still exists)
kubectl scale deployment <previous-deployment> --replicas=<count> -n <namespace>
```

## Version Management

### Pinning Versions

Pin to a specific version in your configuration:

```yaml
project:
  version: "1.2.3"  # Pin to specific version
```

Or use the deploy command:

```bash
rulebricks deploy --chart-version 1.2.3
```

### Version Compatibility

- **Major versions**: May include breaking changes
- **Minor versions**: New features, backward compatible
- **Patch versions**: Bug fixes, backward compatible

Always review release notes for major version upgrades.

## Maintenance Tasks

### Regular Maintenance

#### Check Status Regularly

```bash
rulebricks status
```

Review:
- Pod health
- Resource usage
- Certificate expiration
- Service endpoints

#### Review Logs

```bash
rulebricks logs all --tail 1000
```

Look for:
- Errors or warnings
- Performance issues
- Resource constraints

#### Monitor Resources

```bash
kubectl top nodes
kubectl top pods --all-namespaces
```

Check:
- CPU and memory usage
- Node capacity
- Pod resource requests vs limits

### Database Maintenance

#### Backup Database

> **Note**: Automated backup functionality is planned but not yet implemented. The backup configuration exists in the schema but is not currently used during deployment.

For self-hosted databases, you'll need to set up backups manually. Options include:

1. **Kubernetes CronJob with pg_dump**:
   ```yaml
   # Create a CronJob that runs pg_dump and uploads to cloud storage
   # This would need to be created manually via kubectl or Helm
   ```

2. **Cloud provider managed backups**:
   - Use your cloud provider's database backup services
   - Configure automated snapshots
   - Set up backup retention policies

3. **Third-party backup tools**:
   - Use tools like Velero for Kubernetes backup
   - Configure database-specific backup solutions

The backup configuration schema exists for future implementation:

```yaml
advanced:
  backup:
    enabled: true
    schedule: "0 2 * * *"  # Cron schedule (daily at 2 AM)
    retention: "30d"
    provider: s3
    provider_config:
      bucket: "my-backups"
      region: "us-east-1"
```

**For managed databases** (Supabase Cloud), backups are handled automatically by the provider.

#### Database Migrations

Migrations run automatically during:
- Initial deployment
- Upgrades (if new migrations exist)

Monitor migration logs:

```bash
rulebricks logs database -f
```

### Certificate Renewal

TLS certificates are automatically renewed by cert-manager:

- **Let's Encrypt**: Renews automatically before expiration
- **Custom certificates**: Must be renewed manually

Check certificate status:

```bash
kubectl get certificates --all-namespaces
kubectl describe certificate <cert-name> -n <namespace>
```

### Resource Cleanup

#### Remove Unused Resources

```bash
# List all resources
kubectl get all --all-namespaces

# Remove unused ConfigMaps
kubectl delete configmap <name> -n <namespace>

# Remove unused Secrets
kubectl delete secret <name> -n <namespace>
```

#### Clean Up Old Images

Old container images may accumulate on nodes. Consider:

- Setting up image garbage collection
- Using node image cleanup policies
- Regularly cleaning up unused images

## Troubleshooting Upgrades

### Upgrade Fails

If upgrade fails:

1. **Check logs**:
   ```bash
   rulebricks logs all
   kubectl get events --all-namespaces
   ```

2. **Review dry-run output**:
   ```bash
   rulebricks upgrade run --dry-run
   ```

3. **Check compatibility**:
   - Review release notes
   - Check configuration compatibility
   - Verify resource requirements

4. **Manual rollback** (if needed):
   ```bash
   helm rollback <release-name> -n <namespace>
   ```

### Pods Not Starting After Upgrade

1. **Check pod status**:
   ```bash
   kubectl get pods --all-namespaces
   kubectl describe pod <pod-name> -n <namespace>
   ```

2. **Review pod logs**:
   ```bash
   kubectl logs <pod-name> -n <namespace>
   ```

3. **Check resource constraints**:
   ```bash
   kubectl top nodes
   kubectl describe nodes
   ```

4. **Verify configuration**:
   - Check ConfigMaps and Secrets
   - Verify environment variables
   - Review resource requests/limits

### Database Migration Issues

If database migrations fail:

1. **Check migration logs**:
   ```bash
   rulebricks logs database
   ```

2. **Verify database connectivity**:
   ```bash
   kubectl exec -it <db-pod> -n <namespace> -- psql -U postgres
   ```

3. **Review migration files**:
   - Check for breaking changes
   - Verify migration compatibility
   - Consider manual migration if needed

### Certificate Issues After Upgrade

If certificates fail after upgrade:

1. **Check cert-manager**:
   ```bash
   kubectl get pods -n cert-manager
   kubectl logs -n cert-manager -l app=cert-manager
   ```

2. **Verify certificate requests**:
   ```bash
   kubectl get certificaterequests --all-namespaces
   kubectl describe certificaterequest <name> -n <namespace>
   ```

3. **Check DNS**:
   - Verify DNS records are correct
   - Check DNS propagation
   - Verify domain ownership

## Upgrade Checklist

Before upgrading:

- [ ] Review release notes
- [ ] Test in development environment
- [ ] Backup database (if self-hosted)
- [ ] Backup configuration file
- [ ] Review dry-run output
- [ ] Verify resource capacity
- [ ] Check for breaking changes
- [ ] Plan maintenance window (if needed)

During upgrade:

- [ ] Monitor upgrade progress
- [ ] Watch pod status
- [ ] Check application health
- [ ] Review logs for errors

After upgrade:

- [ ] Verify all services are running
- [ ] Test application functionality
- [ ] Check certificate validity
- [ ] Monitor for issues
- [ ] Review metrics and logs

## Next Steps

- **Monitor your deployment**: See [Status & Troubleshooting](./07-status-troubleshooting.md)
- **Configure backups**: Set up automated database backups
- **Set up alerts**: Configure monitoring alerts for critical issues
- **Plan upgrades**: Schedule regular upgrade reviews


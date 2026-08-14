const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = {
  ...withNextra(),
  basePath: '/docs',
  assetPrefix:
    process.env.NODE_ENV == 'development'
      ? ''
      : 'https://docs.rulebricks.com/docs',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs',
        basePath: false,
        permanent: false,
      },
      {
        source: '/private-deployment/deployment',
        destination: '/private-deployment/quick-start',
        permanent: true,
      },
      {
        source: '/private-deployment/external-authentication',
        destination: '/private-deployment/authentication/token-passthrough',
        permanent: true,
      },
      {
        source: '/private-deployment/provisioning-users',
        destination: '/private-deployment/authentication',
        permanent: true,
      },
      {
        source: '/private-deployment/provisioning-users/claim-mapping',
        destination: '/private-deployment/authentication/claim-mapping',
        permanent: true,
      },
      {
        source: '/private-deployment/sso',
        destination: '/private-deployment/authentication',
        permanent: true,
      },
      {
        source: '/private-deployment/sso/claim-mapping',
        destination: '/private-deployment/authentication/claim-mapping',
        permanent: true,
      },
      {
        source: '/private-deployment/sso/disabling-authentication',
        destination: '/private-deployment/authentication/token-passthrough',
        permanent: true,
      },
      {
        source: '/security/subprocessor-list',
        destination: '/security/trust-portal',
        permanent: true,
      },
    ]
  },
}

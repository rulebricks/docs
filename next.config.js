const { webpack } = require('next/dist/compiled/webpack/webpack')
const { redirect } = require('next/dist/server/api-utils')

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = {
  ...withNextra(),
  webpack: (config, options) => {
    // fix "Global CSS cannot be imported from files other than your Custom <App>."
    // just for the @scalar/api-reference-react/dist/index.css file
    config.module.rules.push({
      test: /@scalar\/api-reference-react\/dist\/index\.css$/,
      use: [
        options.defaultLoaders.css,
        {
          loader: 'ignore-loader',
          options: {
            importLoaders: 1,
            sourceMap: false,
          },
        },
      ],
    })

    return withNextra().webpack(config, options)
  },
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

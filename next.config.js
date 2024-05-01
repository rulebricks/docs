const { webpack } = require('next/dist/compiled/webpack/webpack')

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
}

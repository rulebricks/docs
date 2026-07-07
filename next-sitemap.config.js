/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://rulebricks.com/docs',
  // No fabricated lastmod (build time on every URL is lastmod spam) and no
  // blanket changefreq/priority noise — bare, honest entries only.
  autoLastmod: false,
  transform: async (config, path) => ({
    loc: path,
    alternateRefs: config.alternateRefs ?? [],
  }),
  // robots.txt generated here would be served at /docs/robots.txt, a path
  // crawlers never read (robots lives at the host root). The main site's
  // robots.txt already advertises the docs sitemaps.
  generateRobotsTxt: false,
}

import React from 'react'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'
import NavbarLogo from './components/NavbarLogo'
import {
  IconCube,
  IconCube3dSphere,
  IconHistory,
  IconPencil,
} from '@tabler/icons-react'
import moment from 'moment'
import { useRouter } from 'next/router'

const DOCS_ORIGIN = 'https://rulebricks.com/docs'

// Section folders that have an index.mdx — only these get a linked
// intermediate breadcrumb (a crumb URL must not 404).
const SECTIONS_WITH_INDEX = new Set([
  'analysis-tools',
  'contexts',
  'objects',
  'releases',
  'warnings',
])

// Escapes "<" so page content can never break out of the JSON-LD script tag.
const serializeJsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, '\\u003c')

const SEGMENT_NAME_OVERRIDES: Record<string, string> = {
  api: 'API',
  ai: 'AI',
  sso: 'SSO',
  urls: 'URLs',
}

const segmentName = (segment: string) =>
  segment
    .split('-')
    .map(
      (word) =>
        SEGMENT_NAME_OVERRIDES[word] ||
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')

/**
 * TechArticle + BreadcrumbList JSON-LD for every docs page, canonicalized
 * to the rulebricks.com/docs proxy host.
 */
function JsonLdHead() {
  const { asPath } = useRouter()
  const { title, frontMatter } = useConfig()
  const cleanPath = asPath.split('#')[0].split('?')[0]
  if (cleanPath === '/') return null

  const canonicalUrl = `${DOCS_ORIGIN}${cleanPath}`
  const segments = cleanPath.split('/').filter(Boolean)
  const pageName = title || segmentName(segments[segments.length - 1])

  const crumbs: Array<{ name: string; item?: string }> = [
    { name: 'User Guide', item: DOCS_ORIGIN },
  ]
  if (segments.length > 1 && SECTIONS_WITH_INDEX.has(segments[0])) {
    crumbs.push({
      name: segmentName(segments[0]),
      item: `${DOCS_ORIGIN}/${segments[0]}`,
    })
  }
  crumbs.push({ name: pageName })

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.item || undefined,
    })),
  }

  const techArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: pageName,
    description: frontMatter.metaDescription || undefined,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Rulebricks',
      url: 'https://rulebricks.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://rulebricks.com/android-chrome-256x256.png',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(techArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbList) }}
      />
    </>
  )
}

const config: DocsThemeConfig = {
  head: JsonLdHead,
  logo: NavbarLogo,
  project: {
    icon: null,
    link: 'https://github.com/rulebricks',
  },
  chat: {
    link: 'https://discord.gg/YV5kHTTWh7',
  },
  navbar: {
    extraContent: null,
  },
  footer: {
    component: null,
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
    const { frontMatter } = useConfig()
    let seoOptions = {}
    if (asPath !== '/') {
      seoOptions['titleTemplate'] = `%s – User Guide – Rulebricks`
    } else {
      seoOptions['titleTemplate'] = 'User Guide – Rulebricks'
    }
    seoOptions['defaultTitle'] = 'User Guide – Rulebricks'
    if (asPath == '/') {
      seoOptions['description'] =
        'Learn how to build rules in Rulebricks and integrate them into your applications.'
    } else {
      seoOptions['description'] = frontMatter.metaDescription
    }
    // Docs are reachable both via the rulebricks.com/docs proxy and directly
    // on docs.rulebricks.com — a per-page canonical pointing at the proxy
    // host consolidates the duplicate into the URLs we want indexed.
    // (asPath excludes the /docs basePath; strip query/hash.)
    const cleanPath = asPath.split('#')[0].split('?')[0]
    const canonicalUrl = `https://rulebricks.com/docs${
      cleanPath === '/' ? '' : cleanPath
    }`
    seoOptions['canonical'] = canonicalUrl
    seoOptions['openGraph'] = {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      site_name: 'Rulebricks User Guide',
      images: [
        {
          url: 'https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/static/images/application/social.png',
          alt: 'Rulebricks Logo',
        },
      ],
    }
    seoOptions['twitter'] = {
      handle: '@rulebricks',
      site: '@rulebricks',
      cardType: 'summary_large_image',
    }
    seoOptions['additionalLinkTags'] = [
      {
        rel: 'icon',
        href: 'https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: 'https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/apple-touch-icon.png',
        sizes: '180x180',
      },
      {
        rel: 'manifest',
        href: 'https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/manifest.webmanifest',
      },
      {
        rel: 'mask-icon',
        href: 'https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap',
      },
    ]
    return seoOptions
  },
  primaryHue: 104,
  primarySaturation: 60,
  docsRepositoryBase: 'https://github.com/rulebricks/docs/tree/main',
  banner: {
    key: 'ai-release',
    text: () => {
      return (
        <a
          href="https://www.rulebricks.com/blog/ai-business-rules"
          target="_blank"
          className="flex flex-row justify-start -ml-4 sm:ml-0 sm:justify-center items-center text-center align-middle group duration-100 transition-all hover:text-lime-200"
        >
          <IconCube
            strokeWidth={3}
            className="size-3 flex-shrink-0 group-hover:fill-lime-300/50 group-hover:rotate-[120deg] transition-all duration-150 sm:size-4 inline-block mr-2 "
          />
          <span className="text-xs sm:text-base align-middle self-center truncate">
            Tired of reading documentation? Try our new AI suite. More →
          </span>
        </a>
      )
    },
  },
  /*
  gitTimestamp: ({ timestamp }) => {
    return (
      <div className="text-sm text-neutral-700 opacity-80 align-middle inline-flex items-center invert-dark">
        <IconHistory className="w-4 h-4 self-center inline-block mr-1.5" />
        <span className="self-center">
          This page was last updated {moment(timestamp).fromNow()}
        </span>
      </div>
    )
  },
  */
  gitTimestamp: null,
  feedback: {
    content: null,
  },
  editLink: {
    component: null,
  },
}

export default config

import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import NavbarLogo from './components/NavbarLogo'
import { IconCube3dSphere, IconHistory } from '@tabler/icons-react'
import moment from 'moment'
import { useRouter } from 'next/router'

const config: DocsThemeConfig = {
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
    let seoOptions = {}
    if (asPath !== '/') {
      seoOptions['titleTemplate'] = `%s – User Guide – Rulebricks`
    } else {
      seoOptions['titleTemplate'] = 'User Guide – Rulebricks'
    }
    seoOptions['defaultTitle'] = 'User Guide – Rulebricks'
    seoOptions['description'] =
      'Learn how to build rules in Rulebricks and integrate them into your applications.'
    seoOptions['openGraph'] = {
      type: 'website',
      locale: 'en_US',
      url: 'https://rulebricks.com/docs',
      site_name: 'Rulebricks User Guide',
      images: [
        {
          url: 'https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/static/images/application/logo.png',
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
        href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap',
      },
    ]
    return seoOptions
  },
  primaryHue: 104,
  primarySaturation: 60,
  docsRepositoryBase: 'https://github.com/rulebricks/docs/tree/main',
  banner: {
    key: 'flows-release',
    text: () => {
      return (
        <a
          href="https://www.rulebricks.com/blog/reactive-rule-flows"
          target="_blank"
          className="flex flex-row justify-center items-center text-center align-middle hover:text-lime-100 duration-50"
        >
          <IconCube3dSphere
            strokeWidth={3}
            className="size-3 sm:size-4 inline-block mr-2"
          />
          <span className="text-xs sm:text-base align-middle self-center">
            New in Rulebricks: Reactive Rule Flows. More →
          </span>
        </a>
      )
    },
  },
  gitTimestamp: ({ timestamp }) => {
    return (
      <div className="text-sm text-neutral-700 opacity-80 invert-dark">
        <IconHistory className="w-4 h-4 inline-block mr-1.5" />
        This page was last updated {moment(timestamp).fromNow()}
      </div>
    )
  },
}

export default config

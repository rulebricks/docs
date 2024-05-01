import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import NavbarLogo from './components/NavbarLogo'
import { IconCube3dSphere, IconHistory } from '@tabler/icons-react'
import moment from 'moment'

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
  primaryHue: 104,
  primarySaturation: 60,
  feedback: {
    content: null,
  },
  editLink: {
    component: null,
  },
  banner: {
    key: 'flows-release',
    text: () => {
      return (
        <a
          href="https://www.rulebricks.com/blog/reactive-rule-flows"
          target="_blank"
          className="flex flex-row justify-center items-center text-center align-middle"
        >
          <IconCube3dSphere className="w-4 h-4 text-white inline-block mr-2" />
          <span className="align-middle self-center">
            New in Rulebricks: Reactive Rule Flows. Read more →
          </span>
        </a>
      )
    },
  },
  gitTimestamp: ({ timestamp }) => {
    return (
      <div className="text-sm text-gray-500 opacity-65">
        <IconHistory className="w-4 h-4 inline-block mr-1.5" />
        This page was last updated {moment(timestamp).fromNow()}
      </div>
    )
  },
}

export default config

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import ApiReference from './ApiReference'
import SdkExamples from './SdkExamples'

type Tab = 'api' | 'sdk'

interface SDKParams {
  lang?: string
  section?: string
}

function parseSDKHash(hash: string): SDKParams | null {
  if (!hash.startsWith('sdk')) return null

  const parts = hash.split('/')
  // #sdk -> parts = ['sdk']
  // #sdk/python -> parts = ['sdk', 'python']
  // #sdk/python/rules -> parts = ['sdk', 'python', 'rules']

  return {
    lang: parts[1] || undefined,
    section: parts[2] || undefined,
  }
}

function ApiReferencePage() {
  const [activeTab, setActiveTab] = useState<Tab>('api')
  const [sdkParams, setSdkParams] = useState<SDKParams | null>(null)

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.slice(1) // Remove #

    if (hash.startsWith('sdk')) {
      setActiveTab('sdk')
      setSdkParams(parseSDKHash(hash))
    } else if (hash === '' || !hash.startsWith('sdk')) {
      // Let Scalar handle other hashes, but if empty and we were on SDK, stay there
      if (activeTab === 'sdk' && hash === '') {
        // User cleared hash, stay on SDK
      }
    }
  }, [activeTab])

  // Parse hash on mount
  useEffect(() => {
    handleHashChange()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for hash changes
  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [handleHashChange])

  // Handle tab clicks - update hash
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'sdk') {
      // Set hash to sdk (will preserve language if SdkExamples updates it)
      window.location.hash = 'sdk'
    } else {
      // Clear hash when going to API tab (let Scalar manage it)
      window.location.hash = ''
    }
  }

  return (
    <div className="api-reference-page">
      {/* Top bar */}
      <div className="api-page-topbar">
        <Link href="/" className="back-link">
          <IconArrowLeft size={22} strokeWidth={1} />
          <span className="!text-base !font-light">User Guide</span>
        </Link>

        <div className="api-tabs ">
          <button
            className={`api-tab ${
              activeTab === 'api' ? 'active' : ''
            } !font-light`}
            onClick={() => handleTabClick('api')}
          >
            API Reference
          </button>
          <button
            className={`api-tab ${
              activeTab === 'sdk' ? 'active' : ''
            } !font-light`}
            onClick={() => handleTabClick('sdk')}
          >
            SDK Examples
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="api-page-content">
        {activeTab === 'api' ? (
          <div className="api-reference-wrapper">
            <ApiReference />
          </div>
        ) : (
          <div className="sdk-documentation-wrapper">
            <SdkExamples
              initialLanguage={sdkParams?.lang}
              initialSection={sdkParams?.section}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiReferencePage

import { useState, useEffect, useRef, useCallback } from 'react'
import { Highlight, themes, Prism } from 'prism-react-renderer'
import {
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react'
import sdkData from '../data/sdk-examples.json'

// Add additional language support
;(typeof global !== 'undefined' ? global : window).Prism = Prism
require('prismjs/components/prism-java')
require('prismjs/components/prism-csharp')
require('prismjs/components/prism-ruby')
require('prismjs/components/prism-go')
require('prismjs/components/prism-bash')

type Language = 'python' | 'typescript' | 'go' | 'csharp' | 'java' | 'ruby'

const languageLabels: Record<Language, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  go: 'Go',
  csharp: 'C#',
  java: 'Java',
  ruby: 'Ruby',
}

const githubUrls: Record<Language, string> = {
  python: 'https://github.com/rulebricks/python-sdk',
  typescript: 'https://github.com/rulebricks/node-sdk',
  go: 'https://github.com/rulebricks/go-sdk',
  csharp: 'https://github.com/rulebricks/csharp-sdk',
  java: 'https://github.com/rulebricks/java-sdk',
  ruby: 'https://github.com/rulebricks/ruby-sdk',
}

// Map to Prism language identifiers
const prismLanguageMap: Record<string, string> = {
  python: 'python',
  typescript: 'typescript',
  go: 'go',
  csharp: 'csharp',
  java: 'java',
  ruby: 'ruby',
  bash: 'bash',
  xml: 'markup',
}

function CodeBlock({
  code,
  language,
  displayLang,
}: {
  code: string
  language: string
  displayLang?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const prismLang = prismLanguageMap[language] || 'typescript'

  return (
    <div className="sdk-code-wrapper">
      <div className="sdk-code-header">
        <span className="sdk-code-lang">{displayLang || language}</span>
        <button
          className={`sdk-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <IconCheck size={11} /> Copied
            </>
          ) : (
            <>
              <IconCopy size={11} /> Copy
            </>
          )}
        </button>
      </div>
      <div className="sdk-code-block">
        <Highlight
          theme={themes.nightOwl}
          code={code.trim()}
          language={prismLang}
        >
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}

// Parameter display component - always renders to maintain layout
function ParameterList({
  parameters,
}: {
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
}) {
  return (
    <div className="sdk-params-col">
      {parameters && parameters.length > 0 ? (
        <>
          <h4 className="sdk-params-title">Parameters</h4>
          {parameters.map((param) => (
            <div key={param.name} className="sdk-param">
              <div className="sdk-param-name">{param.name}</div>
              <div className="sdk-param-meta">
                {param.type}
                {param.required && (
                  <span className="required"> · required</span>
                )}
              </div>
              {param.description && (
                <div className="sdk-param-desc">{param.description}</div>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="sdk-no-params">No parameters required</div>
      )}
    </div>
  )
}

// Build navigation items from SDK data
function buildNavItems() {
  const items: Array<{
    id: string
    label: string
    type: 'section' | 'resource' | 'method' | 'subresource'
    children?: Array<{
      id: string
      label: string
      type: string
      children?: any[]
    }>
  }> = []

  sdkData.resources.forEach((resource: any) => {
    const resourceItem: any = {
      id: resource.name.toLowerCase().replace(/\s+/g, '-'),
      label: resource.name,
      type: 'resource',
      children: [],
    }

    if (resource.methods) {
      resource.methods.forEach((method: any) => {
        resourceItem.children.push({
          id: `${resourceItem.id}-${method.name.toLowerCase()}`,
          label: method.name,
          type: 'method',
        })
      })
    }

    if (resource.subResources) {
      resource.subResources.forEach((subResource: any) => {
        const subResourceItem: any = {
          id: `${resourceItem.id}-${subResource.name}`,
          label: subResource.name,
          type: 'subresource',
          children: [],
        }

        if (subResource.methods) {
          subResource.methods.forEach((method: any) => {
            subResourceItem.children.push({
              id: `${subResourceItem.id}-${method.name.toLowerCase()}`,
              label: method.name,
              type: 'method',
            })
          })
        }

        resourceItem.children.push(subResourceItem)
      })
    }

    items.push(resourceItem)
  })

  return items
}

// Valid language IDs
const validLanguages: Language[] = [
  'python',
  'typescript',
  'go',
  'csharp',
  'java',
  'ruby',
]

function isValidLanguage(lang: string | undefined): lang is Language {
  return lang !== undefined && validLanguages.includes(lang as Language)
}

interface SdkExamplesProps {
  initialLanguage?: string
  initialSection?: string
}

function SdkExamples({ initialLanguage, initialSection }: SdkExamplesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    isValidLanguage(initialLanguage) ? initialLanguage : 'python'
  )
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([
      'getting-started',
      'rules',
      'flows',
      'contexts',
      'assets',
      'values',
    ])
  )
  const [activeSection, setActiveSection] = useState<string>(
    initialSection || 'getting-started'
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = buildNavItems()

  const languages = sdkData.languages as Array<{
    id: Language
    name: string
    extension: string
  }>

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setActiveSection(id)
  }

  const handleScroll = useCallback(() => {
    if (!contentRef.current) return
    const container = contentRef.current
    const scrollTop = container.scrollTop
    const sections = container.querySelectorAll('[data-section]')
    let currentSection = 'getting-started'

    sections.forEach((section) => {
      const element = section as HTMLElement
      const sectionTop = element.offsetTop - container.offsetTop - 100
      if (scrollTop >= sectionTop) {
        currentSection = element.getAttribute('data-section') || currentSection
      }
    })

    setActiveSection(currentSection)
  }, [])

  useEffect(() => {
    const container = contentRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll to initial section after component mounts
  useEffect(() => {
    if (!hasInitialized && initialSection) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById(initialSection)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setActiveSection(initialSection)
          // Expand parent sections if needed
          const parts = initialSection.split('-')
          if (parts.length > 1) {
            setExpandedSections((prev) => {
              const next = new Set(Array.from(prev))
              next.add(parts[0])
              return next
            })
          }
        }
        setHasInitialized(true)
      }, 100)
      return () => clearTimeout(timer)
    } else if (!hasInitialized) {
      setHasInitialized(true)
    }
  }, [initialSection, hasInitialized])

  // Update URL hash when language changes
  const updateHash = useCallback((lang: Language, section?: string) => {
    const hashParts = ['sdk', lang]
    if (section && section !== 'getting-started') {
      hashParts.push(section)
    }
    window.location.hash = hashParts.join('/')
  }, [])

  // Handle language change with hash update
  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang)
    setDropdownOpen(false)
    updateHash(lang, activeSection)
  }

  // Handle section click with hash update
  const handleSectionClick = (sectionId: string) => {
    scrollToSection(sectionId)
    updateHash(selectedLanguage, sectionId)
  }

  const renderNavItem = (item: any, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.has(item.id)
    const isActive = activeSection === item.id

    return (
      <div key={item.id} className="sdk-nav-item-wrapper">
        <button
          className={`sdk-nav-item sdk-nav-depth-${depth} ${
            isActive ? 'active' : ''
          } ${
            item.type === 'resource'
              ? 'sdk-nav-resource !text-sm !tracking-normal'
              : ''
          } ${item.type === 'subresource' ? 'sdk-nav-subresource' : ''} ${
            item.type === 'method' ? 'sdk-nav-method' : ''
          }`}
          onClick={() => {
            if (
              hasChildren &&
              (item.type === 'resource' ||
                item.type === 'section' ||
                item.type === 'subresource')
            ) {
              toggleSection(item.id)
            }
            handleSectionClick(item.id)
          }}
        >
          {hasChildren &&
            (item.type === 'resource' ||
              item.type === 'section' ||
              item.type === 'subresource') && (
              <span className="sdk-nav-chevron">
                {isExpanded ? (
                  <IconChevronDown size={22} strokeWidth={1} />
                ) : (
                  <IconChevronRight size={22} strokeWidth={1} />
                )}
              </span>
            )}
          <span className="sdk-nav-label">{item.label}</span>
        </button>
        {hasChildren && isExpanded && (
          <div className="sdk-nav-children">
            {item.children.map((child: any) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Render a method with side-by-side layout
  const renderMethod = (method: any, resourceId: string) => {
    const methodId = `${resourceId}-${method.name.toLowerCase()}`
    const code =
      method.examples[selectedLanguage as keyof typeof method.examples] ||
      '// Example not available'

    return (
      <div
        key={method.name}
        id={methodId}
        data-section={methodId}
        className="sdk-method-block"
      >
        <div className="sdk-method-header">
          <h3 className="sdk-method-name">{method.name}</h3>
          <p className="sdk-method-desc">{method.description}</p>
        </div>
        <div className="sdk-method-row">
          <ParameterList parameters={method.parameters} />
          <div className="sdk-code-col">
            <CodeBlock
              code={code}
              language={selectedLanguage}
              displayLang={languageLabels[selectedLanguage]}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sdk-examples-container">
      {/* Sidebar */}
      <aside className="sdk-sidebar">
        <div className="sdk-language-dropdown" ref={dropdownRef}>
          <button
            className="sdk-language-dropdown-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="sdk-language-label">Language</span>
            <span className="sdk-language-value">
              {languageLabels[selectedLanguage]}
              <IconChevronDown
                size={22}
                strokeWidth={1}
                className={`sdk-dropdown-icon ${dropdownOpen ? 'open' : ''}`}
              />
            </span>
          </button>
          {dropdownOpen && (
            <div className="sdk-language-dropdown-menu">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  className={`sdk-language-option ${
                    selectedLanguage === lang.id ? 'selected' : ''
                  }`}
                  onClick={() => handleLanguageChange(lang.id)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="sdk-nav">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="sdk-sidebar-footer">
          <a
            href={githubUrls[selectedLanguage]}
            target="_blank"
            rel="noopener noreferrer"
            className="sdk-github-link"
          >
            <IconExternalLink size={12} />
            View {languageLabels[selectedLanguage]} SDK
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sdk-main-content" ref={contentRef}>
        {/* Getting Started */}
        <section
          id="getting-started"
          data-section="getting-started"
          className="sdk-content-section"
        >
          <h1 className="!text-2xl">Getting Started</h1>
          <p className="sdk-section-intro !text-lg !mb-12">
            Install the {languageLabels[selectedLanguage]} SDK and start
            integrating Rulebricks into your application.
          </p>

          <div
            id="installation"
            data-section="installation"
            className="sdk-content-block"
          >
            <h2>Installation</h2>
            <CodeBlock
              code={sdkData.installation[selectedLanguage]}
              language={selectedLanguage === 'java' ? 'xml' : 'bash'}
              displayLang={selectedLanguage === 'java' ? 'Maven' : 'Terminal'}
            />
          </div>

          <div
            id="initialization"
            data-section="initialization"
            className="sdk-content-block"
          >
            <h2>Initialize the Client</h2>
            <CodeBlock
              code={sdkData.initialization[selectedLanguage]}
              language={selectedLanguage}
              displayLang={languageLabels[selectedLanguage]}
            />
          </div>
        </section>

        {/* Resource Sections */}
        {sdkData.resources.map((resource: any) => {
          const resourceId = resource.name.toLowerCase().replace(/\s+/g, '-')

          return (
            <section
              key={resource.name}
              id={resourceId}
              data-section={resourceId}
              className="sdk-content-section"
            >
              <h1 className="!text-2xl">{resource.name}</h1>
              <p className="sdk-section-intro !text-lg !mb-12">
                {resource.description}
              </p>

              {resource.methods?.map((method: any) =>
                renderMethod(method, resourceId)
              )}

              {resource.subResources?.map((subResource: any) => {
                const subResourceId = `${resourceId}-${subResource.name}`
                return (
                  <div
                    key={subResource.name}
                    id={subResourceId}
                    data-section={subResourceId}
                    className="sdk-subresource-section"
                  >
                    <h2 className="sdk-subresource-heading">
                      {resource.name.toLowerCase()}.{subResource.name}
                    </h2>
                    <p className="sdk-subresource-desc">
                      {subResource.description}
                    </p>

                    {subResource.methods?.map((method: any) =>
                      renderMethod(method, subResourceId)
                    )}
                  </div>
                )
              })}
            </section>
          )
        })}
      </main>
    </div>
  )
}

export default SdkExamples

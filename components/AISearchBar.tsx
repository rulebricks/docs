import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  IconSearch,
  IconArrowRight,
  IconSparkles,
  IconX,
  IconRefresh,
  IconLoader2,
} from '@tabler/icons-react'

interface RelevantPage {
  title: string
  path: string
  description: string
}

interface SearchResponse {
  answer: string
  relevantPages: RelevantPage[]
  error?: string
}

export default function AISearchBar() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [query])

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopupVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setResponse(null)

    try {
      // Use basePath for API calls
      const basePath = router.basePath || ''
      const res = await fetch(`${basePath}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })

      const data: SearchResponse = await res.json()
      setResponse(data)
      setIsPopupVisible(true)
    } catch (error) {
      setResponse({
        answer: '',
        relevantPages: [],
        error: 'Failed to connect to the AI service. Please try again.',
      })
      setIsPopupVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResponse(null)
    setIsPopupVisible(false)
    textareaRef.current?.focus()
  }

  const handleFocus = () => {
    if (response) {
      setIsPopupVisible(true)
    }
  }

  return (
    <div className="ai-search-container" ref={containerRef}>
      {/* Search Input */}
      <div
        className={`ai-search-input-wrapper ${
          isLoading ? 'loading animate-pulse' : ''
        }`}
      >
        <div className="ai-search-icon self-start align-start mt-1">
          <IconSparkles size={22} strokeWidth={1.5} />
        </div>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            // Clear prior response when query changes
            if (response) {
              setResponse(null)
              setIsPopupVisible(false)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Ask Rulebricks..."
          className="ai-search-input self-center align-middle"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={response ? clearSearch : handleSubmit}
          disabled={(!query.trim() && !response) || isLoading}
          className={`ai-search-submit ${
            response
              ? 'has-response group hover:translate-x-0 transition-all'
              : ''
          }`}
          aria-label={response ? 'New search' : 'Search'}
        >
          {isLoading ? (
            <IconLoader2 size={20} className="animate-spin" />
          ) : response ? (
            <IconRefresh
              size={20}
              className="-rotate-45 group-hover:-rotate-180 transition-all"
            />
          ) : (
            <IconArrowRight size={20} />
          )}
        </button>
      </div>

      {/* Response Area - Only show when we have results and popup is visible */}
      {response && isPopupVisible && (
        <div className="ai-search-response visible">
          {response.error ? (
            <div className="ai-search-error">
              <p>{response.error}</p>
              <button onClick={clearSearch} className="ai-search-retry">
                Try again
              </button>
            </div>
          ) : response.answer ? (
            <div className="ai-search-content">
              {/* Main Answer Area */}
              <div className="ai-search-main">
                <div className="ai-search-answer">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response.answer}
                  </ReactMarkdown>
                </div>
                <button onClick={clearSearch} className="ai-search-clear">
                  Ask another question
                </button>
              </div>

              {/* Sidebar with Links */}
              {response.relevantPages.length > 0 && (
                <div className="ai-search-sidebar">
                  <div className="ai-search-sidebar-header">
                    <div className="ai-search-links-header">
                      <IconSearch size={14} />
                      <span>Related docs</span>
                    </div>
                    <button
                      onClick={clearSearch}
                      className="ai-search-close"
                      aria-label="Close"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                  <div className="ai-search-links-list">
                    {response.relevantPages.map((page) => (
                      <Link
                        key={page.path}
                        href={page.path}
                        className="ai-search-link"
                      >
                        <div className="ai-search-link-content">
                          <span className="ai-search-link-title">
                            {page.title}
                          </span>
                          {page.description && (
                            <span className="ai-search-link-desc">
                              {page.description}
                            </span>
                          )}
                        </div>
                        <IconArrowRight
                          size={14}
                          className="ai-search-link-arrow"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

import { ApiReferenceReact } from '@scalar/api-reference-react'
import { IconLoader } from '@tabler/icons-react'
import { useTheme } from 'nextra-theme-docs'
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useState,
} from 'react'

const OPENAPI_URL = 'https://rulebricks.com/api/v1/openapi.json'

type OpenApiDocument = Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function containsNonPointerRef(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsNonPointerRef)
  }

  if (!isRecord(value)) {
    return false
  }

  if (typeof value.$ref === 'string' && !value.$ref.startsWith('#/')) {
    return true
  }

  return Object.values(value).some(containsNonPointerRef)
}

function prepareForScalar(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(prepareForScalar)
  }

  if (!isRecord(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (key === 'examples' && isRecord(child)) {
        const compatibleExamples = Object.fromEntries(
          Object.entries(child)
            .filter(([, example]) => {
              return (
                !isRecord(example) ||
                !('value' in example) ||
                !containsNonPointerRef(example.value)
              )
            })
            .map(([name, example]) => [name, prepareForScalar(example)])
        )

        return [key, compatibleExamples]
      }

      return [key, prepareForScalar(child)]
    })
  )
}

interface ReferenceErrorBoundaryProps {
  children: ReactNode
  onRetry: () => void
}

interface ReferenceErrorBoundaryState {
  error: Error | null
}

class ReferenceErrorBoundary extends Component<
  ReferenceErrorBoundaryProps,
  ReferenceErrorBoundaryState
> {
  state: ReferenceErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Failed to render the API reference.', error, errorInfo)
  }

  retry = () => {
    this.setState({ error: null })
    this.props.onRetry()
  }

  render() {
    if (this.state.error) {
      return (
        <ReferenceError
          detail="The API specification loaded, but the reference renderer could not display it."
          onRetry={this.retry}
        />
      )
    }

    return this.props.children
  }
}

function ReferenceError({
  detail,
  onRetry,
}: {
  detail: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-[calc(100vh-70px)] w-full items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h2 className="mb-2 text-xl font-medium">API reference unavailable</h2>
        <p className="mb-5 text-sm opacity-70">{detail}</p>
        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function ApiReference() {
  const { theme } = useTheme()
  const [openapiSpec, setOpenapiSpec] = useState<OpenApiDocument | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadOpenApiSpec() {
      setOpenapiSpec(null)
      setLoadError(null)

      try {
        const response = await fetch(OPENAPI_URL, {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            `The specification request returned ${response.status}.`
          )
        }

        const data: unknown = await response.json()

        if (!isRecord(data)) {
          throw new Error('The specification response was not an object.')
        }

        // Scalar treats every string-valued `$ref` as an OpenAPI reference,
        // including literal `$ref` keys inside request example payloads.
        setOpenapiSpec(prepareForScalar(data) as OpenApiDocument)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('Failed to load the OpenAPI specification.', error)
        setLoadError(
          error instanceof Error
            ? error.message
            : 'The specification could not be loaded.'
        )
      }
    }

    loadOpenApiSpec()

    return () => controller.abort()
  }, [requestVersion])

  const retry = () => setRequestVersion((version) => version + 1)

  if (loadError) {
    return <ReferenceError detail={loadError} onRetry={retry} />
  }

  if (!openapiSpec) {
    return (
      <div className="h-[908px] w-full align-middle text-center items-center flex">
        <IconLoader
          size={64}
          strokeWidth={1.5}
          className="m-auto opacity-50 animate-spin"
        />
      </div>
    )
  }

  return (
    <ReferenceErrorBoundary onRetry={retry}>
      <ApiReferenceReact
        configuration={{
          content: openapiSpec,
          hideDownloadButton: false,
          hideModels: true,
          authentication: {
            preferredSecurityScheme: 'ApiKeyAuth',
          },
          darkMode: theme === 'dark',
          layout: 'modern',
          baseServerURL: 'https://rulebricks.com',
        }}
      />
    </ReferenceErrorBoundary>
  )
}

export default ApiReference

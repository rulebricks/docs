import { ApiReferenceReact } from '@scalar/api-reference-react'
import { IconLoader } from '@tabler/icons-react'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useState } from 'react'

function ApiReference() {
  const { theme } = useTheme()
  const [openapiSpec, setOpenapiSpec] = useState(null)

  //

  useEffect(() => {
    if (window?.localStorage.getItem('openapiSpec')) {
      setOpenapiSpec(JSON.parse(window?.localStorage.getItem('openapiSpec')))
    }
    fetch('https://rulebricks.com/api/v1/openapi.json')
      .then((response) => response.json())
      .then((data) => {
        setOpenapiSpec(data)
        // if its different from the current one, reload the page
        if (
          window?.localStorage.getItem('openapiSpec') !== JSON.stringify(data)
        ) {
          window?.localStorage.setItem('openapiSpec', JSON.stringify(data))
          window?.location.reload()
        }
      })
  }, [])
  return !openapiSpec ? (
    <div className="h-[908px] w-full align-middle text-center items-center flex">
      <IconLoader
        size={64}
        strokeWidth={1.5}
        className="m-auto opacity-50 animate-spin"
      />
    </div>
  ) : (
    <ApiReferenceReact
      configuration={{
        spec: {
          content: openapiSpec,
        },
        hideDownloadButton: false,
        hideModels: true,
        authentication: {
          preferredSecurityScheme: 'x-api-key',
          apiKey: {
            token: '',
          },
        },
        darkMode: theme === 'dark',
        layout: 'classic',
      }}
    />
  )
}

export default ApiReference

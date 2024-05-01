import { ApiReferenceReact } from '@scalar/api-reference-react'
import { useTheme } from 'nextra-theme-docs'
import React from 'react'

function ApiReference() {
  const { theme } = useTheme()
  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          url: 'https://rulebricks.com/api/v1/openapi.json',
        },
        hideDownloadButton: true,
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

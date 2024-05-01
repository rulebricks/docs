import { ApiReferenceReact } from '@scalar/api-reference-react'
import { useTheme } from 'nextra-theme-docs'
import React from 'react'

function ApiReference() {
  const { theme } = useTheme()
  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          content: {
            openapi: '3.0.0',
            info: {
              title: 'Rulebricks API',
              summary:
                'Documentation for using and managing rules and flows in Rulebricks.',
              description:
                'Documentation for using and managing rules and flows in Rulebricks.',
              version: '1.0.0',
              termsOfService:
                'https://www.rulebricks.com/legal/terms-of-service',
              contact: {
                name: 'Rulebricks Support',
                url: 'https://www.rulebricks.com/',
                email: 'support@rulebricks.com',
              },
            },
            paths: {
              '/api/v1/solve/{slug}': {
                post: {
                  summary: 'Solve a rule',
                  description:
                    'Executes a single rule identified by a unique slug. The request and response formats are dynamic, dependent on the rule configuration.',
                  tags: ['Rule Execution'],
                  operationId: 'solveRule',
                  parameters: [
                    {
                      name: 'slug',
                      in: 'path',
                      required: true,
                      description: 'The unique identifier for the rule.',
                      schema: {
                        type: 'string',
                      },
                    },
                  ],
                  requestBody: {
                    description:
                      'User defined JSON payload based on rule requirements.',
                    required: true,
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          additionalProperties: true, // Indicates that properties are dynamic
                        },
                      },
                    },
                  },
                  responses: {
                    200: {
                      description:
                        'Rule execution successful. The response structure depends on the rule configuration.',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            additionalProperties: true,
                          },
                        },
                      },
                    },
                    400: {
                      description:
                        'Bad request. Issues with the request format or rule configuration.',
                    },
                    500: {
                      description:
                        'Internal server error. Issue in executing the rule due to server-side problems.',
                    },
                  },
                },
              },
              '/api/v1/solve/bulk/{slug}': {
                post: {
                  summary: 'Bulk solve rules',
                  description:
                    'Executes multiple instances of a rule in bulk, identified by the same slug.',
                  tags: ['Rule Execution'],
                  operationId: 'bulkSolveRules',
                  parameters: [
                    {
                      name: 'slug',
                      in: 'path',
                      required: true,
                      description: 'The unique identifier for the rule.',
                      schema: {
                        type: 'string',
                      },
                    },
                  ],
                  requestBody: {
                    description:
                      'Array of user defined JSON payloads based on the same rule requirements.',
                    required: true,
                    content: {
                      'application/json': {
                        schema: {
                          type: 'array',
                          items: {
                            type: 'object',
                            additionalProperties: true,
                          },
                        },
                      },
                    },
                  },
                  responses: {
                    200: {
                      description:
                        'Bulk rule execution successful. Response is an array of results, each dependent on the rule configuration.',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'array',
                            items: {
                              type: 'object',
                              additionalProperties: true,
                            },
                          },
                        },
                      },
                    },
                    400: {
                      description:
                        'Bad request. Issues with the request format or rule configuration.',
                    },
                    500: {
                      description:
                        'Internal server error. Issue in executing the rules due to server-side problems.',
                    },
                  },
                },
              },
              '/api/v1/solve/parallel': {
                post: {
                  summary: 'Parallel solve rules',
                  description:
                    'Executes multiple rules in parallel based on the provided mapping of rule slugs to payloads.',
                  tags: ['Rule Execution'],
                  operationId: 'parallelSolveRules',
                  requestBody: {
                    description:
                      'A JSON object where each key is a rule slug and the value is the payload for that rule.',
                    required: true,
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          additionalProperties: {
                            type: 'object',
                            additionalProperties: true,
                          },
                        },
                        examples: {
                          parallelRequestExample: {
                            summary:
                              "Example of parallel rule execution request. Note that $rule is a reserved key and should be included as a non-top-level key alongside each rule's intended request payload.",
                            value: {
                              any_key: {
                                $rule: '1ef03ms',
                                alpha: true,
                                beta: 1,
                                charlie: 'request data',
                              },
                              any_key_2: {
                                $rule: 'OvmsYwn',
                                name: 'Bill',
                                age: 30,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  responses: {
                    200: {
                      description:
                        'Parallel rule execution successful. Response is an object with keys representing rule slugs and values being the results.',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            additionalProperties: {
                              type: 'object',
                              additionalProperties: true,
                            },
                          },
                          examples: {
                            parallelResponseExample: {
                              summary:
                                'Example of parallel rule execution response. The response structure mirrors the request structure, stripped of the $rule key and request data.',
                              value: {
                                any_key: {
                                  alpha_is_true: true,
                                },
                                any_key_2: {
                                  eligible: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    400: {
                      description:
                        'Bad request. Issues with the request format or rule configuration.',
                    },
                    500: {
                      description:
                        'Internal server error. Issue in executing the rules due to server-side problems.',
                    },
                  },
                },
              },
              // management endpoints (list, usage, create)
              '/api/v1/list': {
                get: {
                  summary: 'List rules',
                  description: 'List all rules in the organization.',
                  tags: ['Rule Management'],
                  operationId: 'listRules',
                  parameters: [],
                  responses: {
                    200: {
                      description: 'Success',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {},
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '/api/v1/usage': {
                get: {
                  summary: 'Get usage',
                  description:
                    'Get the rule execution usage of your organization.',
                  tags: ['Rule Management'],
                  operationId: 'getUsage',
                  parameters: [],
                  responses: {
                    200: {
                      description: 'Success',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {},
                          },
                        },
                      },
                    },
                  },
                },
              },
              // flow endpoint
              '/api/v1/flow/{slug}': {
                post: {
                  summary: 'Execute a flow',
                  description: 'Execute a flow by its slug.',
                  tags: ['Flow Execution'],
                  operationId: 'executeFlow',
                  parameters: [],
                  requestBody: {
                    description:
                      'A JSON object matching the expected schema of the origin rule of the flow.',
                    required: true,
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {},
                        },
                      },
                    },
                  },
                  responses: {
                    200: {
                      description: 'Flow execution successful.',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {},
                          },
                        },
                      },
                    },
                    400: {
                      description:
                        'Bad request. Issues with the request format, references within a rule in the flow, or general flow configuration.',
                    },
                    500: {
                      description:
                        'Internal server error. Issue in executing the flow due to server-side problems.',
                    },
                  },
                },
              },
            },
            components: {
              securitySchemes: {
                ApiKeyAuth: {
                  // Name of the security scheme
                  type: 'apiKey',
                  in: 'header',
                  name: 'x-api-key', // Name of the header
                },
              },
            },
            externalDocs: {
              description: 'Rulebricks User Guide',
              url: 'https://rulebricks.com/docs',
            },
            security: [
              {
                ApiKeyAuth: [], // Applies the ApiKeyAuth to all endpoints globally; remove if applying per endpoint
              },
            ],
          },
        },
        hideDownloadButton: true,
        hideModels: true,
        authentication: {
          // The OpenAPI file has keys for all security schemes:
          // Which one should be used by default?
          preferredSecurityScheme: 'x-api-key',
          // The `my_custom_security_scheme` security scheme is of type `apiKey`, so prefill the token:
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

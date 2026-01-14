// Shim for openapi-fetch to fix MetaMask SDK compatibility issue
// The MetaMask SDK expects a default export function (createClient)
// We need to avoid circular dependency by directly re-exporting

// This is a minimal createClient implementation that satisfies the MetaMask SDK
function createClient(options) {
  const baseUrl = options?.baseUrl || ''

  return {
    POST: async (path, config) => {
      try {
        const url = `${baseUrl}${path}`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
          body: JSON.stringify(config?.body),
        })

        if (!response.ok) {
          return {
            response,
            error: await response.text(),
          }
        }

        return {
          response,
          data: await response.json(),
        }
      } catch (error) {
        return {
          response: { status: 500 },
          error: error.message,
        }
      }
    },
    GET: async (path, config) => {
      try {
        const url = `${baseUrl}${path}`
        const response = await fetch(url, {
          method: 'GET',
          headers: config?.headers,
        })

        if (!response.ok) {
          return {
            response,
            error: await response.text(),
          }
        }

        return {
          response,
          data: await response.json(),
        }
      } catch (error) {
        return {
          response: { status: 500 },
          error: error.message,
        }
      }
    },
  }
}

export default createClient

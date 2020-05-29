import { createClient } from '@urql/core'
import urljoin from 'url-join'

import { getServerEndPoint } from './getServerEndPoint'

const client = createClient({
  url: urljoin(getServerEndPoint(), 'graphql'),
  requestPolicy: 'network-only',
  fetchOptions: () => {
    return {
      credentials: 'include',
    }
  },
})

const clientWithHeaders = (headers: any) => {
  return createClient({
    url: urljoin(getServerEndPoint(), 'graphql'),
    requestPolicy: 'network-only',
    fetchOptions: () => {
      return {
        headers: {
          cookie: headers.cookie,
        },
        credentials: 'include',
      }
    },
  })
}

export { client, clientWithHeaders }

import urljoin from 'url-join'
import { withUrqlClient } from 'next-urql'

import { getServerEndPoint } from '../utils/getServerEndPoint'

export const withUrql = (Page: any) => {
  return withUrqlClient((context) => ({
    url: urljoin(getServerEndPoint(), 'graphql'),
    requestPolicy: 'network-only',
    fetchOptions: () => {
      return {
        credentials: 'include',
      }
    },
  }))(Page)
}

export default withUrql

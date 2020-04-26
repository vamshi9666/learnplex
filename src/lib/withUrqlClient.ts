import urljoin from 'url-join'
import { getServerEndPoint } from '../utils/getServerEndPoint'
import { withUrqlClient } from 'next-urql'

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

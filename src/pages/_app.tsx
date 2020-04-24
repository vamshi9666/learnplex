import React from 'react'
import { AppProps } from 'next/app'
import { withUrqlClient } from 'next-urql'
import 'antd/dist/antd.css'
import urljoin from 'url-join'

import '../styles/vars.css'
import '../styles/global.css'
import App from '../components/App'
import { getServerEndPoint } from '../utils/getServerEndPoint'

function MyApp({ Component, pageProps }: AppProps) {
  return <App Component={<Component {...pageProps} />} />
}

export default withUrqlClient({
  url: urljoin(getServerEndPoint(), 'graphql'),
  requestPolicy: 'network-only',
})(MyApp)

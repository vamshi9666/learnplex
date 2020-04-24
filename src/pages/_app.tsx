import React from 'react'
import { AppProps } from 'next/app'
import { withUrqlClient } from 'next-urql'
import 'antd/dist/antd.css'

import '../styles/vars.css'
import '../styles/global.css'
import App from '../components/App'

function MyApp({ Component, pageProps }: AppProps) {
  return <App Component={<Component {...pageProps} />} />
}

export default withUrqlClient({
  url:
    process.env.NODE_ENV === 'production'
      ? (process.env.GQL_ENDPOINT as string)
      : 'http://localhost:4000/graphql',
  requestPolicy: 'network-only',
})(MyApp)

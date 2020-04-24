import React from 'react'
import { AppProps } from 'next/app'
import 'antd/dist/antd.css'

import '../styles/vars.css'
import '../styles/global.css'
import App from '../components/App'

function MyApp({ Component, pageProps }: AppProps) {
  return <App Component={<Component {...pageProps} />} />
}

export default MyApp

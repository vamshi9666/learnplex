import React from 'react'
import { AppProps } from 'next/app'
import 'antd/dist/antd.css'
import 'isomorphic-unfetch'
import Router from 'next/router'
import NProgress from 'nprogress'
import 'draft-js/dist/Draft.css'

import '../styles/vars.css'
import '../styles/global.css'
import App from '../components/App'
import withUrql from '../lib/withUrqlClient'

Router.events.on('routeChangeStart', (url) => {
  console.log(`Loading: ${url}`)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
  return <App Component={<Component {...pageProps} />} />
}

export default withUrql(MyApp)

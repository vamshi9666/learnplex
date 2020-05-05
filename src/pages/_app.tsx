import React, { useEffect } from 'react'
import { AppProps } from 'next/app'
import 'isomorphic-unfetch'
import Router from 'next/router'
import NProgress from 'nprogress'

import 'antd/dist/antd.css'
import 'draft-js/dist/Draft.css'
import '../styles/nprogress.css'
import '../styles/vars.css'
import '../styles/global.css'
import '../components/learn/styles/Draft.css'
import App from '../components/App'
import withUrql from '../lib/withUrqlClient'
import { initGA, logPageView } from '../utils/analytics'

Router.events.on('routeChangeStart', (url) => {
  console.log(`Loading: ${url}`)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initGA()
    logPageView()
    Router.events.on('routeChangeComplete', logPageView)
  }, [])

  return <App Component={<Component {...pageProps} />} />
}

export default withUrql(MyApp)

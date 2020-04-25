import React from 'react'
import { AppProps } from 'next/app'
import { withUrqlClient } from 'next-urql'
import 'antd/dist/antd.css'
import urljoin from 'url-join'
import Cookies from 'js-cookie'
import 'isomorphic-unfetch'
import Router from 'next/router'
import NProgress from 'nprogress'

import '../styles/vars.css'
import '../styles/global.css'
import App from '../components/App'
import { getServerEndPoint } from '../utils/getServerEndPoint'
import { parseCookies } from '../lib/parseCookies'

Router.events.on('routeChangeStart', (url) => {
  console.log(`Loading: ${url}`)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
  return <App Component={<Component {...pageProps} />} />
}

export default withUrqlClient((context) => ({
  url: urljoin(getServerEndPoint(), 'graphql'),
  requestPolicy: 'network-only',
  fetchOptions: () => {
    let accessToken
    if (process.browser) {
      accessToken = Cookies.get('accessToken')
    } else {
      const cookies = parseCookies(context?.req)
      accessToken = cookies.accessToken
    }
    return {
      headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' },
    }
  },
}))(MyApp)

import React, { useEffect, useMemo, useState } from 'react'
import { AppProps } from 'next/app'
import 'isomorphic-unfetch'
import Router from 'next/router'
import NProgress from 'nprogress'
import ReactGA from 'react-ga'

import 'react-markdown-editor-lite/lib/index.css'
import 'highlight.js/styles/a11y-light.css'
import '../styles/nprogress.css'
import 'antd/dist/antd.less'
import '../styles/global.less'
import '../styles/lessvars.less'
import withUrql from '../lib/withUrqlClient'
import { initGA, logPageView } from '../utils/analytics'
import { getSiteLayout } from '../components/layouts/SiteLayout'
import { UserContext } from '../lib/contexts/UserContext'
import { User } from '../graphql/types'
import getLoggedInUser from '../utils/getLoggedInUser'

Router.events.on('routeChangeStart', (url) => {
  console.log(`Loading: ${url}`)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

export function reportWebVitals({ id, name, label, value }: any) {
  ReactGA.event({
    category: `Next.js ${label} metric`,
    action: name,
    value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers;
    label: id, // id unique to current page load
    nonInteraction: true, // avoids affecting bounce rate.
  })
}

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState(null as User | null)
  const value = useMemo(() => ({ user, setUser }), [user, setUser])
  useEffect(() => {
    initGA()
    logPageView()
    Router.events.on('routeChangeComplete', logPageView)
  }, [])

  useEffect(() => {
    getLoggedInUser().then((result) => {
      if (!result.error) {
        setUser(result.user)
      }
    })
  }, [])

  const getLayout = (Component as any).getLayout || getSiteLayout

  return (
    <UserContext.Provider value={value}>
      {getLayout(<Component {...pageProps} />)}
    </UserContext.Provider>
  )
}

export default withUrql(MyApp)

import { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { Layout } from 'antd'
import { Header } from './layout'

export default function App({ Component }: { Component: any }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
      </Head>
      <Layout className={'h-100p'}>
        <Layout.Header className={'bg-initial'}>
          <Header />
        </Layout.Header>
        <Layout.Content className={'p-5 h-100p'}>{Component}</Layout.Content>
      </Layout>
    </>
  )
}

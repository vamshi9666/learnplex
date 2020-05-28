import Head from 'next/head'
import React from 'react'
import { useRouter } from 'next/router'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  GET_TITLE,
  OG_URL,
} from '../constants'

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: {
  title?: string
  description?: string
}) {
  const router = useRouter()
  return (
    <Head>
      <title>{GET_TITLE(title)}</title>
      <meta name={'description'} content={description} />
      <meta property={'og:title'} content={GET_TITLE(title)} />
      <meta property={'og:description'} content={description} />
      <meta property={'og:url'} content={`${OG_URL}${router.asPath}`} />
    </Head>
  )
}

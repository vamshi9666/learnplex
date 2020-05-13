import Head from 'next/head'
import React, { FunctionComponent } from 'react'
import { useRouter } from 'next/router'

interface Props {
  title?: string
  description?: string
}

const DEFAULT_DESCRIPTION = 'Master any Technology'

export const SEO: FunctionComponent<Props> = ({
  title = 'Coderplex',
  description = DEFAULT_DESCRIPTION,
}) => {
  const router = useRouter()
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta name={'description'} content={description} />

      <meta
        property="og:title"
        content={`Coderplex - ${title}`}
        key="ogtitle"
      />
      <meta property="og:description" content={description} key="ogdesc" />

      <meta name="twitter:card" content="summary" key="twcard" />
      <meta name="twitter:creator" content={'@coderplex'} key="twhandle" />

      <meta
        property="og:url"
        content={`https://coderplex.in${router.asPath}`}
        key="ogurl"
      />
      <meta property="og:image" content={'/logo.png'} key="ogimage" />
      <meta property="og:site_name" content={'Coderplex'} key="ogsitename" />
      <meta
        property="og:title"
        content={`Coderplex - ${title}`}
        key="ogtitle"
      />
      <meta property="og:description" content={description} key="ogdesc" />

      <title>Coderplex - {title}</title>
    </Head>
  )
}

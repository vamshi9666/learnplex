import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
import React from 'react'
import { DEFAULT_DESCRIPTION, SITE_NAME, TWITTER_HANDLE } from '../constants'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang={'en'}>
        <Head>
          <meta charSet={'utf-8'} />
          <meta name={'application-name'} content={SITE_NAME} />
          <meta name={'twitter:card'} content={'summary'} />
          <meta name={'twitter:creator'} content={TWITTER_HANDLE} />
          <meta
            property={'og:image'}
            content={'/icons/android-chrome-512x512.png'}
          />
          <meta property={'og:type'} content={'website'} />
          <meta name={'author'} content={'Bhanu Teja P'} />
          <meta property={'og:site_name'} content={SITE_NAME} />
          <meta name={'apple-mobile-web-app-capable'} content={'yes'} />
          <meta
            name={'apple-mobile-web-app-status-bar-style'}
            content={'default'}
          />
          <meta name={'apple-mobile-web-app-title'} content={SITE_NAME} />
          <meta name={'description'} content={DEFAULT_DESCRIPTION} />
          <meta property={'og:title'} content={SITE_NAME} />
          <meta property={'og:description'} content={DEFAULT_DESCRIPTION} />
          <meta name={'format-detection'} content={'telephone=no'} />
          <meta name={'mobile-web-app-capable'} content={'yes'} />
          <meta name={'msapplication-TileColor'} content={'#da532c'} />
          <meta name={'theme-color'} content={'#f0f2f5'} />
          <meta
            name={'viewport'}
            content={
              'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
            }
          />
          <link
            rel={'apple-touch-icon'}
            sizes={'180x180'}
            href={'/icons/apple-touch-icon.png'}
          />
          <link
            rel={'icon'}
            type={'image/png'}
            sizes={'32x32'}
            href={'/icons/favicon-32x32.png'}
          />
          <link
            rel={'icon'}
            type={'image/png'}
            sizes={'16x16'}
            href={'/icons/favicon-16x16.png'}
          />
          <link rel={'manifest'} href={'/manifest.json'} />
          <link
            rel={'mask-icon'}
            href={'/icons/safari-pinned-tab.svg'}
            color={'#5bbad5'}
          />
          <link rel={'shortcut icon'} href={'/icons/favicon.ico'} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
if (process.browser) navigator.serviceWorker.register('/sw.js')

import ReactGA from 'react-ga'

export const initGA = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('GA init')
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID as string, {
      gaOptions: {
        siteSpeedSampleRate: 100,
      },
    })
  }
}

export const logPageView = () => {
  console.log(`Logging pageview for ${window.location.pathname}`)
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
}

export const logEvent = (category = '', action = '') => {
  if (category && action) {
    ReactGA.event({ category, action })
  }
}

export const logException = (description = '', fatal = false) => {
  if (description) {
    ReactGA.exception({ description, fatal })
  }
}

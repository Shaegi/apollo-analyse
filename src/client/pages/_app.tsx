import Head from 'next/head'
import { IntlProvider } from 'react-intl'
import { createGlobalStyle, ThemeProvider } from 'styled-components'

const GlobalStyle = createGlobalStyle`
    * {
        font-family: 'Roboto', sans-serif;
        margin: 0;
        list-style: none;
        margin-block-start: 0;
        margin-block-end: 0;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 0;
    }

    h1 {
    padding-bottom: 24px;
  }
    body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    button {
      cursor:pointer;
      background: none;
      border: none;

      &.disabled {
        color: gray;
      }
    }
`

const theme = {
  color: {
    primary: '#0070f3',
    error: '#f30014',
    success: '#398d36'
  },
  size: {
    xxs: '4px',
    xs: '8px',
    s: '12px',
    m: '16px',
    l: '24px'
  }
}

export type Theme = typeof theme

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap" rel="stylesheet" />
      </Head>
      <GlobalStyle />
      <IntlProvider locale="en-GB">
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </IntlProvider>
    </>
  )
}

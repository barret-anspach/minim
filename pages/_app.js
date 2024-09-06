import { MeasuresContextProvider } from '../contexts/MeasuresContext'

import '../styles/globals.css'

function Minim({ Component, pageProps }) {
  return (
    <MeasuresContextProvider>
      <Component {...pageProps} />
    </MeasuresContextProvider>)

}

export default Minim

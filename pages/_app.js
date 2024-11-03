import Head from "next/head";
import { MeasuresContextProvider } from "../contexts/MeasuresContext";

import "../styles/globals.css";

function Minim({ Component, pageProps }) {
  return (
    <MeasuresContextProvider>
      <Head>
        <title>Minim</title>
        <meta name="description" content="Notation renderer" />
      </Head>
      <Component {...pageProps} />
    </MeasuresContextProvider>
  );
}

export default Minim;

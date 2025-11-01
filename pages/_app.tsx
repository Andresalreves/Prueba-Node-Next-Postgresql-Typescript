import type { AppProps } from 'next/app';
import React from 'react';

/**
 * Componente principal de la aplicación Next.js
 * Envuelve todas las páginas
 */
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;

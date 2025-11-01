import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Documento HTML personalizado de Next.js
 */
export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Chatbot con IA para Facebook Messenger" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

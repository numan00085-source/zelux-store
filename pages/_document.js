import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Title/description live here, not in _app.js's next/head, for a
            specific reason verified against this actual deployment: this
            site uses Next.js static export (nextExport: true in the page
            payload), and a next/head <title> set in _app.js only gets
            injected client-side AFTER React hydrates - it is genuinely
            absent from the static HTML Vercel serves before JS runs, which
            is exactly what a fetch (or a crawler/service that doesn't
            execute JS) sees. Confirmed by directly fetching the live page
            and finding no <title> present despite the _app.js change being
            deployed. Next.js's own warning against <title> in _document.js
            is about it conflicting with per-page next/head title overrides
            - this site has none (verified: no other page file uses
            next/head for its own title), so that conflict doesn't apply
            here, and putting the static title where it actually ends up in
            the exported HTML is the correct fix for this specific case. */}
        <title>ZELUX - Premium Streetwear, Footwear & Electronics</title>
        <meta name="description" content="ZELUX is a premium e-commerce destination for curated streetwear, footwear, and electronics. Worldwide shipping, secure checkout, new arrivals weekly." />
        <meta property="og:title" content="ZELUX - Premium Streetwear, Footwear & Electronics" />
        <meta property="og:description" content="Premium streetwear, footwear, and electronics. Worldwide shipping, secure checkout, new arrivals weekly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.zeluxus.com" />
        <meta property="og:image" content="https://www.zeluxus.com/android-chrome-512x512.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="ZELUX - Premium Streetwear, Footwear & Electronics" />
        <meta name="twitter:description" content="Premium streetwear, footwear, and electronics. Worldwide shipping, secure checkout, new arrivals weekly." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#060B16" />
        <meta name="google-site-verification" content="L1bdcgWjqWefyxB_CaZLPXJ_ycIQq9CfuvJoKKyS3j0" />
        <meta name="p:domain_verify" content="51f834c69cc3bff70c983cbf03a22a41"/>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

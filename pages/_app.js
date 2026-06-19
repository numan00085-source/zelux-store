import '../styles/globals.css';
import AdSlot from '../components/AdSlot';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <AdSlot placement="homepage-social-bar" />
    </>
  );
}

import { AppProps } from 'next/app'
import '../styles/global.scss'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Footer } from '../components/Footer'
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react"

const activeChainId = ChainId.BinanceSmartChainMainnet

export default function App({
  Component, pageProps: { session, ...pageProps }
}: AppProps) {
   return (
      <ThirdwebProvider desiredChainId={activeChainId}>
        <ToastContainer autoClose={3000} />
        <Component {...pageProps}/>
        <Footer/>
      </ThirdwebProvider>
  )
}

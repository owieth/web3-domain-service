import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from 'next/app';
import {
  chain, configureChains, createClient, WagmiConfig
} from "wagmi";
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import "../styles/globals.css";
import next from "next";

const { chains, provider } = configureChains(
  [
    chain.polygonMumbai,
  ],
  [
    alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const nextUiDarkTheme = createTheme({
  type: 'dark'
});

function IndexPage({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider theme={nextUiDarkTheme}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme({
          ...darkTheme.accentColors.orange,
          borderRadius: 'large',
        })} coolMode>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </NextUIProvider>

  );
}

export default IndexPage;

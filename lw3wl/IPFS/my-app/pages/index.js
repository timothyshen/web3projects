import {Contract, providers, utils} from "ethers";
import Head from "next/head";
import React, {useEffect, useRef, useState} from "react";
import Web3Modal from "web3modal";
import {abi, NFT_CONTRACT_ADDRESS} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
    const [walletConnected, setWalletConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    const web3ModalRef = useRef();

    const publicMint = async () => {
        try {
            console.log("publicMint");

            const signer = await getProviderOrSigner(true);

            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

            const tx = await nftContract.mint({
                value: utils.parseEther("0.01"),
            });

            setLoading(true);
            await tx.wait();
            setLoading(false);
            window.alert("Minted!");
        } catch (error) {
            console.error(error);
        }
    }

    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (error) {
            console.error(error);
        }
    }

    const getTokenIdsMinted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _tokenIds = await nftContract.tokenIds();
            console.log("tokenIds", _tokenIds);
            setTokenIdsMinted(_tokenIds.toString());
        } catch (err) {
            console.error(err);
        }
    }

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Mumbai network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 80001) {
            window.alert("Change the network to Mumbai");
            throw new Error("Change network to Mumbai");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };


    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting it's `current` value
            // The `current` value is persisted throughout as long as this page is open
            web3ModalRef.current = new Web3Modal({
                network: "mumbai",
                providerOptions: {},
                disableInjectedProvider: false,
            });

            connectWallet();

            getTokenIdsMinted();

            // set an interval to get the number of token Ids minted every 5 seconds
            setInterval(async function () {
                await getTokenIdsMinted();
            }, 5 * 1000);
        }
    }, [walletConnected]);

    /*
      renderButton: Returns a button based on the state of the dapp
    */
    const renderButton = () => {
        // If wallet is not connected, return a button which allows them to connect their wallet
        if (!walletConnected) {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
                </button>
            );
        }

        // If we are currently waiting for something, return a loading button
        if (loading) {
            return <button className={styles.button}>Loading...</button>;
        }

        return (
            <button className={styles.button} onClick={publicMint}>
                Public Mint 🚀
            </button>
        );
    };

    return (
        <div>
            <Head>
                <title>LW3Punks</title>
                <meta name="description" content="LW3Punks-Dapp"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <div className={styles.main}>
                <div>
                    <h1 className={styles.title}>Welcome to LW3Punks!</h1>
                    <div className={styles.description}>
                        Its an NFT collection for LearnWeb3 students.
                    </div>
                    <div className={styles.description}>
                        {tokenIdsMinted}/10 have been minted
                    </div>
                    {renderButton()}
                </div>
                <div>
                    <img className={styles.image} src="./LW3punks/1.png" />
                </div>
            </div>

            <footer className={styles.footer}>Made with &#10084; by LW3Punks</footer>
        </div>
    );
}

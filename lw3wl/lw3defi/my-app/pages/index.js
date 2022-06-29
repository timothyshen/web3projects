import {BigNumber, providers, utils} from "ethers";
import Head from "next/head";
import React, {useEffect, useRef, useState} from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import {addLiquidity, calculateCD} from "../utils/addLiquidity";
import {
    getCDTokensBalance,
    getEtherBalance,
    getLPTokensBalance,
    getReserveOfCDTokens,
} from "../utils/getAmounts";
import {
    getTokensAfterRemove,
    removeLiquidity,
} from "../utils/removeLiquidity";
import {swapTokens, getAmountOfTokensReceivedFromSwap, getAmountOfTokensReveivedFromSwap} from "../utils/swap";

export default function Home() {

    const [loading, setLoading] = useState(false);
    const [liquidityTab, setLiquidityTab] = useState(true);
    const zero = BighNumber.from(0);
    const [ethBalance, setEtherBalance] = useState(zero);
    const [reservedCD, setReservedCD] = useState(zero);
    const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
    const [cdBalance, setCDBalance] = useState(zero);
    const [lpBalance, setLPBalance] = useState(zero);
    const [addEther, setAddEther] = useState(zero);
    const [addCDTokens, setAddCDTokens] = useState(zero);
    const [removeEther, setRemoveEther] = useState(zero);
    const [removeCD, setRemoveCD] = useState(zero);
    const [removeLPTokens, setRemoveLPTokens] = useState("0");
    const [swapAmount, setSwapAmount] = useState("");
    const [tokenToBeReceivedAfterSwap, setTokenToBeReceivedAfterSwap] = useState(zero);
    const [ethSelected, setEthSelected] = useState(true);
    const web3ModalRef = useRef();
    const [walletConnected, setWalletConnected] = useState(false);

    const getAmounts = async () => {
        try {
            const provider = await getProviderOrSigner(false);
            const signer = await getProviderOrSigner(true);
            const address = await signer.getAddress();
            // get the amount of eth in the user's account
            const _ethBalance = await getEtherBalance(provider, address);
            // get the amount of `Crypto Dev` tokens held by the user
            const _cdBalance = await getCDTokensBalance(provider, address);
            // get the amount of `Crypto Dev` LP tokens held by the user
            const _lpBalance = await getLPTokensBalance(provider, address);
            // gets the amount of `CD` tokens that are present in the reserve of the `Exchange contract`
            const _reservedCD = await getReserveOfCDTokens(provider);
            // Get the ether reserves in the contract
            const _ethBalanceContract = await getEtherBalance(provider, null, true);

            setEtherBalance(_ethBalance);
            setCDBalance(_cdBalance);
            setLPBalance(_lpBalance);
            setReservedCD(_reservedCD);
            setReservedCD(_reservedCD);
            setEtherBalanceContract(_ethBalanceContract);

        } catch (err) {
            console.error(err);
        }
    };

    // Swap tokens
    const _swapTokens = async () => {
        try {
            const swapAmountWei = utils.parseEther(swapAmount);
            if (!swapAmountWei) {
                const signer = await getProviderOrSigner(true);
                setLoading(true);

                await swapTokens(
                    signer,
                    swapAmountWei,
                    tokenToBeReceivedAfterSwap,
                    ethSelected,
                );
                setLoading(false);
                await getAmounts();
                setSwapAmount("");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setSwapAmount("")
        }
    }

    const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
        try {
            const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
            if (!_swapAmountWEI.eq(zero)) {
                const provider = await getProviderOrSigner();
                const _ethBalance = await getEtherBalance(provider, null, true);
                const amountOfTokens = await getAmountOfTokensReveivedFromSwap(
                    _swapAmountWEI,
                    provider,
                    ethSelected,
                    _ethBalance,
                    reservedCD
                );
                setTokenToBeReceivedAfterSwap(amountOfTokens);
            } else  {
                setTokenToBeReceivedAfterSwap(zero);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Add liquidity

    const _addLiquidity = async () => {
        try {
            const addEtherWei = utils.parseEther(addEther.toString());
            if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
                const signer = await getProviderOrSigner(true);
                setLoading(true);
                await addLiquidity(signer,  addCDTokens, addEtherWei);
                setLoading(false);
                setAddCDTokens(zero);
                await getAmounts();
            } else {
                setAddCDTokens(zero);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
            setAddCDTokens(zero);
        }
    }

    // Remove liquidity

    const _removeLiquidity = async () => {
        try {

        }
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>

                <p className={styles.description}>
                    Get started by editing{' '}
                    <code className={styles.code}>pages/index.js</code>
                </p>

                <div className={styles.grid}>
                    <a href="https://nextjs.org/docs" className={styles.card}>
                        <h2>Documentation &rarr;</h2>
                        <p>Find in-depth information about Next.js features and API.</p>
                    </a>

                    <a href="https://nextjs.org/learn" className={styles.card}>
                        <h2>Learn &rarr;</h2>
                        <p>Learn about Next.js in an interactive course with quizzes!</p>
                    </a>

                    <a
                        href="https://github.com/vercel/next.js/tree/canary/examples"
                        className={styles.card}
                    >
                        <h2>Examples &rarr;</h2>
                        <p>Discover and deploy boilerplate example Next.js projects.</p>
                    </a>

                    <a
                        href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                        className={styles.card}
                    >
                        <h2>Deploy &rarr;</h2>
                        <p>
                            Instantly deploy your Next.js site to a public URL with Vercel.
                        </p>
                    </a>
                </div>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16}/>
          </span>
                </a>
            </footer>
        </div>
    )
}

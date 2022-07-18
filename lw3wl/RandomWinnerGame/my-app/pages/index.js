import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from "web3modal";
import {abi, RANDOM_GAME_NFT_CONTRACT_ADDRESS} from "../constants";
import {FETCH_CREATED_GAME} from "../queries";
import styles from "../styles/Home.module.css";
import {subgraphQuery} from "../utils";
import {BigNumber, Contract, ethers, providers, utils} from 'ethers'
import React, {useRef, useEffect, useState} from "react";


export default function Home() {
    const zero = BigNumber.from("0");
    const [walletConnected, setWalletConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [entryFee, setEntryFee] = useState(zero);
    const [maxPlayers, setMaxPlayers] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [players, setPlayers] = useState([]);
    const [winner, setWinner] = useState();
    const web3ModelRef = useRef();
    const forceUpdate = React.useReducer(() => ({}), {})[1];


    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (error) {
            console.error(error);
        }
    }

    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModelRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const {chainId} = await web3Provider.getNetwork();
        if (chainId !== 80001) {
            window.alert("Change the network to Mumbai");
            throw new Error("Change the network to Mumbai");
        }

        if (needSigner) {
            const signer = await web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    }

    const startGame = async () => {
        try {
            // Get the signer from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const signer = await getProviderOrSigner(true);
            // We connect to the Contract using a signer because we want the owner to
            // sign the transaction
            const randomGameNFTContract = new Contract(
                RANDOM_GAME_NFT_CONTRACT_ADDRESS,
                abi,
                signer
            );
            setLoading(true);
            // call the startGame function from the contract
            const tx = await randomGameNFTContract.startGame(maxPlayers, entryFee);
            await tx.wait();
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const joinGame = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const randomGameNFTContract = new Contract(
                RANDOM_GAME_NFT_CONTRACT_ADDRESS,
                abi,
                signer
            );
            setLoading(true);
            const tx = await randomGameNFTContract.joinGame({
                value: entryFee
            });
            await tx.wait();
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    const checkIfGameStarted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const randomGameNFTContract = new Contract(
                RANDOM_GAME_NFT_CONTRACT_ADDRESS,
                abi,
                provider
            );
            const _gameStarted = await randomGameNFTContract.gameStarted();
            const _gameArray = await subgraphQuery(FETCH_CREATED_GAME());
            const _game = _gameArray.games[0];
            let _logs = [];

            //init the logs array and query the graph for current gameID
            if (_gameStarted) {
                _logs = [`Game started! ID: ${_game.id}`];
                if (_game.players && _game.players.length > 0) {
                    _logs.push(
                        `${_game.players.length} / ${_game.maxPlayers} already joined 👀 `
                    );
                    _game.players.forEach((player) => {
                        _logs.push(`${player} joined 🏃‍♂️`);
                    });
                }
                setEntryFee(BigNumber.from(_game.entryFee));
                setMaxPlayers(_game.maxPlayers);
            } else if (!gameStarted && _game.winner) {
                _logs = [
                    `Last game has ended with ID: ${_game.id}`,
                    `Winner is: ${_game.winner} 🎉 `,
                    `Waiting for host to start new game....`,
                ];

                setWinner(_game.winner);
            }
            setLogs(_logs);
            setPlayers(_game.players);
            setGameStarted(_gameStarted);
            forceUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const getOwner = async () => {
        try {
            const provider = await getProviderOrSigner();
            const randomGameNFTContract = new Contract(
                RANDOM_GAME_NFT_CONTRACT_ADDRESS,
                abi,
                provider
            );
            const _isOwner = await randomGameNFTContract.owner();
            const signer = await getProviderOrSigner(true);
            const address = await signer.getAddress();
            if (address.toLowerCase() === _owner.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

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
            getOwner();
            checkIfGameStarted();
            setInterval(() => {
                checkIfGameStarted();
            }, 2000);
        }
    }, [walletConnected]);

    /*
      renderButton: Returns a button based on the state of the dapp
    */
    const renderButton = () => {
        // If wallet is not connected, return a button which allows them to connect their wllet
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
        // Render when the game has started
        if (gameStarted) {
            if (players.length === maxPlayers) {
                return (
                    <button className={styles.button} disabled>
                        Choosing winner...
                    </button>
                );
            }
            return (
                <div>
                    <button className={styles.button} onClick={joinGame}>
                        Join Game 🚀
                    </button>
                </div>
            );
        }
        // Start the game
        if (isOwner && !gameStarted) {
            return (
                <div>
                    <input
                        type="number"
                        className={styles.input}
                        onChange={(e) => {
                            // The user will enter the value in ether, we will need to convert
                            // it to WEI using parseEther
                            setEntryFee(
                                e.target.value >= 0
                                    ? utils.parseEther(e.target.value.toString())
                                    : zero
                            );
                        }}
                        placeholder="Entry Fee (ETH)"
                    />
                    <input
                        type="number"
                        className={styles.input}
                        onChange={(e) => {
                            // The user will enter the value in ether, we will need to convert
                            // it to WEI using parseEther
                            setMaxPlayers(e.target.value ?? 0);
                        }}
                        placeholder="Max players"
                    />
                    <button className={styles.button} onClick={startGame}>
                        Start Game 🚀
                    </button>
                </div>
            );
        }
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
                    <h1 className={styles.title}>Welcome to Random Winner Game!</h1>
                    <div className={styles.description}>
                        Its a lottery game where a winner is chosen at random and wins the
                        entire lottery pool
                    </div>
                    {renderButton()}
                    {logs &&
                        logs.map((log, index) => (
                            <div className={styles.log} key={index}>
                                {log}
                            </div>
                        ))}
                </div>
                <div>
                    <img className={styles.image} src="./randomWinner.png"/>
                </div>
            </div>

            <footer className={styles.footer}>
                Made with &#10084; by Your Name
            </footer>
        </div>
    );
}

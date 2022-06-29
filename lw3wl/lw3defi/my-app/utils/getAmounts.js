import {
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import {Contract} from "ethers";


export const getEtherBalance = async (
    provider,
    address,
    contract = false
) => {
    try {
        if (contract) {
            return await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
        } else {
            return await provider.getBalance(address);
        }
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export const getCDTokensBalance = async (provider, address) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
        );
        return await tokenContract.balanceOf(address);
    } catch (err) {
        console.error(err);
    }
}

export const getLPTokensBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        return await exchangeContract.balanceOf(address);
    } catch (err) {
        console.error(err);
    }
}

export const getReserveOfCDTokens = async (provider) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        return await exchangeContract.getReserve();
    } catch (err) {
        console.error(err);
    }
}

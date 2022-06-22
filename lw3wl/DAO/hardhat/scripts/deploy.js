const { ethers } = require('hardhat');
const { CRYPTODEVS_NFT_CONTRACT_ADDRESS } = require('../constants');

async function main() {

    const FakeNFTMarketplace = await ethers.getContractFactory('FakeNFTMarketplace');
    const fackeNFTMarketplace = await FakeNFTMarketplace.deploy();
    await fackeNFTMarketplace.deployed();

    console.log(`FakeNFTMarketplace contract address: ${fackeNFTMarketplace.address}`);

    const CryptoDevsDAO = await ethers.getContractFactory('CryptoDevsDAO');
    const cryptoDevsDAO = await CryptoDevsDAO.deploy(
        fackeNFTMarketplace.address,
        CRYPTODEVS_NFT_CONTRACT_ADDRESS,
        {
            value: ethers.utils.parseEther('0.1'),
        }
    );
    await cryptoDevsDAO.deployed();

    console.log(`CryptoDevsDAO contract address: ${cryptoDevsDAO.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

const { ethers } = require("hardhat");

async function main() {
    const nftContract = await ethers.getContractFactory("GameItem");

    const deloyedNFTContract = await nftContract.deploy();

    console.log("NFT Contract Address:", deloyedNFTContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

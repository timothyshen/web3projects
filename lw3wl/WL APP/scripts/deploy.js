const {ethers} = require('hardhat');

async function main() {
    const whiteListContract = await ethers.getContractFactory('WhiteList');

    const whiteList = await whiteListContract.deploy(10);

    await whiteList.deployed();

    console.log(whiteList.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

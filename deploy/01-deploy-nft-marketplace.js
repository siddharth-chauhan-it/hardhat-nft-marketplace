const { network, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let args = [];

  // Deploy the contract
  log("-----------------------Deploying NftMarketplace!-----------------------");
  const nftMarketplace = await deploy("NftMarketplace", {
    from: deployer,
    log: true,
    args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Verify the contract on testnet or mainnet
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("--------------------------Verifying Contract--------------------------");
    await verify(nftMarketplace.address, args);
  }

  log("-----------------------------End Of Script-----------------------------");
};

module.exports.tags = ["all", "nftmarketplace"];

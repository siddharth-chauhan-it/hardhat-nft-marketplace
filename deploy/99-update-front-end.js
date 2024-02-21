const fs = require("fs");
const { ethers, network } = require("hardhat");
const { FRONT_END_ABI_FILE, FRONT_END_ADDRESSES_FILE } = require("../helper-hardhat-config");

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("---------------Updating Front End Variables!---------------");
    await updateContractAddresses();
    await updateAbi();
  }
};

async function updateContractAddresses() {
  const chainId = network.config.chainId.toString();
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const nftMarketplaceAddress = nftMarketplace.target;
  const contractAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"));
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplaceAddress)) {
      contractAddresses[chainId]["NftMarketplace"].push(nftMarketplaceAddress);
    }
  } else {
    contractAddresses[chainId] = { NftMarketplace: [nftMarketplaceAddress] };
  }
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(contractAddresses));
}

async function updateAbi() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  fs.writeFileSync(`${FRONT_END_ABI_FILE}NftMarketplace.json`, nftMarketplace.interface.formatJson());

  const basicNft = await ethers.getContract("BasicNft");
  fs.writeFileSync(`${FRONT_END_ABI_FILE}BasicNft.json`, basicNft.interface.formatJson());
}

module.exports.tags = ["all", "frontend"];

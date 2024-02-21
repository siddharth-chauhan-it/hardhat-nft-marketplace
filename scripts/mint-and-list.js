const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.parseEther("0.1");

async function mintAndList() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");

  console.log("-----------------------Minting-----------------------");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.logs[0].args.tokenId;

  console.log("--------------------Approving NFT--------------------");
  const approvalTx = await basicNft.approve(nftMarketplace.target, tokenId);
  await approvalTx.wait(1);

  console.log("---------------------Listing NFT---------------------");
  const listingTx = await nftMarketplace.listItem(basicNft.target, tokenId, PRICE);
  await listingTx.wait(1);
  console.log("---------------------NFT Listed!---------------------");

  if (network.config.chainId == 31337) {
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

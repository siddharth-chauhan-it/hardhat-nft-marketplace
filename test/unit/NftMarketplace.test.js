const { assert, expect } = require("chai");
const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFT Marketplace Tests", function () {
      let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
      let deployer, user;

      const PRICE = ethers.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNftContract = await ethers.getContract("BasicNft");
        basicNft = basicNftContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      });

      describe("listItem", function () {
        it("Emits an event after listing an item", async function () {
          expect(await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)).to.emit(
            "ItemListed",
          );
        });

        it("Exclusively items that haven't been listed", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          await expect(
            nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE),
          ).to.be.revertedWithCustomError(
            nftMarketplaceContract,
            `NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId)`,
          );
        });

        it("Exclusively allows owners to list", async function () {
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE),
          ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner");
        });

        it("Needs approvals to list item", async function () {
          await basicNft.approve(ethers.ZeroAddress, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE),
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotApprovedForMarketplace",
          );
        });

        it("Updates listing with seller and price", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployer.address);
        });

        it("Reverts if the price be 0", async () => {
          const ZERO_PRICE = ethers.parseEther("0");
          await expect(
            nftMarketplace.listItem(basicNft.target, TOKEN_ID, ZERO_PRICE),
          ).revertedWithCustomError(nftMarketplace, "NftMarketplace__PriceMustBeAboveZero");
        });
      });

      describe("cancelListing", function () {
        it("Reverts if there is no listing", async function () {
          await expect(
            nftMarketplace.cancelListing(basicNft.target, TOKEN_ID),
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "error NftMarketplace__NotListed(address nftAddress, uint256 tokenId)",
          );
        });

        it("Reverts if anyone but the owner tries to call", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.cancelListing(basicNft.target, TOKEN_ID),
          ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner()");
        });

        it("Emits event and removes listing", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          expect(await nftMarketplace.cancelListing(basicNft.target, TOKEN_ID)).to.emit(
            "ItemCanceled",
          );
          const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
          assert(listing.price.toString() == "0");
        });
      });

      describe("buyItem", function () {
        it("Reverts if the item isnt listed", async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.target, TOKEN_ID),
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotListed(address nftAddress, uint256 tokenId)",
          );
        });

        it("Reverts if the price isn't met", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          await expect(
            nftMarketplace.buyItem(basicNft.target, TOKEN_ID),
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price)",
          );
        });

        it("Transfers the nft to the buyer and updates internal proceeds record", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          expect(await nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: PRICE })).to.emit(
            "ItemBought",
          );
          const newOwner = await basicNft.ownerOf(TOKEN_ID);
          const deployerProceeds = await nftMarketplace.getProceeds(deployer.address);
          assert(newOwner.toString() == user.address);
          assert(deployerProceeds.toString() == PRICE.toString());
        });
      });

      describe("updateListing", function () {
        it("Must be owner and listed", async function () {
          await expect(
            nftMarketplace.updateListing(basicNft.target, TOKEN_ID, PRICE),
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NotListed(address nftAddress, uint256 tokenId)",
          );
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.updateListing(basicNft.target, TOKEN_ID, PRICE),
          ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner()");
        });

        it("Reverts if new price is 0", async function () {
          const updatedPrice = ethers.parseEther("0");
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          await expect(
            nftMarketplace.updateListing(basicNft.target, TOKEN_ID, updatedPrice),
          ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__PriceMustBeAboveZero()");
        });

        it("Updates the price of the item", async function () {
          const updatedPrice = ethers.parseEther("0.2");
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.updateListing(basicNft.target, TOKEN_ID, updatedPrice),
          ).to.emit("ItemListed");
          const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
          assert(listing.price.toString() == updatedPrice.toString());
        });
      });

      describe("withdrawProceeds", function () {
        it("Doesn't allow 0 proceed withdrawls", async function () {
          await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWithCustomError(
            nftMarketplace,
            "NftMarketplace__NoProceeds()",
          );
        });

        it("Withdraws proceeds", async function () {
          await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: PRICE });
          nftMarketplace = nftMarketplaceContract.connect(deployer);

          const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address);
          const deployerBalanceBefore = await ethers.provider.getBalance(deployer);
          const txResponse = await nftMarketplace.withdrawProceeds();
          const transactionReceipt = await txResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const deployerBalanceAfter = await ethers.provider.getBalance(deployer);

          assert(deployerBalanceAfter + gasCost === deployerProceedsBefore + deployerBalanceBefore);
        });
      });
    });

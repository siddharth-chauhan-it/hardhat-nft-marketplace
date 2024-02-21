const networkConfig = {
  31337: {
    name: "hardhat",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000", // 500,000 Gwei
    mintFee: "10000000000000000", // 0.01 ETH
  },
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "8880", // ChainLink VRF subscription ID
    callbackGasLimit: "500000", // 500,000 Gwei || Max is 2,500,000 Gwei for Sepolia
    mintFee: "10000000000000000", // 0.01 ETH
  },
};

const developmentChains = ["hardhat", "localhost"];

const DECIMALS = "18";
const INITIAL_PRICE = "2000000000000000000000";
const FRONT_END_ABI_FILE = "../nextjs-nft-marketplace/src/constants/";
const FRONT_END_ADDRESSES_FILE = "../nextjs-nft-marketplace/src/constants/networkMapping.json";

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
  FRONT_END_ABI_FILE,
  FRONT_END_ADDRESSES_FILE,
};

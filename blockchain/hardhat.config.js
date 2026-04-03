require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 15000000000
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
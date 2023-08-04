const { ethers, network } = require("hardhat")
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config")
const chainId = network.config.chainId
const SUBSCRIPTION_FUND_AMOUNT = ethers.parseEther("2")
const { uploadToPinata } = require("../utils/uploadToPinata")

const IMAGES_PATH = "./images/"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = getNamedAccounts()
    const { deploy } = deployments

    const VRFCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
    )

    console.log("\n\ncreating a subscription...")
    let tx = await VRFCoordinatorV2Mock.createSubscription()
    await tx.wait(1)
    console.log("subscription created.")

    const events = await VRFCoordinatorV2Mock.queryFilter(
        "SubscriptionCreated"
    )
    const subId = events[0].args[0]

    tx = await VRFCoordinatorV2Mock.fundSubscription(
        subId,
        SUBSCRIPTION_FUND_AMOUNT
    )
    console.log("\nfunded subscription.")

    await uploadToPinata(IMAGES_PATH)
    const gasLane = networkConfig[chainId]["keyHash"]
    const callBackGasLimit =
        networkConfig[chainId]["callBackGasLimit"]
    const VRFCoordinatorV2MockAddress =
        VRFCoordinatorV2Mock.getAddress()
    const MINT_FEE = ethers.parseEther("0.1")
}

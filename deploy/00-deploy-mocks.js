const { ethers } = require("hardhat")

const DECIMALS = 18
const INITIAL_ANSWER = 2000

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const BASE_FEE = ethers.parseEther("0.25")
    const GAS_PRICE_LINK = 1e9

    console.log("\ndeploying mocks...")
    let args = [BASE_FEE, GAS_PRICE_LINK]
    const VRFCoordinatorV2Mock = await deploy(
        "VRFCoordinatorV2Mock",
        {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: 1,
        }
    )

    args = [DECIMALS, INITIAL_ANSWER]
    const MockV3Aggregator = await deploy("MockV3Aggregator", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    })

    console.log("Mocks deployed.")
}

module.exports.tags = ["all", "mocks"]

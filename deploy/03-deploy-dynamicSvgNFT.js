const fs = require("fs")
const { ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const lowSvg = fs.readFileSync(
        "./images/dynamicNFT/frown.svg",
        "utf8"
    )
    const highSvg = fs.readFileSync(
        "./images/dynamicNFT/happy.svg",
        "utf8"
    )

    const MockV3Aggregator = await ethers.getContract(
        "MockV3Aggregator",
        deployer
    )

    const MockV3AggregatorAddress =
        await MockV3Aggregator.getAddress()

    const args = [MockV3AggregatorAddress, lowSvg, highSvg]

    console.log("\ndeploying dynamicSvgNFT...")
    const DynamicSvgNFT = await deploy("DynamicSvgNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    })
    console.log(
        "dynamicSvgNFT deployed.\n------------------------"
    )
}

module.exports.tags = ["all", "dynamic-nft"]

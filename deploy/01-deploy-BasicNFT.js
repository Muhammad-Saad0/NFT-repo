const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log("---------------------")
    const args = []
    console.log("deploying BasicNFT...")
    await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations:
            network.config.blockConfirmations || 1,
    })
    console.log("deployed.\n-----------------\n")
}

module.exports.tags = ["all", "BasicNFT"]

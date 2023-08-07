const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const lowSvg = await fs.readFileSync(
        "./images/dynamicNFT/happy.svg",
        "utf8"
    )
    const highSvg = await fs.readFileSync(
        "./images/dynamicNFT/frown.svg",
        "utf8"
    )

    const args = [lowSvg, highSvg]
    console.log(args)
    const DynamicSvgNFT = await deploy("DynamicSvgNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    })

    
    console.log(DynamicSvgNFT)
}

module.exports.tags = ["all", "dynamic-nft"]

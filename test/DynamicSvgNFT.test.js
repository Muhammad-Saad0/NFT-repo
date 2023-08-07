const { expect } = require("chai")
const {
    ethers,
    deployments,
    getNamedAccounts,
} = require("hardhat")
const fs = require("fs")

describe("DynamicSvgNFT", async () => {
    let DynamicSvgNFT, deployer
    const lowSvg = await fs.readFileSync(
        "./images/dynamicNFT/happy.svg",
        "utf8"
    )
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        DynamicSvgNFT = await ethers.getContract(
            "DynamicSvgNFT",
            deployer
        )
    })

    it("does something", async () => {
        const response = await DynamicSvgNFT.svgToImageURI(
            lowSvg
        )
        console.log(response)
    })
})

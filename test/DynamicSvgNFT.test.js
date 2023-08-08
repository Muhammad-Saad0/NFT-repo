const { expect } = require("chai")
const {
    ethers,
    deployments,
    getNamedAccounts,
} = require("hardhat")
const fs = require("fs")
var base64 = require("base-64")

const base64EncodingSvgPrefix = "data:image/svg+xml;base64,"
const base64EncodingJSONPrefix = "data:application/json;base64,"
const lowSvg = fs.readFileSync(
    "./images/dynamicNFT/frown.svg",
    "utf8"
)
const highSvg = fs.readFileSync(
    "./images/dynamicNFT/happy.svg",
    "utf8"
)

const formatTokenURI = (tokenURI) => {
    tokenURI = tokenURI.replace(base64EncodingJSONPrefix, "")
    const tokenURIImage = JSON.parse(
        base64.decode(tokenURI)
    ).image
    const formattedImageString = tokenURIImage.replace(
        base64EncodingSvgPrefix,
        ""
    )
    return formattedImageString
}

describe("testing DynamicSvgNFT", async () => {
    let DynamicSvgNFT, deployer, MockV3Aggregator
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        DynamicSvgNFT = await ethers.getContract(
            "DynamicSvgNFT",
            deployer
        )

        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    it("checks the constructor", async () => {
        let lowSvgFromContrat = await DynamicSvgNFT.getLowSvg()
        lowSvgFromContrat = lowSvgFromContrat.replace(
            "data:image/svg+xml;base64,",
            ""
        )

        let highSvgFromContrat = await DynamicSvgNFT.getHighSvg()
        highSvgFromContrat = highSvgFromContrat.replace(
            "data:image/svg+xml;base64,",
            ""
        )

        const MockV3AggregatorAddress =
            await MockV3Aggregator.getAddress()
        const priceFeed = await DynamicSvgNFT.getPriceFeed()
        expect(priceFeed).to.equal(MockV3AggregatorAddress)
        expect(lowSvgFromContrat).to.equal(base64.encode(lowSvg))
        expect(highSvgFromContrat).to.equal(
            base64.encode(highSvg)
        )
    })

    it("checks the minting of NFT", async () => {
        const tx = await DynamicSvgNFT.mintNFT(2500)
        await tx.wait(1)

        const events = await DynamicSvgNFT.queryFilter(
            "CreatedNFT"
        )
        const highValue = events[0].args.highValue
        const tokenId = events[0].args.tokenId

        expect(tokenId.toString()).to.equal("1")
        expect(highValue.toString()).to.equal("2500")
    })

    it("returns happy face if price is greater than high value", async () => {
        //putting high value as 0 so price will always be greater
        const tx = await DynamicSvgNFT.mintNFT(0)
        await tx.wait(1)

        let tokenURI = await DynamicSvgNFT.tokenURI(1)
        const formattedImageString = formatTokenURI(tokenURI)

        expect(formattedImageString).to.equal(
            base64.encode(highSvg)
        )
    })

    it("returns frowny face if price is lower than high value", async () => {
        //putting high value as a large number so price will always be lower
        const tx = await DynamicSvgNFT.mintNFT(20000)
        await tx.wait(1)

        let tokenURI = await DynamicSvgNFT.tokenURI(1)
        const formattedImageString = formatTokenURI(tokenURI)

        expect(formattedImageString).to.equal(
            base64.encode(lowSvg)
        )
    })
})

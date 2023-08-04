const { expect } = require("chai")
const { ethers, deployments, getNamedAccounts } = require("hardhat")

describe("Unit testing", () => {
    describe("Testing BasicNFT", () => {
        let BasicNFT, deployer
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            BasicNFT = await ethers.getContract("BasicNFT")
        })

        it("checks the deployment", async () => {
            const counter = await BasicNFT.getCounter()
            expect(counter.toString()).to.be.equal("0")
        })

        it("checks if counter increases when NFT is minted", async () => {
            let tx = await BasicNFT.mintNFT()
            await tx.wait(1)

            const counter = await BasicNFT.getCounter()
            expect(counter.toString()).to.be.equal("1")
        })

        it("checks the tokenURI", async () => {
            const tokenURI = await BasicNFT.tokenURI(0)
            expect(tokenURI).to.equal(
                "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG"
            )
        })

        it("checks if event was emitted", async () => {
            await new Promise(async (resolve, reject) => {
                BasicNFT.once("Transfer", async () => {
                    console.log("transfer event was fired")
                    resolve()
                })

                let tx = await BasicNFT.mintNFT()
                await tx.wait(1)
            })
        })

        it("checks the owner of NFT", async () => {
            let tx = await BasicNFT.mintNFT()
            await tx.wait(1)

            const owner = await BasicNFT.ownerOf(0)
            expect(owner).to.equal(deployer)
        })
    })
})

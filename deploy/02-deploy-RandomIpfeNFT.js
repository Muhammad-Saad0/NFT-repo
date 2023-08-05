const { ethers, network } = require("hardhat")
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config")
const chainId = network.config.chainId
const SUBSCRIPTION_FUND_AMOUNT = ethers.parseEther("2")
const {
    uploadFilesToPinata,
    storeTokenUriMetadata,
} = require("../utils/uploadToPinata")
const fs = require("fs")
const path = require("path")

const IMAGES_PATH = "./images/"

const imagesFullPath = path.resolve(IMAGES_PATH)
const files = fs.readdirSync(imagesFullPath)

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    const VRFCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
    )

    console.log("creating a subscription...")
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

    const response = await uploadFilesToPinata(
        imagesFullPath,
        files
    )

    let IpfsTokenURIs = []
    for (const fileIndex in response) {
        const metadata = metadataTemplate
        metadata.name = files[fileIndex].replace(".png", "")
        metadata.description = `an adorable ${files[fileIndex]}`
        metadata.image = `ipfs://${response[fileIndex].IpfsHash}`
        const fileResponse = await storeTokenUriMetadata(
            metadata
        )
        IpfsTokenURIs.push(`ipfs://${fileResponse.IpfsHash}`)
    }

    const gasLane = networkConfig[chainId]["keyHash"]
    const callBackGasLimit =
        networkConfig[chainId]["callBackGasLimit"]
    const VRFCoordinatorV2MockAddress =
        await VRFCoordinatorV2Mock.getAddress()
    const MINT_FEE = ethers.parseEther("0.1")

    const args = [
        MINT_FEE,
        IpfsTokenURIs,
        VRFCoordinatorV2MockAddress,
        subId,
        callBackGasLimit,
        gasLane,
    ]

    console.log(
        "------------------------\ndeploying RandomIpfsNFT..."
    )

    const RandomIpfsNFT = await deploy("RandomIpfsNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations:
            network.config.blockConfirmations || 1,
    })

    console.log("contract deployed.")

    if (chainId == 31337) {
        await VRFCoordinatorV2Mock.addConsumer(
            subId,
            RandomIpfsNFT.address
        )
    }

    console.log("------------------------")
}

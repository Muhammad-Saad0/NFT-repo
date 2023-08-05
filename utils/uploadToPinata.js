require("dotenv").config()
const fs = require("fs")
const path = require("path")

const pinataSDK = require("@pinata/sdk")
const pinata = new pinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET
)

const uploadFilesToPinata = async (imagesFullPath, files) => {
    const options = {
        pinataMetadata: {
            name: "",
        },
    }

    let response = []
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${imagesFullPath}/${files[fileIndex]}`
        )
        let filenameText = files[fileIndex].replace(".png", "")
        options.pinataMetadata.name = filenameText
        try {
            const pinataResponse = await pinata.pinFileToIPFS(
                readableStreamForFile,
                options
            )
            response.push(pinataResponse)
        } catch (error) {
            console.log(error)
        }
    }
    return response
}

async function storeTokenUriMetadata(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
    }
    try {
        const response = await pinata.pinJSONToIPFS(
            metadata,
            options
        )
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { uploadFilesToPinata, storeTokenUriMetadata }

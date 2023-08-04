require("dotenv").config()
const fs = require("fs")
const path = require("path")

const pinataSDK = require("@pinata/sdk")
const pinata = new pinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET
)

const uploadToPinata = async (imagesPath) => {
    return new Promise(async (resolve, reject) => {
        const imagesFullPath = path.resolve(imagesPath)
        const files = fs.readdirSync(imagesFullPath)
        console.log(files)
        console.log(imagesFullPath)

        const options = {
            pinataMetadata: {
                name: "",
            },
            pinataOptions: {
                cidVersion: 0,
            },
        }

        for (const fileIndex in files) {
            const readableStreamForFile = fs.createReadStream(
                `${imagesFullPath}/${files[fileIndex]}`
            )
            let filenameText = files[fileIndex].replace(
                ".png",
                ""
            )
            options.pinataMetadata.name = filenameText
            try {
                await pinata.pinFileToIPFS(
                    readableStreamForFile,
                    options
                )
            } catch (error) {
                console.log(error)
            }
        }
        resolve()
    })
}

module.exports = { uploadToPinata }

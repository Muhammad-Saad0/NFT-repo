// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";

contract DynamicSvgNFT is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodingSvgPrefix =
        "data:image/svg+xml;base64,";
    string private constant base64EncodingJSONPrefix =
        "data:application/json;base64,";
    AggregatorV3Interface private immutable i_priceFeed;
    mapping(uint256 => int256) public tokenIdToHighValue;

    //events
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicNFT", "DNFT") {
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory encodedSvg = Base64.encode(bytes(svg));
        return string(abi.encodePacked(base64EncodingSvgPrefix, encodedSvg));
    }

    function mintNFT(int256 highValue) public {
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(msg.sender, s_tokenCounter);
        tokenIdToHighValue[s_tokenCounter] = highValue;

        emit CreatedNFT(s_tokenCounter, highValue);
    }

    //overriding tokenURI function from ERC721
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Non-existent tokenId");

        string memory imageURI = i_lowImageURI;
        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        if (price >= tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }
        return
            string(
                abi.encodePacked(
                    base64EncodingJSONPrefix,
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSvg() public view returns (string memory) {
        return i_lowImageURI;
    }

    function getHighSvg() public view returns (string memory) {
        return i_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getHighValue(uint256 tokenId) public view returns (int256) {
        return tokenIdToHighValue[tokenId];
    }
}

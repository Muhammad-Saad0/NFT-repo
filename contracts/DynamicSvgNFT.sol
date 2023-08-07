// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNFT is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodingSvgPrefix =
        "data:image/svg+xml;base64,";

    constructor(
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicNFT", "DNFT") {
        i_lowImageURI = lowSvg;
        i_highImageURI = highSvg;
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory encodedSvg = Base64.encode(bytes(svg));
        return string(abi.encodePacked(base64EncodingSvgPrefix, encodedSvg));
    }

    function mintNFT() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract RandomIpfsNFT is ERC721URIStorage, VRFConsumerBaseV2 {
    //state variables
    uint256 private immutable i_mintFee;
    uint256 private s_tokenCounter;
    string[3] internal i_IpfsURIArray;
    VRFCoordinatorV2Interface private immutable i_COORDINATOR;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_gasLane;

    //constants
    uint16 private constant MINIMUM_REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //errors
    error RandomIpfsNFT__NotEnoughEth();

    //events
    event RandomWordsFulfilled();
    event NFTMintRequested();

    constructor(
        uint256 _mintFee,
        string[3] memory _IpfsURIArray,
        address _VRFCoordinatorAddress,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        bytes32 _gasLane
    ) VRFConsumerBaseV2(_VRFCoordinatorAddress) ERC721("DogieNFT", "PUG") {
        i_mintFee = _mintFee;
        i_IpfsURIArray = _IpfsURIArray;
        i_COORDINATOR = VRFCoordinatorV2Interface(_VRFCoordinatorAddress);
        s_tokenCounter = 0;
        i_subscriptionId = _subscriptionId;
        i_callbackGasLimit = _callbackGasLimit;
        i_gasLane = _gasLane;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256 randomNumber = _randomWords[0];
        emit RandomWordsFulfilled();
    }

    function requestMintNFT() public payable returns (uint256) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNFT__NotEnoughEth();
        }

        uint256 requestId = i_COORDINATOR.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            MINIMUM_REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit NFTMintRequested();
        return requestId;
    }

    function mintNFT() public payable {
        _safeMint(msg.sender, s_tokenCounter);
        _setTokenURI(s_tokenCounter, "");
    }
}

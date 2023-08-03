// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RandomIpfsNFT is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    //types
    enum DogBreed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //state variables
    uint256 private immutable i_mintFee;
    uint256 private s_tokenCounter;
    string[3] internal i_IpfsURIArray;
    VRFCoordinatorV2Interface private immutable i_COORDINATOR;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_gasLane;
    mapping(uint256 => address) private requestIdtoSender;

    //constants
    uint16 private constant MINIMUM_REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 internal constant MAX_CHANCE_VALUE = 100;

    //errors
    error RandomIpfsNFT__NotEnoughEth();
    error RandomIpfsNft__RangeOutOfBounds();
    error RandomIpfsNft__TransferFailed();

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
        address ownerOfNft = requestIdtoSender[_requestId];
        uint256 randomNumber = _randomWords[0] % MAX_CHANCE_VALUE;
        DogBreed dogBreed = getRandomDogBreed(randomNumber);

        _safeMint(ownerOfNft, s_tokenCounter);
        _setTokenURI(s_tokenCounter, i_IpfsURIArray[uint256(dogBreed)]);
        s_tokenCounter++;
        emit RandomWordsFulfilled();
    }

    function getRandomDogBreed(uint256 randomNumber) public pure returns (DogBreed) {
        uint256[3] memory chanceArray = getChanceArray();
        uint256 helperVariable = 0;
        for (uint i = 0; i < chanceArray.length; i++) {
            if (randomNumber >= helperVariable && randomNumber < chanceArray[i]) {
                return DogBreed(i);
            }
            helperVariable = chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
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

        requestIdtoSender[requestId] = msg.sender;
        emit NFTMintRequested();
        return requestId;
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 40, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getIpfsToken(uint256 index) public view returns (string memory) {
        return i_IpfsURIArray[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}

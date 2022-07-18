pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RandomWinnerGame is Ownable, VRFConsumerBase {

    //chainlink variables
    uint256 public fee;
    bytes32 public keyHash;

    address[] public players;

    uint8 maxplayers;
    bool public gameStarted;
    uint256 entryFee;
    uint256 public gameId;

    //emitted when game starts
    event GameStarted(uint256 gameId, uint8 maxplayers, uint256 entryFee);
    //emitted when game ends
    event GameEnded(uint256 gameId, address winner, bytes32 requestId);
    //emitted when a player enters the game
    event PlayerEntered(uint256 gameId, address player);

    /**
    * constructor inherits a VRFConsumerBase and initiates the values for keyHash, fee and gameStarted
    * @param vrfCoordinator address of VRFCoordinator contract
    * @param linkToken address of LINK token contract
    * @param vrfFee the amount of LINK to send with the request
    * @param vrfKeyHash ID of public key against which randomness is generated
    */
    constructor(address vrfCoordinator, address linkToken,
        bytes32 vrfKeyHash, uint256 vrfFee)
    VRFConsumerBase(vrfCoordinator, linkToken) {
        keyHash = vrfKeyHash;
        fee = vrfFee;
        gameStarted = false;
    }
    function startGame(uint8 _maxPlayers, uint256 _entryFee) public onlyOwner{
        require(!gameStarted, "Game is currently running");
        delete players;
        maxplayers = _maxPlayers;
        gameStarted = true;
        entryFee = _entryFee;
        gameId += 1;
        emit GameStarted(gameId, maxplayers, entryFee);
    }

    function joinGame() public payable{
        require(gameStarted, "Game is not running");
        require(players.length < maxplayers, "Game is full");
        require(msg.value == entryFee, "Not enough LINK");
        players.push(msg.sender);
        emit PlayerEntered(gameId, msg.sender);
        if(players.length == maxplayers) {
            getRandomWinner();
        }
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal virtual override {
        uint256 winnerIndex = randomness % players.length;
        address winner = players[winnerIndex];
        (bool sent, ) = winner.call{value: address(this).balance}("");
        emit GameEnded(gameId, winner, requestId);
        gameStarted = false;
    }

    function getRandomWinner() private returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}

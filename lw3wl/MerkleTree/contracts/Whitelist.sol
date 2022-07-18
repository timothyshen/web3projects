pragma solidity ^0.8.4;

import "@openzappelin/contracts/utils/cryptography/MerkleProof.sol";


contract Whitelist {

    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) public {
        merkleRoot = _merkleRoot;
    }

    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowanceToMint) view public returns (bool) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, maxAllowanceToMint));
        bool verified = MerkleProof.verify(proof, merkleRoot, leaf);
        return verified;
    }
}

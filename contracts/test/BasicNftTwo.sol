// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNftTwo is ERC721 {
  string public constant TOKEN_URI =
    "ipfs://QmVhuk7SmSGv5k6LSh2aF3HSHpTB9NGocLmhg32yq6X1oc";

  uint256 private s_tokenCounter;

  event DogMinted(uint256 indexed tokenId);

  constructor() ERC721("Doggie", "DOG") {
    s_tokenCounter = 0;
  }

  function mintNft() public {
    _safeMint(msg.sender, s_tokenCounter);
    emit DogMinted(s_tokenCounter);
    s_tokenCounter = s_tokenCounter + 1;
  }

  function tokenURI(
    uint256 /* tokenId */
  ) public pure override returns (string memory) {
    return TOKEN_URI;
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}

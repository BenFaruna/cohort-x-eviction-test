// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721 {

    uint _tokenId;

    event NFTBought(address buyer, uint nftId, address prevOwner);

    constructor() ERC721("NFTMarketplace", "NFTM") {}

    mapping(uint => uint) nftPrices;
    mapping(uint => address) nftOwner;

    function setNftPrice(uint _nftId, uint _price) public {
        require(msg.sender == nftOwner[_nftId], "cannot set price for nft you don't own");
        nftPrices[_nftId] = _price;
        approve(address(this), _nftId);
    }

    function buyNft(uint _nftId) public payable {
        address _prevOwner = nftOwner[_nftId];
        require(msg.value >= nftPrices[_nftId], "insufficient funds");
        nftOwner[_nftId] = msg.sender;
        payable(_prevOwner).transfer(msg.value);
        this.safeTransferFrom(_prevOwner, msg.sender, _nftId);

        emit NFTBought(msg.sender, _nftId, _prevOwner);
    }

    function mint() public {
        _tokenId = _tokenId + 1;
        _mint(msg.sender, _tokenId);
        nftOwner[_tokenId] = msg.sender;
    }

    function _baseURI() internal pure override returns (string memory){
        return "https://gateway.pinata.cloud/ipfs/QmTCFfPxGqxDJaqEpfJJL8K7RRrUGpX3JLipxgsHVkzJ65/";
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Item {
        uint256 itemId;
        address payable seller;
        address payable creator;
        address owner;
        uint256 price;
        uint256 royaltyPercentage; // e.g., 5 for 5%
        string metadataURI;
        string category;
        bool isAuction;
        uint256 auctionEndTime;
        uint256 highestBid;
        address payable highestBidder;
        bool sold;
    }

    uint256 public itemCount;
    mapping(uint256 => Item) public items;

    event ItemListed(
        uint256 indexed itemId,
        address indexed seller,
        address indexed creator,
        uint256 price,
        uint256 royaltyPercentage,
        string metadataURI,
        string category,
        bool isAuction,
        uint256 auctionEndTime
    );

    event ItemSold(
        uint256 indexed itemId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event NewBid(
        uint256 indexed itemId,
        address indexed bidder,
        uint256 amount
    );

    function listItem(
        string memory _metadataURI,
        uint256 _price,
        uint256 _royaltyPercentage,
        string memory _category,
        bool _isAuction,
        uint256 _auctionDuration // in seconds
    ) public {
        require(_price > 0, "Price must be at least 1 wei");
        require(_royaltyPercentage <= 20, "Royalty cannot exceed 20%");

        itemCount++;
        uint256 auctionEndTime = _isAuction ? block.timestamp + _auctionDuration : 0;

        items[itemCount] = Item(
            itemCount,
            payable(msg.sender),
            payable(msg.sender),
            address(0),
            _price,
            _royaltyPercentage,
            _metadataURI,
            _category,
            _isAuction,
            auctionEndTime,
            _isAuction ? _price : 0,
            payable(address(0)),
            false
        );

        emit ItemListed(
            itemCount,
            msg.sender,
            msg.sender,
            _price,
            _royaltyPercentage,
            _metadataURI,
            _category,
            _isAuction,
            auctionEndTime
        );
    }

    function resellItem(
        uint256 _itemId, 
        uint256 _price, 
        bool _isAuction, 
        uint256 _auctionDuration
    ) public {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        require(item.sold, "Item must be sold first to resell");
        require(item.owner == msg.sender, "Only owner can resell item");
        require(_price > 0, "Price must be at least 1 wei");

        item.seller = payable(msg.sender);
        item.owner = address(0);
        item.sold = false;
        item.price = _price;
        item.isAuction = _isAuction;
        item.auctionEndTime = _isAuction ? block.timestamp + _auctionDuration : 0;
        item.highestBid = _isAuction ? _price : 0;
        item.highestBidder = payable(address(0));

        emit ItemListed(
            _itemId,
            msg.sender,
            item.creator,
            _price,
            item.royaltyPercentage,
            item.metadataURI,
            item.category,
            _isAuction,
            item.auctionEndTime
        );
    }

    function buyItem(uint256 _itemId) public payable nonReentrant {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        require(!item.isAuction, "Item is for auction, please bid instead");
        require(msg.value == item.price, "Please submit the asking price");
        require(!item.sold, "Item already sold");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        uint256 royaltyAmount = (msg.value * item.royaltyPercentage) / 100;
        uint256 sellerAmount = msg.value - royaltyAmount;

        item.creator.transfer(royaltyAmount);
        item.seller.transfer(sellerAmount);

        item.owner = msg.sender;
        item.sold = true;

        emit ItemSold(_itemId, item.seller, msg.sender, item.price);
    }

    function placeBid(uint256 _itemId) public payable nonReentrant {
        Item storage item = items[_itemId];
        require(item.isAuction, "Item is not for auction");
        require(block.timestamp < item.auctionEndTime, "Auction has ended");
        require(msg.value > item.highestBid, "Bid must be higher than current highest bid");

        // Refund the previous highest bidder
        if (item.highestBidder != address(0)) {
            item.highestBidder.transfer(item.highestBid);
        }

        item.highestBid = msg.value;
        item.highestBidder = payable(msg.sender);

        emit NewBid(_itemId, msg.sender, msg.value);
    }

    function endAuction(uint256 _itemId) public nonReentrant {
        Item storage item = items[_itemId];
        require(item.isAuction, "Item is not for auction");
        require(block.timestamp >= item.auctionEndTime, "Auction has not ended yet");
        require(!item.sold, "Auction already finalized");

        if (item.highestBidder != address(0)) {
            uint256 royaltyAmount = (item.highestBid * item.royaltyPercentage) / 100;
            uint256 sellerAmount = item.highestBid - royaltyAmount;

            item.creator.transfer(royaltyAmount);
            item.seller.transfer(sellerAmount);

            item.owner = item.highestBidder;
        }

        item.sold = true;
        emit ItemSold(_itemId, item.seller, item.highestBidder, item.highestBid);
    }

    function fetchItemById(uint256 _itemId) public view returns (Item memory) {
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        return items[_itemId];
    }

    function fetchMarketItems() public view returns (Item[] memory) {
        uint256 unsoldItemCount = 0;
        for (uint i = 1; i <= itemCount; i++) {
            if (!items[i].sold) {
                unsoldItemCount++;
            }
        }

        Item[] memory marketItems = new Item[](unsoldItemCount);
        uint currentIndex = 0;
        for (uint i = 1; i <= itemCount; i++) {
            if (!items[i].sold) {
                marketItems[currentIndex] = items[i];
                currentIndex++;
            }
        }
        return marketItems;
    }

    function fetchMyItems() public view returns (Item[] memory) {
        uint256 myItemCount = 0;
        for (uint i = 1; i <= itemCount; i++) {
            if (items[i].owner == msg.sender || items[i].seller == msg.sender) {
                myItemCount++;
            }
        }

        Item[] memory myItems = new Item[](myItemCount);
        uint currentIndex = 0;
        for (uint i = 1; i <= itemCount; i++) {
            if (items[i].owner == msg.sender || items[i].seller == msg.sender) {
                myItems[currentIndex] = items[i];
                currentIndex++;
            }
        }
        return myItems;
    }
}

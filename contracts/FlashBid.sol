// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * FlashBid — Kampüs Fırsat Blockchain Contract
 * Monad Testnet üzerinde çalışan satın alım ve stok yönetimi
 */

contract FlashBid {
    // Deal (Fırsat) yapısı
    struct Deal {
        uint256 id;
        string productName;
        uint256 currentPrice;
        uint256 minPrice;
        uint256 stock;
        uint256 expiresAt;
        address seller;
        bool active;
    }

    // Ticket (Bilet) yapısı
    struct Ticket {
        uint256 id;
        uint256 dealId;
        address buyer;
        uint256 amount;
        uint256 purchasedAt;
        string deliveryCode;
        bool used;
    }

    // State variables
    mapping(uint256 => Deal) public deals;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;

    uint256 public dealCounter = 0;
    uint256 public ticketCounter = 0;
    address public owner;

    // Events
    event DealCreated(
        uint256 indexed dealId,
        string productName,
        uint256 initialPrice,
        uint256 stock
    );
    event DealPurchased(
        uint256 indexed dealId,
        address indexed buyer,
        uint256 amount,
        uint256 ticketId
    );
    event PriceUpdated(uint256 indexed dealId, uint256 newPrice);
    event StockUpdated(uint256 indexed dealId, uint256 newStock);

    constructor() {
        owner = msg.sender;
    }

    // Fırsat oluştur
    function createDeal(
        string memory _productName,
        uint256 _initialPrice,
        uint256 _minPrice,
        uint256 _stock,
        uint256 _durationSeconds
    ) external {
        require(msg.sender == owner, "Only owner can create deals");
        require(_initialPrice > _minPrice, "Initial price must be > min price");
        require(_stock > 0, "Stock must be > 0");

        uint256 dealId = dealCounter++;
        deals[dealId] = Deal({
            id: dealId,
            productName: _productName,
            currentPrice: _initialPrice,
            minPrice: _minPrice,
            stock: _stock,
            expiresAt: block.timestamp + _durationSeconds,
            seller: msg.sender,
            active: true
        });

        emit DealCreated(dealId, _productName, _initialPrice, _stock);
    }

    // Fiyat güncelle (her saniye 1 MONAD azalt)
    function updatePrice(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(deal.active, "Deal not active");
        require(block.timestamp < deal.expiresAt, "Deal expired");

        uint256 timeElapsed = block.timestamp - (deal.expiresAt - 480); // 8 dakika başlangıç
        uint256 priceDecrease = timeElapsed / 1 seconds; // Her saniye 1 wei azalt

        uint256 newPrice = deal.currentPrice > priceDecrease
            ? deal.currentPrice - priceDecrease
            : deal.minPrice;

        if (newPrice != deal.currentPrice) {
            deal.currentPrice = newPrice;
            emit PriceUpdated(_dealId, newPrice);
        }

        // Süre bittiyse deal'i kapat
        if (block.timestamp >= deal.expiresAt) {
            deal.active = false;
        }
    }

    // Satın al
    function purchaseDeal(uint256 _dealId, string memory _deliveryCode)
        external
        payable
        returns (uint256)
    {
        Deal storage deal = deals[_dealId];
        require(deal.active, "Deal not active");
        require(deal.stock > 0, "Out of stock");
        require(block.timestamp < deal.expiresAt, "Deal expired");
        require(msg.value >= deal.currentPrice, "Insufficient payment");

        // Stok azalt
        deal.stock -= 1;
        emit StockUpdated(_dealId, deal.stock);

        // Bilet oluştur
        uint256 ticketId = ticketCounter++;
        tickets[ticketId] = Ticket({
            id: ticketId,
            dealId: _dealId,
            buyer: msg.sender,
            amount: msg.value,
            purchasedAt: block.timestamp,
            deliveryCode: _deliveryCode,
            used: false
        });

        userTickets[msg.sender].push(ticketId);

        // Para gönder
        payable(deal.seller).transfer(msg.value);

        emit DealPurchased(_dealId, msg.sender, msg.value, ticketId);

        return ticketId;
    }

    // Bilet kullan
    function useTicket(uint256 _ticketId) external {
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.buyer == msg.sender, "Not ticket owner");
        require(!ticket.used, "Ticket already used");

        ticket.used = true;
    }

    // Kullanıcının biletlerini al
    function getUserTickets(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userTickets[_user];
    }

    // Deal bilgisini al
    function getDeal(uint256 _dealId)
        external
        view
        returns (Deal memory)
    {
        return deals[_dealId];
    }

    // Ticket bilgisini al
    function getTicket(uint256 _ticketId)
        external
        view
        returns (Ticket memory)
    {
        return tickets[_ticketId];
    }
}

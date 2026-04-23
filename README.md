# ⚡ # ⚡ # ⚡ KampusBid

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Monad](https://img.shields.io/badge/Built%20on-Monad-836ef1.svg)](https://monad.xyz)
[![Frontend: Tailwind](https://img.shields.io/badge/Frontend-TailwindCSS-38bdf8.svg)](https://tailwindcss.com)

**KampusBid** is a real-time **Dutch Auction** platform built to leverage the ultra-low latency and high throughput of the Monad blockchain. It offers a "flash" trading experience where prices drop second-by-second, rewarding the fastest bidders.

---

## ✨ Features

-   🚀 **Ultra-Fast Bidding:** CLI bot and Web UI optimized for Monad's high-speed execution.
-   📉 **Dutch Auction Model:** Prices drop linearly from start to finish. Catch the "Flash-Bid" the moment the price hits your target!
-   💎 **Modern Glassmorphism UI:** A futuristic, dark-mode web interface built with Tailwind CSS.
-   🛡️ **Secure Smart Contract:** Protected by `ReentrancyGuard`, featuring automatic refunds and gas-optimized Solidity architecture.
-   📊 **Real-Time Dashboard:** Monitor all live auctions simultaneously via a dedicated terminal panel or the web app.

---

## 🛠 Tech Stack

-   **Smart Contract:** Solidity 0.8.24
-   **Blockchain:** Monad (Testnet)
-   **Interaction:** Ethers.js v6
-   **Frontend:** HTML5, Tailwind CSS, Glassmorphism Design
-   **Backend/Scripts:** Node.js (ESM)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/monad-flashbid.git
cd monad-flashbid
npm install
```

### 2. Configuration
Create a `.env` file and provide your credentials:
```env
PRIVATE_KEY=your_private_key_here
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 3. Usage

#### 🌐 Web Interface
Open `index.html` in your browser or start a local server:
```bash
# Using a local server is recommended for wallet interactions
npx serve .
```

#### 🖥 Terminal (CLI) Mode
To watch auctions live:
```bash
node multi-panel.js
```
To send a fast bid:
```bash
node multi-bid.js <AUCTION_ID>
```

---

## 📜 Smart Contract

Contract Address: `0xF70Fa61EA16646ed8AE29620E6c442659013a5D9` (Monad Testnet)

Core Functions:
- `createAuction`: Starts a new auction (Owner only).
- `getCurrentPrice`: Calculates the time-based decreasing price.
- `bid`: Executes the purchase, handles the product transfer, and refunds excess payment.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`).
3. Commit your Changes (`git commit -m 'Add some amazing feature'`).
4. Push to the Branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## ⚖️ License

Distributed under the **MIT** License.

---

> **Note:** This project is a prototype and educational example for developers in the Monad ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Monad](https://img.shields.io/badge/Built%20on-Monad-836ef1.svg)](https://monad.xyz)
[![Frontend: Tailwind](https://img.shields.io/badge/Frontend-TailwindCSS-38bdf8.svg)](https://tailwindcss.com)

**Monad Flash-Bid** is a real-time **Dutch Auction** platform built to leverage the ultra-low latency and high throughput of the Monad blockchain. It offers a "flash" trading experience where prices drop second-by-second, rewarding the fastest bidders.

---

## ✨ Features

-   🚀 **Ultra-Fast Bidding:** CLI bot and Web UI optimized for Monad's high-speed execution.
-   📉 **Dutch Auction Model:** Prices drop linearly from start to finish. Catch the "Flash-Bid" the moment the price hits your target!
-   💎 **Modern Glassmorphism UI:** A futuristic, dark-mode web interface built with Tailwind CSS.
-   🛡️ **Secure Smart Contract:** Protected by `ReentrancyGuard`, featuring automatic refunds and gas-optimized Solidity architecture.
-   📊 **Real-Time Dashboard:** Monitor all live auctions simultaneously via a dedicated terminal panel or the web app.

---

## 🛠 Tech Stack

-   **Smart Contract:** Solidity 0.8.24
-   **Blockchain:** Monad (Testnet)
-   **Interaction:** Ethers.js v6
-   **Frontend:** HTML5, Tailwind CSS, Glassmorphism Design
-   **Backend/Scripts:** Node.js (ESM)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/monad-flashbid.git
cd monad-flashbid
npm install
```

### 2. Configuration
Create a `.env` file and provide your credentials:
```env
PRIVATE_KEY=your_private_key_here
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 3. Usage

#### 🌐 Web Interface
Open `index.html` in your browser or start a local server:
```bash
# Using a local server is recommended for wallet interactions
npx serve .
```

#### 🖥 Terminal (CLI) Mode
To watch auctions live:
```bash
node multi-panel.js
```
To send a fast bid:
```bash
node multi-bid.js <AUCTION_ID>
```

---

## 📜 Smart Contract

Contract Address: `0xF70Fa61EA16646ed8AE29620E6c442659013a5D9` (Monad Testnet)

Core Functions:
- `createAuction`: Starts a new auction (Owner only).
- `getCurrentPrice`: Calculates the time-based decreasing price.
- `bid`: Executes the purchase, handles the product transfer, and refunds excess payment.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`).
3. Commit your Changes (`git commit -m 'Add some amazing feature'`).
4. Push to the Branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## ⚖️ License

Distributed under the **MIT** License.

---

> **Note:** This project is a prototype and educational example for developers in the Monad ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Monad](https://img.shields.io/badge/Built%20on-Monad-836ef1.svg)](https://monad.xyz)
[![Frontend: Tailwind](https://img.shields.io/badge/Frontend-TailwindCSS-38bdf8.svg)](https://tailwindcss.com)

**Monad Flash-Bid** is a real-time **Dutch Auction** platform built to leverage the ultra-low latency and high throughput of the Monad blockchain. It offers a "flash" trading experience where prices drop second-by-second, rewarding the fastest bidders.

---

## ✨ Features

-   🚀 **Ultra-Fast Bidding:** CLI bot and Web UI optimized for Monad's high-speed execution.
-   📉 **Dutch Auction Model:** Prices drop linearly from start to finish. Catch the "Flash-Bid" the moment the price hits your target!
-   💎 **Modern Glassmorphism UI:** A futuristic, dark-mode web interface built with Tailwind CSS.
-   🛡️ **Secure Smart Contract:** Protected by `ReentrancyGuard`, featuring automatic refunds and gas-optimized Solidity architecture.
-   📊 **Real-Time Dashboard:** Monitor all live auctions simultaneously via a dedicated terminal panel or the web app.

---

## 🛠 Tech Stack

-   **Smart Contract:** Solidity 0.8.24
-   **Blockchain:** Monad (Testnet)
-   **Interaction:** Ethers.js v6
-   **Frontend:** HTML5, Tailwind CSS, Glassmorphism Design
-   **Backend/Scripts:** Node.js (ESM)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/monad-flashbid.git
cd monad-flashbid
npm install
```

### 2. Configuration
Create a `.env` file and provide your credentials:
```env
PRIVATE_KEY=your_private_key_here
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 3. Usage

#### 🌐 Web Interface
Open `index.html` in your browser or start a local server:
```bash
# Using a local server is recommended for wallet interactions
npx serve .
```

#### 🖥 Terminal (CLI) Mode
To watch auctions live:
```bash
node multi-panel.js
```
To send a fast bid:
```bash
node multi-bid.js <AUCTION_ID>
```

---

## 📜 Smart Contract

Contract Address: `0xF70Fa61EA16646ed8AE29620E6c442659013a5D9` (Monad Testnet)

Core Functions:
- `createAuction`: Starts a new auction (Owner only).
- `getCurrentPrice`: Calculates the time-based decreasing price.
- `bid`: Executes the purchase, handles the product transfer, and refunds excess payment.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`).
3. Commit your Changes (`git commit -m 'Add some amazing feature'`).
4. Push to the Branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## ⚖️ License

Distributed under the **MIT** License.

---

> **Note:** This project is a prototype and educational example for developers in the Monad ecosystem.

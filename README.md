# 💎 ClearSource - Pharmaceutical Supply Chain DApp

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-363636.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![Web3](https://img.shields.io/badge/Web3.js-1.10.0-F16822.svg)](https://web3js.readthedocs.io/)

> **ClearSource** - A premium, production-ready blockchain-based pharmaceutical supply chain management system. Crystal-clear tracking and management ensuring complete transparency, security, and traceability from source to consumer.

[🎥 Demo Video](https://www.youtube.com/watch?v=2e-NGuT1PnY) | [📖 Full Documentation](./docs/DEPLOYMENT.md) | [📱 QR Code Guide](./docs/QR_COMPLETE_GUIDE.md)

## 🔧 Setting up Local Development

### Step 1

Open ganache UI/cli and configure truffle-config.js file. Not required for most cases.

### Step 2

Import the ganache local blockchain accounts in metamask using the mnemonic provided.

### Step 3

Clone the repo

```bash
git clone https://github.com/codeTIT4N/supply-chain-truffle-react.git
cd supply-chain-truffle-react
```

### Step 4

Compile and deploy the smart contract

```bash
npx truffle compile
npx truffle migrate
```

> NOTE: If you make changes in the smart contract you have to redeploy it using `npx truffle migrate --reset`

### Step 5

Install `node_modules` using `yarn`

```bash
cd client
yarn
```

Install `node_modules` using `npm`

```bash
cd client
npm install
```

### Step 6

Start the development server using `yarn`

```bash
yarn start
```

Start the development server using `npm`

```bash
npm start
```

The site is now running at `http://localhost:3000`!
Open the source code and start editing!

---

## ✨ Features

### 🔐 Core Features
- **Blockchain-based tracking** - Immutable record of all transactions
- **Multi-stakeholder management** - RMS, Manufacturers, Distributors, Retailers
- **Real-time updates** - Instant supply chain status changes
- **Complete transparency** - Full visibility of medicine journey
- **Secure authentication** - MetaMask integration
- **📱 QR Code Integration** - Generate, scan, and update medicine status via QR codes

### 🎨 Premium UI/UX
- Modern, responsive design for all devices
- Intuitive navigation with premium navbar
- Beautiful gradient cards and animations
- Glass morphism effects
- Smooth transitions and hover states
- Professional color scheme and typography

### 📊 Functionality
1. **Register Participants** - Add all supply chain stakeholders
2. **Order Medicines** - Create new medicine batches
3. **Control Chain** - Update medicine stages progressively
4. **Track & Trace** - Complete visibility of medicine journey
5. **📱 QR Code System** - Generate, download, and scan QR codes for instant updates
   - Generate QR codes for all medicines
   - Download QR codes as PNG images
   - Scan with camera (computer/phone) or manual input
   - Update medicine status via QR scanning

---

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity ^0.8.0
- **Blockchain**: Ethereum (Ganache for local development)
- **Frontend**: React 18.2.0
- **Web3 Library**: Web3.js 1.10.0
- **UI Framework**: React Bootstrap 2.10.9
- **Routing**: React Router DOM 6.11.1
- **QR Code**: qrcode.react, html5-qrcode
- **Build Tool**: React Scripts 5.0.1

---

## 📖 Documentation

All comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[QR Code Complete Guide](./docs/QR_COMPLETE_GUIDE.md)** - Full QR code system documentation
- **[QR Implementation Summary](./docs/QR_IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[QR Quick Start](./docs/QR_QUICK_START.md)** - Quick testing guide
- **[Phone Camera Setup](./docs/PHONE_CAMERA_SETUP.md)** - Use phone camera for QR scanning
- **[QR Integration Guide](./docs/QR_INTEGRATION_GUIDE.md)** - Technical integration details
- **[Fixes Applied](./docs/FIXES_APPLIED.md)** - Recent bug fixes and enhancements

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🌟 Acknowledgments

- Ethereum Foundation
- Truffle Suite
- React Community
- Web3.js Team

---

**Made with ❤️ for a more transparent pharmaceutical supply chain**

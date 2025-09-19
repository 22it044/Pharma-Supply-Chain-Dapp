# QR Code Integration Guide

## Overview
The pharmaceutical supply chain DApp now includes comprehensive QR code functionality that allows you to:
- Generate QR codes for each medicine in the tracking system
- Scan QR codes using your device camera
- Update medicine status directly through QR code scanning

## Features Implemented

### 1. QR Code Generation (Track.js)
- **Location**: Track Medicine page (`/track`)
- **Functionality**: 
  - When you track a medicine by ID, a QR code is automatically generated
  - The QR code encodes the medicine ID
  - Displays alongside medicine information
  - Can be scanned by mobile devices or other scanners

### 2. QR Code Scanner (QRScanner.js)
- **Location**: QR Scanner page (`/qrscanner`)
- **Functionality**:
  - Activates device camera for QR code scanning
  - Automatically reads medicine ID from QR code
  - Fetches medicine details from blockchain
  - Allows status updates through dropdown selection
  - Confirms transactions via MetaMask

## How to Use

### Generating QR Codes
1. Navigate to **Track** page from the navbar
2. Enter a Medicine ID and click "Track"
3. The QR code will appear on the right side of the medicine information
4. The QR code can be:
   - Scanned directly from screen
   - Downloaded/printed for physical products
   - Shared digitally

### Scanning QR Codes to Update Status
1. Navigate to **📷 QR Scanner** from the navbar
2. Click "Start Scanner" to activate your camera
3. Point your camera at the QR code
4. The system will:
   - Automatically detect and read the QR code
   - Stop scanning
   - Fetch medicine details from blockchain
   - Display current status
5. Select the desired action from dropdown:
   - 🏭 Raw Material Supply
   - 🏢 Manufacturing
   - 🚚 Distribution
   - 🏪 Retail
   - ✅ Mark as Sold
6. Click "Update Status"
7. Confirm the transaction in MetaMask
8. Status will be updated on blockchain

## Technical Details

### Libraries Used
- **qrcode.react** (v3.x): For generating QR codes
- **html5-qrcode** (v2.x): For scanning QR codes using device camera

### Components Modified
1. **Track.js**: Added QR code generation with `QRCodeSVG` component
2. **App.js**: Added route for QR Scanner (`/qrscanner`)
3. **Navbar.js**: Added navigation link for QR Scanner
4. **QRScanner.js**: New component for scanning and updating status

### Smart Contract Integration
The QR scanner component interacts with the following smart contract functions:
- `MedicineStock(id)`: Fetch medicine details
- `showStage(id)`: Get current stage
- `RMSsupply(id)`: Update to Raw Material Supply stage
- `Manufacturing(id)`: Update to Manufacturing stage
- `Distribute(id)`: Update to Distribution stage
- `Retail(id)`: Update to Retail stage
- `sold(id)`: Mark as sold

## Workflow Example

### Supply Chain Worker Workflow
1. **At Raw Material Supplier**:
   - Worker receives medicine order
   - Scans QR code on medicine package
   - Selects "Raw Material Supply"
   - Updates status → Medicine moves to RMS stage

2. **At Manufacturer**:
   - Worker scans QR code
   - Selects "Manufacturing"
   - Updates status → Medicine moves to Manufacturing stage

3. **At Distributor**:
   - Worker scans QR code
   - Selects "Distribution"
   - Updates status → Medicine moves to Distribution stage

4. **At Retailer**:
   - Worker scans QR code
   - Selects "Retail"
   - Updates status → Medicine available for sale

5. **When Sold**:
   - Retailer scans QR code
   - Selects "Mark as Sold"
   - Updates status → Medicine marked as sold

## Security Features
- Only authorized addresses can update medicine status
- Each role (RMS, Manufacturer, Distributor, Retailer) must be registered
- Account must be active to perform updates
- Status progression follows supply chain sequence
- All updates require MetaMask confirmation
- Blockchain immutably records all status changes

## Browser Compatibility
- Chrome (Recommended)
- Firefox
- Safari (iOS 11+)
- Edge
- Mobile browsers with camera access

## Permissions Required
- Camera access for QR code scanning
- MetaMask for blockchain transactions

## Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if another app is using the camera
- Try refreshing the page
- Use HTTPS (required for camera access)

### QR Code Not Scanning
- Ensure good lighting
- Hold camera steady
- Try adjusting distance from QR code
- Clean camera lens

### Transaction Failing
- Verify you're using the correct MetaMask account
- Ensure account is registered for the role
- Check if account is active
- Verify medicine is in correct stage for update
- Ensure sufficient gas in wallet

## Testing Steps

### Local Testing
1. Start the development server:
   ```bash
   cd client
   npm start
   ```

2. Ensure Ganache is running (or your blockchain network)

3. Test QR Generation:
   - Add a medicine
   - Track it by ID
   - Verify QR code appears

4. Test QR Scanning:
   - Navigate to QR Scanner
   - Use mobile device or secondary screen to display QR code
   - Scan and verify information loads
   - Test status update

### Production Testing
1. Deploy contract to testnet (Goerli, Sepolia, etc.)
2. Update network configuration in MetaMask
3. Test all QR functionalities
4. Verify blockchain transactions on block explorer

## Future Enhancements
- Batch QR code generation for multiple medicines
- QR code download/print functionality
- History of scanned QR codes
- Offline QR code caching
- Advanced QR code styling with logos
- Multi-language support in QR scanner

## Support
For issues or questions:
1. Check browser console for errors
2. Verify MetaMask connection
3. Ensure smart contract is deployed
4. Check if all roles are registered
5. Review transaction logs on blockchain explorer

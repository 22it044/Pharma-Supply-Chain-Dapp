import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { Html5QrcodeScanner } from 'html5-qrcode';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { handleError, handleContractError, logError } from './utils/errorHandler';
import { validateMedicineId, validateQRData } from './utils/validation';

function QRScanner() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [scannedData, setScannedData] = useState(null);
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  const [selectedAction, setSelectedAction] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);

  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
    
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Error clearing scanner:", err));
      }
    };
  }, []);

  // Initialize scanner only after the element is mounted (when scannerActive becomes true)
  useEffect(() => {
    const initScanner = async () => {
      if (!scannerActive) return;
      try {
        const el = document.getElementById('qr-reader');
        if (!el) {
          // Wait a tick for DOM to paint
          await new Promise(r => setTimeout(r, 0));
        }
        const readerEl = document.getElementById('qr-reader');
        if (!readerEl) {
          console.error('qr-reader element still not found after mount');
          setUpdateStatus({ type: 'danger', message: 'Scanner element not ready. Please try again.' });
          setScannerActive(false);
          return;
        }
        const html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        html5QrcodeScanner.render(onScanSuccess, onScanError);
        scannerRef.current = html5QrcodeScanner;
      } catch (error) {
        console.error('Error initializing scanner:', error);
        setUpdateStatus({ type: 'danger', message: `Error starting scanner: ${error.message}` });
        setScannerActive(false);
      }
    };

    initScanner();

    // Cleanup when deactivating
    return () => {
      if (!scannerActive && scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Error clearing scanner:', err));
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerActive]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error("User denied account access", error);
        window.alert("User denied account access. Please allow Metamask connection.");
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    const web3 = window.web3;

    if (!web3) {
      console.error("[QRScanner.js] web3 instance not found!");
      window.alert("Web3 instance not found. Please ensure Metamask is installed and enabled.");
      setloader(false);
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        console.error("[QRScanner.js] No accounts found.");
        window.alert("No accounts found. Please ensure Metamask is unlocked and connected.");
        setloader(false);
        return;
      }
      const account = accounts[0];
      setCurrentaccount(account);

      const networkId = await web3.eth.net.getId();
      const networkData = SupplyChainABI.networks[networkId];

      if (networkData) {
        const supplychain = new web3.eth.Contract(
          SupplyChainABI.abi,
          networkData.address
        );
        setSupplyChain(supplychain);
      } else {
        console.error(`[QRScanner.js] Smart contract not deployed to network ${networkId}.`);
        window.alert("The smart contract is not deployed to the current network.");
      }
    } catch (error) {
      console.error("[QRScanner.js] Error loading blockchain data:", error);
      window.alert("An error occurred connecting to the blockchain. Check console.");
    } finally {
      setloader(false);
    }
  };

  const startScanner = () => {
    if (!scannerActive) {
      setUpdateStatus({ type: 'info', message: 'Starting camera scanner...' });
      setScannerActive(true);
    }
  };

  const stopScanner = () => {
    setScannerActive(false);
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error('Error clearing scanner:', err));
      scannerRef.current = null;
    }
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    console.log(`QR Code scanned: ${decodedText}`);
    
    try {
      // Validate QR data
      const medicineId = validateQRData(decodedText);
      setScannedData(medicineId);
      stopScanner();
      
      // Fetch medicine info
      await fetchMedicineInfo(medicineId);
    } catch (error) {
      const errorInfo = handleError(error, 'QRScan');
      setUpdateStatus({ type: 'danger', message: errorInfo.userMessage });
      logError(error, 'QRScanner.onScanSuccess', { decodedText });
    }
  };

  const onScanError = (errorMessage) => {
    // Silent error handling for continuous scanning
    // console.log(`QR Scan Error: ${errorMessage}`);
  };

  const fetchMedicineInfo = async (medicineId) => {
    if (!SupplyChain) {
      setUpdateStatus({ type: 'danger', message: 'Smart contract not loaded!' });
      return;
    }

    try {
      // Validate medicine ID
      const validId = validateMedicineId(medicineId);
      
      const medData = await SupplyChain.methods.MedicineStock(validId).call();
      const stage = await SupplyChain.methods.showStage(validId).call();
      
      setMedicineInfo({ ...medData, stage, id: validId });
      setUpdateStatus({ type: 'success', message: `Medicine ID ${validId} loaded successfully!` });
    } catch (error) {
      const errorInfo = handleContractError(error, 'fetchMedicineInfo');
      setUpdateStatus({ type: 'danger', message: errorInfo.userMessage });
      logError(error, 'QRScanner.fetchMedicineInfo', { medicineId });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAction || !medicineInfo || !SupplyChain || !currentaccount) {
      setUpdateStatus({ type: 'warning', message: 'Please select an action and scan a QR code!' });
      return;
    }

    setloader(true);
    setUpdateStatus({ type: 'info', message: `Updating status to ${selectedAction}...` });

    try {
      const receipt = await SupplyChain.methods[selectedAction](medicineInfo.id).send({ 
        from: currentaccount,
        gas: 300000 // Set gas limit
      });
      
      // Validate receipt
      if (!receipt || !receipt.status) {
        throw new Error('Transaction failed: Invalid receipt');
      }
      
      console.log(`${selectedAction} successful:`, receipt);
      setUpdateStatus({ 
        type: 'success', 
        message: `Medicine ID ${medicineInfo.id} successfully updated to ${selectedAction} stage!` 
      });
      
      // Refresh medicine info
      await fetchMedicineInfo(medicineInfo.id);
    } catch (error) {
      const errorInfo = handleContractError(error, selectedAction);
      setUpdateStatus({ 
        type: 'danger', 
        message: errorInfo.userMessage
      });
      logError(error, 'QRScanner.handleUpdateStatus', { 
        action: selectedAction, 
        medicineId: medicineInfo.id 
      });
    } finally {
      setloader(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput) {
      setUpdateStatus({ type: 'warning', message: 'Please enter a Medicine ID!' });
      return;
    }
    
    try {
      // Validate input
      const validId = validateMedicineId(manualInput);
      setScannedData(validId);
      await fetchMedicineInfo(validId);
    } catch (error) {
      const errorInfo = handleError(error, 'ManualInput');
      setUpdateStatus({ type: 'danger', message: errorInfo.userMessage });
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setMedicineInfo(null);
    setUpdateStatus({ type: '', message: '' });
    setSelectedAction('');
    setManualInput('');
  };

  // Initial Loader
  if (loader && !SupplyChain) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container className="text-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4 className="wait mt-3">Connecting to Blockchain...</h4>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: '3rem' }}>
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h4 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              📷 QR Code Scanner
            </h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Current Account: <code style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{currentaccount}</code>
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <span className="badge-premium badge-success">QR Scanner</span>
            </div>
          </Col>
        </Row>
        <hr/>

        {updateStatus.message && (
          <Alert variant={updateStatus.type} onClose={() => setUpdateStatus({ type: '', message: '' })} dismissible>
            {updateStatus.message}
          </Alert>
        )}

        <Row>
          <Col lg={6} className="mb-3">
            <Card style={{ border: '1px solid var(--border-color)', height: '100%' }}>
              <Card.Header as="h5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                📸 Scan QR Code
              </Card.Header>
              <Card.Body>
                {/* Toggle between Scanner and Manual Input */}
                <div className="mb-3 text-center">
                  <Button 
                    variant={!useManualInput ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => {
                      setUseManualInput(false);
                      if (scannerActive) stopScanner();
                    }}
                    className="me-2"
                  >
                    📷 Camera Scan
                  </Button>
                  <Button 
                    variant={useManualInput ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => {
                      setUseManualInput(true);
                      if (scannerActive) stopScanner();
                    }}
                  >
                    ⌨️ Manual Input
                  </Button>
                </div>

                {!useManualInput ? (
                  // Camera Scanner Mode
                  <>
                    {!scannerActive ? (
                      <div className="text-center">
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={startScanner}
                          style={{ marginBottom: '1rem' }}
                        >
                          🎯 Start Camera Scanner
                        </Button>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                          Click to activate your camera and scan a medicine QR code
                        </p>
                        <div className="mt-3 p-3" style={{ background: '#e7f3ff', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <p className="mb-2"><strong>💡 Using Phone Camera?</strong></p>
                          <p className="mb-0">
                            Open this page on your phone: <br/>
                            <code style={{ fontSize: '0.8rem' }}>http://[your-computer-ip]:3000/qrscanner</code>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div id="qr-reader" style={{ width: '100%' }}></div>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={stopScanner}
                          className="mt-3 w-100"
                        >
                          ⏹️ Stop Scanner
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  // Manual Input Mode
                  <div>
                    <Form onSubmit={handleManualSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Enter Medicine ID:</strong></Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Medicine ID"
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          min="1"
                          required
                        />
                        <Form.Text className="text-muted">
                          Enter the ID of the medicine you want to update
                        </Form.Text>
                      </Form.Group>
                      <Button 
                        variant="primary" 
                        type="submit"
                        className="w-100"
                        disabled={!manualInput}
                      >
                        🔍 Load Medicine Details
                      </Button>
                    </Form>
                    <div className="mt-3 p-3" style={{ background: '#fff3cd', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <p className="mb-0">
                        <strong>ℹ️ No Camera?</strong> Use manual input to enter Medicine ID directly.
                      </p>
                    </div>
                  </div>
                )}

                {scannedData && (
                  <div className="mt-3 p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <p className="mb-0"><strong>Scanned ID:</strong> {scannedData}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-3">
            <Card style={{ border: '1px solid var(--border-color)', height: '100%' }}>
              <Card.Header as="h5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                ⚙️ Update Status
              </Card.Header>
              <Card.Body>
                {medicineInfo ? (
                  <div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <h6 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem', fontWeight: '600' }}>
                        💊 Medicine Information
                      </h6>
                      <p style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        <b>ID:</b> {medicineInfo.id}
                      </p>
                      <p style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        <b>Name:</b> {medicineInfo.name}
                      </p>
                      <p style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        <b>Description:</b> {medicineInfo.description}
                      </p>
                      <p style={{ marginBottom: '0', color: 'var(--text-primary)' }}>
                        <b>Current Stage:</b> <span style={{ background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem' }}>{medicineInfo.stage}</span>
                      </p>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label><strong>Select Action:</strong></Form.Label>
                      <Form.Select 
                        value={selectedAction} 
                        onChange={(e) => setSelectedAction(e.target.value)}
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        <option value="">-- Choose Action --</option>
                        <option value="RMSsupply">🏭 Raw Material Supply</option>
                        <option value="Manufacturing">🏢 Manufacturing</option>
                        <option value="Distribute">🚚 Distribution</option>
                        <option value="Retail">🏪 Retail</option>
                        <option value="sold">✅ Mark as Sold</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button 
                        variant="success" 
                        size="lg"
                        onClick={handleUpdateStatus}
                        disabled={!selectedAction || loader}
                      >
                        {loader ? '⏳ Updating...' : '🔄 Update Status'}
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={resetScanner}
                      >
                        🔃 Scan New QR Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted">
                    <p>Scan a QR code to view medicine details and update status</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Card style={{ border: '1px solid var(--border-color)' }}>
              <Card.Header as="h5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                ℹ️ Instructions
              </Card.Header>
              <Card.Body>
                <h6 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>📷 Camera Scan Mode:</h6>
                <ol style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <li>Click <strong>"Start Camera Scanner"</strong> to activate your camera</li>
                  <li>Point your camera at the medicine QR code</li>
                  <li>Wait for the system to automatically scan and load medicine details</li>
                  <li>Select the appropriate action from the dropdown menu</li>
                  <li>Click <strong>"Update Status"</strong> to record the stage change on blockchain</li>
                  <li>Confirm the transaction in MetaMask when prompted</li>
                </ol>

                <h6 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>⌨️ Manual Input Mode:</h6>
                <ol style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <li>Click <strong>"⌨️ Manual Input"</strong> button at the top</li>
                  <li>Enter the Medicine ID number</li>
                  <li>Click <strong>"Load Medicine Details"</strong></li>
                  <li>Select action and update status as normal</li>
                </ol>

                <h6 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>📱 Using Phone Camera:</h6>
                <ul style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
                  <li><strong>No camera on computer?</strong> Access this page on your phone!</li>
                  <li>Ensure phone and computer are on the <strong>same WiFi network</strong></li>
                  <li>Find your computer's IP address (run <code>ipconfig</code> on Windows)</li>
                  <li>On your phone's browser, go to: <code>http://[YOUR-IP]:3000/qrscanner</code></li>
                  <li>Example: <code>http://192.168.1.100:3000/qrscanner</code></li>
                  <li>Use your phone's camera to scan QR codes from your computer screen or printed codes!</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default QRScanner;

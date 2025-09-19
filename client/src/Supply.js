import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { QRCodeSVG } from 'qrcode.react';
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'; // Use react-bootstrap Table
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

function Supply() {
  const navigate = useNavigate();
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [medicinesList, setMedicinesList] = useState([]); // Consolidated state
  const [ID, setID] = useState(''); // Current ID for stage update
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  useEffect(() => {
    const init = async () => {
      await loadWeb3();
      await loadBlockchaindata();
    };
    init();
  }, []);

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

  // Dedicated fetch function for medicines
  const fetchMedicines = async (supplyChainInstance) => {
      try {
          const medCount = await supplyChainInstance.methods.medicineCtr().call();
          const fetchedMedicines = [];
          for (let i = 1; i <= medCount; i++) {
              try {
                  const med = await supplyChainInstance.methods.MedicineStock(i).call();
                  const stage = await supplyChainInstance.methods.showStage(i).call();
                  fetchedMedicines.push({ ...med, stage: stage });
              } catch (medError) {
                   console.error(`Error fetching details for medicine ID ${i}:`, medError);
              }
          }
          setMedicinesList(fetchedMedicines);
      } catch (err) {
           console.error("Error fetching medicine list:", err);
           setMedicinesList([]);
      }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    const web3 = window.web3;

    if (!web3) {
        console.error("[Supply.js] web3 instance not found!");
        window.alert("Web3 instance not found. Please ensure Metamask is installed and enabled.");
        setloader(false);
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.error("[Supply.js] No accounts found.");
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
            await fetchMedicines(supplychain); // Fetch medicines using dedicated function
        } else {
            console.error(`Smart contract not deployed to network ${networkId}.`);
            window.alert("The smart contract is not deployed to the current network.");
        }
    } catch (error) {
         console.error("[Supply.js] Error loading blockchain data:", error);
         window.alert("An error occurred loading blockchain data. Check console.");
    } finally {
        setloader(false);
    }
  };

  const redirect_to_home = () => {
    navigate("/");
  };

  const handlerChangeID = (event) => {
    setID(event.target.value);
  };

  // --- Updated Submit Handlers for Stage Changes ---

  const handleStageChange = async (stageFunctionName) => {
    if (!SupplyChain || !currentaccount || !ID) {
        alert("Please ensure blockchain data is loaded and you have entered a Medicine ID.");
        return;
    }
    setloader(true);
    console.log(`Attempting to call ${stageFunctionName} for ID: ${ID}`);
    try {
        const receipt = await SupplyChain.methods[stageFunctionName](ID).send({ from: currentaccount });
        if (receipt) {
            console.log(`${stageFunctionName} successful:`, receipt);
            alert(`Medicine ID ${ID} successfully moved to ${stageFunctionName} stage!`);
            await fetchMedicines(SupplyChain); // Re-fetch medicines list to update stage
        }
    } catch (err) {
        console.error(`Error calling ${stageFunctionName} for ID ${ID}:`, err);
        alert(`Error updating stage to ${stageFunctionName}: ${err.message || 'Check console for details.'}`);
    } finally {
        setloader(false);
    }
  };

  // Specific handlers now call the generic one
  const handlerSubmitRMSsupply = (event) => {
    event.preventDefault();
    handleStageChange('RMSsupply');
  };
  const handlerSubmitManufacturing = (event) => {
    event.preventDefault();
    handleStageChange('Manufacturing');
  };
  const handlerSubmitDistribute = (event) => {
    event.preventDefault();
    handleStageChange('Distribute');
  };
  const handlerSubmitRetail = (event) => {
    event.preventDefault();
    handleStageChange('Retail');
  };
  const handlerSubmitSold = (event) => {
    event.preventDefault();
    handleStageChange('sold');
  };

  const handleShowQR = (medicine) => {
    setSelectedMedicine(medicine);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedMedicine(null);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `Medicine_${selectedMedicine.id}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Loader
  if (loader) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container className="text-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4 className="wait mt-3">Loading Blockchain Data...</h4>
        </Container>
      </div>
    );
  }

  // Main render
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: '3rem' }}>
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h4 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>🔄 Control Supply Chain Stages</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Account: <code style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{currentaccount}</code></p>
            <div style={{ marginTop: '0.75rem' }}>
              <span className="badge-premium badge-info">Supply Chain Manager</span>
            </div>
          </Col>
        </Row>
        <hr/>

        <Card className="mb-4" style={{ border: '1px solid var(--border-color)' }}>
          <Card.Header as="h5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>⚙️ Update Medicine Stage</Card.Header>
         <Card.Body>
          <Form>
            <Form.Group as={Row} className="mb-3" controlId="formMedicineId">
              <Form.Label column sm={2}>Medicine ID:</Form.Label>
              <Col sm={10}>
                <Form.Control
                  type="number"
                  onChange={handlerChangeID}
                  placeholder="Enter Medicine ID to update stage"
                  required
                  min="1" // Assuming IDs start from 1
                />
              </Col>
            </Form.Group>

            <div className="d-flex flex-wrap justify-content-start gap-2" style={{ gap: '0.75rem' }}>
              <Button variant="primary" onClick={handlerSubmitRMSsupply} disabled={!ID} style={{ minWidth: '140px' }}>
                🏭 1. RMS Supply
              </Button>
              <Button variant="info" onClick={handlerSubmitManufacturing} disabled={!ID} className="text-white" style={{ minWidth: '140px' }}>
                🏢 2. Manufacture
              </Button>
              <Button variant="warning" onClick={handlerSubmitDistribute} disabled={!ID} className="text-dark" style={{ minWidth: '140px' }}>
                🚚 3. Distribute
              </Button>
              <Button variant="danger" onClick={handlerSubmitRetail} disabled={!ID} style={{ minWidth: '140px' }}>
                🏪 4. Retail
              </Button>
              <Button variant="success" onClick={handlerSubmitSold} disabled={!ID} style={{ minWidth: '140px' }}>
                ✅ 5. Mark Sold
              </Button>
            </div>
            <Form.Text className="text-muted mt-2 d-block">
              Select the Medicine ID and click the corresponding button to advance its stage.
            </Form.Text>
          </Form>
        </Card.Body>
      </Card>

        <Card style={{ border: '1px solid var(--border-color)' }}>
          <Card.Header as="h5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>📊 Medicine Stock & Stages</Card.Header>
          <Card.Body>
            <div style={{ overflowX: 'auto' }}>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Current Stage</th>
                  <th>QR Code</th>
                </tr>
              </thead>
              <tbody>
                {medicinesList.length > 0 ? (
                  medicinesList.map((medItem, key) => (
                    <tr key={medItem.id}> {/* Use unique ID for key if possible */}
                      <td>{medItem.id.toString()}</td>
                      <td>{medItem.name}</td>
                      <td>{medItem.description}</td>
                      <td>{medItem.stage}</td>
                      <td className="text-center">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowQR(medItem)}
                        >
                          📱 View QR
                        </Button>
                      </td>
                    </tr>
                  ))
                 ) : (
                   <tr>
                    <td colSpan="5" className="text-center">No medicines found or data loading.</td>
                   </tr>
                 )}
              </tbody>
            </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={handleCloseQR} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Modal.Title>📱 QR Code - Medicine #{selectedMedicine?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedMedicine && (
            <div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <h6 style={{ color: 'var(--primary-color)', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Medicine Information
                </h6>
                <p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  <strong>Name:</strong> {selectedMedicine.name}
                </p>
                <p style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  <strong>Description:</strong> {selectedMedicine.description}
                </p>
                <p style={{ marginBottom: '0', fontSize: '0.9rem' }}>
                  <strong>Current Stage:</strong> <span style={{ background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>{selectedMedicine.stage}</span>
                </p>
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', display: 'inline-block', border: '2px solid var(--border-color)' }}>
                <QRCodeSVG 
                  id="qr-code-svg"
                  value={selectedMedicine.id.toString()} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-3 p-2" style={{ background: '#e7f3ff', borderRadius: '8px', fontSize: '0.85rem' }}>
                <p className="mb-0">
                  <strong>💡 Tip:</strong> Use QR Scanner to scan this code and update medicine status
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={downloadQRCode}>
            ⬇️ Download QR Code
          </Button>
          <Button variant="secondary" onClick={handleCloseQR}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Supply;

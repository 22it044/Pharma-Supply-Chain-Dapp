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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingBottom: '3rem' }}>
      <Container className="mt-4">
        {/* Enhanced Page Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: '16px', 
          padding: '2rem', 
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.25)'
        }}>
          <Row className="align-items-center">
            <Col>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>🔄</span>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0' }}>Supply Chain Control</h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '1rem' }}>Update medicine stages and manage inventory</p>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block', backdropFilter: 'blur(10px)' }}>
                <small style={{ color: 'white', fontFamily: 'monospace' }}>
                  <strong>Connected:</strong> {currentaccount.substring(0, 6)}...{currentaccount.substring(38)}
                </small>
              </div>
            </Col>
          </Row>
        </div>

        <Card className="mb-4" style={{ 
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <Card.Header as="h5" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            padding: '1.25rem',
            borderBottom: 'none',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            ⚙️ Update Medicine Stage
          </Card.Header>
         <Card.Body style={{ padding: '1.5rem' }}>
          <Form>
            <Form.Group className="mb-4" controlId="formMedicineId">
              <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '0.5rem' }}>Medicine ID</Form.Label>
              <Form.Control
                type="number"
                onChange={handlerChangeID}
                placeholder="Enter medicine ID to update stage"
                required
                min="1"
                style={{
                  borderRadius: '8px',
                  border: '2px solid #e9ecef',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.875rem' }}>
                Enter the ID of the medicine you want to advance to the next stage
              </Form.Text>
            </Form.Group>

            <div>
              <p style={{ fontWeight: '600', color: '#495057', marginBottom: '1rem' }}>Select Stage Action:</p>
              <div className="d-flex flex-wrap justify-content-start gap-3" style={{ gap: '0.75rem' }}>
                <Button 
                  onClick={handlerSubmitRMSsupply} 
                  disabled={!ID} 
                  style={{ 
                    minWidth: '150px',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: '600',
                    background: !ID ? '#e9ecef' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: !ID ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  🏭 RMS Supply
                </Button>
                <Button 
                  onClick={handlerSubmitManufacturing} 
                  disabled={!ID}
                  style={{ 
                    minWidth: '150px',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: '600',
                    background: !ID ? '#e9ecef' : 'linear-gradient(135deg, #17a2b8 0%, #117a8b 100%)',
                    border: 'none',
                    color: 'white',
                    boxShadow: !ID ? 'none' : '0 4px 12px rgba(23, 162, 184, 0.3)'
                  }}
                >
                  🏢 Manufacture
                </Button>
                <Button 
                  onClick={handlerSubmitDistribute} 
                  disabled={!ID}
                  style={{ 
                    minWidth: '150px',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: '600',
                    background: !ID ? '#e9ecef' : 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                    border: 'none',
                    color: '#000',
                    boxShadow: !ID ? 'none' : '0 4px 12px rgba(255, 193, 7, 0.3)'
                  }}
                >
                  🚚 Distribute
                </Button>
                <Button 
                  onClick={handlerSubmitRetail} 
                  disabled={!ID}
                  style={{ 
                    minWidth: '150px',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: '600',
                    background: !ID ? '#e9ecef' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    border: 'none',
                    boxShadow: !ID ? 'none' : '0 4px 12px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  🏪 Retail
                </Button>
                <Button 
                  onClick={handlerSubmitSold} 
                  disabled={!ID}
                  style={{ 
                    minWidth: '150px',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: '600',
                    background: !ID ? '#e9ecef' : 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                    border: 'none',
                    boxShadow: !ID ? 'none' : '0 4px 12px rgba(40, 167, 69, 0.3)'
                  }}
                >
                  ✅ Mark Sold
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

        <Card style={{ 
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <Card.Header as="h5" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            padding: '1.25rem',
            borderBottom: 'none',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            📊 Medicine Stock & Stages
          </Card.Header>
          <Card.Body style={{ padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
            <Table striped bordered hover responsive style={{ marginBottom: '0' }}>
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

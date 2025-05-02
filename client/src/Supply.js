import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'; // Use react-bootstrap Table
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

function Supply() {
  const navigate = useNavigate();
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [medicinesList, setMedicinesList] = useState([]); // Consolidated state
  const [ID, setID] = useState(''); // Current ID for stage update

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

  // Loader
  if (loader) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h1 className="wait mt-3">Loading Blockchain Data...</h1>
      </Container>
    );
  }

  // Main render
  return (
    <Container className="mt-4">
       <Row className="mb-3">
        <Col>
          <h4>Control Supply Chain Stages</h4>
          <p>Current Account: {currentaccount}</p>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={redirect_to_home}>
            Back to Home
          </Button>
        </Col>
      </Row>
      <hr/>

      <Card className="mb-4">
         <Card.Header as="h5">Update Medicine Stage</Card.Header>
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

            <div className="d-flex flex-wrap justify-content-start gap-2">
              <Button variant="primary" onClick={handlerSubmitRMSsupply} disabled={!ID}>
                1. RMS Supply
              </Button>
              <Button variant="info" onClick={handlerSubmitManufacturing} disabled={!ID} className="text-white">
                2. Manufacture
              </Button>
              <Button variant="warning" onClick={handlerSubmitDistribute} disabled={!ID} className="text-dark">
                3. Distribute
              </Button>
              <Button variant="danger" onClick={handlerSubmitRetail} disabled={!ID}>
                4. Retail
              </Button>
              <Button variant="success" onClick={handlerSubmitSold} disabled={!ID}>
                5. Mark Sold
              </Button>
            </div>
            <Form.Text className="text-muted mt-2 d-block">
              Select the Medicine ID and click the corresponding button to advance its stage.
            </Form.Text>
          </Form>
        </Card.Body>
      </Card>

       <Card>
         <Card.Header as="h5">Medicine Stock & Stages</Card.Header>
         <Card.Body>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Current Stage</th>
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
                    </tr>
                  ))
                 ) : (
                   <tr>
                    <td colSpan="4" className="text-center">No medicines found or data loading.</td>
                   </tr>
                 )}
              </tbody>
            </Table>
         </Card.Body>
      </Card>
    </Container>
  );
}

export default Supply;

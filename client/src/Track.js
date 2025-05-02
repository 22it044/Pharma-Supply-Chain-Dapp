import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

function Track() {
  const navigate = useNavigate();
  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  // State variables (keep existing)
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState({}); // Keep as object
  const [MedStage, setMedStage] = useState([]); // Keep as array
  const [ID, setID] = useState();
  const [RMS, setRMS] = useState();
  const [MAN, setMAN] = useState();
  const [DIS, setDIS] = useState();
  const [RET, setRET] = useState();
  const [TrackTillSold, showTrackTillSold] = useState(false);
  const [TrackTillRetail, showTrackTillRetail] = useState(false);
  const [TrackTillDistribution, showTrackTillDistribution] = useState(false);
  const [TrackTillManufacture, showTrackTillManufacture] = useState(false);
  const [TrackTillRMS, showTrackTillRMS] = useState(false);
  const [TrackNotProcessing, showTrackNotProcessing] = useState(false);


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
        console.error("[Track.js] web3 instance not found!");
        window.alert("Web3 instance not found. Please ensure Metamask is installed and enabled.");
        setloader(false);
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.error("[Track.js] No accounts found.");
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
            // No need to load all medicines here, just setup contract
        } else {
            console.error(`[Track.js] Smart contract not deployed to network ${networkId}.`);
            window.alert("The smart contract is not deployed to the current network. Verify Metamask connection.");
        }
    } catch (error) {
         console.error("[Track.js] Error loading blockchain data:", error);
         window.alert("An error occurred connecting to the blockchain. Check console.");
    } finally {
        setloader(false);
    }
  };

  // Keep existing handlers
  const redirect_to_home = () => {
    navigate("/");
  };
  const handlerChangeID = (event) => {
    setID(event.target.value);
  };

  const handlerSubmit = async (event) => {
    event.preventDefault();
    if (!ID || !SupplyChain) {
        alert("Please enter a valid Medicine ID. Contract not loaded?");
        return;
    }

    // Reset visibility states and data
    showTrackTillSold(false);
    showTrackTillRetail(false);
    showTrackTillDistribution(false);
    showTrackTillManufacture(false);
    showTrackTillRMS(false);
    showTrackNotProcessing(false);

    setloader(true); // Show loader during fetch
    console.log(`Tracking Medicine ID: ${ID}`);

    try {
      // Check if ID is valid before proceeding
      const ctr = await SupplyChain.methods.medicineCtr().call();
      const currentId = parseInt(ID, 10);
      if (isNaN(currentId) || currentId <= 0 || currentId > ctr) {
         alert(`Invalid Medicine ID: ${ID}. Please enter a number between 1 and ${ctr}.`);
         setloader(false);
         return;
      }

      // Fetch data for the specific ID
      console.log("Fetching MedicineStock...");
      const medData = await SupplyChain.methods.MedicineStock(ID).call();
      console.log("Fetching showStage...");
      const stage = await SupplyChain.methods.showStage(ID).call();

      setMED(medData);
      setMedStage(stage);
      console.log(`Medicine Data:`, medData);
      console.log(`Medicine Stage: ${stage}`);

      // Fetch participant data based on stage
      if (stage === "Raw Material Supplied") {
        console.log("Fetching RMS data...");
        const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
        setRMS(rmsData);
        showTrackTillRMS(true);
      } else if (stage === "Manufactured") {
        console.log("Fetching RMS data...");
        const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
        setRMS(rmsData);
        console.log("Fetching MAN data...");
        const manData = await SupplyChain.methods.MAN(medData.MANid).call();
        setMAN(manData);
        showTrackTillRMS(true);
        showTrackTillManufacture(true);
      } else if (stage === "Distributed") {
         console.log("Fetching RMS data...");
         const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
         setRMS(rmsData);
         console.log("Fetching MAN data...");
         const manData = await SupplyChain.methods.MAN(medData.MANid).call();
         setMAN(manData);
         console.log("Fetching DIS data...");
         const disData = await SupplyChain.methods.DIS(medData.DISid).call();
         setDIS(disData);
         showTrackTillRMS(true);
         showTrackTillManufacture(true);
         showTrackTillDistribution(true);
      } else if (stage === "Retail") {
         console.log("Fetching RMS data...");
         const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
         setRMS(rmsData);
         console.log("Fetching MAN data...");
         const manData = await SupplyChain.methods.MAN(medData.MANid).call();
         setMAN(manData);
         console.log("Fetching DIS data...");
         const disData = await SupplyChain.methods.DIS(medData.DISid).call();
         setDIS(disData);
         console.log("Fetching RET data...");
         const retData = await SupplyChain.methods.RET(medData.RETid).call();
         setRET(retData);
         showTrackTillRMS(true);
         showTrackTillManufacture(true);
         showTrackTillDistribution(true);
         showTrackTillRetail(true);
      } else if (stage === "Sold") {
         console.log("Fetching RMS data...");
         const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
         setRMS(rmsData);
         console.log("Fetching MAN data...");
         const manData = await SupplyChain.methods.MAN(medData.MANid).call();
         setMAN(manData);
         console.log("Fetching DIS data...");
         const disData = await SupplyChain.methods.DIS(medData.DISid).call();
         setDIS(disData);
         console.log("Fetching RET data...");
         const retData = await SupplyChain.methods.RET(medData.RETid).call();
         setRET(retData);
         showTrackTillRMS(true);
         showTrackTillManufacture(true);
         showTrackTillDistribution(true);
         showTrackTillRetail(true);
         showTrackTillSold(true);
      } else { // Handle 'Ordered' or other potential initial states
        console.log("Stage is 'Ordered' or unknown, showing basic info.");
        showTrackNotProcessing(true);
      }

    } catch (err) {
      console.error("Error occurred during tracking:", err);
      alert(`An error occurred while tracking Medicine ID ${ID}. Check console for details. Message: ${err.message || 'Unknown error'}`);
      // Reset states on error to avoid showing stale/incorrect data
      setMED({});
      setMedStage('');
      setRMS(null);
      setMAN(null);
      setDIS(null);
      setRET(null);
    } finally {
      setloader(false); // Hide loader regardless of success or error
    }
  };

   // Render Tracking Information Conditionally
  const renderTrackingInfo = () => {
    if (loader) {
        return (
            <div className="text-center">
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Fetching details...</span>
            </div>
        );
    }

    if (!MED || !MED.id) {
        return <p className="text-muted">Enter a Medicine ID and click Track to see details.</p>;
    }

    return (
        <ListGroup variant="flush">
            <ListGroup.Item><b>Medicine Name:</b> {MED.name}</ListGroup.Item>
            <ListGroup.Item><b>Description:</b> {MED.description}</ListGroup.Item>
            <ListGroup.Item><b>Current Stage:</b> {MedStage}</ListGroup.Item>
            <hr />
            {TrackTillRMS && RMS && (
                 <ListGroup.Item>
                    <b>Raw Material Supplier:</b> {RMS.name} ({RMS.place}) <br />
                    <small>Address: {RMS.addr}</small>
                 </ListGroup.Item>
            )}
            {TrackTillManufacture && MAN && (
                <ListGroup.Item>
                    <b>Manufacturer:</b> {MAN.name} ({MAN.place}) <br />
                    <small>Address: {MAN.addr}</small>
                </ListGroup.Item>
            )}
            {TrackTillDistribution && DIS && (
                <ListGroup.Item>
                    <b>Distributor:</b> {DIS.name} ({DIS.place}) <br />
                    <small>Address: {DIS.addr}</small>
                </ListGroup.Item>
            )}
             {TrackTillRetail && RET && (
                 <ListGroup.Item>
                    <b>Retailer:</b> {RET.name} ({RET.place}) <br />
                    <small>Address: {RET.addr}</small>
                 </ListGroup.Item>
            )}
             {TrackTillSold && (
                 <ListGroup.Item className="bg-success text-white"><b>Status: Sold</b></ListGroup.Item>
            )}
             {TrackNotProcessing && (
                 <ListGroup.Item className="bg-secondary text-white"><b>Status: Ordered, Not Yet Processed</b></ListGroup.Item>
            )}
        </ListGroup>
    );
  };


  // Initial Loader for web3/contract setup
  if (loader && !SupplyChain) { // Only show full page loader initially
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h1 className="wait mt-3">Connecting to Blockchain...</h1>
      </Container>
    );
  }

  // Main Render
  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h4>Track Medicine</h4>
          <p>Current Account: {currentaccount}</p>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={redirect_to_home}>
            Back to Home
          </Button>
        </Col>
      </Row>
      <hr/>

      <Row>
        <Col md={5} className="mb-3 mb-md-0">
           <Card>
              <Card.Header as="h5">Enter Medicine ID</Card.Header>
              <Card.Body>
                <Form onSubmit={handlerSubmit}>
                    <Form.Group className="mb-3" controlId="formTrackId">
                        <Form.Label>Medicine ID:</Form.Label>
                        <Form.Control
                          type="number"
                          onChange={handlerChangeID}
                          placeholder="Enter ID to track"
                          required
                          min="1"
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={!ID || loader}>
                      {loader && !SupplyChain ? 'Connecting...' : (loader ? 'Tracking...' : 'Track')}
                    </Button>
                </Form>
              </Card.Body>
            </Card>
        </Col>
        <Col md={7}>
            <Card>
                <Card.Header as="h5">Tracking Details</Card.Header>
                <Card.Body>
                    {renderTrackingInfo()}
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Track;

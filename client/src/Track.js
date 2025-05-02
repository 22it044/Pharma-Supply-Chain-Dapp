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
      await window.ethereum.enable();
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
    const accounts = await web3.eth.getAccounts();
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
      setloader(false);
    } else {
      window.alert(
        "The smart contract is not deployed to current network. Verify Metamask connection."
      );
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
    if (!ID || !SupplyChain) return; // Ensure ID and contract exist

    // Reset visibility states
    showTrackTillSold(false);
    showTrackTillRetail(false);
    showTrackTillDistribution(false);
    showTrackTillManufacture(false);
    showTrackTillRMS(false);
    showTrackNotProcessing(false);

    setloader(true); // Show loader during fetch

    try {
      var ctr = await SupplyChain.methods.medicineCtr().call();
      if (ID > ctr || ID <= 0) { // Basic validation
         alert("Invalid Medicine ID.");
         setloader(false);
         return;
      }

      // Fetch data for the specific ID
      const medData = await SupplyChain.methods.MedicineStock(ID).call();
      const stage = await SupplyChain.methods.showStage(ID).call();

      setMED(medData);
      setMedStage(stage);

      // Fetch participant data based on stage
      if (stage === "Raw Material Supplied") {
        const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
        setRMS(rmsData);
        showTrackTillRMS(true);
      } else if (stage === "Manufactured") {
        const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
        const manData = await SupplyChain.methods.MAN(medData.MANid).call();
        setRMS(rmsData);
        setMAN(manData);
        showTrackTillManufacture(true);
      } else if (stage === "Distributed") {
         const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
         const manData = await SupplyChain.methods.MAN(medData.MANid).call();
         const disData = await SupplyChain.methods.DIS(medData.DISid).call();
         setRMS(rmsData);
         setMAN(manData);
         setDIS(disData);
         showTrackTillDistribution(true);
      } else if (stage === "Retailered") {
         const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
         const manData = await SupplyChain.methods.MAN(medData.MANid).call();
         const disData = await SupplyChain.methods.DIS(medData.DISid).call();
         const retData = await SupplyChain.methods.RET(medData.RETid).call();
         setRMS(rmsData);
         setMAN(manData);
         setDIS(disData);
         setRET(retData);
         showTrackTillRetail(true);
      } else if (stage === "Sold") {
         const rmsData = await SupplyChain.methods.RMS(medData.RMSid).call();
         const manData = await SupplyChain.methods.MAN(medData.MANid).call();
         const disData = await SupplyChain.methods.DIS(medData.DISid).call();
         const retData = await SupplyChain.methods.RET(medData.RETid).call();
         setRMS(rmsData);
         setMAN(manData);
         setDIS(disData);
         setRET(retData);
         showTrackTillSold(true);
      } else {
        showTrackNotProcessing(true);
      }
    } catch (err) {
      console.error("Error tracking medicine:", err);
      alert("An error occurred while tracking the medicine.");
    }
    setloader(false); // Hide loader after fetch
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

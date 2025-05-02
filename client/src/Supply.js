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
  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  // State variables (keep existing)
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState({}); // Initialize as object
  const [MedStage, setMedStage] = useState([]); // Initialize as array
  const [ID, setID] = useState();

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
      var i;
      const medCtr = await supplychain.methods.medicineCtr().call();
      const med = {};
      const medStage = [];
      for (i = 0; i < medCtr; i++) {
        med[i + 1] = await supplychain.methods.MedicineStock(i + 1).call(); // Use ID as key
        medStage[i + 1] = await supplychain.methods.showStage(i + 1).call(); // Use ID as key
      }
      setMED(med);
      setMedStage(medStage);
      setloader(false);
    } else {
      window.alert("The smart contract is not deployed to current network");
    }
  };

  // Keep existing handlers
  const redirect_to_home = () => {
    navigate("/");
  };
  const handlerChangeID = (event) => {
    setID(event.target.value);
  };
  const handlerSubmitRMSsupply = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .RMSsupply(ID)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitManufacturing = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .Manufacturing(ID)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitDistribute = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .Distribute(ID)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitRetail = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .Retail(ID)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitSold = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .sold(ID)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
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
                {Object.keys(MED).map(function (key) {
                  return (
                    <tr key={key}>
                      <td>{MED[key].id}</td>
                      <td>{MED[key].name}</td>
                      <td>{MED[key].description}</td>
                      <td>{MedStage[key]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
         </Card.Body>
      </Card>
    </Container>
  );
}

export default Supply;

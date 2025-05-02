import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

function AddMed() {
  const navigate = useNavigate();
  useEffect(() => {
    loadWeb3();
    loadBlockchaindata();
  }, []);

  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState();
  const [MedName, setMedName] = useState();
  const [MedDes, setMedDes] = useState();
  const [MedStage, setMedStage] = useState();

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
        med[i] = await supplychain.methods.MedicineStock(i + 1).call();
        medStage[i] = await supplychain.methods.showStage(i + 1).call();
      }
      setMED(med);
      setMedStage(medStage);
      setloader(false);
    } else {
      window.alert("The smart contract is not deployed to current network");
    }
  };

  const redirect_to_home = () => {
    navigate("/");
  };
  const handlerChangeNameMED = (event) => {
    setMedName(event.target.value);
  };
  const handlerChangeDesMED = (event) => {
    setMedDes(event.target.value);
  };
  const handlerSubmitMED = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .addMedicine(MedName, MedDes)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };

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

  return (
    <Container className="mt-4">
       <Row className="mb-3">
        <Col>
          <h4>Order Medicines</h4>
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
         <Card.Header as="h5">Order New Medicine Batch</Card.Header>
         <Card.Body>
            <Form onSubmit={handlerSubmitMED}>
              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="formMedName">
                  <Form.Label>Medicine Name</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={handlerChangeNameMED}
                    placeholder="Enter medicine name"
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="formMedDesc">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={handlerChangeDesMED}
                    placeholder="Enter medicine description"
                    required
                  />
                </Form.Group>
              </Row>
              <Button variant="primary" type="submit">
                Order Medicine
              </Button>
            </Form>
         </Card.Body>
      </Card>

       <Card className="mb-4">
         <Card.Header as="h5">Existing Medicine Batches</Card.Header>
         <Card.Body>
            <table className="table table-sm table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Current Stage</th>
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
            </table>
         </Card.Body>
      </Card>
    </Container>
  );
}

export default AddMed;

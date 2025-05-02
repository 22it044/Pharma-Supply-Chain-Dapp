import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { useNavigate } from "react-router-dom";
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner'; // For loader
import Table from 'react-bootstrap/Table'; // Import Table component

function AssignRoles() {
  // <<< Debugging Log Start >>>
  console.log("AssignRoles component rendering...");
  // <<< Debugging Log End >>>

  const navigate = useNavigate();
  useEffect(() => {
    // <<< Debugging Log Start >>>
    console.log("AssignRoles useEffect hook running...");
    // <<< Debugging Log End >>>
    loadWeb3();
    loadBlockchaindata();
  }, []);

  // State variables (keep existing)
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [RMSname, setRMSname] = useState();
  const [MANname, setMANname] = useState();
  const [DISname, setDISname] = useState();
  const [RETname, setRETname] = useState();
  const [RMSplace, setRMSplace] = useState();
  const [MANplace, setMANplace] = useState();
  const [DISplace, setDISplace] = useState();
  const [RETplace, setRETplace] = useState();
  const [RMSaddress, setRMSaddress] = useState();
  const [MANaddress, setMANaddress] = useState();
  const [DISaddress, setDISaddress] = useState();
  const [RETaddress, setRETaddress] = useState();
  const [RMS, setRMS] = useState({}); // Initialize as empty object
  const [MAN, setMAN] = useState({}); // Initialize as empty object
  const [DIS, setDIS] = useState({}); // Initialize as empty object
  const [RET, setRET] = useState({}); // Initialize as empty object


  const loadWeb3 = async () => {
    // <<< Debugging Log Start >>>
    console.log("loadWeb3 function started...");
    // <<< Debugging Log End >>>

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
    // <<< Debugging Log Start >>>
    console.log("loadWeb3 function finished.");
    // <<< Debugging Log End >>>
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    setCurrentaccount(account);
    const networkId = await web3.eth.net.getId();

    // <<< Debugging Logs Start >>>
    console.log("Network ID from Metamask:", networkId); // Keep previous logs
    console.log("Available networks in ABI:", SupplyChainABI.networks); // Keep previous logs
    // <<< Debugging Logs End >>>

    const networkData = SupplyChainABI.networks[networkId];

    // <<< Debugging Logs Start >>>
    console.log("Network Data found for ID", networkId, ":", networkData); // Keep previous logs
    // <<< Debugging Logs End >>>

    if (networkData) {
      const supplychain = new web3.eth.Contract(
        SupplyChainABI.abi,
        networkData.address
      );
      setSupplyChain(supplychain);
      var i;
      const rmsCtr = await supplychain.methods.rmsCtr().call();
      const rmsData = {}; // Use temporary object
      for (i = 0; i < rmsCtr; i++) {
        rmsData[i] = await supplychain.methods.RMS(i + 1).call();
      }
      setRMS(rmsData); // Update state once

      const manCtr = await supplychain.methods.manCtr().call();
      const manData = {}; // Use temporary object
      for (i = 0; i < manCtr; i++) {
        manData[i] = await supplychain.methods.MAN(i + 1).call();
      }
      setMAN(manData); // Update state once

      const disCtr = await supplychain.methods.disCtr().call();
      const disData = {}; // Use temporary object
      for (i = 0; i < disCtr; i++) {
        disData[i] = await supplychain.methods.DIS(i + 1).call();
      }
      setDIS(disData); // Update state once

      const retCtr = await supplychain.methods.retCtr().call();
      const retData = {}; // Use temporary object
      for (i = 0; i < retCtr; i++) {
        retData[i] = await supplychain.methods.RET(i + 1).call();
      }
      setRET(retData); // Update state once

      setloader(false);
    } else {
      window.alert("The smart contract is not deployed to current network");
    }
  };

  // Keep existing handler functions
  const redirect_to_home = () => {
    navigate("/");
  };
  const handlerChangeAddressRMS = (event) => {
    setRMSaddress(event.target.value);
  };
  const handlerChangePlaceRMS = (event) => {
    setRMSplace(event.target.value);
  };
  const handlerChangeNameRMS = (event) => {
    setRMSname(event.target.value);
  };
  const handlerChangeAddressMAN = (event) => {
    setMANaddress(event.target.value);
  };
  const handlerChangePlaceMAN = (event) => {
    setMANplace(event.target.value);
  };
  const handlerChangeNameMAN = (event) => {
    setMANname(event.target.value);
  };
  const handlerChangeAddressDIS = (event) => {
    setDISaddress(event.target.value);
  };
  const handlerChangePlaceDIS = (event) => {
    setDISplace(event.target.value);
  };
  const handlerChangeNameDIS = (event) => {
    setDISname(event.target.value);
  };
  const handlerChangeAddressRET = (event) => {
    setRETaddress(event.target.value);
  };
  const handlerChangePlaceRET = (event) => {
    setRETplace(event.target.value);
  };
  const handlerChangeNameRET = (event) => {
    setRETname(event.target.value);
  };

  // Keep existing submit functions
  const handlerSubmitRMS = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .addRMS(RMSaddress, RMSname, RMSplace)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitMAN = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .addManufacturer(MANaddress, MANname, MANplace)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitDIS = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .addDistributor(DISaddress, DISname, DISplace)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };
  const handlerSubmitRET = async (event) => {
    event.preventDefault();
    try {
      var reciept = await SupplyChain.methods
        .addRetailer(RETaddress, RETname, RETplace)
        .send({ from: currentaccount });
      if (reciept) {
        loadBlockchaindata();
      }
    } catch (err) {
      alert("An error occured!!!");
    }
  };

  // Loader component
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

  // Main component render
  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h4>Register Participants</h4>
          <p>Current Account: {currentaccount}</p>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={redirect_to_home}>
            Back to Home
          </Button>
        </Col>
      </Row>
      <hr/>

      {/* Raw Material Suppliers Card */}
      <Card className="mb-4">
        <Card.Header as="h5">Raw Material Suppliers (RMS)</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <h6>Register New RMS</h6>
              <Form onSubmit={handlerSubmitRMS}>
                <Form.Group as={Row} className="mb-3" controlId="formRMSAddress">
                  <Form.Label column sm={3}>Address</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeAddressRMS}
                      placeholder="Ethereum Address"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formRMSName">
                  <Form.Label column sm={3}>Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeNameRMS}
                      placeholder="Supplier Name"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formRMSPlace">
                  <Form.Label column sm={3}>Place</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangePlaceRMS}
                      placeholder="Based In"
                      required
                    />
                  </Col>
                </Form.Group>
                 <Row>
                  <Col sm={{ span: 9, offset: 3 }}>
                    <Button variant="primary" type="submit">
                        Register RMS
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col md={6}>
              <h6>Registered RMS</h6>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Place</th>
                    <th>Ethereum Address</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(RMS).map(function (key) {
                    return (
                      <tr key={key}>
                        <td>{RMS[key].id}</td>
                        <td>{RMS[key].name}</td>
                        <td>{RMS[key].place}</td>
                        <td>{RMS[key].addr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Manufacturers Card */}
      <Card className="mb-4">
        <Card.Header as="h5">Manufacturers (MAN)</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <h6>Register New Manufacturer</h6>
              <Form onSubmit={handlerSubmitMAN}>
                 <Form.Group as={Row} className="mb-3" controlId="formMANAddress">
                  <Form.Label column sm={3}>Address</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeAddressMAN}
                      placeholder="Ethereum Address"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formMANName">
                  <Form.Label column sm={3}>Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeNameMAN}
                      placeholder="Manufacturer Name"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formMANPlace">
                  <Form.Label column sm={3}>Place</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangePlaceMAN}
                      placeholder="Based In"
                      required
                    />
                   </Col>
                </Form.Group>
                <Row>
                  <Col sm={{ span: 9, offset: 3 }}>
                    <Button variant="primary" type="submit">
                      Register Manufacturer
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col md={6}>
              <h6>Registered Manufacturers</h6>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Place</th>
                    <th>Ethereum Address</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(MAN).map(function (key) {
                    return (
                      <tr key={key}>
                        <td>{MAN[key].id}</td>
                        <td>{MAN[key].name}</td>
                        <td>{MAN[key].place}</td>
                        <td>{MAN[key].addr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Distributors Card */}
      <Card className="mb-4">
        <Card.Header as="h5">Distributors (DIS)</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <h6>Register New Distributor</h6>
              <Form onSubmit={handlerSubmitDIS}>
                 <Form.Group as={Row} className="mb-3" controlId="formDISAddress">
                  <Form.Label column sm={3}>Address</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeAddressDIS}
                      placeholder="Ethereum Address"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formDISName">
                  <Form.Label column sm={3}>Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeNameDIS}
                      placeholder="Distributor Name"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formDISPlace">
                  <Form.Label column sm={3}>Place</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangePlaceDIS}
                      placeholder="Based In"
                      required
                    />
                  </Col>
                </Form.Group>
                 <Row>
                  <Col sm={{ span: 9, offset: 3 }}>
                    <Button variant="primary" type="submit">
                      Register Distributor
                    </Button>
                   </Col>
                </Row>
              </Form>
            </Col>
            <Col md={6}>
              <h6>Registered Distributors</h6>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Place</th>
                    <th>Ethereum Address</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(DIS).map(function (key) {
                    return (
                      <tr key={key}>
                        <td>{DIS[key].id}</td>
                        <td>{DIS[key].name}</td>
                        <td>{DIS[key].place}</td>
                        <td>{DIS[key].addr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Retailers Card */}
      <Card className="mb-4">
        <Card.Header as="h5">Retailers (RET)</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <h6>Register New Retailer</h6>
              <Form onSubmit={handlerSubmitRET}>
                <Form.Group as={Row} className="mb-3" controlId="formRETAddress">
                  <Form.Label column sm={3}>Address</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeAddressRET}
                      placeholder="Ethereum Address"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formRETName">
                  <Form.Label column sm={3}>Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangeNameRET}
                      placeholder="Retailer Name"
                      required
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formRETPlace">
                  <Form.Label column sm={3}>Place</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      onChange={handlerChangePlaceRET}
                      placeholder="Based In"
                      required
                    />
                  </Col>
                </Form.Group>
                 <Row>
                  <Col sm={{ span: 9, offset: 3 }}>
                    <Button variant="primary" type="submit">
                      Register Retailer
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col md={6}>
              <h6>Registered Retailers</h6>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Place</th>
                    <th>Ethereum Address</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(RET).map(function (key) {
                    return (
                      <tr key={key}>
                        <td>{RET[key].id}</td>
                        <td>{RET[key].name}</td>
                        <td>{RET[key].place}</td>
                        <td>{RET[key].addr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AssignRoles;

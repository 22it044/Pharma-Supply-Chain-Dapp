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

  // --- Participant List States (Initialize as Arrays) ---
  const [RMS, setRMS] = useState([]); // Use array for list
  const [MAN, setMAN] = useState([]); // Use array for list
  const [DIS, setDIS] = useState([]); // Use array for list
  const [RET, setRET] = useState([]); // Use array for list
  // --- End State Variables ---

  // --- Fetch Functions ---
  const fetchRMS = async (supplyChainInstance) => {
    try {
      const count = await supplyChainInstance.methods.rmsCtr().call();
      const rmsList = [];
      for (let i = 1; i <= count; i++) {
        const rms = await supplyChainInstance.methods.RMS(i).call();
        rmsList.push(rms);
      }
      setRMS(rmsList || []);
    } catch (err) {
      console.error("Error fetching RMS:", err);
      setRMS([]); // Set to empty array on error
    }
  };

  const fetchMAN = async (supplyChainInstance) => {
    try {
      const count = await supplyChainInstance.methods.manCtr().call();
      const manList = [];
      for (let i = 1; i <= count; i++) {
        const man = await supplyChainInstance.methods.MAN(i).call();
        manList.push(man);
      }
      setMAN(manList || []);
    } catch (err) {
      console.error("Error fetching Manufacturers:", err);
      setMAN([]);
    }
  };

  const fetchDIS = async (supplyChainInstance) => {
    try {
      const count = await supplyChainInstance.methods.disCtr().call();
      const disList = [];
      for (let i = 1; i <= count; i++) {
        const dis = await supplyChainInstance.methods.DIS(i).call();
        disList.push(dis);
      }
      setDIS(disList || []);
    } catch (err) {
      console.error("Error fetching Distributors:", err);
      setDIS([]);
    }
  };

  const fetchRET = async (supplyChainInstance) => {
    try {
      const count = await supplyChainInstance.methods.retCtr().call();
      const retList = [];
      for (let i = 1; i <= count; i++) {
        const ret = await supplyChainInstance.methods.RET(i).call();
        retList.push(ret);
      }
      setRET(retList || []);
    } catch (err) {
      console.error("Error fetching Retailers:", err);
      setRET([]);
    }
  };
  // --- End Fetch Functions ---

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error("[loadWeb3] User denied account access or error occurred:", error);
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
      console.error("[loadBlockchaindata] web3 instance not found!");
      setloader(false);
      return; // Exit if web3 isn't initialized
    }

    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        console.error("[loadBlockchaindata] No accounts found. Is Metamask unlocked and connected?");
        window.alert("No accounts found. Please ensure Metamask is unlocked and connected to this site.");
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

        await fetchRMS(supplychain);
        await fetchMAN(supplychain);
        await fetchDIS(supplychain);
        await fetchRET(supplychain);

        setloader(false);
      } else {
        console.error("[loadBlockchaindata] Smart contract not deployed to detected network (", networkId, "). Check contract migration and Metamask network.");
        window.alert("The smart contract is not deployed to current network. Please check Metamask network or deploy the contract.");
        setloader(false); // Stop loader even if contract fails
      }
    } catch (error) {
      console.error("[loadBlockchaindata] Error during blockchain data loading:", error);
      window.alert("An error occurred while loading blockchain data. Check console.");
      setloader(false);
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

  // --- Submit Handlers ---
  const handlerSubmitRMS = async (event) => {
    event.preventDefault();
    try {
      if (!SupplyChain) return; // Ensure contract is loaded
      setloader(true); // Show loader during transaction
      await SupplyChain.methods
        .addRMS(RMSaddress, RMSname, RMSplace)
        .send({ from: currentaccount });
      // --- Re-fetch RMS list after successful transaction ---
      await fetchRMS(SupplyChain);
      setloader(false); // Hide loader
      // Optionally clear input fields
      setRMSaddress(''); setRMSname(''); setRMSplace('');
    } catch (err) {
      alert("Error registering RMS. Check console for details.");
      console.error(err);
      setloader(false); // Hide loader on error
    }
  };

  const handlerSubmitMAN = async (event) => {
     event.preventDefault();
        try {
            if (!SupplyChain) return;
            setloader(true);
            await SupplyChain.methods
                .addManufacturer(MANaddress, MANname, MANplace)
                .send({ from: currentaccount });
            // --- Re-fetch MAN list ---
             await fetchMAN(SupplyChain);
             setloader(false);
             // Clear input fields
              setMANaddress(''); setMANname(''); setMANplace('');
        } catch (err) {
             alert("Error registering Manufacturer. Check console for details.");
            console.error(err);
            setloader(false);
        }
  };

  const handlerSubmitDIS = async (event) => {
    event.preventDefault();
        try {
            if (!SupplyChain) return;
             setloader(true);
            await SupplyChain.methods
                .addDistributor(DISaddress, DISname, DISplace)
                .send({ from: currentaccount });
             // --- Re-fetch DIS list ---
             await fetchDIS(SupplyChain);
             setloader(false);
             // Clear input fields
             setDISaddress(''); setDISname(''); setDISplace('');
        } catch (err) {
             alert("Error registering Distributor. Check console for details.");
            console.error(err);
            setloader(false);
        }
  };

  const handlerSubmitRET = async (event) => {
    event.preventDefault();
        try {
             if (!SupplyChain) return;
             setloader(true);
            await SupplyChain.methods
                .addRetailer(RETaddress, RETname, RETplace)
                .send({ from: currentaccount });
            // --- Re-fetch RET list ---
            await fetchRET(SupplyChain);
            setloader(false);
            // Clear input fields
            setRETaddress(''); setRETname(''); setRETplace('');
        } catch (err) {
             alert("Error registering Retailer. Check console for details.");
            console.error(err);
            setloader(false);
        }
  };
  // --- End Submit Handlers ---


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
                  {RMS.map((rms, index) => (
                    <tr key={index}>
                      <td>{rms.id}</td>
                      <td>{rms.name}</td>
                      <td>{rms.place}</td>
                      <td>{rms.addr}</td>
                    </tr>
                  ))}
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
                  {MAN.map((man, index) => (
                    <tr key={index}>
                      <td>{man.id}</td>
                      <td>{man.name}</td>
                      <td>{man.place}</td>
                      <td>{man.addr}</td>
                    </tr>
                  ))}
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
                  {DIS.map((dis, index) => (
                    <tr key={index}>
                      <td>{dis.id}</td>
                      <td>{dis.name}</td>
                      <td>{dis.place}</td>
                      <td>{dis.addr}</td>
                    </tr>
                  ))}
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
                  {RET.map((ret, index) => (
                    <tr key={index}>
                      <td>{ret.id}</td>
                      <td>{ret.name}</td>
                      <td>{ret.place}</td>
                      <td>{ret.addr}</td>
                    </tr>
                  ))}
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

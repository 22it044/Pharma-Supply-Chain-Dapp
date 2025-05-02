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
  const [currentaccount, setCurrentaccount] = useState("");
  const [loader, setloader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [medicinesList, setMedicinesList] = useState([]); 
  const [MedName, setMedName] = useState(''); 
  const [MedDes, setMedDes] = useState(''); 

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
           console.log("Fetched medicines:", fetchedMedicines); 
      } catch (err) {
           console.error("Error fetching medicine count or list:", err);
           setMedicinesList([]); 
      }
  };

  const loadBlockchaindata = async () => {
    setloader(true);
    const web3 = window.web3;

    if (!web3) {
        console.error("[loadBlockchaindata] web3 instance not found!");
        window.alert("Web3 instance not found. Please ensure Metamask is installed and enabled.");
        setloader(false);
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.error("[loadBlockchaindata] No accounts found. Is Metamask unlocked and connected?");
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
            await fetchMedicines(supplychain); 
        } else {
            console.error(`Smart contract not deployed to detected network (${networkId}).`);
            window.alert("The smart contract is not deployed to the current network. Please check Metamask network.");
        }
    } catch (error) {
         console.error("[loadBlockchaindata] Error:", error);
         window.alert("An error occurred loading blockchain data. Check console.");
    } finally {
        setloader(false);
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
    if (!SupplyChain || !currentaccount) {
        alert("Blockchain data not loaded correctly. Please refresh.");
        return;
    }
    setloader(true); 
    try {
      var receipt = await SupplyChain.methods
        .addMedicine(MedName, MedDes)
        .send({ from: currentaccount });

      if (receipt) {
         console.log("Medicine added successfully:", receipt);
         alert("Medicine Ordered Successfully!");
         await fetchMedicines(SupplyChain); 
         setMedName('');
         setMedDes('');
         const nameInput = document.getElementById('formMedName');
         const descInput = document.getElementById('formMedDesc');
         if(nameInput) nameInput.value = '';
         if(descInput) descInput.value = '';
      }
    } catch (err) {
       console.error("Error submitting medicine:", err);
       alert(`Error ordering medicine: ${err.message || 'Check console for details.'}`);
    } finally {
       setloader(false); 
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
                    value={MedName} 
                    onChange={handlerChangeNameMED}
                    placeholder="Enter medicine name"
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="formMedDesc">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={MedDes} 
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
                {medicinesList.length > 0 ? (
                   medicinesList.map((medItem, key) => (
                    <tr key={key}>
                      <td>{medItem.id.toString()}</td> 
                      <td>{medItem.name}</td>
                      <td>{medItem.description}</td>
                      <td>{medItem.stage}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No medicines found.</td>
                  </tr>
                )}
              </tbody>
            </table>
         </Card.Body>
      </Card>
    </Container>
  );
}

export default AddMed;

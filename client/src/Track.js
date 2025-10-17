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
        <div>
            <div style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Row>
                    <Col md={8}>
                        <div style={{ marginBottom: '1rem' }}>
                          <h6 style={{ 
                            color: '#667eea', 
                            marginBottom: '1rem', 
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>💊</span>
                            Medicine Information
                          </h6>
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '8px'
                          }}>
                            <strong style={{ color: '#495057', minWidth: '120px' }}>Medicine ID:</strong>
                            <span style={{ color: '#212529', fontFamily: 'monospace', fontWeight: '600' }}>#{MED.id}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '8px'
                          }}>
                            <strong style={{ color: '#495057', minWidth: '120px' }}>Name:</strong>
                            <span style={{ color: '#212529' }}>{MED.name}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start',
                            padding: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '8px'
                          }}>
                            <strong style={{ color: '#495057', minWidth: '120px' }}>Description:</strong>
                            <span style={{ color: '#212529' }}>{MED.description}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '8px'
                          }}>
                            <strong style={{ color: '#495057', minWidth: '120px' }}>Current Stage:</strong>
                            <span style={{ 
                              background: MedStage === "Medicine Sold" ? '#28a745' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                              color: 'white', 
                              padding: '0.4rem 1rem', 
                              borderRadius: '20px', 
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                              {MedStage}
                            </span>
                          </div>
                        </div>
                    </Col>
                    <Col md={4} className="text-center">
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #f0f0f0' }}>
                            <QRCodeSVG value={MED.id.toString()} size={120} level="H" />
                            {MedStage !== "Medicine Sold" && (
                                <p style={{ marginTop: '0.75rem', marginBottom: '0', fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                    <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.25rem' }}>📱</span>
                                    Scan to Update Status
                                </p>
                            )}
                            {MedStage === "Medicine Sold" && (
                                <p style={{ marginTop: '0.75rem', marginBottom: '0', fontSize: '0.85rem', color: '#28a745', fontWeight: '600' }}>
                                    <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.25rem' }}>✅</span>
                                    Completed
                                </p>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
            
            {(TrackTillRMS || TrackTillManufacture || TrackTillDistribution || TrackTillRetail || TrackTillSold) && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <h6 style={{ 
                      color: '#667eea', 
                      marginBottom: '1.5rem', 
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🔗</span>
                      Supply Chain Journey
                    </h6>
                    
                    {TrackTillRMS && RMS && (
                        <div style={{ 
                          marginBottom: '1.25rem', 
                          padding: '1rem', 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          borderRadius: '10px',
                          borderLeft: '4px solid #667eea',
                          transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '1rem',
                                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>🏭</span>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#212529', fontSize: '1rem' }}>Raw Material Supplier</div>
                                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.15rem' }}>Stage 1</div>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '4rem' }}>
                              <p style={{ marginBottom: '0.4rem', color: '#495057', fontWeight: '600' }}>
                                {RMS.name}
                              </p>
                              <p style={{ marginBottom: '0.4rem', fontSize: '0.9rem', color: '#6c757d' }}>
                                <strong>Location:</strong> {RMS.place}
                              </p>
                              <p style={{ marginBottom: '0', fontSize: '0.85rem', color: '#6c757d', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                <strong>Address:</strong> {RMS.addr}
                              </p>
                            </div>
                        </div>
                    )}
                    
                    {TrackTillManufacture && MAN && (
                        <div style={{ 
                          marginBottom: '1.25rem', 
                          padding: '1rem', 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          borderRadius: '10px',
                          borderLeft: '4px solid #667eea',
                          transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '1rem',
                                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>🏢</span>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#212529', fontSize: '1rem' }}>Manufacturer</div>
                                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.15rem' }}>Stage 2</div>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '4rem' }}>
                              <p style={{ marginBottom: '0.4rem', color: '#495057', fontWeight: '600' }}>
                                {MAN.name}
                              </p>
                              <p style={{ marginBottom: '0.4rem', fontSize: '0.9rem', color: '#6c757d' }}>
                                <strong>Location:</strong> {MAN.place}
                              </p>
                              <p style={{ marginBottom: '0', fontSize: '0.85rem', color: '#6c757d', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                <strong>Address:</strong> {MAN.addr}
                              </p>
                            </div>
                        </div>
                    )}
                    
                    {TrackTillDistribution && DIS && (
                        <div style={{ 
                          marginBottom: '1.25rem', 
                          padding: '1rem', 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          borderRadius: '10px',
                          borderLeft: '4px solid #667eea',
                          transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '1rem',
                                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>🚚</span>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#212529', fontSize: '1rem' }}>Distributor</div>
                                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.15rem' }}>Stage 3</div>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '4rem' }}>
                              <p style={{ marginBottom: '0.4rem', color: '#495057', fontWeight: '600' }}>
                                {DIS.name}
                              </p>
                              <p style={{ marginBottom: '0.4rem', fontSize: '0.9rem', color: '#6c757d' }}>
                                <strong>Location:</strong> {DIS.place}
                              </p>
                              <p style={{ marginBottom: '0', fontSize: '0.85rem', color: '#6c757d', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                <strong>Address:</strong> {DIS.addr}
                              </p>
                            </div>
                        </div>
                    )}
                    
                    {TrackTillRetail && RET && (
                        <div style={{ 
                          marginBottom: '1.25rem', 
                          padding: '1rem', 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          borderRadius: '10px',
                          borderLeft: '4px solid #667eea',
                          transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '1rem',
                                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>🏪</span>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#212529', fontSize: '1rem' }}>Retailer</div>
                                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.15rem' }}>Stage 4</div>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '4rem' }}>
                              <p style={{ marginBottom: '0.4rem', color: '#495057', fontWeight: '600' }}>
                                {RET.name}
                              </p>
                              <p style={{ marginBottom: '0.4rem', fontSize: '0.9rem', color: '#6c757d' }}>
                                <strong>Location:</strong> {RET.place}
                              </p>
                              <p style={{ marginBottom: '0', fontSize: '0.85rem', color: '#6c757d', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                <strong>Address:</strong> {RET.addr}
                              </p>
                            </div>
                        </div>
                    )}
                    
                    {TrackTillSold && (
                        <div style={{ 
                          marginBottom: '0', 
                          padding: '1rem', 
                          background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(25, 135, 84, 0.1) 100%)',
                          borderRadius: '10px',
                          borderLeft: '4px solid #28a745',
                          transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #28a745 0%, #198754 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '1rem',
                                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>✅</span>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#212529', fontSize: '1rem' }}>Medicine Sold</div>
                                  <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.15rem', fontWeight: '600' }}>Final Stage - Completed ✓</div>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '4rem' }}>
                              <p style={{ marginBottom: '0', color: '#495057', fontSize: '0.95rem' }}>
                                This medicine has completed its journey through the supply chain and has been sold to the end consumer.
                              </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
  };


  // Initial Loader for web3/contract setup
  if (loader && !SupplyChain) { // Only show full page loader initially
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container className="text-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4 className="wait mt-3">Connecting to Blockchain...</h4>
        </Container>
      </div>
    );
  }

  // Main Render
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
                <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>📍</span>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0' }}>Track & Trace</h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '1rem' }}>Real-time medicine supply chain tracking</p>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block', backdropFilter: 'blur(10px)' }}>
                <small style={{ color: 'white', fontFamily: 'monospace' }}>
                  <strong>Connected:</strong> {currentaccount.substring(0, 6)}...{currentaccount.substring(38)}
                </small>
              </div>
            </Col>
          </Row>
        </div>

        <Row>
          <Col md={5} className="mb-3 mb-md-0">
            <Card style={{ 
              border: 'none', 
              height: '100%',
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
                🔍 Enter Medicine ID
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <Form onSubmit={handlerSubmit}>
                    <Form.Group className="mb-3" controlId="formTrackId">
                        <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '0.5rem' }}>Medicine ID</Form.Label>
                        <Form.Control
                          type="number"
                          onChange={handlerChangeID}
                          placeholder="Enter medicine ID to track"
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
                          Enter a valid medicine ID to view its complete supply chain journey
                        </Form.Text>
                    </Form.Group>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={!ID || loader}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 2rem',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loader && !SupplyChain ? '⏳ Connecting...' : (loader ? '🔍 Tracking...' : '🚀 Track Medicine')}
                    </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={7}>
            <Card style={{ 
              border: 'none', 
              height: '100%',
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
                📊 Tracking Details
              </Card.Header>
                <Card.Body style={{ padding: '1.5rem' }}>
                    {renderTrackingInfo()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Track;

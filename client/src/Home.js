import React from "react";
import { useNavigate } from "react-router-dom";
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

function Home() {
  const navigate = useNavigate();
  const redirect_to_roles = () => {
    navigate("/roles");
  };
  const redirect_to_addmed = () => {
    navigate("/addmed");
  };
  const redirect_to_supply = () => {
    navigate("/supply");
  };
  const redirect_to_track = () => {
    navigate("/track");
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', paddingBottom: '4rem' }}>
      {/* Premium Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '4rem 0 5rem',
        marginBottom: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <div className="text-center" style={{ color: 'white' }}>
                <div style={{ 
                  fontSize: '4.5rem', 
                  marginBottom: '1rem',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  💎
                </div>
                <h1 style={{ 
                  fontSize: '3.5rem', 
                  fontWeight: '900', 
                  marginBottom: '1rem',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  letterSpacing: '-1px'
                }}>
                  ClearSource
                </h1>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  opacity: '0.95',
                  marginBottom: '1.5rem',
                  letterSpacing: '2px'
                }}>
                  PHARMACEUTICAL SUPPLY CHAIN
                </div>
                <p style={{ 
                  fontSize: '1.25rem', 
                  opacity: '0.9',
                  maxWidth: '750px', 
                  margin: '0 auto 2rem',
                  lineHeight: '1.8',
                  fontWeight: '400'
                }}>
                  Crystal-clear tracking and management of medicines using blockchain technology. 
                  Ensuring authenticity, security, and complete transparency from source to consumer.
                </p>
                
                {/* Feature Pills */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  marginTop: '2rem'
                }}>
                  <span className="badge-premium" style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white'
                  }}>
                    🔐 Secure
                  </span>
                  <span className="badge-premium" style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white'
                  }}>
                    🔗 Blockchain-Based
                  </span>
                  <span className="badge-premium" style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white'
                  }}>
                    📊 Transparent
                  </span>
                  <span className="badge-premium" style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white'
                  }}>
                    ⚡ Real-time
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Section Title */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Get Started in 4 Simple Steps
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                Complete end-to-end supply chain management
              </p>
            </div>
          </Col>
        </Row>

        <Row xs={1} md={2} lg={4} className="g-4 justify-content-center">
          {/* Step 1: Register Roles */}
          <Col>
            <Card bg="light" className="h-100 shadow-sm" style={{ borderTop: '4px solid var(--primary-color)' }}>
              <Card.Body className="d-flex flex-column" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
                <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  1. Register Participants
                </Card.Title>
                <Card.Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                  Assign roles to Raw Material Suppliers, Manufacturers, Distributors, and Retailers.
                </Card.Text>
                <Button variant="primary" onClick={redirect_to_roles} className="mt-auto" style={{ width: '100%' }}>
                  Register Roles
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Step 2: Order Medicines */}
          <Col>
            <Card bg="light" className="h-100 shadow-sm" style={{ borderTop: '4px solid var(--secondary-color)' }}>
              <Card.Body className="d-flex flex-column" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💊</div>
                <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  2. Order Medicines
                </Card.Title>
                <Card.Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                  Add new medicine batches to the supply chain (only Manufacturers).
                </Card.Text>
                <Button variant="secondary" onClick={redirect_to_addmed} className="mt-auto" style={{ width: '100%' }}>
                  Order Medicines
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Step 3: Control Supply Chain */}
          <Col>
            <Card bg="light" className="h-100 shadow-sm" style={{ borderTop: '4px solid var(--info-color)' }}>
              <Card.Body className="d-flex flex-column" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  3. Control Supply Chain
                </Card.Title>
                <Card.Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                  Update the stage of medicines as they move through the chain (participants based on role).
                </Card.Text>
                <Button variant="info" onClick={redirect_to_supply} className="mt-auto text-white" style={{ width: '100%' }}>
                  Control Chain
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Step 4: Track Medicines */}
          <Col>
            <Card bg="light" className="h-100 shadow-sm" style={{ borderTop: '4px solid #1e293b' }}>
              <Card.Body className="d-flex flex-column" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
                <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  4. Track Medicines
                </Card.Title>
                <Card.Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                  Track the journey of a specific medicine batch using its ID.
                </Card.Text>
                <Button variant="dark" onClick={redirect_to_track} className="mt-auto" style={{ width: '100%' }}>
                  Track Medicine
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="mt-5">
          <Col>
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '3rem 2rem',
              border: '1px solid var(--border-color)'
            }}>
              <Row className="align-items-center">
                <Col lg={6} className="mb-4 mb-lg-0">
                  <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.75rem' }}>
                    Why Choose ClearSource?
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="info-box" style={{ 
                      background: 'white',
                      borderLeft: '4px solid var(--primary-color)',
                      padding: '1rem 1.5rem',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        🔐 Immutable Records
                      </div>
                      <p style={{ marginBottom: '0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        All transactions are permanently recorded on the blockchain, preventing tampering and fraud.
                      </p>
                    </div>
                    
                    <div className="info-box" style={{ 
                      background: 'white',
                      borderLeft: '4px solid var(--success-color)',
                      padding: '1rem 1.5rem',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        📊 Complete Visibility
                      </div>
                      <p style={{ marginBottom: '0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Track every step of medicine's journey from manufacturer to consumer.
                      </p>
                    </div>
                    
                    <div className="info-box" style={{ 
                      background: 'white',
                      borderLeft: '4px solid var(--info-color)',
                      padding: '1rem 1.5rem',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        ⚡ Real-Time Updates
                      </div>
                      <p style={{ marginBottom: '0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Get instant updates as medicines move through each stage of the supply chain.
                      </p>
                    </div>
                  </div>
                </Col>
                
                <Col lg={6}>
                  <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                      Supply Chain Participants
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-sm)',
                        gap: '1rem'
                      }}>
                        <div style={{ fontSize: '2rem' }}>🏭</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            Raw Material Suppliers
                          </div>
                          <small style={{ color: 'var(--text-muted)' }}>
                            Provide initial materials
                          </small>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-sm)',
                        gap: '1rem'
                      }}>
                        <div style={{ fontSize: '2rem' }}>🏢</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            Manufacturers
                          </div>
                          <small style={{ color: 'var(--text-muted)' }}>
                            Produce medicines
                          </small>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-sm)',
                        gap: '1rem'
                      }}>
                        <div style={{ fontSize: '2rem' }}>🚚</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            Distributors
                          </div>
                          <small style={{ color: 'var(--text-muted)' }}>
                            Handle logistics
                          </small>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-sm)',
                        gap: '1rem'
                      }}>
                        <div style={{ fontSize: '2rem' }}>🏪</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            Retailers
                          </div>
                          <small style={{ color: 'var(--text-muted)' }}>
                            Sell to consumers
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="mt-5">
          <Col>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'white',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '1.75rem' }}>
                  Ready to Secure Your Supply Chain?
                </h4>
                <p style={{ fontSize: '1.125rem', opacity: '0.95', maxWidth: '600px', margin: '0 auto 2rem' }}>
                  Join the future of pharmaceutical supply chain management with blockchain technology
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    onClick={redirect_to_roles}
                    style={{
                      background: 'white',
                      color: 'var(--primary-color)',
                      border: 'none',
                      padding: '0.75rem 2rem',
                      fontWeight: '600',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    Get Started →
                  </Button>
                  <Button 
                    onClick={redirect_to_track}
                    variant="outline-light"
                    style={{
                      padding: '0.75rem 2rem',
                      fontWeight: '600',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '2px solid white'
                    }}
                  >
                    Track Medicine
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;

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
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">Pharmaceutical Supply Chain</h2>
          <p className="text-center text-muted">Track and manage medicines transparently using blockchain.</p>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
        {/* Step 1: Register Roles */}
        <Col>
          <Card bg="light" className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>1. Register Participants</Card.Title>
              <Card.Text>
                Assign roles to Raw Material Suppliers, Manufacturers, Distributors, and Retailers.
              </Card.Text>
              <Button variant="primary" onClick={redirect_to_roles} className="mt-auto">
                Register Roles
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Step 2: Order Medicines */}
        <Col>
          <Card bg="light" className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>2. Order Medicines</Card.Title>
              <Card.Text>
                Add new medicine batches to the supply chain (only Manufacturers).
              </Card.Text>
              <Button variant="secondary" onClick={redirect_to_addmed} className="mt-auto">
                Order Medicines
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Step 3: Control Supply Chain */}
        <Col>
           <Card bg="light" className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>3. Control Supply Chain</Card.Title>
              <Card.Text>
                Update the stage of medicines as they move through the chain (participants based on role).
              </Card.Text>
              <Button variant="info" onClick={redirect_to_supply} className="mt-auto text-white">
                Control Chain
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Step 4: Track Medicines */}
        <Col>
           <Card bg="light" className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title>4. Track Medicines</Card.Title>
              <Card.Text>
                Track the journey of a specific medicine batch using its ID.
              </Card.Text>
              <Button variant="dark" onClick={redirect_to_track} className="mt-auto">
                Track Medicine
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;

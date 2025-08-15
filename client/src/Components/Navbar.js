import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function PremiumNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar 
      expand="lg" 
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <Container>
        <Navbar.Brand 
          onClick={() => navigate('/')}
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: '700',
            fontSize: '1.5rem'
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🏥 PharmaChain
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" style={{ gap: '0.5rem' }}>
            <Nav.Link 
              onClick={() => navigate('/')}
              style={{
                fontWeight: isActive('/') ? '600' : '500',
                color: isActive('/') ? 'var(--primary-color)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: isActive('/') ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Home
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/roles')}
              style={{
                fontWeight: isActive('/roles') ? '600' : '500',
                color: isActive('/roles') ? 'var(--primary-color)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: isActive('/roles') ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Register Roles
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/addmed')}
              style={{
                fontWeight: isActive('/addmed') ? '600' : '500',
                color: isActive('/addmed') ? 'var(--primary-color)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: isActive('/addmed') ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Order Medicines
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/supply')}
              style={{
                fontWeight: isActive('/supply') ? '600' : '500',
                color: isActive('/supply') ? 'var(--primary-color)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: isActive('/supply') ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Control Chain
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => navigate('/track')}
              style={{
                fontWeight: isActive('/track') ? '600' : '500',
                color: isActive('/track') ? 'var(--primary-color)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: isActive('/track') ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Track
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default PremiumNavbar;

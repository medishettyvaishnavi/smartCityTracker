import { Container, Nav, Navbar as BootstrapNavbar } from "react-bootstrap";

function Navbar() {
  return (
    <BootstrapNavbar bg="dark" variant="dark">
      <Container>
        <BootstrapNavbar.Brand href="/">
          Smart City
        </BootstrapNavbar.Brand>

        <Nav>
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/complaints">My Complaints</Nav.Link>
          <Nav.Link href="/report">Report Issue</Nav.Link>
          <Nav.Link href="/login">Login</Nav.Link>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
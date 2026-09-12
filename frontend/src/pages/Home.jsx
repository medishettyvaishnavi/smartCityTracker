import { Container, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <Container className="text-center mt-5">
        <h1>Smart City Complaint & Service Tracker</h1>

        <p className="lead mt-3">
          Report public issues and track their resolution easily.
        </p>

        <div className="mt-4">
          <Button as={Link} to="/report" variant="primary" className="me-3">
            Report an Issue
          </Button>

          <Button as={Link} to="/complaints" variant="outline-primary">
            My Complaints
          </Button>
        </div>
      </Container>

      <Container className="mt-5">
        <div className="row">
          <div className="col-md-4 mb-3">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Report Issues</Card.Title>
                <Card.Text>
                  Report problems such as damaged roads, garbage,
                  streetlights and water leaks.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4 mb-3">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Track Complaints</Card.Title>
                <Card.Text>
                  Check the status of your complaints and see whether
                  they are pending, in progress or resolved.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4 mb-3">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Better City Services</Card.Title>
                <Card.Text>
                  Help authorities identify and resolve public-service
                  problems more efficiently.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Home;
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <Container fluid className="py-4">
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">1,234</div>
                </Col>
                <Col className="text-right">
                  <FaUsers size={30} className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-success shadow h-100 py-2">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">567</div>
                </Col>
                <Col className="text-right">
                  <FaShoppingCart size={30} className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-info shadow h-100 py-2">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">$25,000</div>
                </Col>
                <Col className="text-right">
                  <FaDollarSign size={30} className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-warning shadow h-100 py-2">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Growth
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">15%</div>
                </Col>
                <Col className="text-right">
                  <FaChartLine size={30} className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Content Row */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Overview</h6>
            </Card.Header>
            <Card.Body>
              <p>Place your main content, charts or tables here</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Activities</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-3">New order received</li>
                <li className="mb-3">User registration completed</li>
                <li className="mb-3">Payment processed</li>
                <li className="mb-3">Product updated</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
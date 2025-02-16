import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';

function Optimization() {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [constraints, setConstraints] = useState({
    maxBudget: '',
    minESGScore: '',
    maxRisk: ''
  });
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      return [...prev, projectId];
    });
  };

  const handleConstraintChange = (e) => {
    const { name, value } = e.target;
    setConstraints(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptimize = async () => {
    if (selectedProjects.length === 0) {
      alert('Please select at least one project');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/optimization/portfolio', {
        projectIds: selectedProjects,
        constraints
      });
      setOptimizationResult(response.data);
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
      alert('Error optimizing portfolio');
    }
    setLoading(false);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderAllocationChart = () => {
    if (!optimizationResult) return null;

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={optimizationResult.allocation}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {optimizationResult.allocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Portfolio Optimization</h2>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Select Projects</Card.Title>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {projects.map((project) => (
                  <Form.Check
                    key={project._id}
                    type="checkbox"
                    id={`project-${project._id}`}
                    label={`${project.name} (Budget: $${project.budget.toLocaleString()})`}
                    checked={selectedProjects.includes(project._id)}
                    onChange={() => handleProjectSelect(project._id)}
                    className="mb-2"
                  />
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Optimization Constraints</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Budget ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxBudget"
                    value={constraints.maxBudget}
                    onChange={handleConstraintChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Minimum ESG Score</Form.Label>
                  <Form.Control
                    type="number"
                    name="minESGScore"
                    value={constraints.minESGScore}
                    onChange={handleConstraintChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Maximum Risk Level</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxRisk"
                    value={constraints.maxRisk}
                    onChange={handleConstraintChange}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleOptimize}
                  disabled={loading || selectedProjects.length === 0}
                >
                  {loading ? 'Optimizing...' : 'Optimize Portfolio'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {optimizationResult && (
        <>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Optimal Allocation</Card.Title>
                  {renderAllocationChart()}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Portfolio Metrics</Card.Title>
                  <Table striped bordered>
                    <tbody>
                      <tr>
                        <td>Expected Return</td>
                        <td>{(optimizationResult.metrics.expectedReturn * 100).toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td>Risk Level</td>
                        <td>{optimizationResult.metrics.risk.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>ESG Score</td>
                        <td>{optimizationResult.metrics.esgScore.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Allocation Details</Card.Title>
                  <Table responsive striped bordered>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Allocation (%)</th>
                        <th>Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimizationResult.allocation.map((item) => (
                        <tr key={item.project}>
                          <td>{item.name}</td>
                          <td>{(item.weight * 100).toFixed(2)}%</td>
                          <td>${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default Optimization;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
         BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    esgScores: [],
    portfolioPerformance: [],
    riskAnalysis: []
  });

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const projectsRes = await axios.get('/api/projects');
        const analysisRes = await axios.get('/api/analysis/portfolio', {
          data: { projectIds: projectsRes.data.map(p => p._id) }
        });

        setDashboardData({
          projects: projectsRes.data,
          esgScores: calculateESGScores(projectsRes.data),
          portfolioPerformance: analysisRes.data.performance,
          riskAnalysis: analysisRes.data.risks
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateESGScores = (projects) => {
    return projects.map(project => ({
      name: project.name,
      environmental: project.esgScores.environmental,
      social: project.esgScores.social,
      governance: project.esgScores.governance
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Green Finance Dashboard</h2>
      
      <Row>
        <Col md={6} lg={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Total Projects</Card.Title>
              <Card.Text className="h2">{dashboardData.projects.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Average ESG Score</Card.Title>
              <Card.Text className="h2">
                {dashboardData.esgScores.length > 0
                  ? (dashboardData.esgScores.reduce((acc, curr) => 
                      acc + (curr.environmental + curr.social + curr.governance) / 3, 0
                    ) / dashboardData.esgScores.length).toFixed(2)
                  : 'N/A'
                }
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>ESG Scores by Project</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer>
                  <BarChart data={dashboardData.esgScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="environmental" fill="#8884d8" />
                    <Bar dataKey="social" fill="#82ca9d" />
                    <Bar dataKey="governance" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Portfolio Performance</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer>
                  <LineChart data={dashboardData.portfolioPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="return" stroke="#8884d8" />
                    <Line type="monotone" dataKey="risk" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Risk Analysis</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.riskAnalysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.riskAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;

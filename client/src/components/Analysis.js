import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import axios from 'axios';

function Analysis() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
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

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    if (projectId) {
      setLoading(true);
      try {
        const response = await axios.post('/api/analysis/esg-impact', { projectId });
        setAnalysisData(response.data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
      setLoading(false);
    }
  };

  const renderESGRadar = () => {
    if (!analysisData) return null;

    const radarData = [
      {
        subject: 'Environmental',
        score: analysisData.esgScore.environmental,
        fullMark: 100,
      },
      {
        subject: 'Social',
        score: analysisData.esgScore.social,
        fullMark: 100,
      },
      {
        subject: 'Governance',
        score: analysisData.esgScore.governance,
        fullMark: 100,
      },
    ];

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="ESG Score"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderRiskAnalysis = () => {
    if (!analysisData) return null;

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={analysisData.risks.categories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#82ca9d" name="Risk Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Project Analysis</h2>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Project</Form.Label>
            <Form.Select
              value={selectedProject}
              onChange={(e) => handleProjectSelect(e.target.value)}
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div>Loading analysis...</div>
      ) : analysisData ? (
        <>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>ESG Score Analysis</Card.Title>
                  {renderESGRadar()}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Risk Analysis</Card.Title>
                  {renderRiskAnalysis()}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Recommendations</Card.Title>
                  <ul>
                    {analysisData.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Card.Title>Impact Assessment</Card.Title>
                  <Row>
                    <Col md={4}>
                      <h6>Environmental Impact</h6>
                      <p>{analysisData.impact.environmental}</p>
                    </Col>
                    <Col md={4}>
                      <h6>Social Impact</h6>
                      <p>{analysisData.impact.social}</p>
                    </Col>
                    <Col md={4}>
                      <h6>Economic Impact</h6>
                      <p>{analysisData.impact.economic}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <div>Select a project to view analysis</div>
      )}
    </Container>
  );
}

export default Analysis;

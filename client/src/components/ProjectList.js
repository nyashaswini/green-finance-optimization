import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const getESGBadgeColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const calculateAverageESG = (esgScores) => {
    return ((esgScores.environmental + esgScores.social + esgScores.governance) / 3).toFixed(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Green Finance Projects</h2>
        <Button as={Link} to="/projects/add" variant="success">
          Add New Project
        </Button>
      </div>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Sector</th>
            <th>Location</th>
            <th>Budget</th>
            <th>ESG Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project._id}>
              <td>{project.name}</td>
              <td>{project.sector}</td>
              <td>{project.location}</td>
              <td>${project.budget.toLocaleString()}</td>
              <td>
                <Badge bg={getESGBadgeColor(calculateAverageESG(project.esgScores))}>
                  {calculateAverageESG(project.esgScores)}
                </Badge>
              </td>
              <td>
                <Badge bg={project.status === 'active' ? 'success' : 'secondary'}>
                  {project.status}
                </Badge>
              </td>
              <td>
                <Button
                  as={Link}
                  to={`/projects/edit/${project._id}`}
                  variant="primary"
                  size="sm"
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteProject(project._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ProjectList;

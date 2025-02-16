import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProjectForm() {
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [scoringResult, setScoringResult] = useState(null);
    const [project, setProject] = useState({
        name: '',
        description: '',
        sector: '',
        budget: '',
        location: {
            country: '',
            city: '',
            coordinates: {
                latitude: '',
                longitude: ''
            }
        },
        startDate: '',
        endDate: '',
        environmentalMetrics: {
            carbonReduction: {
                amount: '',
                methodology: ''
            },
            energyEfficiency: {
                currentUsage: '',
                projectedSavings: '',
                unit: 'kWh'
            },
            waterConservation: {
                amount: '',
                unit: 'cubic_meters'
            },
            wasteReduction: {
                amount: '',
                unit: 'tons'
            },
            renewableEnergyGeneration: {
                amount: '',
                unit: 'MWh'
            }
        },
        socialMetrics: {
            jobsCreated: '',
            communitiesServed: '',
            beneficiariesCount: '',
            healthcareAccess: false,
            educationInitiatives: false,
            affordableHousing: false
        },
        governanceMetrics: {
            transparencyScore: '',
            complianceStatus: 'pending',
            reportingFrequency: 'quarterly',
            certifications: []
        },
        risks: [{
            category: '',
            likelihood: '',
            impact: '',
            description: '',
            mitigationStrategy: ''
        }]
    });

    const sectors = [
        'renewable_energy',
        'sustainable_agriculture',
        'clean_transportation',
        'green_building',
        'waste_management',
        'water_management',
        'other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            console.log('Submitting project data:', project);
            const response = await axios.post('http://localhost:5000/api/projects/add', project);
            console.log('Server response:', response.data);
            setScoringResult(response.data.scoringFactors);
            navigate('/projects');
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert(`Failed to create project: ${error.response?.data || error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const parts = name.split('.');
            setProject(prev => {
                let newProject = { ...prev };
                let current = newProject;
                for (let i = 0; i < parts.length - 1; i++) {
                    current[parts[i]] = { ...current[parts[i]] };
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
                return newProject;
            });
        } else {
            setProject(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setProject(prev => ({
            ...prev,
            socialMetrics: {
                ...prev.socialMetrics,
                [name]: checked
            }
        }));
    };

    const addCertification = () => {
        setProject(prev => ({
            ...prev,
            governanceMetrics: {
                ...prev.governanceMetrics,
                certifications: [
                    ...prev.governanceMetrics.certifications,
                    { name: '', issuer: '', validUntil: '' }
                ]
            }
        }));
    };

    const handleCertificationChange = (index, field, value) => {
        setProject(prev => ({
            ...prev,
            governanceMetrics: {
                ...prev.governanceMetrics,
                certifications: prev.governanceMetrics.certifications.map((cert, i) =>
                    i === index ? { ...cert, [field]: value } : cert
                )
            }
        }));
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Add New Project</h2>
            
            {scoringResult && (
                <Alert variant="success" className="mb-4">
                    <Alert.Heading>Project Created Successfully!</Alert.Heading>
                    <p>ESG Scores have been calculated based on your project data:</p>
                    <ul>
                        <li>Environmental: {scoringResult.environmental}</li>
                        <li>Social: {scoringResult.social}</li>
                        <li>Governance: {scoringResult.governance}</li>
                    </ul>
                    <p>Redirecting to projects list...</p>
                </Alert>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Card className="mb-4">
                    <Card.Body>
                        <h5>Basic Information</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Project Name</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="name"
                                        value={project.name}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sector</Form.Label>
                                    <Form.Select
                                        required
                                        name="sector"
                                        value={project.sector}
                                        onChange={handleChange}
                                    >
                                        <option value="">Choose sector...</option>
                                        {sectors.map(sector => (
                                            <option key={sector} value={sector}>
                                                {sector.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        required
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={project.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="location.country"
                                        value={project.location.country}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location.city"
                                        value={project.location.city}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Budget ($)</Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        name="budget"
                                        value={project.budget}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <h5>Environmental Metrics</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Carbon Reduction (tons CO2)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="environmentalMetrics.carbonReduction.amount"
                                        value={project.environmentalMetrics.carbonReduction.amount}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Energy Efficiency Savings (kWh)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="environmentalMetrics.energyEfficiency.projectedSavings"
                                        value={project.environmentalMetrics.energyEfficiency.projectedSavings}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Water Conservation (cubic meters)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="environmentalMetrics.waterConservation.amount"
                                        value={project.environmentalMetrics.waterConservation.amount}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Waste Reduction (tons)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="environmentalMetrics.wasteReduction.amount"
                                        value={project.environmentalMetrics.wasteReduction.amount}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <h5>Social Impact</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Jobs Created</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="socialMetrics.jobsCreated"
                                        value={project.socialMetrics.jobsCreated}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Communities Served</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="socialMetrics.communitiesServed"
                                        value={project.socialMetrics.communitiesServed}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Beneficiaries Count</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="socialMetrics.beneficiariesCount"
                                        value={project.socialMetrics.beneficiariesCount}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Healthcare Access Improvement"
                                        name="healthcareAccess"
                                        checked={project.socialMetrics.healthcareAccess}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Education Initiatives"
                                        name="educationInitiatives"
                                        checked={project.socialMetrics.educationInitiatives}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Affordable Housing"
                                        name="affordableHousing"
                                        checked={project.socialMetrics.affordableHousing}
                                        onChange={handleCheckboxChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Governance & Compliance</h5>
                            <Button variant="success" size="sm" onClick={addCertification}>
                                Add Certification
                            </Button>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Compliance Status</Form.Label>
                                    <Form.Select
                                        name="governanceMetrics.complianceStatus"
                                        value={project.governanceMetrics.complianceStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="compliant">Compliant</option>
                                        <option value="pending">Pending</option>
                                        <option value="non_compliant">Non-Compliant</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reporting Frequency</Form.Label>
                                    <Form.Select
                                        name="governanceMetrics.reportingFrequency"
                                        value={project.governanceMetrics.reportingFrequency}
                                        onChange={handleChange}
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="semi_annual">Semi-Annual</option>
                                        <option value="annual">Annual</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {project.governanceMetrics.certifications.map((cert, index) => (
                            <Row key={index} className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Certification Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Issuer</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={cert.issuer}
                                            onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Valid Until</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={cert.validUntil}
                                            onChange={(e) => handleCertificationChange(index, 'validUntil', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        ))}
                    </Card.Body>
                </Card>

                <div className="d-flex justify-content-end gap-2 mb-4">
                    <Button variant="secondary" onClick={() => navigate('/projects')}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Create Project
                    </Button>
                </div>
            </Form>
        </Container>
    );
}

export default ProjectForm;

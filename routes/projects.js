const router = require('express').Router();
const Project = require('../models/Project');
const ESGScoringService = require('../services/esgScoring');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Add new project
router.post('/add', async (req, res) => {
    try {
        console.log('Received project data:', req.body);
        
        if (!req.body.name || !req.body.sector || !req.body.budget) {
            return res.status(400).json('Required fields missing: name, sector, and budget are required');
        }

        const projectData = req.body;
        
        // Create new project without scores
        const newProject = new Project(projectData);
        
        // Validate the project data
        const validationError = newProject.validateSync();
        if (validationError) {
            console.error('Validation error:', validationError);
            return res.status(400).json(`Validation error: ${validationError.message}`);
        }
        
        // Calculate ESG scores based on project data
        const scores = await ESGScoringService.calculateESGScores(newProject);
        
        // Update project with calculated scores
        newProject.calculatedScores = {
            environmental: scores.environmental,
            social: scores.social,
            governance: scores.governance,
            total: scores.total,
            lastUpdated: new Date()
        };
        
        console.log('Saving project with scores:', newProject);
        
        // Save project with calculated scores
        const savedProject = await newProject.save();
        
        res.json({
            project: savedProject,
            scoringFactors: scores.factors
        });
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(400).json(`Error creating project: ${err.message}`);
    }
});

// Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        // Recalculate scores if they're older than 24 hours
        const scoreAge = new Date() - project.calculatedScores.lastUpdated;
        if (scoreAge > 24 * 60 * 60 * 1000) {
            const scores = await ESGScoringService.calculateESGScores(project);
            project.calculatedScores = {
                environmental: scores.environmental,
                social: scores.social,
                governance: scores.governance,
                total: scores.total,
                lastUpdated: new Date()
            };
            await project.save();
        }
        
        res.json(project);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Update project
router.put('/update/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        // Update project fields
        Object.assign(project, req.body);
        
        // Recalculate ESG scores based on updated data
        const scores = await ESGScoringService.calculateESGScores(project);
        project.calculatedScores = {
            environmental: scores.environmental,
            social: scores.social,
            governance: scores.governance,
            total: scores.total,
            lastUpdated: new Date()
        };
        
        const updatedProject = await project.save();
        res.json({
            project: updatedProject,
            scoringFactors: scores.factors
        });
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json('Project deleted.');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;

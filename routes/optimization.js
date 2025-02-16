const router = require('express').Router();
const math = require('mathjs');
const Project = require('../models/Project');

// Optimize portfolio allocation
router.post('/portfolio', async (req, res) => {
    try {
        const { projectIds, constraints } = req.body;
        const projects = await Project.find({ '_id': { $in: projectIds } });
        
        const optimization = optimizePortfolio(projects, constraints);
        res.json(optimization);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Generate investment scenarios
router.post('/scenarios', async (req, res) => {
    try {
        const { projectIds, parameters } = req.body;
        const projects = await Project.find({ '_id': { $in: projectIds } });
        
        const scenarios = generateScenarios(projects, parameters);
        res.json(scenarios);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Helper functions
function optimizePortfolio(projects, constraints) {
    const { maxBudget, minESGScore, maxRisk } = constraints;
    
    // Calculate returns and risks for each project
    const projectMetrics = projects.map(project => ({
        id: project._id,
        return: calculateExpectedReturn(project),
        risk: calculateRisk(project),
        esgScore: calculateESGScore(project),
        budget: project.budget
    }));
    
    // Simple linear programming for portfolio optimization
    const weights = optimizeWeights(projectMetrics, constraints);
    
    return {
        allocation: createAllocation(projects, weights),
        metrics: calculatePortfolioMetrics(projectMetrics, weights)
    };
}

function generateScenarios(projects, parameters) {
    const { numScenarios, riskLevels } = parameters;
    const scenarios = [];
    
    for (const riskLevel of riskLevels) {
        const constraints = {
            maxBudget: parameters.maxBudget,
            minESGScore: parameters.minESGScore,
            maxRisk: riskLevel
        };
        
        const optimization = optimizePortfolio(projects, constraints);
        scenarios.push({
            riskLevel,
            ...optimization
        });
    }
    
    return scenarios;
}

function optimizeWeights(projectMetrics, constraints) {
    // Simplified weight optimization using mean-variance optimization
    const returns = projectMetrics.map(p => p.return);
    const risks = projectMetrics.map(p => p.risk);
    const esgScores = projectMetrics.map(p => p.esgScore);
    
    // Create correlation matrix
    const correlationMatrix = calculateCorrelationMatrix(returns);
    
    // Optimize weights using quadratic programming
    try {
        const weights = quadraticOptimization(returns, risks, correlationMatrix, constraints);
        return weights;
    } catch (err) {
        // Fallback to simple allocation if optimization fails
        return projectMetrics.map(() => 1 / projectMetrics.length);
    }
}

function calculateExpectedReturn(project) {
    const { metrics } = project;
    return (
        (metrics.energyEfficiency * 0.4) +
        (metrics.socialImpact * 0.3) +
        (project.esgScores.environmental * 0.3)
    ) / project.budget;
}

function calculateRisk(project) {
    return project.risks.reduce((total, risk) => {
        return total + (risk.likelihood * risk.impact);
    }, 0) / project.risks.length;
}

function calculateESGScore(project) {
    const { environmental, social, governance } = project.esgScores;
    return (environmental + social + governance) / 3;
}

function calculateCorrelationMatrix(returns) {
    const n = returns.length;
    const matrix = math.zeros(n, n);
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) {
                matrix.set([i, j], 1);
            } else {
                matrix.set([i, j], calculateCorrelation(returns[i], returns[j]));
            }
        }
    }
    
    return matrix;
}

function calculateCorrelation(x, y) {
    // Simplified correlation calculation
    return 0.5; // Placeholder - implement actual correlation calculation
}

function quadraticOptimization(returns, risks, correlationMatrix, constraints) {
    // Simplified implementation - replace with actual quadratic programming
    const n = returns.length;
    return Array(n).fill(1/n); // Equal weights as placeholder
}

function createAllocation(projects, weights) {
    return projects.map((project, index) => ({
        project: project._id,
        name: project.name,
        weight: weights[index],
        amount: project.budget * weights[index]
    }));
}

function calculatePortfolioMetrics(projectMetrics, weights) {
    const expectedReturn = math.dot(
        projectMetrics.map(p => p.return),
        weights
    );
    
    const risk = math.sqrt(
        math.dot(
            weights,
            math.multiply(
                math.matrix(projectMetrics.map(p => p.risk)),
                weights
            )
        )
    );
    
    const esgScore = math.dot(
        projectMetrics.map(p => p.esgScore),
        weights
    );
    
    return {
        expectedReturn,
        risk,
        esgScore
    };
}

module.exports = router;

const router = require('express').Router();
const natural = require('natural');
const Project = require('../models/Project');

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Analyze project ESG impact
router.post('/esg-impact', async (req, res) => {
    try {
        const { projectId } = req.body;
        const project = await Project.findById(projectId);
        
        const esgScore = calculateESGScore(project);
        const risks = analyzeRisks(project);
        const impact = calculateImpact(project);
        
        res.json({
            esgScore,
            risks,
            impact,
            recommendations: generateRecommendations(esgScore, risks, impact)
        });
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Analyze portfolio performance
router.post('/portfolio', async (req, res) => {
    try {
        const { projectIds } = req.body;
        const projects = await Project.find({ '_id': { $in: projectIds } });
        
        const portfolioAnalysis = analyzePortfolio(projects);
        res.json(portfolioAnalysis);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Helper functions
function calculateESGScore(project) {
    const { environmental, social, governance } = project.esgScores;
    
    // Calculate weighted average (can be customized based on priorities)
    const weights = { environmental: 0.4, social: 0.3, governance: 0.3 };
    return (
        environmental * weights.environmental +
        social * weights.social +
        governance * weights.governance
    );
}

function analyzeRisks(project) {
    const riskScore = project.risks.reduce((total, risk) => {
        return total + (risk.likelihood * risk.impact);
    }, 0) / project.risks.length;
    
    return {
        score: riskScore,
        categories: categorizeRisks(project.risks)
    };
}

function calculateImpact(project) {
    const { metrics } = project;
    
    return {
        environmental: calculateEnvironmentalImpact(metrics),
        social: calculateSocialImpact(metrics),
        economic: calculateEconomicImpact(project)
    };
}

function generateRecommendations(esgScore, risks, impact) {
    const recommendations = [];
    
    if (esgScore < 70) {
        recommendations.push('Consider improving ESG metrics through targeted initiatives');
    }
    
    if (risks.score > 0.6) {
        recommendations.push('High risk level detected. Review risk mitigation strategies');
    }
    
    return recommendations;
}

function analyzePortfolio(projects) {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const avgESGScore = projects.reduce((sum, p) => sum + calculateESGScore(p), 0) / projects.length;
    
    return {
        totalBudget,
        avgESGScore,
        diversification: calculateDiversification(projects),
        riskProfile: calculatePortfolioRisk(projects)
    };
}

// Additional helper functions
function calculateEnvironmentalImpact(metrics) {
    return (metrics.carbonEmissions * -1 + metrics.energyEfficiency + metrics.waterUsage * -1) / 3;
}

function calculateSocialImpact(metrics) {
    return metrics.socialImpact;
}

function calculateEconomicImpact(project) {
    // Simplified ROI calculation
    return (project.metrics.energyEfficiency * 100) / project.budget;
}

function categorizeRisks(risks) {
    return risks.reduce((categories, risk) => {
        if (!categories[risk.category]) {
            categories[risk.category] = [];
        }
        categories[risk.category].push(risk);
        return categories;
    }, {});
}

function calculateDiversification(projects) {
    const sectors = new Set(projects.map(p => p.sector));
    return (sectors.size / projects.length) * 100;
}

function calculatePortfolioRisk(projects) {
    return projects.reduce((total, project) => {
        return total + (project.risks.reduce((sum, risk) => sum + risk.likelihood * risk.impact, 0) / project.risks.length);
    }, 0) / projects.length;
}

module.exports = router;

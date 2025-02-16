const axios = require('axios');
const natural = require('natural');
const math = require('mathjs');

class ESGScoringService {
    static async calculateESGScores(project) {
        try {
            const [environmentalScore, environmentalFactors] = await this.calculateEnvironmentalScore(project);
            const [socialScore, socialFactors] = await this.calculateSocialScore(project);
            const [governanceScore, governanceFactors] = await this.calculateGovernanceScore(project);

            const totalScore = (environmentalScore * 0.4) + (socialScore * 0.3) + (governanceScore * 0.3);

            return {
                environmental: environmentalScore,
                social: socialScore,
                governance: governanceScore,
                total: totalScore,
                factors: {
                    environmental: environmentalFactors,
                    social: socialFactors,
                    governance: governanceFactors
                }
            };
        } catch (error) {
            console.error('Error calculating ESG scores:', error);
            throw error;
        }
    }

    static async calculateEnvironmentalScore(project) {
        const factors = {};
        let totalScore = 0;
        let weightSum = 0;

        // Carbon Reduction Impact
        if (project.environmentalMetrics.carbonReduction) {
            const weight = 0.4;
            factors.carbonReduction = await this.evaluateCarbonReduction(
                project.environmentalMetrics.carbonReduction,
                project.sector
            );
            totalScore += factors.carbonReduction * weight;
            weightSum += weight;
        }

        // Energy Efficiency
        if (project.environmentalMetrics.energyEfficiency) {
            const weight = 0.3;
            factors.energyEfficiency = this.evaluateEnergyEfficiency(
                project.environmentalMetrics.energyEfficiency
            );
            totalScore += factors.energyEfficiency * weight;
            weightSum += weight;
        }

        // Water Conservation
        if (project.environmentalMetrics.waterConservation) {
            const weight = 0.15;
            factors.waterConservation = await this.evaluateWaterConservation(
                project.environmentalMetrics.waterConservation,
                project.location
            );
            totalScore += factors.waterConservation * weight;
            weightSum += weight;
        }

        // Waste Reduction
        if (project.environmentalMetrics.wasteReduction) {
            const weight = 0.15;
            factors.wasteReduction = this.evaluateWasteReduction(
                project.environmentalMetrics.wasteReduction
            );
            totalScore += factors.wasteReduction * weight;
            weightSum += weight;
        }

        // Normalize score if not all metrics are present
        const finalScore = weightSum > 0 ? (totalScore / weightSum) * 100 : 0;

        return [Math.min(100, Math.max(0, finalScore)), factors];
    }

    static async calculateSocialScore(project) {
        const factors = {};
        let totalScore = 0;
        let weightSum = 0;

        // Job Creation Impact
        if (project.socialMetrics.jobsCreated) {
            const weight = 0.3;
            factors.jobCreation = await this.evaluateJobCreation(
                project.socialMetrics.jobsCreated,
                project.budget
            );
            totalScore += factors.jobCreation * weight;
            weightSum += weight;
        }

        // Community Impact
        if (project.socialMetrics.communitiesServed) {
            const weight = 0.3;
            factors.communityImpact = this.evaluateCommunityImpact(
                project.socialMetrics.communitiesServed,
                project.socialMetrics.beneficiariesCount
            );
            totalScore += factors.communityImpact * weight;
            weightSum += weight;
        }

        // Social Infrastructure
        const infrastructureWeight = 0.4;
        factors.infrastructure = this.evaluateSocialInfrastructure({
            healthcareAccess: project.socialMetrics.healthcareAccess,
            educationInitiatives: project.socialMetrics.educationInitiatives,
            affordableHousing: project.socialMetrics.affordableHousing
        });
        totalScore += factors.infrastructure * infrastructureWeight;
        weightSum += infrastructureWeight;

        const finalScore = weightSum > 0 ? (totalScore / weightSum) * 100 : 0;

        return [Math.min(100, Math.max(0, finalScore)), factors];
    }

    static async calculateGovernanceScore(project) {
        const factors = {};
        let totalScore = 0;
        let weightSum = 0;

        // Transparency and Reporting
        const transparencyWeight = 0.4;
        factors.transparency = this.evaluateTransparency(
            project.governanceMetrics.transparencyScore,
            project.governanceMetrics.reportingFrequency
        );
        totalScore += factors.transparency * transparencyWeight;
        weightSum += transparencyWeight;

        // Compliance
        const complianceWeight = 0.3;
        factors.compliance = this.evaluateCompliance(
            project.governanceMetrics.complianceStatus,
            project.governanceMetrics.certifications
        );
        totalScore += factors.compliance * complianceWeight;
        weightSum += complianceWeight;

        // Risk Management
        const riskWeight = 0.3;
        factors.riskManagement = this.evaluateRiskManagement(project.risks);
        totalScore += factors.riskManagement * riskWeight;
        weightSum += riskWeight;

        const finalScore = weightSum > 0 ? (totalScore / weightSum) * 100 : 0;

        return [Math.min(100, Math.max(0, finalScore)), factors];
    }

    // Helper methods for detailed evaluations
    static async evaluateCarbonReduction(carbonData, sector) {
        try {
            // Get sector benchmarks from external API or database
            const sectorBenchmarks = await this.getSectorBenchmarks(sector);
            const reduction = carbonData.amount;
            
            if (!sectorBenchmarks || !reduction) return 0;
            
            // Compare with sector average and best practices
            const score = (reduction / sectorBenchmarks.averageReduction) * 70;
            return Math.min(100, score);
        } catch (error) {
            console.error('Error evaluating carbon reduction:', error);
            return 0;
        }
    }

    static evaluateEnergyEfficiency(efficiencyData) {
        if (!efficiencyData.projectedSavings || !efficiencyData.currentUsage) return 0;
        
        const savingsPercentage = (efficiencyData.projectedSavings / efficiencyData.currentUsage) * 100;
        return Math.min(100, savingsPercentage);
    }

    static async evaluateWaterConservation(waterData, location) {
        try {
            // Get water stress data for the location
            const waterStressData = await this.getWaterStressData(location);
            
            if (!waterData.amount || !waterStressData) return 0;
            
            // Higher score for water conservation in high-stress areas
            const baseScore = (waterData.amount / waterStressData.regionalAverage) * 70;
            const stressMultiplier = 1 + (waterStressData.stressLevel * 0.3);
            
            return Math.min(100, baseScore * stressMultiplier);
        } catch (error) {
            console.error('Error evaluating water conservation:', error);
            return 0;
        }
    }

    static evaluateWasteReduction(wasteData) {
        if (!wasteData.amount) return 0;
        
        // Basic scoring based on reduction amount
        // Could be enhanced with waste type analysis and circular economy metrics
        return Math.min(100, wasteData.amount * 0.1);
    }

    static async evaluateJobCreation(jobsCreated, budget) {
        if (!jobsCreated || !budget) return 0;
        
        // Calculate jobs per million dollars invested
        const jobsPerMillion = (jobsCreated / (budget / 1000000));
        
        // Compare with industry averages
        try {
            const industryAverage = await this.getIndustryJobCreationAverage();
            return Math.min(100, (jobsPerMillion / industryAverage) * 70);
        } catch (error) {
            console.error('Error evaluating job creation:', error);
            return Math.min(100, jobsPerMillion * 5); // Fallback calculation
        }
    }

    static evaluateCommunityImpact(communitiesServed, beneficiariesCount) {
        if (!communitiesServed || !beneficiariesCount) return 0;
        
        // Basic scoring based on reach and depth of impact
        const reachScore = Math.min(100, communitiesServed * 10);
        const depthScore = Math.min(100, (beneficiariesCount / communitiesServed) * 0.1);
        
        return (reachScore + depthScore) / 2;
    }

    static evaluateSocialInfrastructure(infrastructure) {
        let score = 0;
        let count = 0;
        
        if (infrastructure.healthcareAccess) { score += 100; count++; }
        if (infrastructure.educationInitiatives) { score += 100; count++; }
        if (infrastructure.affordableHousing) { score += 100; count++; }
        
        return count > 0 ? score / count : 0;
    }

    static evaluateTransparency(transparencyScore, reportingFrequency) {
        if (!transparencyScore) return 0;
        
        let frequencyMultiplier = 1;
        switch (reportingFrequency) {
            case 'monthly': frequencyMultiplier = 1.2; break;
            case 'quarterly': frequencyMultiplier = 1.1; break;
            case 'semi_annual': frequencyMultiplier = 1.0; break;
            case 'annual': frequencyMultiplier = 0.9; break;
            default: frequencyMultiplier = 0.8;
        }
        
        return Math.min(100, transparencyScore * frequencyMultiplier);
    }

    static evaluateCompliance(complianceStatus, certifications) {
        let score = 0;
        
        // Base compliance score
        switch (complianceStatus) {
            case 'compliant': score += 70; break;
            case 'pending': score += 40; break;
            case 'non_compliant': score += 0; break;
            default: score += 0;
        }
        
        // Additional points for certifications
        if (certifications && certifications.length > 0) {
            score += Math.min(30, certifications.length * 10);
        }
        
        return Math.min(100, score);
    }

    static evaluateRiskManagement(risks) {
        if (!risks || risks.length === 0) return 0;
        
        // Calculate average risk score and mitigation completeness
        const riskScores = risks.map(risk => {
            const severity = risk.likelihood * risk.impact;
            const mitigationScore = risk.mitigationStrategy ? 1 : 0;
            return { severity, mitigationScore };
        });
        
        const avgSeverity = math.mean(riskScores.map(r => r.severity));
        const mitigationCompleteness = math.mean(riskScores.map(r => r.mitigationScore));
        
        // Higher score for lower average severity and better mitigation strategies
        const severityScore = Math.max(0, 100 - (avgSeverity * 10));
        const mitigationScore = mitigationCompleteness * 100;
        
        return (severityScore * 0.6) + (mitigationScore * 0.4);
    }

    // Mock external API calls - replace with actual API integrations
    static async getSectorBenchmarks(sector) {
        // Simulate API call to get sector-specific benchmarks
        return {
            averageReduction: 1000, // tons of CO2
            bestPractice: 2000
        };
    }

    static async getWaterStressData(location) {
        // Simulate API call to get water stress data
        return {
            regionalAverage: 1000000, // cubic meters
            stressLevel: 0.7 // 0-1 scale
        };
    }

    static async getIndustryJobCreationAverage() {
        // Simulate API call to get industry averages
        return 15; // jobs per million dollars invested
    }
}

module.exports = ESGScoringService;

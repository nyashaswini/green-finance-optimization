const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    sector: {
        type: String,
        required: true,
        enum: ['renewable_energy', 'sustainable_agriculture', 'clean_transportation', 
               'green_building', 'waste_management', 'water_management', 'other']
    },
    budget: {
        type: Number,
        required: true
    },
    location: {
        country: {
            type: String,
            required: true
        },
        city: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    environmentalMetrics: {
        carbonReduction: {
            amount: Number, // in tons of CO2
            methodology: String
        },
        energyEfficiency: {
            currentUsage: Number,
            projectedSavings: Number,
            unit: String
        },
        waterConservation: {
            amount: Number,
            unit: String
        },
        wasteReduction: {
            amount: Number,
            unit: String
        },
        renewableEnergyGeneration: {
            amount: Number,
            unit: String
        }
    },
    socialMetrics: {
        jobsCreated: Number,
        communitiesServed: Number,
        beneficiariesCount: Number,
        healthcareAccess: Boolean,
        educationInitiatives: Boolean,
        affordableHousing: Boolean
    },
    governanceMetrics: {
        transparencyScore: Number,
        complianceStatus: {
            type: String,
            enum: ['compliant', 'pending', 'non_compliant']
        },
        reportingFrequency: {
            type: String,
            enum: ['monthly', 'quarterly', 'semi_annual', 'annual']
        },
        certifications: [{
            name: String,
            issuer: String,
            validUntil: Date
        }]
    },
    marketData: {
        industryTrends: [{
            metric: String,
            value: Number,
            date: Date
        }],
        peerComparison: [{
            metric: String,
            projectValue: Number,
            industryAverage: Number,
            date: Date
        }]
    },
    risks: [{
        category: String,
        likelihood: Number,
        impact: Number,
        description: String,
        mitigationStrategy: String
    }],
    documents: [{
        title: String,
        url: String,
        type: String,
        uploadDate: Date
    }],
    calculatedScores: {
        environmental: Number,
        social: Number,
        governance: Number,
        total: Number,
        lastUpdated: Date
    },
    status: {
        type: String,
        enum: ['proposed', 'active', 'completed', 'suspended'],
        default: 'proposed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the updatedAt timestamp
projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Project', projectSchema);

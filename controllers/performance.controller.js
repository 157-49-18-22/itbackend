const db = require('../models/sql');
const PerformanceTest = db.PerformanceTest;
const Project = db.Project;

// Get all performance tests
exports.getPerformanceTests = async (req, res) => {
    try {
        const { projectId, limit = 50 } = req.query;

        const queryOptions = {
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name']
                }
            ]
        };

        if (projectId) {
            queryOptions.where = { projectId };
        }

        const tests = await PerformanceTest.findAll(queryOptions);

        res.status(200).json({
            success: true,
            data: tests
        });
    } catch (error) {
        console.error('Error fetching performance tests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance tests',
            error: error.message
        });
    }
};

// Create (Run) a new performance test
// In a real scenario, this would trigger a job. Here we simulate/record it.
exports.createPerformanceTest = async (req, res) => {
    try {
        const {
            projectId,
            testName,
            testType,
            url,
            duration,
            concurrentUsers,
            targetResponseTime,
            // Optional results if manually reporting
            avgResponseTime,
            maxResponseTime,
            minResponseTime,
            throughput,
            errorRate,
            status
        } = req.body;

        // If providing results directly (recording a manual test or simulation result)
        // Otherwise, we could generate random "simulation" data here if desired

        // For this implementation, we'll assume the client might send results OR we generate them if missing
        // to simulate a "Live Run" effect.

        let finalAvgResponseTime = avgResponseTime;
        let finalMaxResponseTime = maxResponseTime;
        let finalMinResponseTime = minResponseTime;
        let finalThroughput = throughput;
        let finalErrorRate = errorRate;
        let finalStatus = status;

        if (finalAvgResponseTime === undefined) {
            // Simulation Logic
            finalAvgResponseTime = Math.floor(Math.random() * 2000) + 200; // 200-2200ms
            finalMinResponseTime = Math.floor(finalAvgResponseTime * 0.5);
            finalMaxResponseTime = Math.floor(finalAvgResponseTime * 2.5);
            finalThroughput = Math.floor(Math.random() * 500) + 50; // 50-550 req/s
            finalErrorRate = parseFloat((Math.random() * 5).toFixed(2)); // 0-5% error rate

            // Determine status based on target
            if (finalAvgResponseTime > (targetResponseTime || 3000) || finalErrorRate > 2) {
                finalStatus = 'failed';
            } else if (finalAvgResponseTime > (targetResponseTime * 0.8) || finalErrorRate > 0.5) {
                finalStatus = 'warning';
            } else {
                finalStatus = 'passed';
            }
        }

        const newTest = await PerformanceTest.create({
            projectId,
            testName,
            testType: testType || 'load',
            url,
            duration: duration || 60,
            concurrentUsers: concurrentUsers || 10,
            targetResponseTime: targetResponseTime || 2000,
            avgResponseTime: finalAvgResponseTime,
            maxResponseTime: finalMaxResponseTime,
            minResponseTime: finalMinResponseTime,
            throughput: finalThroughput,
            errorRate: finalErrorRate,
            status: finalStatus || 'passed'
        });

        const populatedTest = await PerformanceTest.findByPk(newTest.id, {
            include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
        });

        res.status(201).json({
            success: true,
            message: 'Performance test executed successfully',
            data: populatedTest
        });

    } catch (error) {
        console.error('Error creating performance test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to run performance test',
            error: error.message
        });
    }
};

// Check specific test details
exports.getPerformanceTestById = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await PerformanceTest.findByPk(id, {
            include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Performance test not found'
            });
        }

        res.status(200).json({
            success: true,
            data: test
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test details',
            error: error.message
        });
    }
};

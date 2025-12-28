const { sequelize } = require('../config/database.sql');

exports.getTestSuites = async (req, res) => {
    try {
        // Fetch test cases from database
        const [testCases] = await sequelize.query(`
            SELECT 
                tc.id, 
                tc.title as name, 
                tc.description, 
                tc.status, 
                tc.priority,
                tc.created_at
            FROM test_cases tc
            ORDER BY tc.created_at DESC
        `);

        // Mock aggregation or mapping to suites
        // Since we don't have explicit suites in DB, we'll map all to 'Integration' or 'Unit' 
        // based on some logic, or just put them all in 'Manual/DB Tests'

        // Let's create a "Database Tests" suite populated by real data
        const databaseTests = testCases.map(tc => ({
            name: tc.name, // mapped from title
            status: tc.status === 'passed' ? 'passed' : (tc.status === 'failed' ? 'failed' : 'pending'),
            duration: 'N/A', // DB doesn't track this
            code: tc.description || 'No description provided', // Use description as code/steps
            error: tc.status === 'failed' ? 'Test marked as failed in DB' : null
        }));

        const totalTests = databaseTests.length;
        const passed = databaseTests.filter(t => t.status === 'passed').length;
        const failed = databaseTests.filter(t => t.status === 'failed').length;

        const suites = {
            unit: [], // No real unit test files found
            integration: [
                {
                    id: 'db-test-cases',
                    name: 'Database Recorded Test Cases',
                    description: 'Test cases fetched from the project database',
                    totalTests: totalTests,
                    passed: passed,
                    failed: failed,
                    duration: 'N/A',
                    coverage: totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0,
                    tests: databaseTests
                }
            ],
            e2e: [],
            performance: []
        };

        res.status(200).json({
            success: true,
            data: suites
        });

    } catch (error) {
        console.error('Error fetching test suites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test suites',
            error: error.message
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // Test Case Stats
        const [testStats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending
            FROM test_cases
        `);

        // Bug Stats
        const [bugStats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN priority = 'Critical' OR priority = 'critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN status = 'Open' OR status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'Resolved' OR status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM bugs
        `);

        // Recent Activity (Recent bugs and tests)
        const [recentBugs] = await sequelize.query(`
            SELECT id, title, created_at, 'bug' as type
            FROM bugs
            ORDER BY created_at DESC
            LIMIT 5
        `);

        const [recentTests] = await sequelize.query(`
            SELECT id, title, created_at, 'test' as type
            FROM test_cases
            ORDER BY created_at DESC
            LIMIT 5
        `);

        // Merge and sort
        const activities = [...recentBugs, ...recentTests]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(item => ({
                msg: item.type === 'bug' ? `New bug reported: ${item.title}` : `Test case created: ${item.title}`,
                time: item.created_at,
                type: item.type
            }));

        const stats = {
            totalTestCases: parseInt(testStats[0].total || 0),
            passedTests: parseInt(testStats[0].passed || 0),
            failedTests: parseInt(testStats[0].failed || 0),
            pendingTests: parseInt(testStats[0].pending || 0),
            totalBugs: parseInt(bugStats[0].total || 0),
            criticalBugs: parseInt(bugStats[0].critical || 0),
            openBugs: parseInt(bugStats[0].open || 0),
            resolvedBugs: parseInt(bugStats[0].resolved || 0),
            testingProgress: 0,
            recentActivity: activities
        };

        if (stats.totalTestCases > 0) {
            stats.testingProgress = Math.round((stats.passedTests / stats.totalTestCases) * 100);
        }

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message
        });
    }
};

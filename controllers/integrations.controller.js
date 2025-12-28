exports.getIntegrationsStatus = (req, res) => {
    try {
        const checkEnv = (keys) => keys.some(key => process.env[key] && process.env[key].length > 0);

        const integrations = [
            {
                id: 'github',
                status: checkEnv(['GITHUB_TOKEN', 'GITHUB_CLIENT_ID', 'GITHUB_ACTION']) ? 'active' : 'inactive'
            },
            {
                id: 'slack',
                status: checkEnv(['SLACK_WEBHOOK_URL', 'SLACK_BOT_TOKEN', 'SLACK_TOKEN']) ? 'active' : 'inactive'
            },
            {
                id: 'jira',
                status: checkEnv(['JIRA_API_TOKEN', 'JIRA_HOST', 'JIRA_EMAIL']) ? 'configured' : 'inactive'
            },
            {
                id: 'aws',
                status: checkEnv(['AWS_ACCESS_KEY_ID', 'AWS_REGION']) ? 'active' : 'inactive'
            },
            {
                id: 'vercel',
                status: checkEnv(['VERCEL_TOKEN', 'VERCEL_ORG_ID']) ? 'active' : 'inactive'
            },
            {
                id: 'firebase',
                status: checkEnv(['FIREBASE_API_KEY', 'FIREBASE_CONFIG']) ? 'active' : 'inactive'
            },
            {
                id: 'stripe',
                status: checkEnv(['STRIPE_SECRET_KEY', 'STRIPE_PUBLIC_KEY']) ? 'active' : 'inactive'
            },
            {
                id: 'docker',
                status: checkEnv(['DOCKER_USERNAME', 'DOCKER_REGISTRY']) ? 'configured' : 'inactive'
            },
            {
                id: 'postgresql',
                status: checkEnv(['DATABASE_URL', 'DB_HOST']) ? 'active' : 'inactive'
            }
        ];

        res.status(200).json({
            success: true,
            data: integrations,
            checkedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error checking integrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check integrations',
            error: error.message
        });
    }
};

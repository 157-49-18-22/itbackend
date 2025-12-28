const { sequelize, PerformanceTest } = require('./models/sql');

async function syncModels() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync specifically the new model
        await PerformanceTest.sync({ alter: true });
        console.log('PerformanceTest table synced.');

    } catch (error) {
        console.error('Error syncing DB:', error);
    } finally {
        await sequelize.close();
    }
}

syncModels();

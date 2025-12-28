const { sequelize, Message } = require('./models/sql');

const sync = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync specifically the message model to add the missing column
        // We use alter: true to update the table structure without dropping data
        console.log('Syncing Message model...');
        await Message.sync({ alter: true });

        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
};

sync();

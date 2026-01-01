const { sequelize, User } = require('../models/sql');

async function createAdmin() {
    try {
        console.log('Connecting to database...');
        // This will use the config from .env (which I just updated to MySQL)
        await sequelize.authenticate();
        console.log('Connection established.');

        // Skip sync/alter to avoid complex foreign key issues in script
        // await sequelize.sync(); 

        const adminData = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            department: 'Management',
            status: 'active'
        };

        const existing = await User.findOne({ where: { email: adminData.email } });
        if (existing) {
            console.log('Admin user already exists.');
        } else {
            await User.create(adminData);
            console.log('Admin user created successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

createAdmin();

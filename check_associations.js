const { Project, Client, User, Task, sequelize } = require('./models/sql');

async function checkAssociations() {
    try {
        console.log('Testing controller query...');
        const projects = await Project.findAll({
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name', 'company', 'email']
                },
                {
                    model: User,
                    as: 'projectManager',
                    attributes: ['id', 'name', 'email', 'avatar']
                },
                {
                    model: Task,
                    as: 'tasks',
                    attributes: ['id', 'status', 'priority']
                }
            ],
            limit: 5 // limit for safety
        });

        console.log('Controller Query Success!');
        console.log('Projects found:', projects.length);
        if (projects.length > 0) {
            console.log('First project client:', projects[0].client ? projects[0].client.name : 'No client');
        }
    } catch (error) {
        console.error('Controller Query Failed:', error);
    } finally {
        await sequelize.close();
    }
}

checkAssociations();

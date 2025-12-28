const { Project, sequelize } = require('./models/sql');

async function checkProjects() {
    try {
        const projects = await Project.findAll();
        console.log('Total Projects found in DB:', projects.length);
        projects.forEach(p => console.log(`- ${p.id}: ${p.name} (Archived: ${p.isArchived})`));
    } catch (error) {
        console.error('Error fetching projects:', error);
    } finally {
        await sequelize.close();
    }
}

checkProjects();

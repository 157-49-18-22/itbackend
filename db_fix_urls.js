const { sequelize, Wireframe, Mockup, Prototype } = require('./models/sql');

async function fixUrls() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Fetching Wireframes...');
        const wireframes = await Wireframe.findAll();
        for (const w of wireframes) {
            if (w.imageUrl && (w.imageUrl.includes(' ') || w.imageUrl.endsWith(' '))) {
                const newUrl = w.imageUrl.replace(/\s+/g, '');
                console.log(`Updating Wireframe ${w.id}: "${w.imageUrl}" -> "${newUrl}"`);
                await w.update({ imageUrl: newUrl });
            }
        }

        console.log('Fetching Mockups...');
        const mockups = await Mockup.findAll();
        for (const m of mockups) {
            if (m.image_url && (m.image_url.includes(' ') || m.image_url.endsWith(' '))) {
                const newUrl = m.image_url.replace(/\s+/g, '');
                console.log(`Updating Mockup ${m.id}: "${m.image_url}" -> "${newUrl}"`);
                await m.update({ image_url: newUrl });
            }
        }

        console.log('Fetching Prototypes...');
        const prototypes = await Prototype.findAll();
        for (const p of prototypes) {
            if (p.imageUrl && (p.imageUrl.includes(' ') || p.imageUrl.endsWith(' '))) {
                const newUrl = p.imageUrl.replace(/\s+/g, '');
                console.log(`Updating Prototype ${p.id}: "${p.imageUrl}" -> "${newUrl}"`);
                await p.update({ imageUrl: newUrl });
            }
        }

        console.log('URL cleanup complete!');
    } catch (error) {
        console.error('Error fixing URLs:', error);
    } finally {
        await sequelize.close();
    }
}

fixUrls();

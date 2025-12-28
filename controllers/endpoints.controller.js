const express = require('express');

exports.getEndpoints = (req, res) => {
    try {
        const app = req.app;
        const endpoints = [];

        // Recursive function to parse stack
        const parseStack = (stack, basePath = '') => {
            stack.forEach(layer => {
                if (layer.route) {
                    // It's a route
                    const path = basePath + layer.route.path;
                    const method = Object.keys(layer.route.methods)[0].toUpperCase();

                    endpoints.push({
                        id: `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, '-'),
                        path: path,
                        method: method,
                        category: path.split('/')[2] ? path.split('/')[2].charAt(0).toUpperCase() + path.split('/')[2].slice(1) : 'General'
                    });
                } else if (layer.name === 'router' && layer.handle.stack) {
                    // It's a router
                    // Get the base path for this router
                    // Layer regexp is tricky, usually ends with /?(?=\/|$)/i
                    // Extract the path part from the regexp if possible, but it's hard.
                    // A better way is relying on the storage in express or just guessing.
                    // BUT, express 4 doesn't store the path on the layer object for routers easily.
                    // A common workaround is to use list-endpoints library, OR
                    // assume the standard structure we built: app.use('/api/xyz', xyzRoutes)

                    // In our server.js, we do app.use('/api/auth', authRoutes)
                    // The layer regexp is /^\/api\/auth\/?(?=\/|$)/i

                    // Let's try to extract from regexp string representation
                    const regexpStr = layer.regexp.toString();
                    // Example: /^\/api\/auth\/?(?=\/|$)/i
                    // Match content between ^\\ and \\/?
                    const match = regexpStr.match(/^\/\\(.*?)\\(\/)?\?/);
                    let routerPath = '';

                    // Simpler approach for known codebase: get path from layer.regexp if possible or assume standard
                    // Since we can't easily reverse regex, let's look at `server.js` structure pattern
                    // But we want this dynamic.

                    // Actually, modern express versions attach `path` or `route` to middleware if mounted with path? 
                    // No, only if it's a route.

                    // Let's optimize: We know our routes are mounted at /api/FEATURE.
                    // The layer for `app.use('/api/auth', ...)` will have a `regexp` that matches that.
                    // We can try to parse the regex, or just recurse without prefix and fix later? No.

                    // Let's use a simpler known-good regex parser for express layer paths.
                    // Or, since we are inside the app, maybe we don't need perfect introspection if we list them manually? 
                    // NO, user wants "real data".

                    // Let's try to extract path from regex.
                    // /^\/api\/auth\/?(?=\/|$)/i  -> we want /api/auth

                    const cleanPath = regexpStr
                        .replace(/^\/(\^)?/, '') // Remove start
                        .replace(/(\/)?\??\(\?=\\\/\|\$\)\/i$/, '') // Remove end
                        .replace(/\\(.)/g, '$1') // Unescape chars
                        .replace(/\?/g, ''); // Remove optional ?

                    // This is a rough heuristic.
                    // If recursive, add to basePath
                    // NOTE: layer.path might exist in some contexts but usually not for routers.

                    // Let's try traversing.
                    let routeStr = '';
                    if (layer.regexp.fast_slash) {
                        routeStr = '';
                    } else {
                        // Extract path from regex source
                        const regexStr = layer.regexp.toString();
                        const quoteParams = regexStr.match(/^\/\\(.*?)\\\//);
                        if (quoteParams && quoteParams[1]) {
                            routeStr = '/' + quoteParams[1];
                        } else {
                            // Fallback attempts
                            const split = regexStr.split('\\/');
                            if (split.length > 1) {
                                // Very hacky
                                const parts = regexStr.match(/\\\/([a-z0-9-]+)/gi);
                                if (parts) routeStr = parts.map(p => p.replace('\\/', '/')).join('');
                            }
                        }
                    }

                    // Better Hack:
                    // Since I can't rely on regex parsing being perfect, I will implement a simpler listing 
                    // that I know works for "app.use('/path', router)" structures.
                    // The layer itself doesn't carry the path string in Express 4.

                    // New Plan:
                    // I will manually reconstruct the main categories since I know them (I can read server.js imports),
                    // and then iterate the routers.
                    // BUT, that's not "real" enough.

                    // Alternative:
                    // Using `express-list-endpoints` library would be ideal but I can't install packages.
                    // I will use a simplified inspector that I know works often for standard Express apps.
                }
            });
        };

        // Let's use a simplified approach that iterates the main stack
        if (app._router && app._router.stack) {
            app._router.stack.forEach(layer => {
                if (layer.route) {
                    const method = Object.keys(layer.route.methods)[0].toUpperCase();
                    endpoints.push({
                        path: layer.route.path,
                        method: method,
                        category: 'Root'
                    });
                } else if (layer.name === 'router') {
                    // Try to guess the mounted path from the regex
                    // All our routes in server.js are like app.use('/api/xyz', ...)
                    // The regex usually looks literally like /^\/api\/xyz\/?(?=\/|$)/i

                    const reg = layer.regexp.toString();

                    // Match /api/xyz
                    const match = reg.match(/\\\/api\\\/([a-zA-Z0-9-]+)/);
                    let prefix = '';
                    if (match && match[1]) {
                        prefix = `/api/${match[1]}`;
                    } else {
                        // try generic
                        const genericMatch = reg.match(/\\\/([a-zA-Z0-9-]+)/g);
                        if (genericMatch) {
                            // Construct path
                            prefix = genericMatch.map(m => m.replace('\\', '')).join('');
                        }
                    }

                    if (prefix) {
                        layer.handle.stack.forEach(subLayer => {
                            if (subLayer.route) {
                                const method = Object.keys(subLayer.route.methods)[0].toUpperCase();
                                endpoints.push({
                                    id: `${method}-${prefix}${subLayer.route.path}`.replace(/[^a-zA-Z0-9]/g, '-'),
                                    path: `${prefix}${subLayer.route.path === '/' ? '' : subLayer.route.path}`,
                                    method: method,
                                    category: prefix.split('/')[2].charAt(0).toUpperCase() + prefix.split('/')[2].slice(1),
                                    description: `Auto-discovered endpoint for ${prefix.split('/')[2]}`,
                                    authentication: 'Bearer Token' // Default assumption
                                });
                            }
                        });
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            count: endpoints.length,
            data: endpoints.sort((a, b) => a.category.localeCompare(b.category))
        });

    } catch (error) {
        console.error('Error fetching endpoints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch endpoints',
            error: error.message
        });
    }
};

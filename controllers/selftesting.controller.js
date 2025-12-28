exports.getChecklist = (req, res) => {
    try {
        // In a real app, this might come from a DB table like 'quality_checklist_items'
        // For now, we serve a standard "real" configurable list from the backend
        const checklist = [
            {
                id: 'func-1',
                category: 'Functionality',
                name: 'All features working as expected',
                description: 'Verify that all implemented features function correctly',
                weight: 10
            },
            {
                id: 'func-2',
                category: 'Functionality',
                name: 'Form validations working',
                description: 'Check all form fields have proper validation (client + server)',
                weight: 8
            },
            {
                id: 'func-3',
                category: 'Functionality',
                name: 'API responses handled correctly',
                description: 'Verify proper handling of success, error, and loading states',
                weight: 8
            },
            {
                id: 'ui-1',
                category: 'UI/UX',
                name: 'Responsive design verification',
                description: 'Test layout on mobile (320px), tablet (768px), and desktop',
                weight: 9
            },
            {
                id: 'ui-2',
                category: 'UI/UX',
                name: 'Cross-browser compatibility',
                description: 'Verify functionality on Chrome, Firefox, and Edge',
                weight: 7
            },
            {
                id: 'sec-1',
                category: 'Security',
                name: 'Authentication checks',
                description: 'Verify protected routes cannot be accessed without token',
                weight: 10
            },
            {
                id: 'sec-2',
                category: 'Security',
                name: 'Input sanitization',
                description: 'Ensure no XSS vulnerabilities in input fields',
                weight: 9
            },
            {
                id: 'perf-1',
                category: 'Performance',
                name: 'Lighthouse Score > 90',
                description: 'Run browser audit and verify performance score',
                weight: 6
            },
            {
                id: 'code-1',
                category: 'Code Quality',
                name: 'No console logs/errors',
                description: 'Clean up debug logs and verify no runtime console errors',
                weight: 5
            }
        ];

        res.status(200).json({
            success: true,
            data: checklist,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching checklist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch checklist',
            error: error.message
        });
    }
};

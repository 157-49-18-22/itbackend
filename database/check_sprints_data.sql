-- Check all data in sprints table
SELECT id, name, projectId, status, startDate, endDate, tasks FROM sprints;

-- Check count of sprints per project
SELECT projectId, COUNT(*) as sprint_count FROM sprints GROUP BY projectId;

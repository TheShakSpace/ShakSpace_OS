const { Router } = require('express');

const router = Router();

// Auth
router.use('/auth', require('./v1/auth.routes'));

// Users
router.use('/users', require('./v1/users.routes'));

// Workspaces
router.use('/workspaces', require('./v1/workspaces.routes'));

// Knowledge
router.use('/knowledge', require('./v1/knowledge.routes'));

// AI
router.use('/ai', require('./v1/ai.routes'));

// Automations
router.use('/automations', require('./v1/automations.routes'));

// Notifications
router.use('/notifications', require('./v1/notifications.routes'));

// Settings
router.use('/settings', require('./v1/settings.routes'));

module.exports = router;


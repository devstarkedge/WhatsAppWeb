const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject } = require('../controllers/projectController');
const auth = require('../middleware/auth');

// All project routes require authentication
router.use(auth);

// Get all projects for the authenticated user
router.get('/', getProjects);

// Create a new project
router.post('/', createProject);

// Delete a project
router.delete('/:id', deleteProject);

module.exports = router;

const { WorkflowState, Project } = require('../../models/sql');
const { createAuditLog } = require('../../utils/auditLogger');

// Helper function to get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.connection?.socket?.remoteAddress;
};

/**
 * @desc    Get current workflow state for a project
 * @route   GET /api/workflow/projects/:projectId/state
 * @access  Private
 */
exports.getWorkflowState = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find or create workflow state
    let workflowState = await WorkflowState.findOne({
      where: { projectId }
    });

    if (!workflowState) {
      workflowState = await WorkflowState.create({
        projectId,
        currentState: 'RequirementGathering',
        status: 'Not Started'
      });
    }

    res.json({
      success: true,
      data: workflowState
    });
  } catch (error) {
    console.error('Error getting workflow state:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting workflow state',
      error: error.message
    });
  }
};

/**
 * @desc    Update workflow state
 * @route   PUT /api/workflow/projects/:projectId/state
 * @access  Private
 */
exports.updateWorkflowState = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { state, status, notes } = req.body;
    const userId = req.user.id;

    // Validate state if provided
    const validStates = [
      'RequirementGathering',
      'Wireframing',
      'Design',
      'Development',
      'Testing',
      'UAT',
      'Deployment',
      'Completed'
    ];

    if (state && !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workflow state'
      });
    }

    // Validate status if provided
    const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find or create workflow state
    let workflowState = await WorkflowState.findOne({
      where: { projectId }
    });

    if (!workflowState) {
      workflowState = await WorkflowState.create({
        projectId,
        currentState: state || 'RequirementGathering',
        status: status || 'Not Started',
        notes: notes || null,
        startedAt: new Date()
      });
    } else {
      // Update existing workflow state
      const updateData = {};
      
      if (state) {
        updateData.currentState = state;
        // If this is a new state, update startedAt
        if (state !== workflowState.currentState) {
          updateData.startedAt = new Date();
          // If previous state was completed, set completedAt
          if (workflowState.status === 'In Progress') {
            updateData.completedAt = new Date();
          }
        }
      }
      
      if (status) {
        updateData.status = status;
        // If status is completed, set completedAt
        if (status === 'Completed') {
          updateData.completedAt = new Date();
        }
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      // Update the workflow state
      await workflowState.update(updateData);
    }

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'WorkflowState',
      entityId: workflowState.id,
      userId: userId,
      oldValue: {
        state: workflowState.currentState,
        status: workflowState.status,
        notes: workflowState.notes
      },
      newValue: {
        state: state || workflowState.currentState,
        status: status || workflowState.status,
        notes: notes !== undefined ? notes : workflowState.notes
      },
      description: `Workflow state updated to ${state || workflowState.currentState} (${status || workflowState.status})`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    // Refresh the workflow state
    workflowState = await WorkflowState.findByPk(workflowState.id);

    res.json({
      success: true,
      data: workflowState,
      message: 'Workflow state updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow state:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workflow state',
      error: error.message
    });
  }
};

/**
 * @desc    Get workflow history for a project
 * @route   GET /api/workflow/projects/:projectId/history
 * @access  Private
 */
exports.getWorkflowHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get workflow state history (you'll need to implement an audit log table for this)
    // This is a simplified example - you might want to query an audit log table
    const workflowState = await WorkflowState.findOne({
      where: { projectId },
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: workflowState || {}
    });
  } catch (error) {
    console.error('Error getting workflow history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting workflow history',
      error: error.message
    });
  }
};

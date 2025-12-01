const Project = require('../models/Project.model');
const { createAuditLog } = require('../utils/auditLogger');

// Get workflow status for a project
exports.getWorkflowStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .select('name currentPhase completedPhases workflowStatus')
      .populate('team', 'name email role')
      .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ensure workflowStatus exists
    project.workflowStatus = project.workflowStatus || {
      uiUx: { status: 'pending', completedAt: null },
      development: { status: 'pending', completedAt: null },
      testing: { status: 'pending', completedAt: null },
      completion: { status: 'pending', completedAt: null },
    };

    // Ensure completedPhases exists
    project.completedPhases = project.completedPhases || [];

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting workflow status',
      error: error.message 
    });
  }
};

// Update workflow phase
exports.updatePhase = async (req, res) => {
  try {
    const { projectId, phase } = req.params;
    const { status = 'in-progress', notes } = req.body;
    
    const validPhases = ['ui-ux', 'development', 'testing', 'completion'];
    if (!validPhases.includes(phase)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phase' 
      });
    }

    const updateData = {};
    updateData.currentPhase = phase;
    updateData[`workflowStatus.${phase}`] = {
      status,
      updatedAt: new Date(),
      updatedBy: req.user.id,
      ...(notes && { notes })
    };

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Log the phase update
    await createAuditLog({
      action: 'WORKFLOW_PHASE_UPDATE',
      entity: 'Project',
      entityId: project._id,
      performedBy: req.user.id,
      details: {
        phase,
        status,
        message: `Updated project phase to ${phase}`,
      },
    });

    res.json({
      success: true,
      data: project,
      message: `Project updated to ${phase} phase`,
    });
  } catch (error) {
    console.error('Error updating workflow phase:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating workflow phase',
      error: error.message 
    });
  }
};

// Complete a phase
exports.completePhase = async (req, res) => {
  try {
    const { projectId, phase } = req.params;
    const { notes } = req.body;
    
    const validPhases = ['ui-ux', 'development', 'testing', 'completion'];
    if (!validPhases.includes(phase)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phase' 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update phase status to completed
    project.workflowStatus = project.workflowStatus || {};
    project.workflowStatus[phase] = {
      status: 'completed',
      completedAt: new Date(),
      completedBy: req.user.id,
      ...(notes && { notes })
    };

    // Add to completedPhases if not already there
    if (!project.completedPhases.includes(phase)) {
      project.completedPhases.push(phase);
    }

    // Determine next phase
    const phaseIndex = validPhases.indexOf(phase);
    if (phaseIndex < validPhases.length - 1) {
      project.currentPhase = validPhases[phaseIndex + 1];
    }

    await project.save();

    // Log the phase completion
    await createAuditLog({
      action: 'WORKFLOW_PHASE_COMPLETE',
      entity: 'Project',
      entityId: project._id,
      performedBy: req.user.id,
      details: {
        phase,
        message: `Completed ${phase} phase`,
      },
    });

    res.json({
      success: true,
      data: project,
      message: `Successfully completed ${phase} phase`,
    });
  } catch (error) {
    console.error('Error completing phase:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error completing phase',
      error: error.message 
    });
  }
};

// Get phase details
exports.getPhaseDetails = async (req, res) => {
  try {
    const { projectId, phase } = req.params;
    
    const project = await Project.findById(projectId)
      .select(`name currentPhase workflowStatus.${phase} team`)
      .populate('team', 'name email role')
      .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get phase-specific data based on the phase
    let phaseData = {};
    
    switch (phase) {
      case 'ui-ux':
        // Add UI/UX specific data
        phaseData = await getUIPhaseData(projectId);
        break;
      case 'development':
        // Add development specific data
        phaseData = await getDevPhaseData(projectId);
        break;
      case 'testing':
        // Add testing specific data
        phaseData = await getTestingPhaseData(projectId);
        break;
      case 'completion':
        // Add completion specific data
        phaseData = await getCompletionPhaseData(projectId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid phase' });
    }

    res.json({
      success: true,
      data: {
        ...project,
        phaseData
      }
    });
  } catch (error) {
    console.error('Error getting phase details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting phase details',
      error: error.message 
    });
  }
};

// Helper functions for phase-specific data
async function getUIPhaseData(projectId) {
  // TODO: Implement UI/UX phase data fetching
  return {
    wireframes: [],
    mockups: [],
    prototypes: [],
    designAssets: []
  };
}

async function getDevPhaseData(projectId) {
  // TODO: Implement development phase data fetching
  return {
    sprints: [],
    tasks: [],
    codeRepos: [],
    deployments: []
  };
}

async function getTestingPhaseData(projectId) {
  // TODO: Implement testing phase data fetching
  return {
    testCases: [],
    testRuns: [],
    bugs: [],
    uatApprovals: []
  };
}

async function getCompletionPhaseData(projectId) {
  // TODO: Implement completion phase data fetching
  return {
    deliverables: [],
    clientApprovals: [],
    handoverDocuments: []
  };
}

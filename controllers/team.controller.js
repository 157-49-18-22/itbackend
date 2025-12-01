const { User } = require('../models/sql');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
// Using plain text passwords

/**
 * Get all team members with department counts
 */
exports.getTeamMembers = async (req, res) => {
  try {
    // Get all active users
    const members = await User.findAll({
      where: { status: 'active' },
      attributes: [
        'id', 'name', 'email', 'role', 'department', 'avatar', 'joinDate'
      ],
      order: [['name', 'ASC']]
    });

    // Calculate department counts
    const departmentCounts = await User.findAll({
      where: { status: 'active' },
      attributes: [
        'department',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['department'],
      raw: true
    });

    // Format department counts
    const departments = departmentCounts.map(dept => ({
      name: dept.department || 'Unassigned',
      count: parseInt(dept.count, 10)
    }));

    res.json({
      success: true,
      data: {
        members,
        departments
      }
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a new team member (Admin only)
 * This is the only way to create new user accounts
 */
exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, role, and department are required',
        field: !name ? 'name' : !email ? 'email' : !password ? 'password' : !role ? 'role' : 'department'
      });
    }

    // Check for existing user with case-insensitive email (MySQL compatible)
    const existingUser = await User.findOne({
      where: {
        email: {
          [Op.like]: `%${email.toLowerCase()}%`
        }
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
        field: 'email'
      });
    }

    // Create user with plain text password
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password,  // Store password in plain text
      role: role || 'Developer',
      department: department || 'Development',
      phone: phone || null,
      status: 'active',
      joinDate: new Date(),
      // Set default values
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      preferences: {
        theme: 'light',
        pushNotifications: true,
        emailNotifications: true
      }
    });

    // Return success response (without password)
    const { password: _, ...userData } = user.toJSON();
    
    res.status(201).json({
      success: true,
      data: userData,
      message: 'Team member added successfully. They can now log in with their email and password.'
    });
  } catch (error) {
    console.error('Error adding team member:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a team member
 */
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, department, phone, status } = req.body;

    // Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If email is being changed, check if it's already in use
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({
        where: {
          email: {
            [Op.iLike]: email
          },
          id: { [Op.ne]: id } // Exclude current user
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
          field: 'email'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      department: department || user.department,
      phone: phone !== undefined ? phone : user.phone,
      status: status || user.status
    };

    // Only update password if a new one is provided
    if (password) {
      updateData.password = password;  // Store password in plain text
    }

    // Get user data before update for audit log
    const previousData = { ...user.get({ plain: true }) };

    // Update user
    await user.update(updateData);

    // Get updated user data
    const updatedUser = await User.findByPk(id);
    const updatedData = updatedUser.get({ plain: true });

    // Don't send password in response
    const { password: _, ...userData } = updatedData;

    res.json({
      success: true,
      data: userData,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove a team member (soft delete)
 */
exports.removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await User.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Soft delete by setting status to inactive
    await member.update({ status: 'inactive' });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: error.message
    });
  }
};

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User.model');
const Client = require('../models/Client.model');
const Project = require('../models/Project.model');
const Task = require('../models/Task.model');
const Approval = require('../models/Approval.model');
const Deliverable = require('../models/Deliverable.model');
const Message = require('../models/Message.model');
const Notification = require('../models/Notification.model');
const Activity = require('../models/Activity.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear all collections
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Approval.deleteMany({});
    await Deliverable.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Activity.deleteMany({});

    console.log('👥 Creating users...');
    
    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@itagency.com',
        password: 'password123',
        role: 'Admin',
        department: 'Management',
        designation: 'System Administrator',
        status: 'active',
        phone: '+1-555-0001',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        name: 'John Doe',
        email: 'john@itagency.com',
        password: 'password123',
        role: 'Project Manager',
        department: 'Management',
        designation: 'Senior Project Manager',
        status: 'active',
        phone: '+1-555-0002',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
      },
      {
        name: 'Sarah Lee',
        email: 'sarah@itagency.com',
        password: 'password123',
        role: 'Designer',
        department: 'Design',
        designation: 'UI/UX Designer',
        status: 'active',
        phone: '+1-555-0003',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
      },
      {
        name: 'Alex Johnson',
        email: 'alex@itagency.com',
        password: 'password123',
        role: 'Developer',
        department: 'Development',
        designation: 'Full Stack Developer',
        status: 'active',
        phone: '+1-555-0004',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      {
        name: 'Jane Smith',
        email: 'jane@itagency.com',
        password: 'password123',
        role: 'Developer',
        department: 'Development',
        designation: 'Backend Developer',
        status: 'active',
        phone: '+1-555-0005',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      {
        name: 'Mike Wilson',
        email: 'mike@itagency.com',
        password: 'password123',
        role: 'Tester',
        department: 'Development',
        designation: 'QA Engineer',
        status: 'active',
        phone: '+1-555-0006',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
      }
    ]);

    console.log('🏢 Creating clients...');
    
    // Create clients
    const clients = await Client.create([
      {
        name: 'Robert Brown',
        companyName: 'FashionHub Inc.',
        email: 'robert@fashionhub.com',
        phone: '+1-555-1001',
        industry: 'E-commerce',
        website: 'https://fashionhub.com',
        status: 'Active',
        contactPerson: {
          name: 'Robert Brown',
          designation: 'CEO',
          email: 'robert@fashionhub.com',
          phone: '+1-555-1001'
        }
      },
      {
        name: 'Emily Davis',
        companyName: 'Global Bank Corp',
        email: 'emily@globalbank.com',
        phone: '+1-555-1002',
        industry: 'Finance',
        website: 'https://globalbank.com',
        status: 'Active',
        contactPerson: {
          name: 'Emily Davis',
          designation: 'CTO',
          email: 'emily@globalbank.com',
          phone: '+1-555-1002'
        }
      },
      {
        name: 'David Chen',
        companyName: 'TechSolutions Inc.',
        email: 'david@techsolutions.com',
        phone: '+1-555-1003',
        industry: 'Technology',
        website: 'https://techsolutions.com',
        status: 'Active',
        contactPerson: {
          name: 'David Chen',
          designation: 'Product Manager',
          email: 'david@techsolutions.com',
          phone: '+1-555-1003'
        }
      }
    ]);

    console.log('📁 Creating projects...');
    
    // Create projects
    const projects = await Project.create([
      {
        name: 'E-commerce Website Redesign',
        description: 'Complete redesign of FashionHub e-commerce platform with modern UI/UX',
        client: clients[0]._id,
        status: 'In Progress',
        priority: 'High',
        currentPhase: 'Development',
        progress: 65,
        startDate: new Date('2024-10-15'),
        endDate: new Date('2024-12-30'),
        team: {
          projectManager: users[1]._id,
          members: [
            { user: users[2]._id, role: 'Designer' },
            { user: users[3]._id, role: 'Developer' },
            { user: users[4]._id, role: 'Developer' }
          ]
        },
        phases: {
          uiux: { status: 'Completed', progress: 100 },
          development: { status: 'In Progress', progress: 60 },
          testing: { status: 'Not Started', progress: 0 }
        },
        budget: { estimated: 50000, actual: 32000, currency: 'USD' },
        tags: ['e-commerce', 'redesign', 'react']
      },
      {
        name: 'Mobile Banking App',
        description: 'Secure mobile banking application for iOS and Android',
        client: clients[1]._id,
        status: 'In Progress',
        priority: 'High',
        currentPhase: 'UI/UX Design',
        progress: 30,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-02-15'),
        team: {
          projectManager: users[1]._id,
          members: [
            { user: users[2]._id, role: 'Designer' },
            { user: users[3]._id, role: 'Developer' }
          ]
        },
        phases: {
          uiux: { status: 'In Progress', progress: 45 },
          development: { status: 'Not Started', progress: 0 },
          testing: { status: 'Not Started', progress: 0 }
        },
        budget: { estimated: 80000, actual: 15000, currency: 'USD' },
        tags: ['mobile', 'banking', 'react-native']
      },
      {
        name: 'Corporate Website',
        description: 'Modern corporate website with CMS integration',
        client: clients[2]._id,
        status: 'Completed',
        priority: 'Medium',
        currentPhase: 'Completed',
        progress: 100,
        startDate: new Date('2024-09-10'),
        endDate: new Date('2024-10-25'),
        actualEndDate: new Date('2024-10-23'),
        team: {
          projectManager: users[1]._id,
          members: [
            { user: users[2]._id, role: 'Designer' },
            { user: users[4]._id, role: 'Developer' }
          ]
        },
        phases: {
          uiux: { status: 'Completed', progress: 100 },
          development: { status: 'Completed', progress: 100 },
          testing: { status: 'Completed', progress: 100 }
        },
        budget: { estimated: 25000, actual: 24500, currency: 'USD' },
        tags: ['website', 'cms', 'nextjs']
      }
    ]);

    console.log('✅ Creating tasks...');
    
    // Create tasks
    await Task.create([
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated builds and deployments',
        project: projects[0]._id,
        status: 'in-progress',
        priority: 'high',
        type: 'Feature',
        assignee: users[3]._id,
        reporter: users[1]._id,
        dueDate: new Date('2024-11-12'),
        estimatedHours: 8,
        actualHours: 5,
        tags: ['devops', 'automation'],
        phase: 'Development'
      },
      {
        title: 'Design checkout flow',
        description: 'Create wireframes and mockups for checkout process',
        project: projects[0]._id,
        status: 'review',
        priority: 'high',
        type: 'Feature',
        assignee: users[2]._id,
        reporter: users[1]._id,
        dueDate: new Date('2024-11-10'),
        estimatedHours: 12,
        actualHours: 11,
        tags: ['ui', 'checkout'],
        phase: 'UI/UX'
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT-based authentication with refresh tokens',
        project: projects[1]._id,
        status: 'todo',
        priority: 'critical',
        type: 'Feature',
        assignee: users[4]._id,
        reporter: users[1]._id,
        dueDate: new Date('2024-11-15'),
        estimatedHours: 16,
        tags: ['security', 'backend'],
        phase: 'Development'
      }
    ]);

    console.log('📋 Creating approvals...');
    
    // Create approvals
    await Approval.create([
      {
        type: 'Deliverable',
        title: 'UI Mockups v2',
        description: 'Homepage and product detail page mockups',
        project: projects[0]._id,
        requestedBy: users[2]._id,
        requestedTo: users[0]._id,
        status: 'Pending',
        priority: 'High',
        notes: 'Updated based on client feedback',
        version: 'v2.0'
      },
      {
        type: 'Stage Transition',
        title: 'Move to Development Phase',
        description: 'UI/UX design completed, ready for development',
        project: projects[1]._id,
        requestedBy: users[1]._id,
        requestedTo: users[0]._id,
        status: 'Pending',
        priority: 'Medium',
        notes: 'All wireframes approved by client',
        version: '-'
      }
    ]);

    console.log('📦 Creating deliverables...');
    
    // Create deliverables
    await Deliverable.create([
      {
        name: 'Homepage Wireframes',
        description: 'Low-fidelity wireframes for homepage layout',
        project: projects[0]._id,
        type: 'Wireframe',
        status: 'Approved',
        version: 'v1.0',
        fileUrl: '/uploads/wireframes-homepage-v1.pdf',
        fileName: 'wireframes-homepage-v1.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        uploadedBy: users[2]._id,
        phase: 'UI/UX',
        tags: ['wireframe', 'homepage']
      },
      {
        name: 'Design System',
        description: 'Complete design system with components and guidelines',
        project: projects[0]._id,
        type: 'Design System',
        status: 'Final',
        version: 'v1.0',
        fileUrl: '/uploads/design-system-v1.fig',
        fileName: 'design-system-v1.fig',
        fileSize: 5120000,
        fileType: 'application/figma',
        uploadedBy: users[2]._id,
        phase: 'UI/UX',
        tags: ['design-system', 'components']
      }
    ]);

    console.log('💬 Creating messages...');
    
    // Create messages
    await Message.create([
      {
        thread: 'project-1-general',
        sender: users[1]._id,
        recipients: [users[2]._id, users[3]._id, users[4]._id],
        subject: 'Project Kickoff',
        content: 'Welcome to the E-commerce Redesign project! Let\'s have our first meeting tomorrow.',
        project: projects[0]._id
      },
      {
        thread: 'project-1-general',
        sender: users[2]._id,
        recipients: [users[1]._id],
        content: 'Sounds good! I\'ll prepare the design presentation.',
        project: projects[0]._id,
        parentMessage: null
      }
    ]);

    console.log('🔔 Creating notifications...');
    
    // Create notifications
    await Notification.create([
      {
        type: 'Approval',
        title: 'Approval required: UI Mockups v2',
        description: 'E-commerce Platform',
        recipient: users[0]._id,
        sender: users[2]._id,
        isRead: false,
        priority: 'high',
        relatedProject: projects[0]._id
      },
      {
        type: 'Task',
        title: 'New task assigned to you',
        description: 'Setup CI/CD pipeline',
        recipient: users[3]._id,
        sender: users[1]._id,
        isRead: false,
        priority: 'medium',
        relatedProject: projects[0]._id
      },
      {
        type: 'System',
        title: 'Project status updated',
        description: 'Corporate Website is now Completed',
        recipient: users[1]._id,
        isRead: true,
        priority: 'low',
        relatedProject: projects[2]._id
      }
    ]);

    console.log('📊 Creating activities...');
    
    // Create activities
    await Activity.create([
      {
        type: 'Project',
        title: 'Project created: E-commerce Website Redesign',
        description: 'New project initiated',
        user: users[1]._id,
        project: projects[0]._id,
        timestamp: new Date('2024-10-15T10:00:00')
      },
      {
        type: 'Task',
        title: 'Task created: Setup CI/CD pipeline',
        description: 'New development task',
        user: users[1]._id,
        project: projects[0]._id,
        timestamp: new Date('2024-11-05T14:30:00')
      },
      {
        type: 'Approval',
        title: 'Approval requested: UI Mockups v2',
        description: 'Awaiting admin approval',
        user: users[2]._id,
        project: projects[0]._id,
        timestamp: new Date('2024-11-06T16:45:00')
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Email: admin@itagency.com');
    console.log('Password: password123');
    console.log('\nOther users: john@itagency.com, sarah@itagency.com, alex@itagency.com');
    console.log('All passwords: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

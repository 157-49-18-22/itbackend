require('dotenv').config();
const { sequelize, User, Client, Project, Task, Approval, Deliverable, Message, Notification, Activity } = require('../models/sql');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding SQL database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Clear existing data (disable foreign key checks)
    console.log('🗑️  Clearing existing data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await Activity.destroy({ where: {}, truncate: true, cascade: true });
    await Notification.destroy({ where: {}, truncate: true, cascade: true });
    await Message.destroy({ where: {}, truncate: true, cascade: true });
    await Approval.destroy({ where: {}, truncate: true, cascade: true });
    await Deliverable.destroy({ where: {}, truncate: true, cascade: true });
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await Project.destroy({ where: {}, truncate: true, cascade: true });
    await Client.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('👥 Creating users...');
    
    // Create users
    const users = await User.bulkCreate([
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
    const clients = await Client.bulkCreate([
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
    const projects = await Project.bulkCreate([
      {
        name: 'E-commerce Website Redesign',
        description: 'Complete redesign of FashionHub e-commerce platform with modern UI/UX',
        clientId: clients[0].id,
        status: 'In Progress',
        priority: 'High',
        currentPhase: 'Development',
        progress: 65,
        startDate: new Date('2024-10-15'),
        endDate: new Date('2024-12-30'),
        projectManagerId: users[1].id,
        teamMembers: [
          { userId: users[2].id, role: 'Designer' },
          { userId: users[3].id, role: 'Developer' },
          { userId: users[4].id, role: 'Developer' }
        ],
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
        clientId: clients[1].id,
        status: 'In Progress',
        priority: 'High',
        currentPhase: 'UI/UX Design',
        progress: 30,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-02-15'),
        projectManagerId: users[1].id,
        teamMembers: [
          { userId: users[2].id, role: 'Designer' },
          { userId: users[3].id, role: 'Developer' }
        ],
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
        clientId: clients[2].id,
        status: 'Completed',
        priority: 'Medium',
        currentPhase: 'Completed',
        progress: 100,
        startDate: new Date('2024-09-10'),
        endDate: new Date('2024-10-25'),
        actualEndDate: new Date('2024-10-23'),
        projectManagerId: users[1].id,
        teamMembers: [
          { userId: users[2].id, role: 'Designer' },
          { userId: users[4].id, role: 'Developer' }
        ],
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
    await Task.bulkCreate([
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated builds and deployments',
        projectId: projects[0].id,
        status: 'in-progress',
        priority: 'high',
        type: 'Feature',
        assigneeId: users[3].id,
        reporterId: users[1].id,
        dueDate: new Date('2024-11-12'),
        estimatedHours: 8,
        actualHours: 5,
        tags: ['devops', 'automation'],
        phase: 'Development'
      },
      {
        title: 'Design checkout flow',
        description: 'Create wireframes and mockups for checkout process',
        projectId: projects[0].id,
        status: 'review',
        priority: 'high',
        type: 'Feature',
        assigneeId: users[2].id,
        reporterId: users[1].id,
        dueDate: new Date('2024-11-10'),
        estimatedHours: 12,
        actualHours: 11,
        tags: ['ui', 'checkout'],
        phase: 'UI/UX'
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT-based authentication with refresh tokens',
        projectId: projects[1].id,
        status: 'todo',
        priority: 'critical',
        type: 'Feature',
        assigneeId: users[4].id,
        reporterId: users[1].id,
        dueDate: new Date('2024-11-15'),
        estimatedHours: 16,
        tags: ['security', 'backend'],
        phase: 'Development'
      }
    ]);

    console.log('📋 Creating approvals...');
    
    // Create approvals
    await Approval.bulkCreate([
      {
        approvalId: 'AP-1024',
        type: 'Deliverable',
        title: 'UI Mockups v2',
        description: 'Homepage and product detail page mockups',
        projectId: projects[0].id,
        requestedById: users[2].id,
        requestedToId: users[0].id,
        status: 'Pending',
        priority: 'High',
        notes: 'Updated based on client feedback',
        version: 'v2.0'
      },
      {
        approvalId: 'AP-1025',
        type: 'Stage Transition',
        title: 'Move to Development Phase',
        description: 'UI/UX design completed, ready for development',
        projectId: projects[1].id,
        requestedById: users[1].id,
        requestedToId: users[0].id,
        status: 'Pending',
        priority: 'Medium',
        notes: 'All wireframes approved by client',
        version: '-'
      }
    ]);

    console.log('📦 Creating deliverables...');
    
    // Create deliverables
    await Deliverable.bulkCreate([
      {
        name: 'Homepage Wireframes',
        description: 'Low-fidelity wireframes for homepage layout',
        projectId: projects[0].id,
        type: 'Wireframe',
        status: 'Approved',
        version: 'v1.0',
        fileUrl: '/uploads/wireframes-homepage-v1.pdf',
        fileName: 'wireframes-homepage-v1.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        uploadedById: users[2].id,
        phase: 'UI/UX',
        tags: ['wireframe', 'homepage']
      },
      {
        name: 'Design System',
        description: 'Complete design system with components and guidelines',
        projectId: projects[0].id,
        type: 'Design System',
        status: 'Final',
        version: 'v1.0',
        fileUrl: '/uploads/design-system-v1.fig',
        fileName: 'design-system-v1.fig',
        fileSize: 5120000,
        fileType: 'application/figma',
        uploadedById: users[2].id,
        phase: 'UI/UX',
        tags: ['design-system', 'components']
      }
    ]);

    console.log('💬 Creating messages...');
    
    // Create messages
    await Message.bulkCreate([
      {
        thread: 'project-1-general',
        senderId: users[1].id,
        recipients: [users[2].id, users[3].id, users[4].id],
        subject: 'Project Kickoff',
        content: 'Welcome to the E-commerce Redesign project! Let\'s have our first meeting tomorrow.',
        projectId: projects[0].id
      },
      {
        thread: 'project-1-general',
        senderId: users[2].id,
        recipients: [users[1].id],
        content: 'Sounds good! I\'ll prepare the design presentation.',
        projectId: projects[0].id
      }
    ]);

    console.log('🔔 Creating notifications...');
    
    // Create notifications
    await Notification.bulkCreate([
      {
        notificationId: 'N-3010',
        type: 'Approval',
        title: 'Approval required: UI Mockups v2',
        description: 'E-commerce Platform',
        recipientId: users[0].id,
        senderId: users[2].id,
        isRead: false,
        priority: 'high',
        relatedProjectId: projects[0].id
      },
      {
        notificationId: 'N-3011',
        type: 'Task',
        title: 'New task assigned to you',
        description: 'Setup CI/CD pipeline',
        recipientId: users[3].id,
        senderId: users[1].id,
        isRead: false,
        priority: 'medium',
        relatedProjectId: projects[0].id
      },
      {
        notificationId: 'N-3012',
        type: 'System',
        title: 'Project status updated',
        description: 'Corporate Website is now Completed',
        recipientId: users[1].id,
        isRead: true,
        priority: 'low',
        relatedProjectId: projects[2].id
      }
    ]);

    console.log('📊 Creating activities...');
    
    // Create activities
    await Activity.bulkCreate([
      {
        activityId: 'A-2007',
        type: 'Project',
        title: 'Project created: E-commerce Website Redesign',
        description: 'New project initiated',
        userId: users[1].id,
        projectId: projects[0].id,
        timestamp: new Date('2024-10-15T10:00:00')
      },
      {
        activityId: 'A-2008',
        type: 'Task',
        title: 'Task created: Setup CI/CD pipeline',
        description: 'New development task',
        userId: users[1].id,
        projectId: projects[0].id,
        timestamp: new Date('2024-11-05T14:30:00')
      },
      {
        activityId: 'A-2009',
        type: 'Approval',
        title: 'Approval requested: UI Mockups v2',
        description: 'Awaiting admin approval',
        userId: users[2].id,
        projectId: projects[0].id,
        timestamp: new Date('2024-11-06T16:45:00')
      }
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Email: admin@itagency.com');
    console.log('Password: password123');
    console.log('\nOther users: john@itagency.com, sarah@itagency.com, alex@itagency.com');
    console.log('All passwords: password123\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();

import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import './App.css';

// ═══════════════════════════════════════════════════════════════
// LEP HUB — Legacy Enterprise Platform v3
// With AI-Powered Document Generation & Assessment Persistence
// ═══════════════════════════════════════════════════════════════

// ─── DATA: LEP Framework Structure ─────────────────────────────
const LEP_PILLARS = [
  {
    id: 'roots',
    name: 'ROOTS',
    icon: '🌳',
    color: '#2d5a3d',
    tagline: 'Know where you come from',
    description: 'Family history, core values, and shared identity',
    modules: [
      { id: 'family-story', name: 'Family Story', description: 'Document your origin story, key moments, and legacy milestones', hasContent: true },
      { id: 'core-values', name: 'Core Values', description: 'Define and ratify the values that guide your family enterprise', hasContent: true },
      { id: 'genogram', name: 'Family Genogram', description: 'Map your family system, relationships, and patterns', hasContent: true },
    ],
  },
  {
    id: 'order',
    name: 'ORDER',
    icon: '⚙️',
    color: '#1a3a5c',
    tagline: 'Structure creates freedom',
    description: 'Governance structures, policies, and accountability',
    modules: [
      { id: 'constitution', name: 'Family Constitution', description: 'Create or update your family charter and guiding principles', hasContent: true },
      { id: 'governance', name: 'Governance Design', description: 'Define councils, committees, roles, and decision-making authority', hasContent: true },
      { id: 'policies', name: 'Policies & Agreements', description: 'Employment, compensation, conflict resolution, and operating policies', hasContent: true },
    ],
  },
  {
    id: 'impact',
    name: 'IMPACT',
    icon: '📈',
    color: '#7c3aed',
    tagline: 'Measure what matters',
    description: 'Business strategy, financial health, and performance',
    modules: [
      { id: 'strategic-plan', name: 'Strategic Plan', description: 'Family enterprise vision, goals, and strategic priorities', hasContent: true },
      { id: 'financial-health', name: 'Financial Dashboard', description: 'Key metrics, reporting cadence, and financial transparency', hasContent: true },
      { id: 'performance', name: 'Performance Review', description: 'Business performance assessment and accountability', hasContent: true },
    ],
  },
  {
    id: 'continuity',
    name: 'CONTINUITY',
    icon: '🔄',
    color: '#0891b2',
    tagline: 'Plan for every scenario',
    description: 'Succession planning, contingency, and wealth transfer',
    modules: [
      { id: 'succession', name: 'Succession Plan', description: 'Leadership pipeline, timeline, criteria, and development', hasContent: true },
      { id: 'contingency', name: 'Contingency Protocols', description: 'Emergency scenarios, backup plans, and crisis response', hasContent: true },
      { id: 'estate', name: 'Estate & Wealth Transfer', description: 'Trusts, gifting strategies, and ownership transitions', hasContent: true },
    ],
  },
  {
    id: 'legacy',
    name: 'LEGACY',
    icon: '✦',
    color: '#d97706',
    tagline: 'Build for generations',
    description: 'Next-gen development, philanthropy, and long-term vision',
    modules: [
      { id: 'nextgen', name: 'Next Gen Program', description: 'Education, onboarding, mentorship, and leadership readiness', hasContent: true },
      { id: 'philanthropy', name: 'Philanthropy Strategy', description: 'Giving philosophy, foundations, and community impact', hasContent: true },
      { id: 'vision', name: 'Vision 2050', description: 'Long-term family vision and aspirational goals', hasContent: true },
    ],
  },
];

const MEETING_TYPES = [
  { id: 'board', name: 'Board Meeting', frequency: 'Quarterly', icon: '🏛️', pillars: ['impact', 'continuity'] },
  { id: 'shareholder', name: 'Shareholder Meeting', frequency: 'Annual', icon: '📊', pillars: ['impact', 'continuity'] },
  { id: 'family-council', name: 'Family Council', frequency: 'Monthly', icon: '👥', pillars: ['order', 'roots'] },
  { id: 'family-meeting', name: 'Family Meeting', frequency: 'Annual', icon: '🏠', pillars: ['roots', 'legacy'] },
  { id: 'nextgen', name: 'Next Gen Gathering', frequency: 'Semi-annual', icon: '🌱', pillars: ['legacy'] },
];

const COMMITTEE_TYPES = [
  { id: 'investment', name: 'Investment Committee', icon: '💰' },
  { id: 'compensation', name: 'Compensation Committee', icon: '💵' },
  { id: 'philanthropy', name: 'Philanthropy Committee', icon: '❤️' },
  { id: 'governance', name: 'Governance Committee', icon: '⚖️' },
  { id: 'nominating', name: 'Nominating Committee', icon: '🗳️' },
];

// ─── ASSESSMENT QUESTIONS ──────────────────────────────────────
const ASSESSMENT_QUESTIONS = {
  roots: [
    { id: 'r1', text: 'Our family has a documented history and origin story that all members know.' },
    { id: 'r2', text: 'We have clearly defined and written core values that guide our decisions.' },
    { id: 'r3', text: 'Family members understand how they fit into the larger family system.' },
    { id: 'r4', text: 'We regularly share stories and traditions that reinforce our identity.' },
    { id: 'r5', text: 'New family members (spouses, etc.) are formally onboarded to our family culture.' },
  ],
  order: [
    { id: 'o1', text: 'We have a written family constitution or charter.' },
    { id: 'o2', text: 'Roles and responsibilities are clearly defined for family members in the business.' },
    { id: 'o3', text: 'We have formal governance structures (board, councils, committees).' },
    { id: 'o4', text: 'There are clear policies for employment, compensation, and conflict resolution.' },
    { id: 'o5', text: 'Decision-making authority is documented and understood by all.' },
  ],
  impact: [
    { id: 'i1', text: 'We have a written strategic plan for the family enterprise.' },
    { id: 'i2', text: 'Financial performance is regularly reviewed with appropriate stakeholders.' },
    { id: 'i3', text: 'Key metrics are tracked and reported on a consistent schedule.' },
    { id: 'i4', text: 'Business performance is benchmarked against industry standards.' },
    { id: 'i5', text: 'There is accountability for achieving strategic goals.' },
  ],
  continuity: [
    { id: 'c1', text: 'We have a written succession plan for key leadership positions.' },
    { id: 'c2', text: 'Potential successors have been identified and are being developed.' },
    { id: 'c3', text: 'Contingency plans exist for unexpected events (death, disability, divorce).' },
    { id: 'c4', text: 'Estate and wealth transfer plans are documented and communicated.' },
    { id: 'c5', text: 'Ownership transition timelines and criteria are clear.' },
  ],
  legacy: [
    { id: 'l1', text: 'Next generation members have a clear development pathway.' },
    { id: 'l2', text: 'We have a defined approach to family philanthropy.' },
    { id: 'l3', text: 'There is a long-term vision (10+ years) for the family enterprise.' },
    { id: 'l4', text: 'Younger family members are engaged and excited about the future.' },
    { id: 'l5', text: 'We actively prepare the next generation for leadership and ownership.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// MODULE CONTENT FOR ALL PILLARS
// ═══════════════════════════════════════════════════════════════

const ROOTS_MODULE_CONTENT = {
  'family-story': {
    title: 'Family Story',
    subtitle: 'Document your origin story, key moments, and legacy milestones',
    estimatedTime: '60-90 minutes',
    sections: [
      {
        id: 'origin',
        title: 'Origin Story',
        description: 'Every family enterprise has a founding story. Capture yours.',
        exercises: [
          {
            id: 'founder-story',
            question: 'Who founded the family enterprise, and what year did it begin?',
            type: 'textarea',
            placeholder: 'Describe the founder(s) and the founding moment...',
            helperText: 'Include names, dates, and the circumstances that led to starting the business.',
          },
          {
            id: 'why-started',
            question: 'What problem were they trying to solve or opportunity were they pursuing?',
            type: 'textarea',
            placeholder: 'What drove the founding decision...',
          },
          {
            id: 'early-struggles',
            question: 'What were the biggest challenges in the early years?',
            type: 'textarea',
            placeholder: 'Describe the obstacles overcome...',
          },
          {
            id: 'first-success',
            question: 'What was the first major milestone or success?',
            type: 'textarea',
            placeholder: 'The breakthrough moment...',
          },
        ],
      },
      {
        id: 'milestones',
        title: 'Key Milestones',
        description: 'Map the critical moments that shaped your family enterprise.',
        exercises: [
          {
            id: 'milestone-list',
            question: 'List 5-10 defining moments in your family enterprise history',
            type: 'milestone-builder',
            helperText: 'Include expansions, crises overcome, leadership transitions, major deals, etc.',
          },
        ],
      },
      {
        id: 'legacy-stories',
        title: 'Stories We Tell',
        description: 'The stories passed down become the culture. Which ones matter most?',
        exercises: [
          {
            id: 'hero-story',
            question: 'What\'s a story about a family member that exemplifies who we are?',
            type: 'textarea',
            placeholder: 'The story of...',
            helperText: 'This could be about sacrifice, integrity, innovation, or resilience.',
          },
          {
            id: 'crisis-story',
            question: 'What\'s a story about a time the family enterprise almost failed?',
            type: 'textarea',
            placeholder: 'The time we almost...',
            helperText: 'How the family came together in crisis.',
          },
          {
            id: 'values-story',
            question: 'What\'s a story that captures our core values in action?',
            type: 'textarea',
            placeholder: 'This story shows what we stand for...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Story Document',
      description: 'A written narrative capturing your origin, milestones, and defining stories.',
    },
  },
  'core-values': {
    title: 'Core Values',
    subtitle: 'Define and ratify the values that guide your family enterprise',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'current-values',
        title: 'Values Discovery',
        description: 'Before defining new values, understand what\'s already guiding you.',
        exercises: [
          {
            id: 'implicit-values',
            question: 'What values have guided your family enterprise, even if unwritten?',
            type: 'textarea',
            placeholder: 'The values we\'ve always operated by...',
            helperText: 'Think about what the founders would say matters most.',
          },
          {
            id: 'non-negotiables',
            question: 'What behaviors would cause someone to be asked to leave the business?',
            type: 'textarea',
            placeholder: 'We would never tolerate...',
            helperText: 'The inverse of your values reveals what truly matters.',
          },
          {
            id: 'proud-moments',
            question: 'When have you been most proud of how the family handled something?',
            type: 'textarea',
            placeholder: 'The moment we showed who we really are...',
          },
        ],
      },
      {
        id: 'values-definition',
        title: 'Values Definition',
        description: 'Name and define 3-5 core values for your family enterprise.',
        exercises: [
          {
            id: 'values-list',
            question: 'Define your family enterprise core values',
            type: 'values-builder',
            helperText: 'Each value needs a name, definition, and behavioral example.',
          },
        ],
      },
      {
        id: 'values-in-action',
        title: 'Values in Action',
        description: 'Values only matter if they\'re used. Define how.',
        exercises: [
          {
            id: 'hiring-values',
            question: 'How will these values influence who we hire?',
            type: 'textarea',
            placeholder: 'When evaluating candidates, we look for...',
          },
          {
            id: 'decision-values',
            question: 'How will these values guide difficult decisions?',
            type: 'textarea',
            placeholder: 'When we\'re unsure what to do, we ask ourselves...',
          },
          {
            id: 'values-recognition',
            question: 'How will we recognize and celebrate values-driven behavior?',
            type: 'textarea',
            placeholder: 'We will acknowledge values in action by...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Values Charter',
      description: 'A ratified document listing your 3-5 core values with definitions.',
    },
  },
  'genogram': {
    title: 'Family Genogram',
    subtitle: 'Map your family system, relationships, and patterns',
    estimatedTime: '60-90 minutes',
    sections: [
      {
        id: 'family-mapping',
        title: 'Family Map',
        description: 'Create a visual map of your family system.',
        exercises: [
          {
            id: 'generations',
            question: 'How many generations are currently involved or connected to the enterprise?',
            type: 'select',
            options: ['2 generations', '3 generations', '4 generations', '5+ generations'],
          },
          {
            id: 'family-branches',
            question: 'List each branch of the family',
            type: 'branch-builder',
            helperText: 'Include the branch name, key members, and their roles.',
          },
        ],
      },
      {
        id: 'relationships',
        title: 'Relationship Patterns',
        description: 'Understand the dynamics that shape your family system.',
        exercises: [
          {
            id: 'strong-bonds',
            question: 'Which family relationships are particularly strong?',
            type: 'textarea',
            placeholder: 'The strongest bonds are between...',
            helperText: 'These alliances influence how decisions get made.',
          },
          {
            id: 'tension-areas',
            question: 'Where are there tensions or conflicts in the family system?',
            type: 'textarea',
            placeholder: 'There has historically been tension around...',
            helperText: 'Being honest about these patterns is essential.',
          },
          {
            id: 'triangles',
            question: 'Are there "triangles" where two people communicate through a third?',
            type: 'textarea',
            placeholder: 'Communication sometimes goes through...',
            helperText: 'Triangulation is common in family systems.',
          },
        ],
      },
      {
        id: 'roles-patterns',
        title: 'Roles & Patterns',
        description: 'Every family assigns informal roles. Name them.',
        exercises: [
          {
            id: 'peacemaker',
            question: 'Who plays the "peacemaker" role in the family?',
            type: 'textarea',
            placeholder: 'The person who smooths things over is...',
          },
          {
            id: 'truth-teller',
            question: 'Who plays the "truth teller" role?',
            type: 'textarea',
            placeholder: 'The person who says what others won\'t is...',
          },
          {
            id: 'decision-maker',
            question: 'Who is the de facto decision-maker, regardless of formal titles?',
            type: 'textarea',
            placeholder: 'The person whose opinion ultimately matters most is...',
          },
          {
            id: 'patterns',
            question: 'What patterns repeat across generations?',
            type: 'textarea',
            placeholder: 'We see recurring themes of...',
            helperText: 'Patterns might include conflict avoidance, entrepreneurship, etc.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Genogram',
      description: 'A documented map of your family system including branches and patterns.',
    },
  },
};

const ORDER_MODULE_CONTENT = {
  'constitution': {
    title: 'Family Constitution',
    subtitle: 'Create or update your family charter and guiding principles',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'charter-purpose',
        title: 'Charter Purpose',
        description: 'Why do you need a family constitution? What will it guide?',
        exercises: [
          {
            id: 'purpose-statement',
            question: 'What is the primary purpose of your family constitution?',
            type: 'textarea',
            placeholder: 'Our family constitution exists to...',
            helperText: 'Think about governance, decision-making, and family harmony.',
          },
          {
            id: 'scope',
            question: 'What aspects of family life and business will this constitution cover?',
            type: 'textarea',
            placeholder: 'The constitution will address...',
          },
        ],
      },
      {
        id: 'principles',
        title: 'Guiding Principles',
        description: 'What foundational principles should guide your family?',
        exercises: [
          {
            id: 'principles-list',
            question: 'List 4-6 core principles for your family constitution',
            type: 'textarea',
            placeholder: 'Our core principles are:\n1.\n2.\n3.\netc.',
            helperText: 'Examples: transparency, meritocracy, stakeholder responsibility, stewardship.',
          },
          {
            id: 'membership-criteria',
            question: 'Who is considered a member of the family enterprise, and what criteria define membership?',
            type: 'textarea',
            placeholder: 'Family members are defined as...',
          },
        ],
      },
      {
        id: 'decision-rights',
        title: 'Decision Rights',
        description: 'How will key decisions be made?',
        exercises: [
          {
            id: 'decision-framework',
            question: 'Describe how major decisions (hiring, exits, investments) will be made',
            type: 'textarea',
            placeholder: 'For major decisions, we will...',
            helperText: 'Clarify who has authority, who gets consulted, and what the process is.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Constitution',
      description: 'A foundational governance document defining your family enterprise principles.',
    },
  },
  'governance': {
    title: 'Governance Design',
    subtitle: 'Define councils, committees, roles, and decision-making authority',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'board-design',
        title: 'Board Structure',
        description: 'Design your governance board(s) and councils.',
        exercises: [
          {
            id: 'board-type',
            question: 'What governance structures will you establish (board, family council, advisory board)?',
            type: 'textarea',
            placeholder: 'We will have the following bodies...',
            helperText: 'Example: Board of Directors, Family Council, Investment Committee.',
          },
          {
            id: 'board-composition',
            question: 'Who should sit on each body, and what are the selection criteria?',
            type: 'textarea',
            placeholder: 'Board members will be selected based on...',
          },
        ],
      },
      {
        id: 'roles-responsibilities',
        title: 'Roles & Responsibilities',
        description: 'Define clear roles and decision authority.',
        exercises: [
          {
            id: 'role-definition',
            question: 'Define the key roles in your governance structure (CEO, board chair, council chair)',
            type: 'textarea',
            placeholder: 'The CEO is responsible for...\nThe Board Chair is responsible for...',
          },
          {
            id: 'authority-limits',
            question: 'What are the authority limits for each role?',
            type: 'textarea',
            placeholder: 'The CEO can make decisions up to...\nThe Board must approve...',
          },
        ],
      },
      {
        id: 'meeting-cadence',
        title: 'Meeting Cadence',
        description: 'How often will governance bodies meet?',
        exercises: [
          {
            id: 'meeting-schedule',
            question: 'What is your planned meeting schedule for each governance body?',
            type: 'select',
            options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'As-needed'],
          },
        ],
      },
    ],
    deliverable: {
      title: 'Governance Structure Document',
      description: 'A formal document defining your governance bodies, roles, and decision authority.',
    },
  },
  'policies': {
    title: 'Policies & Agreements',
    subtitle: 'Employment, compensation, conflict resolution, and operating policies',
    estimatedTime: '120-150 minutes',
    sections: [
      {
        id: 'employment-policies',
        title: 'Employment Policies',
        description: 'Set clear expectations for family members employed in the business.',
        exercises: [
          {
            id: 'employment-criteria',
            question: 'What are the criteria for hiring family members in the business?',
            type: 'textarea',
            placeholder: 'Family members seeking employment must meet...',
            helperText: 'Example: minimum education, outside work experience, performance standards.',
          },
          {
            id: 'employment-terms',
            question: 'What are the key employment terms and expectations?',
            type: 'textarea',
            placeholder: 'Employment terms include...',
          },
        ],
      },
      {
        id: 'compensation',
        title: 'Compensation Philosophy',
        description: 'Define your approach to compensation fairness.',
        exercises: [
          {
            id: 'comp-philosophy',
            question: 'What is your family\'s philosophy on compensation for family employees?',
            type: 'textarea',
            placeholder: 'We believe compensation should be...',
            helperText: 'Market-based? Performance-based? Equal? Consider both fairness and competitiveness.',
          },
        ],
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution',
        description: 'How will family conflicts be addressed?',
        exercises: [
          {
            id: 'conflict-process',
            question: 'Describe your conflict resolution process',
            type: 'textarea',
            placeholder: 'When conflicts arise, we will...',
            helperText: 'Consider: direct conversation, mediation, counseling, arbitration.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Enterprise Policies',
      description: 'A comprehensive policies document covering employment, compensation, and conflict resolution.',
    },
  },
};

const IMPACT_MODULE_CONTENT = {
  'strategic-plan': {
    title: 'Strategic Plan',
    subtitle: 'Family enterprise vision, goals, and strategic priorities',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'vision-mission',
        title: 'Vision & Mission',
        description: 'Define your family enterprise\'s long-term direction.',
        exercises: [
          {
            id: 'vision-statement',
            question: 'What is your family enterprise\'s vision for the next 10-20 years?',
            type: 'textarea',
            placeholder: 'Our vision is...',
            helperText: 'Paint a picture of what success looks like for your family and business.',
          },
          {
            id: 'mission-statement',
            question: 'What is your mission — the core purpose of your enterprise?',
            type: 'textarea',
            placeholder: 'Our mission is to...',
          },
        ],
      },
      {
        id: 'strategic-goals',
        title: 'Strategic Goals',
        description: 'Set 3-5 year goals aligned with your vision.',
        exercises: [
          {
            id: 'goals-list',
            question: 'What are your top 3-5 strategic goals for the next 3-5 years?',
            type: 'textarea',
            placeholder: 'Goal 1: \nGoal 2: \nGoal 3: \netc.',
            helperText: 'Be specific and measurable. Include business, family, and impact goals.',
          },
          {
            id: 'priorities',
            question: 'What are your top strategic priorities right now?',
            type: 'textarea',
            placeholder: 'Our priorities are...',
          },
        ],
      },
      {
        id: 'execution',
        title: 'Execution Plan',
        description: 'How will you execute your strategy?',
        exercises: [
          {
            id: 'milestones',
            question: 'What are the key milestones and timeline for your strategic plan?',
            type: 'textarea',
            placeholder: 'By [date] we will...\nBy [date] we will...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Enterprise Strategic Plan',
      description: 'A 3-5 year strategic plan defining vision, goals, and execution.',
    },
  },
  'financial-health': {
    title: 'Financial Dashboard',
    subtitle: 'Key metrics, reporting cadence, and financial transparency',
    estimatedTime: '60-90 minutes',
    sections: [
      {
        id: 'key-metrics',
        title: 'Key Metrics',
        description: 'Define the financial metrics that matter to your family.',
        exercises: [
          {
            id: 'metrics-list',
            question: 'What are your top 5-7 key financial metrics to track?',
            type: 'textarea',
            placeholder: 'Key metrics:\n1. Revenue\n2. EBITDA\n3. etc.',
            helperText: 'Examples: Revenue, Profit Margin, Cash Flow, ROI, Debt Ratios, Shareholder Value.',
          },
          {
            id: 'targets',
            question: 'What are your performance targets for each metric?',
            type: 'textarea',
            placeholder: 'Revenue target: \nProfit margin target: \netc.',
          },
        ],
      },
      {
        id: 'reporting',
        title: 'Reporting & Transparency',
        description: 'When and how will financial information be shared?',
        exercises: [
          {
            id: 'reporting-schedule',
            question: 'What is your financial reporting cadence?',
            type: 'select',
            options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually'],
          },
          {
            id: 'transparency-level',
            question: 'What level of financial transparency will you maintain with family members?',
            type: 'textarea',
            placeholder: 'We will share...',
            helperText: 'Consider: full transparency, summary reports, or selective disclosures.',
          },
        ],
      },
      {
        id: 'accountability',
        title: 'Accountability',
        description: 'How will you hold the business accountable to financial goals?',
        exercises: [
          {
            id: 'accountability-process',
            question: 'How will financial performance be reviewed and discussed?',
            type: 'textarea',
            placeholder: 'We will review financial performance by...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Financial Health Dashboard',
      description: 'A financial framework defining metrics, reporting, and accountability.',
    },
  },
  'performance': {
    title: 'Performance Review',
    subtitle: 'Business performance assessment and accountability',
    estimatedTime: '60-90 minutes',
    sections: [
      {
        id: 'performance-framework',
        title: 'Performance Framework',
        description: 'How will you assess business performance?',
        exercises: [
          {
            id: 'assessment-criteria',
            question: 'What criteria will you use to assess business performance?',
            type: 'textarea',
            placeholder: 'We assess performance based on...',
            helperText: 'Financial results, customer satisfaction, employee retention, market position, etc.',
          },
          {
            id: 'benchmarks',
            question: 'What industry benchmarks or standards will you use?',
            type: 'textarea',
            placeholder: 'We benchmark against...',
          },
        ],
      },
      {
        id: 'review-process',
        title: 'Review Process',
        description: 'When and how will performance be reviewed?',
        exercises: [
          {
            id: 'review-schedule',
            question: 'How frequently will performance be formally reviewed?',
            type: 'select',
            options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually'],
          },
          {
            id: 'stakeholders',
            question: 'Who will be involved in the performance review process?',
            type: 'textarea',
            placeholder: 'Performance reviews will involve...',
          },
        ],
      },
      {
        id: 'consequences',
        title: 'Accountability & Consequences',
        description: 'What happens based on performance results?',
        exercises: [
          {
            id: 'accountability-plan',
            question: 'How will you respond to strong or weak performance?',
            type: 'textarea',
            placeholder: 'If performance targets are met, we will...\nIf targets are missed, we will...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Performance Review Framework',
      description: 'A system for assessing and holding the business accountable for results.',
    },
  },
};

const CONTINUITY_MODULE_CONTENT = {
  'succession': {
    title: 'Succession Plan',
    subtitle: 'Leadership pipeline, timeline, criteria, and development',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'successors',
        title: 'Successor Identification',
        description: 'Who are the potential successors for key positions?',
        exercises: [
          {
            id: 'successor-candidates',
            question: 'Identify potential successors for key leadership positions',
            type: 'textarea',
            placeholder: 'For the CEO position, we are considering...\nFor the CFO position, we are considering...',
            helperText: 'Name candidates and their current roles.',
          },
          {
            id: 'selection-criteria',
            question: 'What criteria will be used to select successors?',
            type: 'textarea',
            placeholder: 'Successor selection criteria include...',
            helperText: 'Leadership ability, technical skills, family values alignment, stakeholder support.',
          },
        ],
      },
      {
        id: 'development',
        title: 'Development Plan',
        description: 'How will you develop the next generation of leaders?',
        exercises: [
          {
            id: 'development-plan',
            question: 'What development activities will prepare successors for leadership?',
            type: 'textarea',
            placeholder: 'Our development plan includes...',
            helperText: 'Mentoring, education, project assignments, gradual responsibility increase.',
          },
          {
            id: 'timeline',
            question: 'What is the timeline for the succession transition?',
            type: 'textarea',
            placeholder: 'Our succession timeline is...',
            helperText: 'Consider a 3-5 year transition period with clear milestones.',
          },
        ],
      },
      {
        id: 'transition',
        title: 'Transition Process',
        description: 'How will the transition actually happen?',
        exercises: [
          {
            id: 'transition-steps',
            question: 'Describe the succession transition process in detail',
            type: 'textarea',
            placeholder: 'The transition will occur in phases:\nPhase 1:...\nPhase 2:...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Succession Plan',
      description: 'A detailed plan for leadership transitions including candidates, criteria, and timeline.',
    },
  },
  'contingency': {
    title: 'Contingency Protocols',
    subtitle: 'Emergency scenarios, backup plans, and crisis response',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'risk-identification',
        title: 'Risk Identification',
        description: 'What scenarios could disrupt your family enterprise?',
        exercises: [
          {
            id: 'key-person-risk',
            question: 'Who are your key people, and what would happen if they were unavailable?',
            type: 'textarea',
            placeholder: 'Key person risks:\n1. [Name] - if unavailable, we would...',
            helperText: 'Consider CEO, CFO, major customers, key relationships.',
          },
          {
            id: 'scenarios',
            question: 'What other emergency scenarios should you plan for?',
            type: 'textarea',
            placeholder: 'We should plan for:\n1. Economic downturn\n2. Loss of major customer\n3. etc.',
          },
        ],
      },
      {
        id: 'protocols',
        title: 'Crisis Protocols',
        description: 'How will you respond to emergencies?',
        exercises: [
          {
            id: 'crisis-response',
            question: 'What is your crisis response process?',
            type: 'textarea',
            placeholder: 'In a crisis, we will:\n1. Immediately...\n2. Within 24 hours...\n3. Within a week...',
            helperText: 'Include communication plan, decision authority, resource allocation.',
          },
          {
            id: 'backup-plans',
            question: 'What backup plans or redundancies are in place for critical functions?',
            type: 'textarea',
            placeholder: 'For critical functions, we have backups for...',
          },
        ],
      },
      {
        id: 'communication',
        title: 'Communication & Recovery',
        description: 'How will stakeholders be informed and business recovery managed?',
        exercises: [
          {
            id: 'stakeholder-comms',
            question: 'How will you communicate with family, employees, customers, and lenders during a crisis?',
            type: 'textarea',
            placeholder: 'We will communicate with stakeholders by...',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Contingency & Crisis Plan',
      description: 'A comprehensive plan addressing emergency scenarios and crisis response.',
    },
  },
  'estate': {
    title: 'Estate & Wealth Transfer',
    subtitle: 'Trusts, gifting strategies, and ownership transitions',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'wealth-strategy',
        title: 'Wealth Transfer Strategy',
        description: 'How will you transfer wealth and ownership across generations?',
        exercises: [
          {
            id: 'transfer-vision',
            question: 'What is your vision for wealth transfer? Who receives what and when?',
            type: 'textarea',
            placeholder: 'Our wealth transfer plan is...',
            helperText: 'Consider equal vs. unequal distributions, timing, and conditions.',
          },
          {
            id: 'ownership-transition',
            question: 'How will ownership of the business be transitioned?',
            type: 'textarea',
            placeholder: 'Ownership will transition by...',
            helperText: 'Sale, gifting, trusts, holding companies, gradual transfer.',
          },
        ],
      },
      {
        id: 'structures',
        title: 'Legal & Tax Structures',
        description: 'What structures will you use?',
        exercises: [
          {
            id: 'trust-structure',
            question: 'What trust or legal structures will you establish?',
            type: 'textarea',
            placeholder: 'We plan to establish...',
            helperText: 'Revocable trusts, irrevocable trusts, family limited partnerships, holding companies.',
          },
          {
            id: 'tax-strategy',
            question: 'What is your tax strategy for wealth transfer?',
            type: 'textarea',
            placeholder: 'Our tax strategy includes...',
            helperText: 'Consult with tax advisors. Consider gift tax, estate tax, income tax.',
          },
        ],
      },
      {
        id: 'gifting',
        title: 'Gifting & Distribution',
        description: 'How and when will distributions occur?',
        exercises: [
          {
            id: 'gifting-plan',
            question: 'What is your gifting and distribution plan?',
            type: 'textarea',
            placeholder: 'We will gift/distribute by...',
            helperText: 'Annual exclusions, lifetime gifts, testamentary gifts, incentive distributions.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Estate & Wealth Transfer Plan',
      description: 'A comprehensive plan for transferring wealth, ownership, and legacy.',
    },
  },
};

const LEGACY_MODULE_CONTENT = {
  'nextgen': {
    title: 'Next Gen Program',
    subtitle: 'Education, onboarding, mentorship, and leadership readiness',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'education',
        title: 'Education Pathway',
        description: 'What education should next-gen members pursue?',
        exercises: [
          {
            id: 'education-approach',
            question: 'What educational pathway do you recommend for next-gen family members?',
            type: 'textarea',
            placeholder: 'We encourage next gen to...',
            helperText: 'Consider college, business school, technical training, or industry-specific education.',
          },
          {
            id: 'outside-experience',
            question: 'Should next-gen members work outside the family business first?',
            type: 'textarea',
            placeholder: 'We believe outside experience is...',
            helperText: 'Benefits and requirements for external work experience.',
          },
        ],
      },
      {
        id: 'mentorship',
        title: 'Mentorship & Development',
        description: 'How will you mentor and develop the next generation?',
        exercises: [
          {
            id: 'mentorship-program',
            question: 'What mentorship and development activities will you provide?',
            type: 'textarea',
            placeholder: 'Our mentorship program includes...',
            helperText: 'One-on-one mentoring, peer learning, formal training, project assignments.',
          },
          {
            id: 'onboarding',
            question: 'How will next-gen members be onboarded to the business?',
            type: 'textarea',
            placeholder: 'Onboarding will involve...',
            helperText: 'Business orientation, family history, governance structure, stakeholder meetings.',
          },
        ],
      },
      {
        id: 'readiness',
        title: 'Readiness Assessment',
        description: 'How will you assess if someone is ready for leadership?',
        exercises: [
          {
            id: 'readiness-criteria',
            question: 'What criteria indicate someone is ready for leadership responsibilities?',
            type: 'textarea',
            placeholder: 'We assess readiness based on...',
            helperText: 'Business acumen, values alignment, stakeholder relationships, decision-making ability.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Next Generation Development Program',
      description: 'A comprehensive program for preparing the next generation for leadership.',
    },
  },
  'philanthropy': {
    title: 'Philanthropy Strategy',
    subtitle: 'Giving philosophy, foundations, and community impact',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'giving-philosophy',
        title: 'Giving Philosophy',
        description: 'What are your family\'s values around giving?',
        exercises: [
          {
            id: 'mission',
            question: 'What is your family\'s philanthropic mission or purpose?',
            type: 'textarea',
            placeholder: 'Our giving is guided by...',
            helperText: 'Consider causes that align with family values and interests.',
          },
          {
            id: 'impact-goals',
            question: 'What specific impact do you want your philanthropy to have?',
            type: 'textarea',
            placeholder: 'We aim to impact...',
            helperText: 'Education, health, poverty, environment, arts, etc.',
          },
        ],
      },
      {
        id: 'structure',
        title: 'Philanthropic Structure',
        description: 'How will you organize and fund your philanthropy?',
        exercises: [
          {
            id: 'structure-type',
            question: 'What philanthropic structure will you use?',
            type: 'select',
            options: ['Family Foundation', 'Donor-Advised Fund', 'Direct Giving', 'Hybrid Approach'],
          },
          {
            id: 'governance',
            question: 'How will philanthropy be governed and by whom?',
            type: 'textarea',
            placeholder: 'Our philanthropic governance involves...',
            helperText: 'Family council, foundation board, professional advisors.',
          },
        ],
      },
      {
        id: 'engagement',
        title: 'Family Engagement',
        description: 'How will family members participate in philanthropy?',
        exercises: [
          {
            id: 'participation',
            question: 'How will family members be involved in philanthropic decisions?',
            type: 'textarea',
            placeholder: 'Family members will be involved through...',
            helperText: 'Grants committees, site visits, volunteer work, board service.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Family Philanthropy Strategy',
      description: 'A comprehensive strategy for family giving and community impact.',
    },
  },
  'vision': {
    title: 'Vision 2050',
    subtitle: 'Long-term family vision and aspirational goals',
    estimatedTime: '90-120 minutes',
    sections: [
      {
        id: 'aspirational-vision',
        title: 'Aspirational Vision',
        description: 'What legacy do you want to build across generations?',
        exercises: [
          {
            id: 'legacy-vision',
            question: 'Imagine your family in 2050. Describe the legacy you hope to have created.',
            type: 'textarea',
            placeholder: 'In 2050, we hope to be known for...',
            helperText: 'Think across family relationships, business impact, community contribution, values.',
          },
          {
            id: 'generational-goals',
            question: 'What do you want to accomplish across the next 3-4 generations?',
            type: 'textarea',
            placeholder: 'Our multi-generational aspirations are...',
            helperText: 'Business continuity, wealth building, impact, family harmony, values transmission.',
          },
        ],
      },
      {
        id: 'strategic-directions',
        title: 'Strategic Directions',
        description: 'What strategic directions support your vision?',
        exercises: [
          {
            id: 'directions',
            question: 'What are the key strategic directions to realize your 2050 vision?',
            type: 'textarea',
            placeholder: 'To achieve our vision, we will:\n1.\n2.\n3.',
            helperText: 'Business expansion, diversification, international growth, innovation, etc.',
          },
        ],
      },
      {
        id: 'measurement',
        title: 'Vision Measurement',
        description: 'How will you know if you\'re on track?',
        exercises: [
          {
            id: 'success-metrics',
            question: 'How will you measure progress toward your 2050 vision?',
            type: 'textarea',
            placeholder: 'We will track progress through...',
            helperText: 'Financial milestones, family engagement, community impact, values metrics.',
          },
        ],
      },
    ],
    deliverable: {
      title: 'Vision 2050: Legacy Plan',
      description: 'A compelling articulation of your family\'s long-term aspirational vision.',
    },
  },
};

// Merge all module content into one object
const ALL_MODULE_CONTENT = {
  ...ROOTS_MODULE_CONTENT,
  ...ORDER_MODULE_CONTENT,
  ...IMPACT_MODULE_CONTENT,
  ...CONTINUITY_MODULE_CONTENT,
  ...LEGACY_MODULE_CONTENT,
};

// ═══════════════════════════════════════════════════════════════
// AI DOCUMENT GENERATION
// ═══════════════════════════════════════════════════════════════

const DOCUMENT_PROMPTS = {
  'family-story': `You are a family enterprise consultant. Write a concise Family Story Document based on the responses below. Use third person. Sections: Our Beginning, Key Milestones, What Defines Us. Warm and professional tone. Keep it concise.

RESPONSES:
`,
  'core-values': `You are a family enterprise consultant. Create a Family Values Charter from the responses below. Use first person plural ("We believe..."). For each value: name, definition, examples. End with a commitment statement. Keep concise.

RESPONSES:
`,
  'genogram': `You are a family enterprise consultant. Create a Family System Analysis from the responses below. Describe family structure, relationship dynamics, informal roles, and generational patterns. Professional tone. Keep concise.

RESPONSES:
`,
  'constitution': `You are a family enterprise consultant. Draft a Family Constitution from the responses below. Formal language. Sections: Preamble, Purpose, Principles, Membership, Decision Rights. Use numbered articles. Keep concise.

FAMILY RESPONSES:
`,
  'governance': `You are a family enterprise consultant. Create a Governance Design document from the responses below. Cover governance bodies, roles, decision authority, coordination. Keep concise.

RESPONSES:
`,
  'policies': `You are a family enterprise consultant. Create a Policies & Agreements document from the responses below. Sections: Employment, Compensation, Conflict Resolution. Keep concise.

RESPONSES:
`,
  'strategic-plan': `You are a family enterprise consultant. Create a Strategic Plan from the responses below. Include executive summary, goals, objectives, timeline. Keep concise.

RESPONSES:
`,
  'financial-health': `You are a family enterprise consultant. Create a Financial Health Dashboard document from the responses below. Cover key metrics, targets, reporting schedule. Keep concise.

RESPONSES:
`,
  'performance': `You are a family enterprise consultant. Create a Performance Review System document from the responses below. Cover criteria, process, accountability. Keep concise.

RESPONSES:
`,
  'succession': `You are a family enterprise consultant. Create a Succession Plan from the responses below. Cover candidates, selection criteria, development plan, transition timeline. Keep concise.

RESPONSES:
`,
  'contingency': `You are a family enterprise consultant. Create a Contingency Plan from the responses below. Cover key risks, crisis protocols, communication plans. Keep concise.

RESPONSES:
`,
  'estate': `You are a family enterprise consultant. Create an Estate & Wealth Transfer Plan from the responses below. Cover transfer vision, legal structures, gifting strategy. Note: requires professional guidance. Keep concise.

RESPONSES:
`,
  'nextgen': `You are a family enterprise consultant. Create a Next Generation Development Program from the responses below. Cover education, mentorship, onboarding, readiness criteria. Keep concise.

RESPONSES:
`,
  'philanthropy': `You are a family enterprise consultant. Create a Philanthropy Strategy from the responses below. Cover mission, focus areas, structure, governance, family engagement. Keep concise.

RESPONSES:
`,
  'vision': `You are a family enterprise consultant. Create a Vision 2050 document from the responses below. Include inspiring vision, multi-generational goals, strategic directions, milestones. Keep concise.

RESPONSES:
`,
};

async function generateDocumentWithAI(moduleId, data) {
  const prompt = DOCUMENT_PROMPTS[moduleId];
  if (!prompt) throw new Error('No prompt template for this module');

  // Format the family's responses based on module type
  let formattedData = '';

  if (moduleId === 'family-story') {
    formattedData = `
ORIGIN STORY:
- Founder: ${data['founder-story'] || 'Not provided'}
- Why Started: ${data['why-started'] || 'Not provided'}
- Early Struggles: ${data['early-struggles'] || 'Not provided'}
- First Success: ${data['first-success'] || 'Not provided'}

KEY MILESTONES:
${(data.milestones || []).map(m => `- ${m.year}: ${m.title} — ${m.description}`).join('\n') || 'None provided'}

STORIES WE TELL:
- Hero Story: ${data['hero-story'] || 'Not provided'}
- Crisis Story: ${data['crisis-story'] || 'Not provided'}
- Values Story: ${data['values-story'] || 'Not provided'}
`;
  } else if (moduleId === 'core-values') {
    formattedData = `
VALUES DISCOVERY:
- Implicit Values: ${data['implicit-values'] || 'Not provided'}
- Non-Negotiables: ${data['non-negotiables'] || 'Not provided'}
- Proud Moments: ${data['proud-moments'] || 'Not provided'}

DEFINED VALUES:
${(data.values || []).map((v, i) => `
Value ${i + 1}: ${v.name || 'Unnamed'}
Definition: ${v.definition || 'Not defined'}
Behavior: ${v.behavior || 'Not specified'}
`).join('\n') || 'None defined'}

VALUES IN ACTION:
- Hiring: ${data['hiring-values'] || 'Not provided'}
- Decision-Making: ${data['decision-values'] || 'Not provided'}
- Recognition: ${data['values-recognition'] || 'Not provided'}
`;
  } else if (moduleId === 'genogram') {
    formattedData = `
FAMILY STRUCTURE:
- Generations: ${data['generations'] || 'Not specified'}

FAMILY BRANCHES:
${(data.branches || []).map((b, i) => `
Branch ${i + 1}: ${b.name || 'Unnamed'}
Members: ${b.members || 'Not listed'}
Roles: ${b.roles || 'Not specified'}
`).join('\n') || 'None defined'}

RELATIONSHIP PATTERNS:
- Strong Bonds: ${data['strong-bonds'] || 'Not provided'}
- Tension Areas: ${data['tension-areas'] || 'Not provided'}
- Communication Triangles: ${data['triangles'] || 'Not provided'}

ROLES & PATTERNS:
- Peacemaker: ${data['peacemaker'] || 'Not identified'}
- Truth-Teller: ${data['truth-teller'] || 'Not identified'}
- Decision-Maker: ${data['decision-maker'] || 'Not identified'}
- Repeating Patterns: ${data['patterns'] || 'Not identified'}
`;
  } else if (moduleId === 'constitution') {
    formattedData = `
CHARTER PURPOSE:
- Purpose Statement: ${data['purpose-statement'] || 'Not provided'}
- Scope: ${data['scope'] || 'Not provided'}

GUIDING PRINCIPLES:
- Core Principles: ${data['principles-list'] || 'Not provided'}
- Membership Criteria: ${data['membership-criteria'] || 'Not provided'}

DECISION RIGHTS:
- Decision Framework: ${data['decision-framework'] || 'Not provided'}
`;
  } else if (moduleId === 'governance') {
    formattedData = `
BOARD STRUCTURE:
- Board Design: ${data['board-type'] || 'Not provided'}
- Board Composition: ${data['board-composition'] || 'Not provided'}

ROLES & RESPONSIBILITIES:
- Role Definitions: ${data['role-definition'] || 'Not provided'}
- Authority Limits: ${data['authority-limits'] || 'Not provided'}

MEETING CADENCE:
- Meeting Schedule: ${data['meeting-schedule'] || 'Not provided'}
`;
  } else if (moduleId === 'policies') {
    formattedData = `
EMPLOYMENT POLICIES:
- Employment Criteria: ${data['employment-criteria'] || 'Not provided'}
- Employment Terms: ${data['employment-terms'] || 'Not provided'}

COMPENSATION PHILOSOPHY:
- Compensation Approach: ${data['comp-philosophy'] || 'Not provided'}

CONFLICT RESOLUTION:
- Conflict Process: ${data['conflict-process'] || 'Not provided'}
`;
  } else if (moduleId === 'strategic-plan') {
    formattedData = `
VISION & MISSION:
- Vision Statement: ${data['vision-statement'] || 'Not provided'}
- Mission Statement: ${data['mission-statement'] || 'Not provided'}

STRATEGIC GOALS:
- Goals: ${data['goals-list'] || 'Not provided'}
- Priorities: ${data['priorities'] || 'Not provided'}

EXECUTION:
- Milestones: ${data['milestones'] || 'Not provided'}
`;
  } else if (moduleId === 'financial-health') {
    formattedData = `
KEY METRICS:
- Metrics List: ${data['metrics-list'] || 'Not provided'}
- Performance Targets: ${data['targets'] || 'Not provided'}

REPORTING & TRANSPARENCY:
- Reporting Schedule: ${data['reporting-schedule'] || 'Not provided'}
- Transparency Level: ${data['transparency-level'] || 'Not provided'}

ACCOUNTABILITY:
- Accountability Process: ${data['accountability-process'] || 'Not provided'}
`;
  } else if (moduleId === 'performance') {
    formattedData = `
PERFORMANCE FRAMEWORK:
- Assessment Criteria: ${data['assessment-criteria'] || 'Not provided'}
- Industry Benchmarks: ${data['benchmarks'] || 'Not provided'}

REVIEW PROCESS:
- Review Schedule: ${data['review-schedule'] || 'Not provided'}
- Review Stakeholders: ${data['stakeholders'] || 'Not provided'}

ACCOUNTABILITY:
- Accountability Plan: ${data['accountability-plan'] || 'Not provided'}
`;
  } else if (moduleId === 'succession') {
    formattedData = `
SUCCESSORS:
- Successor Candidates: ${data['successor-candidates'] || 'Not provided'}
- Selection Criteria: ${data['selection-criteria'] || 'Not provided'}

DEVELOPMENT:
- Development Plan: ${data['development-plan'] || 'Not provided'}
- Timeline: ${data['timeline'] || 'Not provided'}

TRANSITION:
- Transition Steps: ${data['transition-steps'] || 'Not provided'}
`;
  } else if (moduleId === 'contingency') {
    formattedData = `
RISK IDENTIFICATION:
- Key Person Risks: ${data['key-person-risk'] || 'Not provided'}
- Emergency Scenarios: ${data['scenarios'] || 'Not provided'}

CRISIS PROTOCOLS:
- Crisis Response: ${data['crisis-response'] || 'Not provided'}
- Backup Plans: ${data['backup-plans'] || 'Not provided'}

COMMUNICATION:
- Stakeholder Communication: ${data['stakeholder-comms'] || 'Not provided'}
`;
  } else if (moduleId === 'estate') {
    formattedData = `
WEALTH STRATEGY:
- Transfer Vision: ${data['transfer-vision'] || 'Not provided'}
- Ownership Transition: ${data['ownership-transition'] || 'Not provided'}

LEGAL & TAX STRUCTURES:
- Trust Structure: ${data['trust-structure'] || 'Not provided'}
- Tax Strategy: ${data['tax-strategy'] || 'Not provided'}

GIFTING & DISTRIBUTION:
- Gifting Plan: ${data['gifting-plan'] || 'Not provided'}
`;
  } else if (moduleId === 'nextgen') {
    formattedData = `
EDUCATION:
- Education Pathway: ${data['education-approach'] || 'Not provided'}
- Outside Experience: ${data['outside-experience'] || 'Not provided'}

MENTORSHIP & DEVELOPMENT:
- Mentorship Program: ${data['mentorship-program'] || 'Not provided'}
- Onboarding: ${data['onboarding'] || 'Not provided'}

READINESS:
- Readiness Criteria: ${data['readiness-criteria'] || 'Not provided'}
`;
  } else if (moduleId === 'philanthropy') {
    formattedData = `
GIVING PHILOSOPHY:
- Philanthropic Mission: ${data['mission'] || 'Not provided'}
- Impact Goals: ${data['impact-goals'] || 'Not provided'}

PHILANTHROPIC STRUCTURE:
- Structure Type: ${data['structure-type'] || 'Not provided'}
- Governance: ${data['governance'] || 'Not provided'}

FAMILY ENGAGEMENT:
- Family Participation: ${data['participation'] || 'Not provided'}
`;
  } else if (moduleId === 'vision') {
    formattedData = `
ASPIRATIONAL VISION:
- Legacy Vision: ${data['legacy-vision'] || 'Not provided'}
- Generational Goals: ${data['generational-goals'] || 'Not provided'}

STRATEGIC DIRECTIONS:
- Strategic Directions: ${data['directions'] || 'Not provided'}

VISION MEASUREMENT:
- Success Metrics: ${data['success-metrics'] || 'Not provided'}
`;
  }

  const fullPrompt = prompt + formattedData;

  // Call Netlify function (which proxies to Claude API)
  const response = await fetch('/.netlify/functions/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [
        { role: 'user', content: fullPrompt }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate document');
  }

  const result = await response.json();
  return result.content[0].text;
}

function parseNarrativeToDocx(narrative, title) {
  const lines = narrative.split('\n').filter(line => line.trim());
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          italics: true,
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Process content
  for (const line of lines) {
    const trimmed = line.trim();

    // Check if it's a heading (starts with # or is ALL CAPS or ends with :)
    if (trimmed.startsWith('#')) {
      const headingText = trimmed.replace(/^#+\s*/, '');
      children.push(
        new Paragraph({
          text: headingText,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.startsWith('##')) {
      const headingText = trimmed.replace(/^##\s*/, '');
      children.push(
        new Paragraph({
          text: headingText,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmed.match(/^[A-Z][A-Z\s]+:?$/) || trimmed.match(/^[A-Z][a-z]+(\s[A-Z][a-z]+)*:$/)) {
      // Section headers like "OUR BEGINNING" or "Key Milestones:"
      children.push(
        new Paragraph({
          text: trimmed.replace(/:$/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      // Bullet point
      children.push(
        new Paragraph({
          text: trimmed.substring(2),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      // Bold text (standalone)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*/g, ''),
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed) {
      // Regular paragraph - handle inline bold/italic
      const runs = [];
      let remaining = trimmed;

      // Simple parsing for **bold** and *italic*
      const parts = remaining.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else if (part.startsWith('*') && part.endsWith('*')) {
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else if (part) {
          runs.push(new TextRun({ text: part }));
        }
      }

      children.push(
        new Paragraph({
          children: runs.length ? runs : [new TextRun(trimmed)],
          spacing: { after: 200 },
        })
      );
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '───────────────────────────────────────',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generated by LEP Hub • stridefba.com',
          italics: true,
          size: 20,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    })
  );

  return new Document({
    sections: [{
      properties: {},
      children,
    }],
  });
}

async function downloadDocument(moduleId, data, title) {
  // Generate narrative with AI
  const narrative = await generateDocumentWithAI(moduleId, data);

  // Convert to Word document
  const doc = parseNarrativeToDocx(narrative, title);

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);

  return narrative; // Return for preview
}


// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Nav({ currentView, setCurrentView, user }) {
  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <span className="nav-logo">◆</span>
        <span className="nav-title">LEP Hub</span>
      </div>

      <div className="nav-menu">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="nav-icon">◇</span>
          Dashboard
        </button>
        <button
          className={`nav-item ${currentView === 'assessment' ? 'active' : ''}`}
          onClick={() => setCurrentView('assessment')}
        >
          <span className="nav-icon">📊</span>
          Assessment
        </button>
        <button
          className={`nav-item ${currentView === 'pillars' ? 'active' : ''}`}
          onClick={() => setCurrentView('pillars')}
        >
          <span className="nav-icon">🏛️</span>
          Pillars
        </button>
        <button
          className={`nav-item ${currentView === 'meetings' ? 'active' : ''}`}
          onClick={() => setCurrentView('meetings')}
        >
          <span className="nav-icon">📅</span>
          Meetings
        </button>
        <button
          className={`nav-item ${currentView === 'vault' ? 'active' : ''}`}
          onClick={() => setCurrentView('vault')}
        >
          <span className="nav-icon">🌁</span>
          Vault
        </button>
      </div>

      <div className="nav-user">
        <div className="user-avatar">{user?.initials || 'JP'}</div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'Jason Packer'}</span>
          <span className="user-role">Administrator</span>
        </div>
      </div>
    </nav>
  );
}

function Dashboard({ scores, setCurrentView, setActivePillar, vaultDocuments, onGenerateLepReport }) {
  const totalScore = scores ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5) : null;

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Welcome back</h1>
          <p className="subtitle">Here's where your family enterprise stands.</p>
        </div>
        {!scores && (
          <button className="btn btn-primary" onClick={() => setCurrentView('assessment')}>
            Take Assessment
          </button>
        )}
      </header>

      {scores ? (
        <>
          <div className="score-hero">
            <div className="score-circle">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="url(#scoreGradient)" strokeWidth="8"
                  strokeDasharray={`${totalScore * 3.39} 339`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2d5a3d" />
                    <stop offset="100%" stopColor="#4a7c5d" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="score-value">
                <span className="score-number">{totalScore}</span>
                <span className="score-label">LEP Score</span>
              </div>
            </div>
            <div className="score-summary">
              <h2>Your LEP Score: {totalScore}/100</h2>
              <p>
                {totalScore >= 80 ? "Excellent! Your family enterprise has strong foundations." :
                 totalScore >= 60 ? "Good progress. Focus on your lower-scoring pillars." :
                 totalScore >= 40 ? "Room for growth. Consider working with a peer group." :
                 "Just getting started. The LEP journey will transform your family enterprise."}
              </p>
              <div className="dashboard-actions">
                <button className="btn btn-outline" onClick={() => setCurrentView('assessment')}>
                  Retake Assessment
                </button>
                <button className="btn btn-primary" onClick={() => onGenerateLepReport(scores)}>
                  Generate LEP Report
                </button>
              </div>
            </div>
          </div>

          <div className="pillar-scores">
            <h3>Pillar Breakdown</h3>
            <div className="pillar-grid">
              {LEP_PILLARS.map(pillar => (
                <div
                  key={pillar.id}
                  className="pillar-score-card"
                  style={{'--pillar-color': pillar.color}}
                  onClick={() => { setActivePillar(pillar.id); setCurrentView('pillars'); }}
                >
                  <div className="pillar-score-header">
                    <span className="pillar-icon">{pillar.icon}</span>
                    <span className="pillar-name">{pillar.name}</span>
                  </div>
                  <div className="pillar-score-bar">
                    <div className="pillar-score-fill" style={{width: `${scores[pillar.id]}%`}}></div>
                  </div>
                  <div className="pillar-score-value">{scores[pillar.id]}%</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>Start Your LEP Journey</h2>
          <p>Take the assessment to discover where your family enterprise stands across all 5 pillars.</p>
          <button className="btn btn-primary btn-lg" onClick={() => setCurrentView('assessment')}>
            Take the LEP Assessment
          </button>
        </div>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => setCurrentView('meetings')}>
            <span className="action-icon">📅</span>
            <span className="action-label">Schedule a Meeting</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('pillars')}>
            <span className="action-icon">📝</span>
            <span className="action-label">Work on a Module</span>
          </button>
          <button className="action-card" onClick={() => setCurrentView('vault')}>
            <span className="action-icon">📁</span>
            <span className="action-label">View Documents</span>
          </button>
          <a className="action-card" href="https://stridefba.com" target="_blank" rel="noopener noreferrer">
            <span className="action-icon">🤝</span>
            <span className="action-label">Join a Peer Group</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Assessment({ onComplete }) {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Load saved assessment answers
    const savedAnswers = localStorage.getItem('lep_assessment_answers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  useEffect(() => {
    // Save assessment answers as user progresses
    localStorage.setItem('lep_assessment_answers', JSON.stringify(answers));
  }, [answers]);

  const pillars = LEP_PILLARS;
  const pillar = pillars[currentPillar];
  const questions = ASSESSMENT_QUESTIONS[pillar.id];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const pillarComplete = questions.every(q => answers[q.id] !== undefined);

  const nextPillar = () => {
    if (currentPillar < pillars.length - 1) {
      setCurrentPillar(currentPillar + 1);
    } else {
      const scores = {};
      pillars.forEach(p => {
        const qs = ASSESSMENT_QUESTIONS[p.id];
        const total = qs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
        scores[p.id] = Math.round((total / (qs.length * 5)) * 100);
      });
      // Clear assessment answers after completion
      localStorage.removeItem('lep_assessment_answers');
      onComplete(scores);
    }
  };

  const prevPillar = () => {
    if (currentPillar > 0) setCurrentPillar(currentPillar - 1);
  };

  return (
    <div className="assessment">
      <header className="page-header">
        <div>
          <h1>LEP Assessment</h1>
          <p className="subtitle">Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)</p>
        </div>
      </header>

      <div className="assessment-progress">
        {pillars.map((p, i) => (
          <div
            key={p.id}
            className={`progress-step ${i === currentPillar ? 'active' : ''} ${i < currentPillar ? 'complete' : ''}`}
            style={{'--pillar-color': p.color}}
          >
            <span className="progress-icon">{p.icon}</span>
            <span className="progress-label">{p.name}</span>
          </div>
        ))}
      </div>

      <div className="assessment-card" style={{'--pillar-color': pillar.color}}>
        <div className="assessment-pillar-header">
          <span className="pillar-icon">{pillar.icon}</span>
          <div>
            <h2>{pillar.name}</h2>
            <p>{pillar.description}</p>
          </div>
        </div>

        <div className="questions">
          {questions.map((q, i) => (
            <div key={q.id} className="question">
              <p className="question-text">{i + 1}. {q.text}</p>
              <div className="rating-scale">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className={`rating-btn ${answers[q.id] === value ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q.id, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="rating-labels">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>
          ))}
        </div>

        <div className="assessment-nav">
          <button
            className="btn btn-outline"
            onClick={prevPillar}
            disabled={currentPillar === 0}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={nextPillar}
            disabled={!pillarComplete}
          >
            {currentPillar === pillars.length - 1 ? 'Complete Assessment' : 'Next Pillar →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LEPReportGenerator({ scores, onClose, onReportGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [error, setError] = useState(null);

  const generateLepReport = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Create comprehensive assessment prompt
      const scoreDetails = LEP_PILLARS.map(p => {
        const pillars = ASSESSMENT_QUESTIONS[p.id];
        const answersKey = p.id.charAt(0); // 'r', 'o', 'i', 'c', 'l'
        const allAnswers = Object.entries(ASSESSMENT_QUESTIONS[p.id]).map(([key, question]) => {
          return { question: question.text, rating: 'Not assessed' };
        });
        return `${p.name}: ${scores[p.id]}%`;
      }).join('\n');

      const prompt = `Family enterprise consultant. Write a brief LEP Assessment Report. Sections: Executive Summary, Pillar Analysis (strengths and improvements for each), and 3 Next Steps. Professional tone.

Overall Score: ${Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)}/100
${scoreDetails}`;

      const response = await fetch('/.netlify/functions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      const reportText = result.content[0].text;

      // Convert to DOCX and download
      const doc = parseNarrativeToDocx(reportText, 'LEP Assessment Report');
      const blob = await Packer.toBlob(doc);
      const filename = `LEP_Assessment_Report_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, filename);

      // Store in vault
      const vaultEntry = {
        id: `report_${Date.now()}`,
        title: 'LEP Assessment Report',
        pillar: 'assessment',
        date: new Date().toISOString(),
        preview: reportText.split('\n').slice(0, 5).join('\n'),
        fullContent: reportText,
      };

      const existingVault = JSON.parse(localStorage.getItem('lep_vault') || '[]');
      existingVault.unshift(vaultEntry);
      localStorage.setItem('lep_vault', JSON.stringify(existingVault));

      setReportContent(reportText);
      onReportGenerated();
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (reportContent) {
    return (
      <div className="module-workbook">
        <div className="workbook-header">
          <button className="btn btn-ghost" onClick={onClose}>← Back</button>
          <h2>LEP Assessment Report Generated</h2>
        </div>

        <div className="generation-success">
          <div className="success-icon">✓</div>
          <h2>Report Generated & Downloaded!</h2>
          <p>Your LEP Assessment Report has been saved to your downloads folder and added to your Vault.</p>

          <div className="preview-section">
            <h3>Report Preview</h3>
            <div className="document-preview">
              {reportContent.split('\n').slice(0, 20).map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
              <p><em>... (full report in download) ...</em></p>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Done — Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-workbook">
      <div className="workbook-header">
        <button className="btn btn-ghost" onClick={onClose}>← Back</button>
        <h2>Generate LEP Report</h2>
      </div>

      <div className="generation-prompt">
        <h2>Generate Your LEP Assessment Report</h2>
        <p>Your assessment is complete! Generate a comprehensive executive report based on your scores across all five pillars.</p>

        <div className="score-summary">
          <h3>Your Scores</h3>
          <div className="score-grid">
            {LEP_PILLARS.map(pillar => (
              <div key={pillar.id} className="score-box">
                <span className="score-icon">{pillar.icon}</span>
                <span className="score-label">{pillar.name}</span>
                <span className="score-number">{scores[pillar.id]}%</span>
              </div>
            ))}
          </div>
          <div className="overall-score">
            <p>Overall Score: <strong>{Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)}/100</strong></p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          onClick={generateLepReport}
          disabled={isGenerating}
        >
          {isGenerating ? '⏳ Generating Report...' : '✨ Generate LEP Report'}
        </button>
      </div>
    </div>
  );
}

function ModuleWorkbook({ moduleId, moduleData, onClose, onSave, savedData, onMarkComplete }) {
  const content = ALL_MODULE_CONTENT[moduleId];
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState(savedData || {});
  const [milestones, setMilestones] = useState(savedData?.milestones || []);
  const [values, setValues] = useState(savedData?.values || [{ name: '', definition: '', behavior: '' }]);
  const [branches, setBranches] = useState(savedData?.branches || [{ name: '', members: '', roles: '' }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  const [error, setError] = useState(null);

  if (!content) {
    return (
      <div className="module-workbook">
        <div className="workbook-header">
          <button className="btn btn-ghost" onClick={onClose}>← Back to Pillars</button>
          <h2>{moduleData.name}</h2>
        </div>
        <div className="workbook-coming-soon">
          <div className="coming-soon-icon">🚧</div>
          <h3>Module Coming Soon</h3>
          <p>This module is currently in development. Check back soon!</p>
          <button className="btn btn-primary" onClick={onClose}>Return to Pillars</button>
        </div>
      </div>
    );
  }

  const section = content.sections[currentSection];
  const totalSections = content.sections.length;
  const isLastSection = currentSection === totalSections - 1;

  const handleResponseChange = (exerciseId, value) => {
    setResponses(prev => ({ ...prev, [exerciseId]: value }));
  };

  const getAllData = () => {
    return { ...responses, milestones, values, branches, lastSaved: new Date().toISOString() };
  };

  const handleSaveProgress = () => {
    onSave(moduleId, getAllData());
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = getAllData();
      onSave(moduleId, data); // Save first
      const narrative = await downloadDocument(moduleId, data, content.deliverable.title);

      // Store in vault
      const vaultEntry = {
        id: `${moduleId}_${Date.now()}`,
        title: content.deliverable.title,
        pillar: LEP_PILLARS.find(p => p.modules.some(m => m.id === moduleId))?.id || 'roots',
        date: new Date().toISOString(),
        preview: narrative.split('\n').slice(0, 3).join('\n'),
        fullContent: narrative,
      };

      const existingVault = JSON.parse(localStorage.getItem('lep_vault') || '[]');
      existingVault.unshift(vaultEntry);
      localStorage.setItem('lep_vault', JSON.stringify(existingVault));

      setGeneratedPreview(narrative);
      onMarkComplete(moduleId);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addMilestone = () => setMilestones([...milestones, { year: '', title: '', description: '' }]);
  const updateMilestone = (i, field, value) => { const u = [...milestones]; u[i] = { ...u[i], [field]: value }; setMilestones(u); };
  const removeMilestone = (i) => setMilestones(milestones.filter((_, idx) => idx !== i));

  const addValue = () => setValues([...values, { name: '', definition: '', behavior: '' }]);
  const updateValue = (i, field, value) => { const u = [...values]; u[i] = { ...u[i], [field]: value }; setValues(u); };
  const removeValue = (i) => setValues(values.filter((_, idx) => idx !== i));

  const addBranch = () => setBranches([...branches, { name: '', members: '', roles: '' }]);
  const updateBranch = (i, field, value) => { const u = [...branches]; u[i] = { ...u[i], [field]: value }; setBranches(u); };
  const removeBranch = (i) => setBranches(branches.filter((_, idx) => idx !== i));

  const renderExercise = (exercise) => {
    switch (exercise.type) {
      case 'textarea':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <textarea
              className="exercise-textarea"
              placeholder={exercise.placeholder}
              value={responses[exercise.id] || ''}
              onChange={(e) => handleResponseChange(exercise.id, e.target.value)}
              rows={4}
            />
          </div>
        );
      case 'select':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            <select
              className="exercise-select"
              value={responses[exercise.id] || ''}
              onChange={(e) => handleResponseChange(exercise.id, e.target.value)}
            >
              <option value="">Select...</option>
              {exercise.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      case 'milestone-builder':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <div className="milestone-list">
              {milestones.map((m, i) => (
                <div key={i} className="milestone-item">
                  <input type="text" className="milestone-year" placeholder="Year" value={m.year} onChange={(e) => updateMilestone(i, 'year', e.target.value)} />
                  <input type="text" className="milestone-title" placeholder="Milestone title" value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)} />
                  <input type="text" className="milestone-desc" placeholder="Brief description" value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)} />
                  <button className="btn-icon" onClick={() => removeMilestone(i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addMilestone}>+ Add Milestone</button>
            </div>
          </div>
        );
      case 'values-builder':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <div className="values-list">
              {values.map((v, i) => (
                <div key={i} className="value-item">
                  <div className="value-number">{i + 1}</div>
                  <div className="value-fields">
                    <input type="text" className="value-name" placeholder="Value name (e.g., Integrity)" value={v.name} onChange={(e) => updateValue(i, 'name', e.target.value)} />
                    <textarea className="value-definition" placeholder="What this value means to us..." value={v.definition} onChange={(e) => updateValue(i, 'definition', e.target.value)} rows={2} />
                    <textarea className="value-behavior" placeholder="What this looks like in action..." value={v.behavior} onChange={(e) => updateValue(i, 'behavior', e.target.value)} rows={2} />
                  </div>
                  <button className="btn-icon" onClick={() => removeValue(i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addValue}>+ Add Value</button>
            </div>
          </div>
        );
      case 'branch-builder':
        return (
          <div key={exercise.id} className="exercise">
            <label className="exercise-question">{exercise.question}</label>
            {exercise.helperText && <p className="exercise-helper">{exercise.helperText}</p>}
            <div className="branch-list">
              {branches.map((b, i) => (
                <div key={i} className="branch-item">
                  <div className="branch-header">
                    <span className="branch-label">Branch {i + 1}</span>
                    <button className="btn-icon" onClick={() => removeBranch(i)}>✕</button>
                  </div>
                  <input type="text" className="branch-name" placeholder="Branch name" value={b.name} onChange={(e) => updateBranch(i, 'name', e.target.value)} />
                  <textarea className="branch-members" placeholder="List family members..." value={b.members} onChange={(e) => updateBranch(i, 'members', e.target.value)} rows={2} />
                  <textarea className="branch-roles" placeholder="Their roles..." value={b.roles} onChange={(e) => updateBranch(i, 'roles', e.target.value)} rows={2} />
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addBranch}>+ Add Branch</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show preview if document was generated
  if (generatedPreview) {
    return (
      <div className="module-workbook">
        <div className="workbook-header">
          <button className="btn btn-ghost" onClick={onClose}>← Back to Pillars</button>
          <div className="workbook-progress">Document Generated ✓</div>
        </div>

        <div className="generation-success">
          <div className="success-icon">✓</div>
          <h2>Document Downloaded!</h2>
          <p>Your {content.deliverable.title} has been saved to your downloads folder and added to your Vault.</p>

          <div className="preview-section">
            <h3>Preview</h3>
            <div className="document-preview">
              {generatedPreview.split('\n').map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-outline" onClick={() => setGeneratedPreview(null)}>
              ← Edit Responses
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Done — Return to Pillars
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-workbook">
      <div className="workbook-header">
        <button className="btn btn-ghost" onClick={onClose}>← Back to Pillars</button>
        <div className="workbook-progress">Section {currentSection + 1} of {totalSections}</div>
      </div>

      <div className="workbook-title-section">
        <h1>{content.title}</h1>
        <p className="workbook-subtitle">{content.subtitle}</p>
        <div className="workbook-meta">
          <span className="meta-item">⏱️ {content.estimatedTime}</span>
          <span className="meta-item">🌄 Deliverable: {content.deliverable.title}</span>
        </div>
      </div>

      <div className="section-tabs">
        {content.sections.map((s, i) => (
          <button
            key={s.id}
            className={`section-tab ${i === currentSection ? 'active' : ''} ${i < currentSection ? 'complete' : ''}`}
            onClick={() => setCurrentSection(i)}
          >
            <span className="section-number">{i + 1}</span>
            <span className="section-name">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="workbook-content">
        <div className="section-header">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <div className="exercises">
          {section.exercises.map(ex => renderExercise(ex))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="workbook-nav">
        <button className="btn btn-outline" onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0}>
          ← Previous Section
        </button>
        <button className="btn btn-secondary" onClick={handleSaveProgress}>💾 Save Progress</button>
        {!isLastSection ? (
          <button className="btn btn-primary" onClick={() => setCurrentSection(currentSection + 1)}>Next Section →</button>
        ) : (
          <button
            className="btn btn-generate"
            onClick={handleGenerateDocument}
            disabled={isGenerating}
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate Document'}
          </button>
        )}
      </div>
    </div>
  );
}

function PillarsView({ activePillar, setActivePillar, moduleProgress, setModuleProgress, moduleData, setModuleData }) {
  const [activeModule, setActiveModule] = useState(null);
  const pillar = LEP_PILLARS.find(p => p.id === activePillar) || LEP_PILLARS[0];

  const handleModuleClick = (module) => {
    if (module.hasContent) {
      setActiveModule(module);
    } else {
      setModuleProgress(prev => ({ ...prev, [module.id]: prev[module.id] === 'complete' ? 'not-started' : 'complete' }));
    }
  };

  const handleSaveModuleData = (moduleId, data) => {
    setModuleData(prev => ({ ...prev, [moduleId]: data }));
    setModuleProgress(prev => ({ ...prev, [moduleId]: 'in-progress' }));
  };

  const handleMarkComplete = (moduleId) => {
    setModuleProgress(prev => ({ ...prev, [moduleId]: 'complete' }));
  };

  if (activeModule) {
    return (
      <ModuleWorkbook
        moduleId={activeModule.id}
        moduleData={activeModule}
        savedData={moduleData[activeModule.id]}
        onClose={() => setActiveModule(null)}
        onSave={handleSaveModuleData}
        onMarkComplete={handleMarkComplete}
      />
    );
  }

  return (
    <div className="pillars-view">
      <header className="page-header">
        <div>
          <h1>LEP Pillars</h1>
          <p className="subtitle">Work through each pillar at your own pace.</p>
        </div>
      </header>

      <div className="pillar-tabs">
        {LEP_PILLARS.map(p => (
          <button
            key={p.id}
            className={`pillar-tab ${activePillar === p.id ? 'active' : ''}`}
            style={{'--pillar-color': p.color}}
            onClick={() => setActivePillar(p.id)}
          >
            <span className="pillar-icon">{p.icon}</span>
            <span className="pillar-name">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="pillar-content" style={{'--pillar-color': pillar.color}}>
        <div className="pillar-header">
          <div className="pillar-title">
            <span className="pillar-icon-lg">{pillar.icon}</span>
            <div>
              <h2>{pillar.name}</h2>
              <p className="pillar-tagline">{pillar.tagline}</p>
            </div>
          </div>
          <p className="pillar-description">{pillar.description}</p>
        </div>

        <div className="modules-list">
          <h3>Modules</h3>
          {pillar.modules.map((module, i) => {
            const status = moduleProgress[module.id] || 'not-started';
            const hasContent = module.hasContent;
            return (
              <div key={module.id} className={`module-card ${status}`}>
                <div className="module-number">{i + 1}</div>
                <div className="module-info">
                  <h4>{module.name}</h4>
                  <p>{module.description}</p>
                  {hasContent && <span className="module-badge">Interactive Workbook</span>}
                </div>
                <div className="module-actions">
                  {status === 'complete' ? (
                    <button className="btn btn-outline" onClick={() => handleModuleClick(module)}>✓ Complete — Review</button>
                  ) : status === 'in-progress' ? (
                    <button className="btn btn-primary" onClick={() => handleModuleClick(module)}>Continue →</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleModuleClick(module)}>Start Module</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MeetingsView() {
  return (
    <div className="meetings-view">
      <header className="page-header">
        <div>
          <h1>Meeting Center</h1>
          <p className="subtitle">Schedule and track your governance meetings.</p>
        </div>
        <button className="btn btn-primary">+ Schedule Meeting</button>
      </header>

      <div className="meetings-grid">
        <div className="meetings-section">
          <h3>Meeting Types</h3>
          <div className="meeting-types">
            {MEETING_TYPES.map(meeting => (
              <div key={meeting.id} className="meeting-type-card">
                <span className="meeting-icon">{meeting.icon}</span>
                <div className="meeting-info">
                  <h4>{meeting.name}</h4>
                  <span className="meeting-frequency">{meeting.frequency}</span>
                </div>
                <button className="btn btn-outline btn-sm">View Template</button>
              </div>
            ))}
          </div>
        </div>

        <div className="meetings-section">
          <h3>Committees</h3>
          <div className="committee-list">
            {COMMITTEE_TYPES.map(committee => (
              <div key={committee.id} className="committee-card">
                <span className="committee-icon">{committee.icon}</span>
                <span className="committee-name">{committee.name}</span>
                <button className="btn btn-ghost btn-sm">Configure</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="upcoming-meetings">
        <h3>Upcoming Meetings</h3>
        <div className="empty-state-sm">
          <p>No meetings scheduled. Create your first meeting to get started.</p>
          <button className="btn btn-outline">+ Schedule Meeting</button>
        </div>
      </div>
    </div>
  );
}

function VaultView({ vaultDocuments }) {
  const [expandedPillar, setExpandedPillar] = useState(null);

  // Group documents by pillar
  const documentsByPillar = {};
  LEP_PILLARS.forEach(p => {
    documentsByPillar[p.id] = [];
  });
  documentsByPillar['assessment'] = [];

  vaultDocuments.forEach(doc => {
    if (documentsByPillar[doc.pillar]) {
      documentsByPillar[doc.pillar].push(doc);
    }
  });

  const handleDownloadDocument = (doc) => {
    const doc_instance = parseNarrativeToDocx(doc.fullContent, doc.title);
    Packer.toBlob(doc_instance).then(blob => {
      const filename = `${doc.title.replace(/\s+/g, '_')}_${doc.date.split('T')[0]}.docx`;
      saveAs(blob, filename);
    });
  };

  return (
    <div className="vault-view">
      <header className="page-header">
        <div>
          <h1>Document Vault</h1>
          <p className="subtitle">All your completed work, organized by pillar.</p>
        </div>
      </header>

      {vaultDocuments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h2>Your Vault is Empty</h2>
          <p>Complete modules to generate and store documents in your vault.</p>
        </div>
      ) : (
        <div className="vault-grid">
          {LEP_PILLARS.map(pillar => {
            const docs = documentsByPillar[pillar.id] || [];
            return (
              <div key={pillar.id} className="vault-folder" style={{'--pillar-color': pillar.color}}>
                <div className="folder-header" onClick={() => setExpandedPillar(expandedPillar === pillar.id ? null : pillar.id)}>
                  <span className="folder-icon">{pillar.icon}</span>
                  <h4>{pillar.name}</h4>
                  <span className="folder-count">{docs.length}</span>
                </div>
                {expandedPillar === pillar.id && (
                  <div className="folder-content">
                    {docs.length > 0 ? (
                      <div className="document-list">
                        {docs.map(doc => (
                          <div key={doc.id} className="document-item">
                            <div className="document-info">
                              <h5>{doc.title}</h5>
                              <p className="document-date">{new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              <p className="document-preview">{doc.preview}</p>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => handleDownloadDocument(doc)}>⬇ Download</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="folder-empty">No documents yet</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {documentsByPillar['assessment'].length > 0 && (
            <div className="vault-folder" style={{'--pillar-color': '#666666'}}>
              <div className="folder-header" onClick={() => setExpandedPillar(expandedPillar === 'assessment' ? null : 'assessment')}>
                <span className="folder-icon">📊</span>
                <h4>Assessment Reports</h4>
                <span className="folder-count">{documentsByPillar['assessment'].length}</span>
              </div>
              {expandedPillar === 'assessment' && (
                <div className="folder-content">
                  <div className="document-list">
                    {documentsByPillar['assessment'].map(doc => (
                      <div key={doc.id} className="document-item">
                        <div className="document-info">
                          <h5>{doc.title}</h5>
                          <p className="document-date">{new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          <p className="document-preview">{doc.preview}</p>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => handleDownloadDocument(doc)}>⬇ Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [scores, setScores] = useState(null);
  const [activePillar, setActivePillar] = useState('roots');
  const [moduleProgress, setModuleProgress] = useState({});
  const [moduleData, setModuleData] = useState({});
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [showLepReportGenerator, setShowLepReportGenerator] = useState(false);

  useEffect(() => {
    const savedScores = localStorage.getItem('lep_scores');
    const savedProgress = localStorage.getItem('lep_progress');
    const savedModuleData = localStorage.getItem('lep_module_data');
    const savedVault = localStorage.getItem('lep_vault');

    if (savedScores) setScores(JSON.parse(savedScores));
    if (savedProgress) setModuleProgress(JSON.parse(savedProgress));
    if (savedModuleData) setModuleData(JSON.parse(savedModuleData));
    if (savedVault) setVaultDocuments(JSON.parse(savedVault));
  }, []);

  useEffect(() => { if (scores) localStorage.setItem('lep_scores', JSON.stringify(scores)); }, [scores]);
  useEffect(() => { localStorage.setItem('lep_progress', JSON.stringify(moduleProgress)); }, [moduleProgress]);
  useEffect(() => { localStorage.setItem('lep_module_data', JSON.stringify(moduleData)); }, [moduleData]);

  const handleAssessmentComplete = (newScores) => {
    setScores(newScores);
    setCurrentView('dashboard');
  };

  const handleGenerateLepReport = (assessmentScores) => {
    setShowLepReportGenerator(true);
  };

  const handleReportGenerated = () => {
    const savedVault = localStorage.getItem('lep_vault');
    if (savedVault) {
      setVaultDocuments(JSON.parse(savedVault));
    }
  };

  const user = { name: 'Jason Packer', initials: 'JP' };

  if (showLepReportGenerator) {
    return (
      <div className="lep-app">
        <Nav currentView={currentView} setCurrentView={setCurrentView} user={user} />
        <main className="app-main">
          <LEPReportGenerator
            scores={scores}
            onClose={() => setShowLepReportGenerator(false)}
            onReportGenerated={handleReportGenerated}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="lep-app">
      <Nav currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard scores={scores} setCurrentView={setCurrentView} setActivePillar={setActivePillar} vaultDocuments={vaultDocuments} onGenerateLepReport={handleGenerateLepReport} />}
        {currentView === 'assessment' && <Assessment onComplete={handleAssessmentComplete} />}
        {currentView === 'pillars' && <PillarsView activePillar={activePillar} setActivePillar={setActivePillar} moduleProgress={moduleProgress} setModuleProgress={setModuleProgress} moduleData={moduleData} setModuleData={setModuleData} />}
        {currentView === 'meetings' && <MeetingsView />}
        {currentView === 'vault' && <VaultView vaultDocuments={vaultDocuments} />}
      </main>
    </div>
  );
}

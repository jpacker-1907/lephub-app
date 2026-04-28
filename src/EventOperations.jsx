import React, { useState, useEffect } from 'react';

const ADMIN_EMAILS = ['jason@stridefba.com', 'jpacker@stridefba.com', 'jason.m.packer@gmail.com'];
const EVENT_TYPES = ['Panel', 'Conference', 'Workshop', 'Peer Group', 'Family Meeting'];
const SPONSOR_TIERS_DEFAULT = [
  { id: 'presenting', name: 'Presenting', price: 5000 },
  { id: 'gold', name: 'Gold', price: 2500 },
  { id: 'silver', name: 'Silver', price: 1000 },
  { id: 'community', name: 'Community', price: 0 }
];
const EXPENSE_CATEGORIES = ['Venue', 'Catering', 'AV', 'Printing', 'Travel', 'Marketing', 'Speaker Fees', 'Other'];

const MONTHLY_PANEL_TEMPLATE = {
  name: 'Monthly Panel Template',
  tasks: [
    'Confirm speaker',
    'Book venue/Zoom',
    'Create agenda',
    'Promote on social',
    'Send reminders (1 week)',
    'Send reminders (1 day)',
    'Prep AV equipment',
    'Print badges',
    'Print table tents',
    'Print attendee list',
    'Set up registration desk',
    'Post-event survey sent',
    'Follow-up email sent'
  ]
};

const CONFERENCE_TEMPLATE = {
  name: 'Conference Template',
  tasks: [
    'Confirm all speakers',
    'Book main venue',
    'Secure breakout rooms',
    'Finalize conference schedule',
    'Contract catering',
    'Arrange AV/livestream',
    'Design conference materials',
    'Manage sponsor logistics',
    'Coordinate volunteer team',
    'Test technology/wifi',
    'Send save-the-date',
    'Open registration',
    'Promote heavily (8 weeks out)',
    'Send speaker bios/headshots to marketing',
    'Confirm all registrations',
    'Send final reminder (1 week)',
    'Print all badges and materials',
    'Day-of coordination checklist',
    'Post-event survey',
    'Sponsor thank-you emails',
    'Financial reconciliation'
  ]
};

export default function EventOperations() {
  const [activeTab, setActiveTab] = useState('events');
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('lep_current_user');
    return storedUser ? JSON.parse(storedUser) : { email: 'jason.m.packer@gmail.com', name: 'Jason Packer' };
  });

  const isAdmin = ADMIN_EMAILS.includes(currentUser.email);

  // Event management
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('lep_events') || '[]'));
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '', type: 'Panel', date: '', time: '', location: '', address: '',
    capacity: '', description: '', speakers: [{ name: '', title: '', bio: '' }]
  });

  // Checklists
  const [eventChecklists, setEventChecklists] = useState(() =>
    JSON.parse(localStorage.getItem('lep_event_checklists') || '{}')
  );
  const [checklistTemplates, setChecklistTemplates] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('lep_checklist_templates') || '[]');
    if (stored.length === 0) {
      return [MONTHLY_PANEL_TEMPLATE, CONFERENCE_TEMPLATE];
    }
    return stored;
  });
  const [selectedChecklistEvent, setSelectedChecklistEvent] = useState(null);

  // Attendees
  const [eventAttendees, setEventAttendees] = useState(() =>
    JSON.parse(localStorage.getItem('lep_event_attendees') || '{}')
  );
  const [selectedAttendeeEvent, setSelectedAttendeeEvent] = useState(null);
  const [newAttendee, setNewAttendee] = useState({
    name: '', email: '', organization: '', title: '', dietary: '', notes: ''
  });

  // Sponsors
  const [eventSponsors, setEventSponsors] = useState(() =>
    JSON.parse(localStorage.getItem('lep_event_sponsors') || '{}')
  );
  const [sponsorTiers, setSponsorTiers] = useState(() =>
    JSON.parse(localStorage.getItem('lep_sponsor_tiers') || JSON.stringify(SPONSOR_TIERS_DEFAULT))
  );
  const [selectedSponsorEvent, setSelectedSponsorEvent] = useState(null);
  const [newSponsor, setNewSponsor] = useState({
    name: '', contact: '', tier: 'gold', status: 'Prospect',
    deliverables: { logoSubmitted: false, bioSubmitted: false, boothConfirmed: false, paymentReceived: false }
  });

  // Financials
  const [eventFinancials, setEventFinancials] = useState(() =>
    JSON.parse(localStorage.getItem('lep_event_financials') || '{}')
  );
  const [selectedFinancialEvent, setSelectedFinancialEvent] = useState(null);
  const [newRevenueLine, setNewRevenueLine] = useState({ type: '', amount: '' });
  const [newExpenseLine, setNewExpenseLine] = useState({
    category: 'Venue', description: '', amount: '', status: 'Estimated'
  });

  // Surveys
  const [eventSurveys, setEventSurveys] = useState(() =>
    JSON.parse(localStorage.getItem('lep_event_surveys') || '{}')
  );
  const [selectedSurveyEvent, setSelectedSurveyEvent] = useState(null);
  const [showSurveyResults, setShowSurveyResults] = useState(false);
  const [newSurveyQuestion, setNewSurveyQuestion] = useState({ text: '', type: 'text' });

  // Toast notification
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('lep_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('lep_event_checklists', JSON.stringify(eventChecklists));
  }, [eventChecklists]);

  useEffect(() => {
    localStorage.setItem('lep_checklist_templates', JSON.stringify(checklistTemplates));
  }, [checklistTemplates]);

  useEffect(() => {
    localStorage.setItem('lep_event_attendees', JSON.stringify(eventAttendees));
  }, [eventAttendees]);

  useEffect(() => {
    localStorage.setItem('lep_event_sponsors', JSON.stringify(eventSponsors));
  }, [eventSponsors]);

  useEffect(() => {
    localStorage.setItem('lep_sponsor_tiers', JSON.stringify(sponsorTiers));
  }, [sponsorTiers]);

  useEffect(() => {
    localStorage.setItem('lep_event_financials', JSON.stringify(eventFinancials));
  }, [eventFinancials]);

  useEffect(() => {
    localStorage.setItem('lep_event_surveys', JSON.stringify(eventSurveys));
  }, [eventSurveys]);

  // Event handlers
  const createEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      showToast('Please fill in required fields');
      return;
    }
    const eventId = `event_${Date.now()}`;
    const event = {
      id: eventId,
      ...newEvent,
      createdAt: new Date().toISOString(),
      registered: []
    };
    setEvents([...events, event]);
    setEventChecklists({ ...eventChecklists, [eventId]: [] });
    setEventAttendees({ ...eventAttendees, [eventId]: [] });
    setEventSponsors({ ...eventSponsors, [eventId]: [] });
    setEventFinancials({ ...eventFinancials, [eventId]: { revenue: [], expenses: [] } });
    setEventSurveys({ ...eventSurveys, [eventId]: { questions: getDefaultSurveyQuestions(), responses: [] } });
    setNewEvent({
      name: '', type: 'Panel', date: '', time: '', location: '', address: '',
      capacity: '', description: '', speakers: [{ name: '', title: '', bio: '' }]
    });
    setShowCreateEvent(false);
    showToast('Event created successfully');
  };

  const deleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    const newChecklists = { ...eventChecklists };
    delete newChecklists[eventId];
    setEventChecklists(newChecklists);
    showToast('Event deleted');
  };

  const addChecklistTask = (eventId, templateName = null) => {
    if (templateName) {
      const template = checklistTemplates.find(t => t.name === templateName);
      if (template) {
        const tasks = template.tasks.map(taskName => ({
          id: `task_${Date.now()}_${Math.random()}`,
          task: taskName,
          assignee: '',
          dueDate: '',
          completed: false
        }));
        setEventChecklists({
          ...eventChecklists,
          [eventId]: tasks
        });
        showToast(`Applied template: ${templateName}`);
      }
    }
  };

  const toggleChecklistTask = (eventId, taskId) => {
    const tasks = eventChecklists[eventId] || [];
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setEventChecklists({ ...eventChecklists, [eventId]: updated });
  };

  const updateChecklistTask = (eventId, taskId, field, value) => {
    const tasks = eventChecklists[eventId] || [];
    const updated = tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t);
    setEventChecklists({ ...eventChecklists, [eventId]: updated });
  };

  const addAttendee = (eventId) => {
    if (!newAttendee.name || !newAttendee.email) {
      showToast('Name and email required');
      return;
    }
    const attendees = eventAttendees[eventId] || [];
    const attendee = {
      id: `attendee_${Date.now()}`,
      ...newAttendee,
      checkedIn: false
    };
    setEventAttendees({ ...eventAttendees, [eventId]: [...attendees, attendee] });
    setNewAttendee({ name: '', email: '', organization: '', title: '', dietary: '', notes: '' });
    showToast('Attendee added');
  };

  const toggleCheckin = (eventId, attendeeId) => {
    const attendees = eventAttendees[eventId] || [];
    const updated = attendees.map(a =>
      a.id === attendeeId ? { ...a, checkedIn: !a.checkedIn } : a
    );
    setEventAttendees({ ...eventAttendees, [eventId]: updated });
  };

  const deleteAttendee = (eventId, attendeeId) => {
    const attendees = eventAttendees[eventId] || [];
    setEventAttendees({
      ...eventAttendees,
      [eventId]: attendees.filter(a => a.id !== attendeeId)
    });
  };

  const exportAttendeeCSV = (eventId) => {
    const attendees = eventAttendees[eventId] || [];
    const headers = ['Name', 'Email', 'Organization', 'Title', 'Dietary Restrictions', 'Checked In'];
    const rows = attendees.map(a => [
      a.name, a.email, a.organization, a.title, a.dietary, a.checkedIn ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees_${eventId}.csv`;
    a.click();
    showToast('CSV exported');
  };

  const printBadges = (eventId) => {
    const attendees = eventAttendees[eventId] || [];
    const event = events.find(e => e.id === eventId);
    if (attendees.length === 0) {
      showToast('No attendees to print');
      return;
    }
    const printContent = `
      <html>
        <head>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .badge-sheet { page-break-after: always; }
              .badge-grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, 1fr); gap: 12px; width: 8.5in; height: 11in; padding: 0.5in; box-sizing: border-box; }
              .badge { border: 2px solid #1A2A3F; border-radius: 8px; padding: 12px; text-align: center; background: white; display: flex; flex-direction: column; justify-content: center; }
              .badge-name { font-size: 16px; font-weight: bold; color: #1A2A3F; margin-bottom: 8px; }
              .badge-title { font-size: 11px; color: #2B4C6F; margin-bottom: 4px; }
              .badge-org { font-size: 10px; color: #7A8BA0; margin-bottom: 8px; }
              .badge-event { font-size: 9px; color: #E05B6F; font-weight: bold; }
            }
          </style>
        </head>
        <body>
          <div class="badge-sheet">
            <div class="badge-grid">
              ${attendees.slice(0, 8).map(a => `
                <div class="badge">
                  <div class="badge-name">${a.name}</div>
                  <div class="badge-title">${a.title}</div>
                  <div class="badge-org">${a.organization}</div>
                  <div class="badge-event">${event?.name || 'Event'}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ${attendees.length > 8 ? `
            <div class="badge-sheet">
              <div class="badge-grid">
                ${attendees.slice(8, 16).map(a => `
                  <div class="badge">
                    <div class="badge-name">${a.name}</div>
                    <div class="badge-title">${a.title}</div>
                    <div class="badge-org">${a.organization}</div>
                    <div class="badge-event">${event?.name || 'Event'}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    const win = window.open('', '', 'width=900,height=1100');
    win.document.write(printContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const printTableTents = (eventId) => {
    const attendees = eventAttendees[eventId] || [];
    if (attendees.length === 0) {
      showToast('No attendees to print');
      return;
    }
    const printContent = `
      <html>
        <head>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .tent-page { page-break-after: always; width: 11in; height: 8.5in; }
              .tent-container { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0.5in; height: 100%; box-sizing: border-box; }
              .tent { border: 2px solid #1A2A3F; border-radius: 8px; padding: 24px; background: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; break-inside: avoid; }
              .tent-name { font-size: 18px; font-weight: bold; color: #1A2A3F; margin-bottom: 12px; }
              .tent-org { font-size: 13px; color: #2B4C6F; }
            }
          </style>
        </head>
        <body>
          <div class="tent-page">
            <div class="tent-container">
              ${attendees.slice(0, 2).map(a => `
                <div class="tent">
                  <div class="tent-name">${a.name}</div>
                  <div class="tent-org">${a.organization}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ${attendees.length > 2 ? `
            <div class="tent-page">
              <div class="tent-container">
                ${attendees.slice(2, 4).map(a => `
                  <div class="tent">
                    <div class="tent-name">${a.name}</div>
                    <div class="tent-org">${a.organization}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    const win = window.open('', '', 'width=1100,height=900');
    win.document.write(printContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const printRoster = (eventId) => {
    const attendees = eventAttendees[eventId] || [];
    const event = events.find(e => e.id === eventId);
    const printContent = `
      <html>
        <head>
          <style>
            body { font-family: system-ui; margin: 0.5in; color: #1A2A3F; }
            h1 { margin-top: 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 2px solid #1A2A3F; padding: 8px 4px; font-weight: bold; }
            td { padding: 6px 4px; border-bottom: 1px solid #DDE3EB; }
            tr:nth-child(even) { background: #F5F7FA; }
          </style>
        </head>
        <body>
          <h1>${event?.name || 'Event'} - Attendee Roster</h1>
          <p>Total: ${attendees.length} attendees</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Organization</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${attendees.map(a => `
                <tr>
                  <td>${a.name}</td>
                  <td>${a.title}</td>
                  <td>${a.organization}</td>
                  <td>${a.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '', 'width=900,height=1100');
    win.document.write(printContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const addSponsor = (eventId) => {
    if (!newSponsor.name) {
      showToast('Sponsor name required');
      return;
    }
    const sponsors = eventSponsors[eventId] || [];
    const sponsor = {
      id: `sponsor_${Date.now()}`,
      ...newSponsor
    };
    setEventSponsors({ ...eventSponsors, [eventId]: [...sponsors, sponsor] });
    setNewSponsor({
      name: '', contact: '', tier: 'gold', status: 'Prospect',
      deliverables: { logoSubmitted: false, bioSubmitted: false, boothConfirmed: false, paymentReceived: false }
    });
    showToast('Sponsor added');
  };

  const deleteSponsor = (eventId, sponsorId) => {
    const sponsors = eventSponsors[eventId] || [];
    setEventSponsors({
      ...eventSponsors,
      [eventId]: sponsors.filter(s => s.id !== sponsorId)
    });
  };

  const updateSponsorDeliverable = (eventId, sponsorId, deliverable) => {
    const sponsors = eventSponsors[eventId] || [];
    const updated = sponsors.map(s =>
      s.id === sponsorId
        ? { ...s, deliverables: { ...s.deliverables, [deliverable]: !s.deliverables[deliverable] } }
        : s
    );
    setEventSponsors({ ...eventSponsors, [eventId]: updated });
  };

  const getTotalSponsorshipRevenue = (eventId) => {
    const sponsors = eventSponsors[eventId] || [];
    return sponsors.reduce((sum, s) => {
      const tier = sponsorTiers.find(t => t.id === s.tier);
      return sum + (s.status === 'Paid' || s.status === 'Committed' ? (tier?.price || 0) : 0);
    }, 0);
  };

  const addRevenueLine = (eventId) => {
    if (!newRevenueLine.type || !newRevenueLine.amount) {
      showToast('Type and amount required');
      return;
    }
    const financials = eventFinancials[eventId] || { revenue: [], expenses: [] };
    const revenue = financials.revenue || [];
    setEventFinancials({
      ...eventFinancials,
      [eventId]: {
        ...financials,
        revenue: [...revenue, { id: `rev_${Date.now()}`, ...newRevenueLine, amount: parseFloat(newRevenueLine.amount) }]
      }
    });
    setNewRevenueLine({ type: '', amount: '' });
    showToast('Revenue line added');
  };

  const addExpenseLine = (eventId) => {
    if (!newExpenseLine.description || !newExpenseLine.amount) {
      showToast('Description and amount required');
      return;
    }
    const financials = eventFinancials[eventId] || { revenue: [], expenses: [] };
    const expenses = financials.expenses || [];
    setEventFinancials({
      ...eventFinancials,
      [eventId]: {
        ...financials,
        expenses: [...expenses, { id: `exp_${Date.now()}`, ...newExpenseLine, amount: parseFloat(newExpenseLine.amount) }]
      }
    });
    setNewExpenseLine({ category: 'Venue', description: '', amount: '', status: 'Estimated' });
    showToast('Expense line added');
  };

  const deleteFinancialLine = (eventId, lineId, type) => {
    const financials = eventFinancials[eventId] || { revenue: [], expenses: [] };
    const key = type === 'revenue' ? 'revenue' : 'expenses';
    setEventFinancials({
      ...eventFinancials,
      [eventId]: {
        ...financials,
        [key]: financials[key].filter(l => l.id !== lineId)
      }
    });
  };

  const getEventFinancialsSummary = (eventId) => {
    const financials = eventFinancials[eventId] || { revenue: [], expenses: [] };
    const ticketRevenue = (selectedFinancialEvent?.capacity || 0) * 0; // placeholder: no ticket price in event
    const sponsorshipRevenue = getTotalSponsorshipRevenue(eventId);
    const otherRevenue = (financials.revenue || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalRevenue = sponsorshipRevenue + otherRevenue;
    const totalExpenses = (financials.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
  };

  const getDefaultSurveyQuestions = () => [
    { id: 'q1', text: 'Overall satisfaction', type: 'rating', scale: 5 },
    { id: 'q2', text: 'Most valuable session', type: 'text' },
    { id: 'q3', text: 'Suggestions for improvement', type: 'text' },
    { id: 'q4', text: 'Would you attend again?', type: 'yesno' },
    { id: 'q5', text: 'Net Promoter Score (0-10)', type: 'nps' }
  ];

  const addSurveyQuestion = (eventId) => {
    if (!newSurveyQuestion.text) {
      showToast('Question text required');
      return;
    }
    const survey = eventSurveys[eventId] || { questions: [], responses: [] };
    const questions = survey.questions || [];
    setEventSurveys({
      ...eventSurveys,
      [eventId]: {
        ...survey,
        questions: [...questions, { id: `q_${Date.now()}`, ...newSurveyQuestion }]
      }
    });
    setNewSurveyQuestion({ text: '', type: 'text' });
    showToast('Question added');
  };

  const addSampleSurveyResponse = (eventId) => {
    const survey = eventSurveys[eventId] || { questions: [], responses: [] };
    const responses = survey.responses || [];
    const sampleResponse = {};
    (survey.questions || []).forEach(q => {
      if (q.type === 'rating') sampleResponse[q.id] = Math.floor(Math.random() * 5) + 1;
      else if (q.type === 'nps') sampleResponse[q.id] = Math.floor(Math.random() * 11);
      else if (q.type === 'yesno') sampleResponse[q.id] = Math.random() > 0.5 ? 'Yes' : 'No';
      else sampleResponse[q.id] = 'Sample response text';
    });
    setEventSurveys({
      ...eventSurveys,
      [eventId]: {
        ...survey,
        responses: [...responses, { id: `resp_${Date.now()}`, ...sampleResponse }]
      }
    });
    showToast('Sample response added');
  };

  const sendSurvey = (eventId) => {
    showToast('Survey sent to all attendees (simulated)');
  };

  const getSurveyStats = (eventId) => {
    const survey = eventSurveys[eventId] || { questions: [], responses: [] };
    const stats = {};
    (survey.questions || []).forEach(q => {
      if (q.type === 'rating' || q.type === 'nps') {
        const values = (survey.responses || []).map(r => r[q.id]).filter(v => v !== undefined);
        stats[q.id] = {
          avg: values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0,
          count: values.length
        };
      }
    });
    return stats;
  };

  // Sorting
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    const today = new Date();
    const aIsUpcoming = aDate >= today;
    const bIsUpcoming = bDate >= today;
    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    return aDate - bDate;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tabStyle = {
    display: 'flex', gap: '4px', borderBottom: `2px solid #DDE3EB`, marginBottom: '20px'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '12px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: '14px', fontWeight: isActive ? '600' : '400', color: isActive ? '#1A2A3F' : '#7A8BA0',
    borderBottom: isActive ? `3px solid #E05B6F` : 'none', marginBottom: '-2px', fontFamily: 'system-ui'
  });

  const cardStyle = {
    background: '#FFF', borderRadius: '12px', border: `1px solid #DDE3EB`, padding: '16px',
    marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
  };

  const buttonStyle = (variant = 'primary') => ({
    primary: {
      background: '#E05B6F', color: '#FFF', border: 'none', padding: '10px 16px',
      borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'system-ui'
    },
    secondary: {
      background: '#F5F7FA', color: '#1A2A3F', border: `1px solid #DDE3EB`, padding: '10px 16px',
      borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'system-ui'
    },
    small: {
      background: '#E05B6F', color: '#FFF', border: 'none', padding: '6px 12px',
      borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'system-ui'
    }
  }[variant]);

  const inputStyle = {
    padding: '10px', border: `1px solid #DDE3EB`, borderRadius: '6px', fontSize: '13px',
    fontFamily: 'system-ui', width: '100%', boxSizing: 'border-box'
  };

  const selectStyle = {
    ...inputStyle, background: '#FFF', cursor: 'pointer'
  };

  const badgeStyle = (type) => {
    const colors = {
      'Panel': '#2B4C6F',
      'Conference': '#E05B6F',
      'Workshop': '#2D5A3D',
      'Peer Group': '#7A8BA0',
      'Family Meeting': '#1A2A3F'
    };
    return {
      display: 'inline-block', background: colors[type] || '#7A8BA0', color: '#FFF',
      padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginRight: '8px'
    };
  };

  // ============ TAB: EVENTS ============
  const renderEvents = () => (
    <div>
      {isAdmin && (
        <div style={{ marginBottom: '20px' }}>
          {!showCreateEvent && (
            <button style={buttonStyle('primary')} onClick={() => setShowCreateEvent(true)}>
              + Create Event
            </button>
          )}
          {showCreateEvent && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Create New Event
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text" placeholder="Event Name" value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  style={selectStyle}
                >
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="date" value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="time" value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Location (venue or Zoom)" value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Address" value={newEvent.address}
                  onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="number" placeholder="Capacity" value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <textarea
                placeholder="Event Description" value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                style={{ ...inputStyle, marginTop: '12px', minHeight: '80px', resize: 'vertical' }}
              />
              <h4 style={{ margin: '16px 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Speakers/Panelists</h4>
              {newEvent.speakers.map((speaker, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text" placeholder="Name" value={speaker.name}
                    onChange={(e) => {
                      const updated = [...newEvent.speakers];
                      updated[idx].name = e.target.value;
                      setNewEvent({ ...newEvent, speakers: updated });
                    }}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Title" value={speaker.title}
                    onChange={(e) => {
                      const updated = [...newEvent.speakers];
                      updated[idx].title = e.target.value;
                      setNewEvent({ ...newEvent, speakers: updated });
                    }}
                    style={inputStyle}
                  />
                  <textarea
                    placeholder="Bio" value={speaker.bio}
                    onChange={(e) => {
                      const updated = [...newEvent.speakers];
                      updated[idx].bio = e.target.value;
                      setNewEvent({ ...newEvent, speakers: updated });
                    }}
                    style={{ ...inputStyle, minHeight: '40px', resize: 'vertical' }}
                  />
                </div>
              ))}
              <button
                style={buttonStyle('secondary')}
                onClick={() => setNewEvent({ ...newEvent, speakers: [...newEvent.speakers, { name: '', title: '', bio: '' }] })}
              >
                + Add Speaker
              </button>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button style={buttonStyle('primary')} onClick={createEvent}>Save Event</button>
                <button style={buttonStyle('secondary')} onClick={() => setShowCreateEvent(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedEvent ? (
        <div style={cardStyle}>
          <button style={buttonStyle('secondary')} onClick={() => setSelectedEvent(null)}>← Back</button>
          <h2 style={{ margin: '16px 0', fontFamily: "'Instrument Serif', Georgia, serif" }}>{selectedEvent.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Type</p>
              <span style={badgeStyle(selectedEvent.type)}>{selectedEvent.type}</span>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Date & Time</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(selectedEvent.date)} at {selectedEvent.time}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Location</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{selectedEvent.location}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Capacity</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{selectedEvent.capacity || '—'}</p>
            </div>
          </div>
          {selectedEvent.address && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Address</p>
              <p style={{ margin: 0 }}>{selectedEvent.address}</p>
            </div>
          )}
          {selectedEvent.description && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Description</p>
              <p style={{ margin: 0 }}>{selectedEvent.description}</p>
            </div>
          )}
          {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Speakers/Panelists</h4>
              {selectedEvent.speakers.map((s, idx) => (
                <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid #DDE3EB` }}>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '600' }}>{s.name}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#2B4C6F' }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#7A8BA0' }}>{s.bio}</p>
                </div>
              ))}
            </div>
          )}
          {isAdmin && (
            <button
              style={{ ...buttonStyle('small'), background: '#C1464F' }}
              onClick={() => {
                deleteEvent(selectedEvent.id);
                setSelectedEvent(null);
              }}
            >
              Delete Event
            </button>
          )}
        </div>
      ) : (
        <div>
          {sortedEvents.length === 0 ? (
            <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>No events yet</p>
          ) : (
            sortedEvents.map(event => (
              <div
                key={event.id}
                style={cardStyle}
                onClick={() => setSelectedEvent(event)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <span style={badgeStyle(event.type)}>{event.type}</span>
                    <h3 style={{ margin: '8px 0 4px 0', fontFamily: "'Instrument Serif', Georgia, serif" }}>
                      {event.name}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#7A8BA0' }}>
                      {formatDate(event.date)} at {event.time}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>📍 {event.location}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#7A8BA0' }}>
                      {(eventAttendees[event.id] || []).length} / {event.capacity || '∞'} registered
                    </p>
                  </div>
                  <button style={buttonStyle('primary')} onClick={(e) => { e.stopPropagation(); }}>
                    RSVP / Register
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ============ TAB: CHECKLISTS ============
  const renderChecklists = () => {
    const eventOptions = events.map(e => ({ id: e.id, name: e.name }));
    const selected = selectedChecklistEvent ? events.find(e => e.id === selectedChecklistEvent) : null;
    const checklist = eventChecklists[selectedChecklistEvent] || [];

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Select Event
          </label>
          <select
            value={selectedChecklistEvent || ''}
            onChange={(e) => setSelectedChecklistEvent(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">Choose an event...</option>
            {eventOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {selectedChecklistEvent && selected && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                style={buttonStyle('secondary')}
                onClick={() => addChecklistTask(selectedChecklistEvent, 'Monthly Panel Template')}
              >
                Apply Panel Template
              </button>
              <button
                style={buttonStyle('secondary')}
                onClick={() => addChecklistTask(selectedChecklistEvent, 'Conference Template')}
              >
                Apply Conference Template
              </button>
            </div>

            {checklist.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  height: '8px', background: '#DDE3EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px'
                }}>
                  <div style={{
                    height: '100%', background: '#2D5A3D',
                    width: `${checklist.length > 0 ? (checklist.filter(t => t.completed).length / checklist.length * 100) : 0}%`
                  }} />
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#7A8BA0' }}>
                  {checklist.filter(t => t.completed).length} of {checklist.length} completed
                </p>
              </div>
            )}

            {checklist.map(task => (
              <div key={task.id} style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '24px 1fr 120px 120px 100px', gap: '12px', alignItems: 'center' }}>
                <input
                  type="checkbox" checked={task.completed}
                  onChange={() => toggleChecklistTask(selectedChecklistEvent, task.id)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <div>
                  <p style={{
                    margin: 0, fontWeight: '500',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#7A8BA0' : '#1A2A3F'
                  }}>
                    {task.task}
                  </p>
                </div>
                <input
                  type="text" placeholder="Assign to..." value={task.assignee}
                  onChange={(e) => updateChecklistTask(selectedChecklistEvent, task.id, 'assignee', e.target.value)}
                  style={{ ...inputStyle, fontSize: '12px' }}
                />
                <input
                  type="date" value={task.dueDate}
                  onChange={(e) => updateChecklistTask(selectedChecklistEvent, task.id, 'dueDate', e.target.value)}
                  style={{ ...inputStyle, fontSize: '12px' }}
                />
                <button
                  style={buttonStyle('small')}
                  onClick={() => {
                    const updated = checklist.filter(t => t.id !== task.id);
                    setEventChecklists({ ...eventChecklists, [selectedChecklistEvent]: updated });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            {checklist.length === 0 && (
              <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>
                No tasks yet. Apply a template to get started!
              </p>
            )}
          </div>
        )}

        {!selectedChecklistEvent && (
          <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>
            Select an event to view its checklist
          </p>
        )}
      </div>
    );
  };

  // ============ TAB: ATTENDEES ============
  const renderAttendees = () => {
    const eventOptions = events.map(e => ({ id: e.id, name: e.name }));
    const selected = selectedAttendeeEvent ? events.find(e => e.id === selectedAttendeeEvent) : null;
    const attendees = eventAttendees[selectedAttendeeEvent] || [];

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Select Event
          </label>
          <select
            value={selectedAttendeeEvent || ''}
            onChange={(e) => setSelectedAttendeeEvent(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">Choose an event...</option>
            {eventOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {selectedAttendeeEvent && selected && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button style={buttonStyle('primary')} onClick={() => printBadges(selectedAttendeeEvent)}>
                Print Badges
              </button>
              <button style={buttonStyle('primary')} onClick={() => printTableTents(selectedAttendeeEvent)}>
                Print Table Tents
              </button>
              <button style={buttonStyle('primary')} onClick={() => printRoster(selectedAttendeeEvent)}>
                Print Roster
              </button>
              <button style={buttonStyle('secondary')} onClick={() => exportAttendeeCSV(selectedAttendeeEvent)}>
                Export CSV
              </button>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Add Attendee</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text" placeholder="Name *" value={newAttendee.name}
                  onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="email" placeholder="Email *" value={newAttendee.email}
                  onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Organization" value={newAttendee.organization}
                  onChange={(e) => setNewAttendee({ ...newAttendee, organization: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Title" value={newAttendee.title}
                  onChange={(e) => setNewAttendee({ ...newAttendee, title: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Dietary Restrictions" value={newAttendee.dietary}
                  onChange={(e) => setNewAttendee({ ...newAttendee, dietary: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Notes" value={newAttendee.notes}
                  onChange={(e) => setNewAttendee({ ...newAttendee, notes: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <button style={{ ...buttonStyle('primary'), marginTop: '12px' }} onClick={() => addAttendee(selectedAttendeeEvent)}>
                + Add Attendee
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>
                Attendees ({attendees.length})
              </h4>
              {attendees.map(attendee => (
                <div key={attendee.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <input
                          type="checkbox" checked={attendee.checkedIn}
                          onChange={() => toggleCheckin(selectedAttendeeEvent, attendee.id)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{attendee.name}</span>
                        {attendee.checkedIn && <span style={{ color: '#2D5A3D', fontSize: '12px' }}>✓ Checked In</span>}
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>{attendee.email}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
                        {attendee.title} {attendee.title && attendee.organization ? '·' : ''} {attendee.organization}
                      </p>
                      {attendee.dietary && <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#E05B6F' }}>🍽 {attendee.dietary}</p>}
                      {attendee.notes && <p style={{ margin: 0, fontSize: '12px', color: '#7A8BA0' }}>{attendee.notes}</p>}
                    </div>
                    <button
                      style={buttonStyle('small')}
                      onClick={() => deleteAttendee(selectedAttendeeEvent, attendee.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedAttendeeEvent && (
          <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>
            Select an event to manage attendees
          </p>
        )}
      </div>
    );
  };

  // ============ TAB: SPONSORS ============
  const renderSponsors = () => {
    const eventOptions = events.map(e => ({ id: e.id, name: e.name }));
    const selected = selectedSponsorEvent ? events.find(e => e.id === selectedSponsorEvent) : null;
    const sponsors = eventSponsors[selectedSponsorEvent] || [];

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Select Event
          </label>
          <select
            value={selectedSponsorEvent || ''}
            onChange={(e) => setSelectedSponsorEvent(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">Choose an event...</option>
            {eventOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {isAdmin && (
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Tier Definitions</h4>
            {sponsorTiers.map((tier, idx) => (
              <div key={tier.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <input
                  type="text" value={tier.name}
                  onChange={(e) => {
                    const updated = [...sponsorTiers];
                    updated[idx].name = e.target.value;
                    setSponsorTiers(updated);
                  }}
                  style={inputStyle}
                />
                <input
                  type="number" value={tier.price}
                  onChange={(e) => {
                    const updated = [...sponsorTiers];
                    updated[idx].price = parseFloat(e.target.value);
                    setSponsorTiers(updated);
                  }}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        )}

        {selectedSponsorEvent && selected && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>
                Total Sponsorship Revenue: ${getTotalSponsorshipRevenue(selectedSponsorEvent).toLocaleString()}
              </h4>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Add Sponsor</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text" placeholder="Sponsor Name *" value={newSponsor.name}
                  onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Contact" value={newSponsor.contact}
                  onChange={(e) => setNewSponsor({ ...newSponsor, contact: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={newSponsor.tier}
                  onChange={(e) => setNewSponsor({ ...newSponsor, tier: e.target.value })}
                  style={selectStyle}
                >
                  {sponsorTiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select
                  value={newSponsor.status}
                  onChange={(e) => setNewSponsor({ ...newSponsor, status: e.target.value })}
                  style={selectStyle}
                >
                  <option>Prospect</option>
                  <option>Committed</option>
                  <option>Paid</option>
                  <option>Declined</option>
                </select>
              </div>
              <button style={{ ...buttonStyle('primary'), marginTop: '12px' }} onClick={() => addSponsor(selectedSponsorEvent)}>
                + Add Sponsor
              </button>
            </div>

            {sponsorTiers.map(tier => {
              const tierSponsors = sponsors.filter(s => s.tier === tier.id);
              if (tierSponsors.length === 0) return null;
              return (
                <div key={tier.id} style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>
                    {tier.name} (${tier.price})
                  </h4>
                  {tierSponsors.map(sponsor => (
                    <div key={sponsor.id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h5 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{sponsor.name}</h5>
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#7A8BA0' }}>
                            {sponsor.contact} · {sponsor.status}
                          </p>
                        </div>
                        <button
                          style={buttonStyle('small')}
                          onClick={() => deleteSponsor(selectedSponsorEvent, sponsor.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div style={{ padding: '12px', background: '#F5F7FA', borderRadius: '6px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600' }}>Deliverables</p>
                        {['logoSubmitted', 'bioSubmitted', 'boothConfirmed', 'paymentReceived'].map(d => (
                          <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox" checked={sponsor.deliverables[d]}
                              onChange={() => updateSponsorDeliverable(selectedSponsorEvent, sponsor.id, d)}
                              style={{ cursor: 'pointer' }}
                            />
                            {d === 'logoSubmitted' && 'Logo Submitted'}
                            {d === 'bioSubmitted' && 'Bio Submitted'}
                            {d === 'boothConfirmed' && 'Booth Confirmed'}
                            {d === 'paymentReceived' && 'Payment Received'}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {sponsors.length === 0 && (
              <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
                No sponsors yet
              </p>
            )}
          </div>
        )}

        {!selectedSponsorEvent && (
          <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>
            Select an event to manage sponsors
          </p>
        )}
      </div>
    );
  };

  // ============ TAB: FINANCIALS ============
  const renderFinancials = () => {
    const eventOptions = events.map(e => ({ id: e.id, name: e.name }));
    const selected = selectedFinancialEvent ? events.find(e => e.id === selectedFinancialEvent) : null;
    const financials = eventFinancials[selectedFinancialEvent] || { revenue: [], expenses: [] };
    const summary = getEventFinancialsSummary(selectedFinancialEvent);

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Select Event
          </label>
          <select
            value={selectedFinancialEvent || ''}
            onChange={(e) => setSelectedFinancialEvent(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">Choose an event...</option>
            {eventOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {selectedFinancialEvent && selected && (
          <div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px'
            }}>
              <div style={{ ...cardStyle, margin: 0 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Total Revenue</p>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', Georgia, serif", color: '#2D5A3D' }}>
                  ${summary.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div style={{ ...cardStyle, margin: 0 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Total Expenses</p>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', Georgia, serif", color: '#E05B6F' }}>
                  ${summary.totalExpenses.toLocaleString()}
                </h3>
              </div>
              <div style={{ ...cardStyle, margin: 0 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7A8BA0' }}>Net Profit/Loss</p>
                <h3 style={{
                  margin: 0, fontFamily: "'Instrument Serif', Georgia, serif",
                  color: summary.netProfit >= 0 ? '#2D5A3D' : '#E05B6F'
                }}>
                  ${summary.netProfit.toLocaleString()}
                </h3>
              </div>
            </div>

            <h4 style={{ margin: '20px 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Revenue</h4>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <input
                  type="text" placeholder="Revenue Type (e.g., Ticket Sales)" value={newRevenueLine.type}
                  onChange={(e) => setNewRevenueLine({ ...newRevenueLine, type: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="number" placeholder="Amount" value={newRevenueLine.amount}
                  onChange={(e) => setNewRevenueLine({ ...newRevenueLine, amount: e.target.value })}
                  style={inputStyle}
                />
                <button style={buttonStyle('primary')} onClick={() => addRevenueLine(selectedFinancialEvent)}>
                  Add
                </button>
              </div>
            </div>

            {(financials.revenue || []).length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                {(financials.revenue || []).map(line => (
                  <div key={line.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '500' }}>{line.type}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontWeight: '600' }}>${line.amount.toLocaleString()}</p>
                      <button
                        style={buttonStyle('small')}
                        onClick={() => deleteFinancialLine(selectedFinancialEvent, line.id, 'revenue')}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ margin: '20px 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Expenses</h4>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 100px', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <select
                  value={newExpenseLine.category}
                  onChange={(e) => setNewExpenseLine({ ...newExpenseLine, category: e.target.value })}
                  style={selectStyle}
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text" placeholder="Description" value={newExpenseLine.description}
                  onChange={(e) => setNewExpenseLine({ ...newExpenseLine, description: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="number" placeholder="Amount" value={newExpenseLine.amount}
                  onChange={(e) => setNewExpenseLine({ ...newExpenseLine, amount: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={newExpenseLine.status}
                  onChange={(e) => setNewExpenseLine({ ...newExpenseLine, status: e.target.value })}
                  style={selectStyle}
                >
                  <option>Estimated</option>
                  <option>Actual</option>
                  <option>Paid</option>
                </select>
                <button style={buttonStyle('primary')} onClick={() => addExpenseLine(selectedFinancialEvent)}>
                  Add
                </button>
              </div>
            </div>

            {(financials.expenses || []).length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                {(financials.expenses || []).map(line => (
                  <div key={line.id} style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '80px 1fr 80px 100px 100px', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#7A8BA0' }}>{line.category}</span>
                    <p style={{ margin: 0, fontWeight: '500' }}>{line.description}</p>
                    <p style={{ margin: 0, color: '#7A8BA0', fontSize: '12px' }}>{line.status}</p>
                    <p style={{ margin: 0, fontWeight: '600' }}>${line.amount.toLocaleString()}</p>
                    <button
                      style={buttonStyle('small')}
                      onClick={() => deleteFinancialLine(selectedFinancialEvent, line.id, 'expenses')}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(financials.revenue || []).length === 0 && (financials.expenses || []).length === 0 && (
              <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
                No revenue or expense lines yet
              </p>
            )}

            <button style={buttonStyle('secondary')} onClick={() => {
              const data = `Event: ${selected.name}\nTotal Revenue: $${summary.totalRevenue}\nTotal Expenses: $${summary.totalExpenses}\nNet Profit/Loss: $${summary.netProfit}`;
              const blob = new Blob([data], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `financials_${selectedFinancialEvent}.csv`;
              a.click();
              showToast('CSV exported');
            }}>
              Export to CSV
            </button>
          </div>
        )}

        {!selectedFinancialEvent && (
          <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>
            Select an event to view its financials
          </p>
        )}
      </div>
    );
  };

  // ============ TAB: SURVEYS ============
  const renderSurveys = () => {
    const eventOptions = events.map(e => ({ id: e.id, name: e.name }));
    const selected = selectedSurveyEvent ? events.find(e => e.id === selectedSurveyEvent) : null;
    const survey = eventSurveys[selectedSurveyEvent] || { questions: [], responses: [] };
    const stats = getSurveyStats(selectedSurveyEvent);

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            Select Event
          </label>
          <select
            value={selectedSurveyEvent || ''}
            onChange={(e) => setSelectedSurveyEvent(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">Choose an event...</option>
            {eventOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        {selectedSurveyEvent && selected && (
          <div>
            {!showSurveyResults ? (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button style={buttonStyle('primary')} onClick={() => sendSurvey(selectedSurveyEvent)}>
                    Send Survey
                  </button>
                  {(survey.responses || []).length > 0 && (
                    <button style={buttonStyle('primary')} onClick={() => setShowSurveyResults(true)}>
                      View Results
                    </button>
                  )}
                </div>

                <div style={cardStyle}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Add Custom Question</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
                    <input
                      type="text" placeholder="Question Text" value={newSurveyQuestion.text}
                      onChange={(e) => setNewSurveyQuestion({ ...newSurveyQuestion, text: e.target.value })}
                      style={inputStyle}
                    />
                    <select
                      value={newSurveyQuestion.type}
                      onChange={(e) => setNewSurveyQuestion({ ...newSurveyQuestion, type: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="text">Text</option>
                      <option value="rating">1-5 Rating</option>
                      <option value="nps">NPS (0-10)</option>
                      <option value="yesno">Yes/No</option>
                    </select>
                  </div>
                  <button style={{ ...buttonStyle('primary'), marginTop: '12px' }} onClick={() => addSurveyQuestion(selectedSurveyEvent)}>
                    + Add Question
                  </button>
                </div>

                <h4 style={{ margin: '20px 0 16px 0', fontSize: '13px', fontWeight: '600' }}>Survey Questions</h4>
                {(survey.questions || []).map(q => (
                  <div key={q.id} style={cardStyle}>
                    <p style={{ margin: 0, fontWeight: '500' }}>{q.text}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#7A8BA0' }}>Type: {q.type}</p>
                  </div>
                ))}

                {(survey.responses || []).length > 0 && (
                  <button
                    style={{ ...buttonStyle('secondary'), marginTop: '20px' }}
                    onClick={() => addSampleSurveyResponse(selectedSurveyEvent)}
                  >
                    + Add Sample Response (for demo)
                  </button>
                )}

                {(survey.responses || []).length === 0 && (survey.questions || []).length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '20px' }}>
                      No responses yet. Click "Send Survey" or add sample responses for testing.
                    </p>
                    <button
                      style={{ ...buttonStyle('secondary'), width: '100%' }}
                      onClick={() => addSampleSurveyResponse(selectedSurveyEvent)}
                    >
                      + Add Sample Response
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button style={buttonStyle('secondary')} onClick={() => setShowSurveyResults(false)}>
                  ← Back to Survey
                </button>

                <h3 style={{ margin: '20px 0 16px 0', fontFamily: "'Instrument Serif', Georgia, serif" }}>Results</h3>
                <p style={{ color: '#7A8BA0', marginBottom: '20px' }}>
                  {(survey.responses || []).length} response{(survey.responses || []).length !== 1 ? 's' : ''}
                </p>

                {(survey.questions || []).map(q => {
                  const qStats = stats[q.id];
                  if (q.type === 'text') {
                    const responses = (survey.responses || [])
                      .map(r => r[q.id])
                      .filter(v => v && typeof v === 'string');
                    return (
                      <div key={q.id} style={cardStyle}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>{q.text}</h4>
                        {responses.map((resp, idx) => (
                          <p key={idx} style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#7A8BA0' }}>
                            • {resp}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  if (q.type === 'rating' || q.type === 'nps') {
                    return (
                      <div key={q.id} style={cardStyle}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>
                          {q.text}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#7A8BA0' }}>
                          Average: {qStats?.avg || 0} / {q.type === 'nps' ? '10' : '5'}
                        </p>
                        <div style={{
                          height: '20px', background: '#DDE3EB', borderRadius: '4px', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', background: '#2B4C6F',
                            width: `${(parseFloat(qStats?.avg || 0) / (q.type === 'nps' ? 10 : 5)) * 100}%`
                          }} />
                        </div>
                      </div>
                    );
                  }
                  if (q.type === 'yesno') {
                    const responses = (survey.responses || []).map(r => r[q.id]).filter(v => v);
                    const yesCount = responses.filter(r => r === 'Yes').length;
                    const noCount = responses.filter(r => r === 'No').length;
                    return (
                      <div key={q.id} style={cardStyle}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>{q.text}</h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
                          Yes: {yesCount} ({responses.length > 0 ? ((yesCount / responses.length) * 100).toFixed(0) : 0}%)
                        </p>
                        <p style={{ margin: 0, fontSize: '12px' }}>
                          No: {noCount} ({responses.length > 0 ? ((noCount / responses.length) * 100).toFixed(0) : 0}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}

        {!selectedSurveyEvent && (
          <p style={{ color: '#7A8BA0', textAlign: 'center', padding: '40px 20px' }}>
            Select an event to create and view surveys
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#F5F7FA', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 20px 0', fontFamily: "'Instrument Serif', Georgia, serif" }}>Event Operations</h1>
        <p style={{ margin: '0 0 20px 0', color: '#7A8BA0', fontSize: '13px' }}>
          Stride FBA Event Management Suite
        </p>

        <div style={tabStyle}>
          {['events', 'checklists', 'attendees', 'sponsors', 'financials', 'surveys'].map(tab => (
            <button
              key={tab}
              style={tabButtonStyle(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background: '#FFF', borderRadius: '12px', border: `1px solid #DDE3EB`, padding: '20px' }}>
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'checklists' && renderChecklists()}
          {activeTab === 'attendees' && renderAttendees()}
          {activeTab === 'sponsors' && renderSponsors()}
          {activeTab === 'financials' && renderFinancials()}
          {activeTab === 'surveys' && renderSurveys()}
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '20px', background: '#2D5A3D', color: '#FFF',
          padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontFamily: 'system-ui', zIndex: 1000
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';

const ContentLibrary = () => {
  const adminEmails = ['jason@stridefba.com', 'jpacker@stridefba.com', 'jason.m.packer@gmail.com'];

  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('my-assignments');
  const [contentItems, setContentItems] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Modal states
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showEditContentModal, setShowEditContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  // Form states
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'Video',
    url: '',
    topics: [],
    estimatedTime: '',
  });

  const [newAssignment, setNewAssignment] = useState({
    contentId: '',
    assignedTo: 'all',
    specificGroup: 'senior-gen',
    dueDate: '',
    note: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const topics = ['governance', 'succession', 'communication', 'family-dynamics', 'leadership', 'finance', 'next-gen'];

  // Load data from localStorage
  useEffect(() => {
    const user = localStorage.getItem('lep_current_user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      setIsAdmin(adminEmails.includes(userData.email));
      setActiveTab(adminEmails.includes(userData.email) ? 'library' : 'my-assignments');
    }

    const content = localStorage.getItem('lep_content_library');
    if (content) setContentItems(JSON.parse(content));

    const assign = localStorage.getItem('lep_content_assignments');
    if (assign) setAssignments(JSON.parse(assign));
  }, []);

  // Save content to localStorage
  const saveContent = () => {
    localStorage.setItem('lep_content_library', JSON.stringify(contentItems));
  };

  // Save assignments to localStorage
  const saveAssignments = () => {
    localStorage.setItem('lep_content_assignments', JSON.stringify(assignments));
  };

  const addContent = () => {
    if (!newContent.title || !newContent.url) {
      alert('Title and URL are required');
      return;
    }

    const content = {
      id: Date.now().toString(),
      ...newContent,
      createdAt: new Date().toISOString(),
    };

    setContentItems([...contentItems, content]);
    localStorage.setItem('lep_content_library', JSON.stringify([...contentItems, content]));
    setNewContent({ title: '', description: '', type: 'Video', url: '', topics: [], estimatedTime: '' });
    setShowAddContentModal(false);
  };

  const updateContent = () => {
    const updated = contentItems.map(item =>
      item.id === editingContent.id ? editingContent : item
    );
    setContentItems(updated);
    localStorage.setItem('lep_content_library', JSON.stringify(updated));
    setShowEditContentModal(false);
    setEditingContent(null);
  };

  const deleteContent = (id) => {
    const updated = contentItems.filter(item => item.id !== id);
    setContentItems(updated);
    localStorage.setItem('lep_content_library', JSON.stringify(updated));
  };

  const createAssignment = () => {
    if (!newAssignment.contentId || !newAssignment.dueDate) {
      alert('Content and due date are required');
      return;
    }

    const assignment = {
      id: Date.now().toString(),
      contentId: newAssignment.contentId,
      assignedTo: newAssignment.assignedTo === 'group' ? newAssignment.specificGroup : newAssignment.assignedTo,
      assignedBy: currentUser.email,
      dueDate: newAssignment.dueDate,
      note: newAssignment.note,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };

    const updated = [...assignments, assignment];
    setAssignments(updated);
    localStorage.setItem('lep_content_assignments', JSON.stringify(updated));
    setNewAssignment({ contentId: '', assignedTo: 'all', specificGroup: 'senior-gen', dueDate: '', note: '' });
    setShowCreateAssignmentModal(false);
  };

  const markAsComplete = (assignmentId) => {
    const updated = assignments.map(a =>
      a.id === assignmentId ? { ...a, completedAt: new Date().toISOString() } : a
    );
    setAssignments(updated);
    localStorage.setItem('lep_content_assignments', JSON.stringify(updated));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video': return '🎬';
      case 'Article': return '📄';
      case 'Book': return '📘';
      case 'Document': return '📋';
      default: return '📌';
    }
  };

  const getUserAssignments = () => {
    if (!currentUser) return [];
    return assignments.filter(a =>
      a.assignedTo === 'all' ||
      a.assignedTo === currentUser.email ||
      (a.assignedTo === 'senior-gen' && currentUser.group === 'Senior Gen') ||
      (a.assignedTo === 'next-gen' && currentUser.group === 'Next Gen')
    );
  };

  const categorizeAssignments = (userAssignments) => {
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue = [];
    const thisWeek = [];
    const upcoming = [];
    const completed = [];

    userAssignments.forEach(a => {
      const content = contentItems.find(c => c.id === a.contentId);
      if (!content) return;

      if (a.completedAt) {
        completed.push({ ...a, content });
      } else {
        const dueDate = new Date(a.dueDate);
        if (dueDate < today) {
          overdue.push({ ...a, content });
        } else if (dueDate <= oneWeekLater) {
          thisWeek.push({ ...a, content });
        } else {
          upcoming.push({ ...a, content });
        }
      }
    });

    return { overdue, thisWeek, upcoming, completed };
  };

  const filterContent = () => {
    return contentItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = !selectedTopic || item.topics.includes(selectedTopic);
      return matchesSearch && matchesTopic;
    });
  };

  const getContentCountByTopic = () => {
    const counts = {};
    topics.forEach(t => {
      counts[t] = contentItems.filter(c => c.topics.includes(t)).length;
    });
    return counts;
  };

  // Styles
  const containerStyle = {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const headerStyle = {
    marginBottom: '32px',
    fontFamily: "'Instrument Serif', Georgia, serif",
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1A2A3F',
    marginBottom: '8px',
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#7A8BA0',
  };

  const tabsStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    borderBottom: '2px solid #DDE3EB',
  };

  const tabStyle = (isActive) => ({
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: isActive ? '#E05B6F' : '#7A8BA0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: isActive ? '3px solid #E05B6F' : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const buttonStyle = {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#E05B6F',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2B4C6F',
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #DDE3EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '16px',
    marginBottom: '16px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const formGroupStyle = {
    marginBottom: '16px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1A2A3F',
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DDE3EB',
    borderRadius: '8px',
    fontFamily: 'inherit',
  };

  // ===== ADMIN LIBRARY TAB =====
  const AdminLibraryTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A2A3F', margin: 0 }}>Content Library</h2>
        <button style={buttonStyle} onClick={() => setShowAddContentModal(true)}>+ Add Content</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {topics.map(topic => (
          <div key={topic} style={cardStyle}>
            <div style={{ fontSize: '12px', textTransform: 'capitalize', color: '#7A8BA0', marginBottom: '8px' }}>{topic}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#2B4C6F' }}>{getContentCountByTopic()[topic]}</div>
          </div>
        ))}
      </div>

      <div style={gridStyle}>
        {contentItems.map(item => (
          <div key={item.id} style={cardStyle}>
            <div style={{ fontSize: '18px', marginBottom: '12px' }}>
              <span style={{ marginRight: '8px' }}>{getTypeIcon(item.type)}</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A2A3F' }}>{item.title}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#7A8BA0', marginBottom: '12px' }}>{item.description}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {item.topics.map(t => (
                <span key={t} style={{ fontSize: '11px', backgroundColor: '#E5EBF5', color: '#2B4C6F', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#7A8BA0', marginBottom: '12px' }}>{item.estimatedTime}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ ...secondaryButtonStyle, flex: 1, padding: '8px' }}
                onClick={() => { setEditingContent(item); setShowEditContentModal(true); }}
              >Edit</button>
              <button
                style={{ ...buttonStyle, flex: 1, padding: '8px', backgroundColor: '#DC2626' }}
                onClick={() => { if (window.confirm('Delete this content?')) deleteContent(item.id); }}
              >Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== ADMIN ASSIGNMENTS TAB =====
  const AdminAssignmentsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A2A3F', margin: 0 }}>Assignment Tracker</h2>
        <button style={buttonStyle} onClick={() => setShowCreateAssignmentModal(true)}>+ Create Assignment</button>
      </div>

      <div style={gridStyle}>
        {assignments.map(a => {
          const content = contentItems.find(c => c.id === a.contentId);
          if (!content) return null;
          const isOverdue = !a.completedAt && new Date(a.dueDate) < new Date();

          return (
            <div key={a.id} style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A2A3F', marginBottom: '8px' }}>
                {getTypeIcon(content.type)} {content.title}
              </div>
              <div style={{ fontSize: '13px', color: '#7A8BA0', marginBottom: '8px' }}>
                <strong>Assigned to:</strong> {a.assignedTo === 'all' ? 'All Members' : (a.assignedTo.charAt(0).toUpperCase() + a.assignedTo.slice(1)).replace('-', ' ')}
              </div>
              <div style={{ fontSize: '13px', color: '#7A8BA0', marginBottom: '8px' }}>
                <strong>Due:</strong> {new Date(a.dueDate).toLocaleDateString()}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: a.completedAt ? '#2D5A3D' : (isOverdue ? '#DC2626' : '#2B4C6F'),
                marginBottom: '8px',
              }}>
                {a.completedAt ? '✓ Completed' : (isOverdue ? '⚠ Overdue' : 'Pending')}
              </div>
              {a.note && <div style={{ fontSize: '12px', color: '#7A8BA0', fontStyle: 'italic', marginBottom: '8px' }}>{a.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ===== MEMBER MY ASSIGNMENTS TAB =====
  const MemberMyAssignmentsTab = () => {
    const categorized = categorizeAssignments(getUserAssignments());

    const renderAssignmentGroup = (title, items, statusColor) => (
      items.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: statusColor, marginBottom: '16px' }}>{title}</h3>
          <div style={gridStyle}>
            {items.map(a => (
              <div key={a.id} style={cardStyle}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A2A3F', marginBottom: '8px' }}>
                  {getTypeIcon(a.content.type)} {a.content.title}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {a.content.topics.map(t => (
                    <span key={t} style={{ fontSize: '11px', backgroundColor: '#E5EBF5', color: '#2B4C6F', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: '#7A8BA0', marginBottom: '8px' }}>
                  <strong>Due:</strong> {new Date(a.dueDate).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '12px', color: '#7A8BA0', marginBottom: '8px' }}>{a.content.estimatedTime}</div>
                {a.note && <div style={{ fontSize: '12px', color: '#7A8BA0', fontStyle: 'italic', backgroundColor: '#F5F7FA', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>"{a.note}"</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...buttonStyle, flex: 1, padding: '8px', fontSize: '13px' }}
                    onClick={() => window.open(a.content.url, '_blank')}
                  >Open Content</button>
                  {!a.completedAt && (
                    <button
                      style={{ ...secondaryButtonStyle, flex: 1, padding: '8px', fontSize: '13px' }}
                      onClick={() => markAsComplete(a.id)}
                    >Mark Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    );

    return (
      <div>
        {categorized.overdue.length === 0 && categorized.thisWeek.length === 0 && categorized.upcoming.length === 0 && categorized.completed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#7A8BA0' }}>
            <p style={{ fontSize: '16px' }}>No assignments yet</p>
          </div>
        ) : (
          <>
            {renderAssignmentGroup('🔴 Overdue', categorized.overdue, '#DC2626')}
            {renderAssignmentGroup('📅 This Week', categorized.thisWeek, '#2B4C6F')}
            {renderAssignmentGroup('📆 Upcoming', categorized.upcoming, '#7A8BA0')}
            {renderAssignmentGroup('✓ Completed', categorized.completed, '#2D5A3D')}
          </>
        )}
      </div>
    );
  };

  // ===== MEMBER BROWSE LIBRARY TAB =====
  const MemberBrowseLibraryTab = () => {
    const filtered = filterContent();

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              style={{
                ...secondaryButtonStyle,
                backgroundColor: !selectedTopic ? '#E05B6F' : '#2B4C6F',
              }}
              onClick={() => setSelectedTopic('')}
            >All Topics</button>
            {topics.map(t => (
              <button
                key={t}
                style={{
                  ...secondaryButtonStyle,
                  backgroundColor: selectedTopic === t ? '#E05B6F' : '#2B4C6F',
                  textTransform: 'capitalize',
                }}
                onClick={() => setSelectedTopic(selectedTopic === t ? '' : t)}
              >{t}</button>
            ))}
          </div>
        </div>

        <div style={gridStyle}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: '#7A8BA0' }}>
              <p style={{ fontSize: '16px' }}>No content found</p>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} style={cardStyle}>
                <div style={{ fontSize: '18px', marginBottom: '12px' }}>
                  <span style={{ marginRight: '8px' }}>{getTypeIcon(item.type)}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A2A3F' }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#7A8BA0', marginBottom: '12px' }}>{item.description}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {item.topics.map(t => (
                    <span key={t} style={{ fontSize: '11px', backgroundColor: '#E5EBF5', color: '#2B4C6F', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: '#7A8BA0', marginBottom: '12px' }}>{item.estimatedTime}</div>
                <button
                  style={{ ...buttonStyle, width: '100%' }}
                  onClick={() => window.open(item.url, '_blank')}
                >Open Content</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ===== ADD/EDIT CONTENT MODAL =====
  const ContentModal = ({ isEdit = false }) => {
    const content = isEdit ? editingContent : newContent;
    const setContent = isEdit ? setEditingContent : setNewContent;

    return (
      <div style={modalStyle} onClick={() => isEdit ? setShowEditContentModal(false) : setShowAddContentModal(false)}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A2A3F', marginBottom: '24px', margin: 0 }}>
            {isEdit ? 'Edit Content' : 'Add New Content'}
          </h2>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Type</label>
            <select
              value={content.type}
              onChange={(e) => setContent({ ...content, type: e.target.value })}
              style={inputStyle}
            >
              <option>Video</option>
              <option>Article</option>
              <option>Document</option>
              <option>Book</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>URL *</label>
            <input
              type="url"
              value={content.url}
              onChange={(e) => setContent({ ...content, url: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Topics</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    const newTopics = content.topics.includes(t)
                      ? content.topics.filter(x => x !== t)
                      : [...content.topics, t];
                    setContent({ ...content, topics: newTopics });
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: content.topics.includes(t) ? '#E05B6F' : '#DDE3EB',
                    color: content.topics.includes(t) ? 'white' : '#1A2A3F',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Estimated Time</label>
            <input
              type="text"
              placeholder="e.g., 15 min read, 45 min video"
              value={content.estimatedTime}
              onChange={(e) => setContent({ ...content, estimatedTime: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={buttonStyle}
              onClick={() => isEdit ? updateContent() : addContent()}
            >{isEdit ? 'Update' : 'Add'} Content</button>
            <button
              style={{ ...secondaryButtonStyle, backgroundColor: '#DDE3EB', color: '#1A2A3F' }}
              onClick={() => isEdit ? setShowEditContentModal(false) : setShowAddContentModal(false)}
            >Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== CREATE ASSIGNMENT MODAL =====
  const AssignmentModal = () => (
    <div style={modalStyle} onClick={() => setShowCreateAssignmentModal(false)}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A2A3F', marginBottom: '24px', margin: 0 }}>Create Assignment</h2>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Content *</label>
          <select
            value={newAssignment.contentId}
            onChange={(e) => setNewAssignment({ ...newAssignment, contentId: e.target.value })}
            style={inputStyle}
          >
            <option value="">Select content...</option>
            {contentItems.map(item => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Assign To</label>
          <select
            value={newAssignment.assignedTo}
            onChange={(e) => setNewAssignment({ ...newAssignment, assignedTo: e.target.value })}
            style={inputStyle}
          >
            <option value="all">All Members</option>
            <option value="group">Specific Group</option>
          </select>
        </div>

        {newAssignment.assignedTo === 'group' && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Group</label>
            <select
              value={newAssignment.specificGroup}
              onChange={(e) => setNewAssignment({ ...newAssignment, specificGroup: e.target.value })}
              style={inputStyle}
            >
              <option value="senior-gen">Senior Gen</option>
              <option value="next-gen">Next Gen</option>
            </select>
          </div>
        )}

        <div style={formGroupStyle}>
          <label style={labelStyle}>Due Date *</label>
          <input
            type="date"
            value={newAssignment.dueDate}
            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Note</label>
          <textarea
            value={newAssignment.note}
            onChange={(e) => setNewAssignment({ ...newAssignment, note: e.target.value })}
            placeholder="Optional message to recipients..."
            style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={buttonStyle} onClick={createAssignment}>Create Assignment</button>
          <button
            style={{ ...secondaryButtonStyle, backgroundColor: '#DDE3EB', color: '#1A2A3F' }}
            onClick={() => setShowCreateAssignmentModal(false)}
          >Cancel</button>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return <div style={containerStyle}><p style={{ color: '#7A8BA0' }}>Loading...</p></div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Content Library</div>
        <div style={subtitleStyle}>{isAdmin ? 'Facilitator View' : 'Member View'}</div>
      </div>

      <div style={tabsStyle}>
        {isAdmin ? (
          <>
            <button
              style={tabStyle(activeTab === 'library')}
              onClick={() => setActiveTab('library')}
            >Library</button>
            <button
              style={tabStyle(activeTab === 'assignments')}
              onClick={() => setActiveTab('assignments')}
            >Assignments</button>
          </>
        ) : (
          <>
            <button
              style={tabStyle(activeTab === 'my-assignments')}
              onClick={() => setActiveTab('my-assignments')}
            >My Assignments</button>
            <button
              style={tabStyle(activeTab === 'browse')}
              onClick={() => setActiveTab('browse')}
            >Browse Library</button>
          </>
        )}
      </div>

      {isAdmin ? (
        <>
          {activeTab === 'library' && <AdminLibraryTab />}
          {activeTab === 'assignments' && <AdminAssignmentsTab />}
        </>
      ) : (
        <>
          {activeTab === 'my-assignments' && <MemberMyAssignmentsTab />}
          {activeTab === 'browse' && <MemberBrowseLibraryTab />}
        </>
      )}

      {showAddContentModal && <ContentModal />}
      {showEditContentModal && <ContentModal isEdit />}
      {showCreateAssignmentModal && <AssignmentModal />}
    </div>
  );
};

export default ContentLibrary;

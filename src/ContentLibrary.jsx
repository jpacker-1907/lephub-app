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

  // Video reflection state
  const [showReflection, setShowReflection] = useState(false);
  const [reflections, setReflections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lep_video_reflections') || '{}'); } catch { return {}; }
  });
  const saveReflection = (videoId, field, value) => {
    const updated = { ...reflections, [videoId]: { ...(reflections[videoId] || {}), [field]: value, updatedAt: new Date().toISOString() } };
    setReflections(updated);
    localStorage.setItem('lep_video_reflections', JSON.stringify(updated));
  };
  const getReflection = (videoId, field) => (reflections[videoId] && reflections[videoId][field]) || '';

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
  // Shared featured content renderer (used by both admin and member views)
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
    const featured = contentItems.filter(i => i.featured);

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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Content Library</div>
        <div style={subtitleStyle}>{isAdmin ? 'Facilitator View' : 'Learning Resources'}</div>
      </div>

      {/* Featured Video — hardcoded at top, always visible */}
      <div style={{ background: 'linear-gradient(135deg, #1A2A3F 0%, #2B4C6F 60%, #34597A 100%)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(224,91,111,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(224,91,111,0.2)', border: '1px solid rgba(224,91,111,0.4)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#F8C8CF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Featured</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px', lineHeight: 1.3 }}>Food Fight: Inside The Battle For Market Basket</h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '20px', maxWidth: '600px' }}>The remarkable true story of how a family business feud at Market Basket triggered the largest non-union employee walkout in U.S. history. Essential viewing for any family in business.</p>
          <div style={{ width: '100%', maxWidth: '720px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <iframe
              width="720"
              height="405"
              src="https://www.youtube.com/embed/8-K7G9aA_70"
              title="Food Fight: Inside The Battle For Market Basket"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block', width: '100%', height: '405px' }}
            ></iframe>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '4px' }}>Family Dynamics</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '4px' }}>Governance</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '4px' }}>Leadership</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '4px' }}>Succession</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '4px' }}>90 min documentary</span>
            </div>
            <button
              onClick={() => setShowReflection(!showReflection)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: showReflection ? 'rgba(255,255,255,0.15)' : '#E05B6F', color: 'white', border: showReflection ? '1px solid rgba(255,255,255,0.3)' : 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s ease', marginLeft: 'auto' }}
            >{showReflection ? 'Hide Reflection' : 'Start Reflection'} ✍️</button>
          </div>
        </div>
      </div>

      {/* Post-Viewing Reflection Module */}
      {showReflection && (() => {
        const vid = 'market-basket';
        const r = reflections[vid] || {};
        const filledCount = ['parallels', 'governance', 'pillarScore', 'stakeholders', 'oneAction'].filter(f => r[f] && r[f].trim()).length;
        const pillarNames = ['ROOTS', 'ORDER', 'MOMENTUM', 'CONTINUITY', 'LEGACY'];
        const pillarColors = ['#4A7C59', '#2B4C6F', '#C23B4C', '#3A8A8C', '#B8860B'];

        const reflectionQuestions = [
          { id: 'parallels', label: 'Family Dynamics Parallel', question: 'What parallels do you see between the Demoulas family dynamics and your own family enterprise? Where does your family fall on the spectrum of alignment vs. division?', placeholder: 'The dynamic between Arthur T. and Arthur S. reminds me of...' },
          { id: 'governance', label: 'Governance Breakdown', question: 'The Market Basket crisis was fundamentally a governance failure. What governance structures — board composition, decision rights, conflict resolution — could have prevented it? How does your family\'s governance compare?', placeholder: 'The board structure failed because... In our family, we...' },
          { id: 'stakeholders', label: 'Stakeholder Loyalty', question: 'Employees and customers walked out for Arthur T. — an almost unprecedented display of loyalty. What did he do to earn that? What would your employees or customers do if your family enterprise faced a similar crisis?', placeholder: 'Arthur T. earned that loyalty by... In our business...' },
          { id: 'pillarScore', label: 'LEP Pillar Analysis', question: 'Score Market Basket across the five LEP pillars at the time of the crisis. Where were they strong? Where did they fail?', placeholder: 'ROOTS — strong values but never codified...\nORDER — governance was the critical failure...\nMOMENTUM — the business itself was performing...\nCONTINUITY — no succession plan...\nLEGACY — at risk of being destroyed...', type: 'pillar-analysis' },
          { id: 'oneAction', label: 'Your One Action', question: 'Based on what you watched, what is one concrete thing you will do this month to strengthen your family enterprise against a similar crisis?', placeholder: 'This month, I will...' },
        ];

        return (
          <div style={{ background: 'white', border: '1px solid #E8ECF1', borderRadius: '16px', padding: '32px', marginBottom: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #E05B6F, #C23B4C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>✍️</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A2A3F', margin: 0 }}>Post-Viewing Reflection</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#7A8BA0', margin: 0 }}>Connect what you watched to your own family enterprise through the LEP lens.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: '#7A8BA0' }}>{filledCount}/5 complete</div>
                <div style={{ width: '60px', height: '6px', background: '#F0F4F8', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(filledCount / 5) * 100}%`, height: '100%', background: filledCount === 5 ? '#4A7C59' : '#E05B6F', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reflectionQuestions.map((q, idx) => (
                <div key={q.id} style={{ background: '#FAFBFC', border: '1px solid #EEF1F6', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: r[q.id] && r[q.id].trim() ? '#4A7C59' : '#DDE3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: r[q.id] && r[q.id].trim() ? 'white' : '#7A8BA0', transition: 'all 0.2s ease' }}>{r[q.id] && r[q.id].trim() ? '✓' : idx + 1}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E05B6F', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{q.label}</div>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: '#2B3A52', lineHeight: 1.6, marginBottom: '14px' }}>{q.question}</p>

                  {q.type === 'pillar-analysis' ? (
                    <div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                        {pillarNames.map((name, i) => (
                          <div key={name} style={{ flex: 1, textAlign: 'center', background: `${pillarColors[i]}10`, border: `1px solid ${pillarColors[i]}25`, borderRadius: '6px', padding: '6px 4px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: pillarColors[i], letterSpacing: '0.05em' }}>{name}</div>
                          </div>
                        ))}
                      </div>
                      <textarea
                        value={getReflection(vid, q.id)}
                        onChange={e => saveReflection(vid, q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={6}
                        style={{ width: '100%', padding: '14px', border: '1px solid #DDE3EB', borderRadius: '10px', fontSize: '0.9rem', color: '#2B3A52', lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', background: 'white', boxSizing: 'border-box', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#E05B6F'}
                        onBlur={e => e.target.style.borderColor = '#DDE3EB'}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={getReflection(vid, q.id)}
                      onChange={e => saveReflection(vid, q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={4}
                      style={{ width: '100%', padding: '14px', border: '1px solid #DDE3EB', borderRadius: '10px', fontSize: '0.9rem', color: '#2B3A52', lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', background: 'white', boxSizing: 'border-box', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#E05B6F'}
                      onBlur={e => e.target.style.borderColor = '#DDE3EB'}
                    />
                  )}
                  {r[q.id] && r[q.id].trim() && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#7A8BA0' }}>Auto-saved</div>
                  )}
                </div>
              ))}
            </div>

            {filledCount === 5 && (
              <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #4A7C5910, #4A7C5905)', border: '1px solid #4A7C5925', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4A7C59', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>✓</div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4A7C59', marginBottom: '2px' }}>Reflection Complete</div>
                  <div style={{ fontSize: '0.82rem', color: '#5A6B80' }}>Your responses are saved and available to your facilitator for peer group discussion.</div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

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

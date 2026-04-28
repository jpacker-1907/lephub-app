import React, { useState, useRef, useEffect } from 'react';

export default function CommunityView() {
  // ─── CHANNELS ─────────────────────────────────────────────
  const CHANNELS = [
    { id: 'general', name: 'general', description: 'Open discussion for all members' },
    { id: 'next-gen', name: 'next-gen', description: 'Rising generation leadership & development' },
    { id: 'governance', name: 'governance', description: 'Boards, family councils & decision-making' },
    { id: 'succession', name: 'succession', description: 'Transition planning & founder identity' },
    { id: 'family-dynamics', name: 'family-dynamics', description: 'Communication, conflict & family systems' },
    { id: 'wins', name: 'wins', description: 'Celebrate milestones & breakthroughs' },
    { id: 'resources', name: 'resources', description: 'Articles, books & tools to share' },
    { id: 'pro-lounge', name: 'pro-lounge', description: 'Professionals-only — industry insights, trends & peer discussion' },
    { id: 'pro-referrals', name: 'pro-referrals', description: 'Share referral opportunities and collaborate across specialties' },
  ];

  const AVATARS = {
    'Jason Packer': { initials: 'JP', color: '#E05B6F' },
    'You': { initials: 'ME', color: '#5AAFB5' },
  };

  const REACTION_EMOJIS = ['👍', '❤️', '🔥', '💡', '🙌', '😂'];

  // ─── STATE ────────────────────────────────────────────────
  const COMMUNITY_VERSION = 'v5'; // bumped to v5: new Facebook-style feed
  const [channels, setChannels] = useState(() => {
    const savedVersion = localStorage.getItem('stride_community_version');
    const saved = localStorage.getItem('stride_community_channels');
    if (saved && savedVersion === COMMUNITY_VERSION) return JSON.parse(saved);

    const seed = {
      'general': [],
      'next-gen': [],
      'governance': [],
      'succession': [],
      'wins': [],
      'family-dynamics': [],
      'resources': [],
      'pro-lounge': [],
      'pro-referrals': [],
    };
    localStorage.setItem('stride_community_channels', JSON.stringify(seed));
    localStorage.setItem('stride_community_version', COMMUNITY_VERSION);
    return seed;
  });

  const [activeChannel, setActiveChannel] = useState('general');
  const [filterChannel, setFilterChannel] = useState('all'); // 'all' or specific channel
  const [postText, setPostText] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [expandedComments, setExpandedComments] = useState({}); // postId -> bool
  const [reactionPickerOpen, setReactionPickerOpen] = useState(null); // postId
  const [replyText, setReplyText] = useState({});
  const fileInputRef = useRef(null);
  const msgEndRef = useRef(null);

  const MAX_IMAGE_DIM = 1200; // Larger for prominent display
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // ─── HELPERS ──────────────────────────────────────────────
  const getAvatar = (name) => AVATARS[name] || {
    initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    color: '#7A8BA0'
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const classifyFile = (type, name) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    return 'document';
  };

  const fileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', csv: '📊', ppt: '📎', pptx: '📎', txt: '📃', zip: '📦', mp4: '🎬', mov: '🎬', avi: '🎬', webm: '🎬' };
    return icons[ext] || '📁';
  };

  // ─── FILE PROCESSING ──────────────────────────────────────
  const processFiles = (fileList) => {
    Array.from(fileList).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" is too large. Max ${formatFileSize(MAX_FILE_SIZE)}.`);
        return;
      }
      const kind = classifyFile(file.type, file.name);

      if (kind === 'image') {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > MAX_IMAGE_DIM || h > MAX_IMAGE_DIM) {
            const ratio = Math.min(MAX_IMAGE_DIM / w, MAX_IMAGE_DIM / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(url);
          setPendingFiles(prev => [...prev, { name: file.name, type: file.type, size: file.size, dataUrl, kind, width: w, height: h }]);
        };
        img.src = url;
      } else if (kind === 'video') {
        const reader = new FileReader();
        reader.onload = () => {
          setPendingFiles(prev => [...prev, { name: file.name, type: file.type, size: file.size, dataUrl: reader.result, kind }]);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setPendingFiles(prev => [...prev, { name: file.name, type: file.type, size: file.size, dataUrl: reader.result, kind }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // ─── POST OPERATIONS ──────────────────────────────────────
  const createPost = () => {
    if (!postText.trim() && pendingFiles.length === 0) return;
    const post = {
      id: String(Date.now()),
      author: 'You',
      text: postText,
      ts: new Date().toISOString(),
      channel: activeChannel,
      attachments: pendingFiles.length > 0 ? pendingFiles : undefined,
      reactions: {},
      comments: [],
    };
    setChannels(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), post],
    }));
    setPostText('');
    setPendingFiles([]);
  };

  const addComment = (postId) => {
    if (!replyText[postId]?.trim()) return;
    const post = channels[activeChannel]?.find(p => p.id === postId);
    if (!post) return;
    const comment = {
      id: String(Date.now()),
      author: 'You',
      text: replyText[postId],
      ts: new Date().toISOString(),
      reactions: {},
    };
    setChannels(prev => ({
      ...prev,
      [activeChannel]: (prev[activeChannel] || []).map(p =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
      ),
    }));
    setReplyText(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleReaction = (postId, emoji, commentId = null) => {
    setChannels(prev => {
      const updated = { ...prev };
      const post = updated[activeChannel]?.find(p => p.id === postId);
      if (!post) return prev;

      let target = commentId ? post.comments?.find(c => c.id === commentId) : post;
      if (!target) return prev;

      if (!target.reactions) target.reactions = {};
      if (!target.reactions[emoji]) target.reactions[emoji] = [];

      const userIndex = target.reactions[emoji].indexOf('You');
      if (userIndex > -1) {
        target.reactions[emoji].splice(userIndex, 1);
        if (target.reactions[emoji].length === 0) delete target.reactions[emoji];
      } else {
        target.reactions[emoji].push('You');
      }

      return updated;
    });
    setReactionPickerOpen(null);
  };

  // Persist
  useEffect(() => {
    localStorage.setItem('stride_community_channels', JSON.stringify(channels));
  }, [channels]);

  // ─── RENDERING COMPONENTS ─────────────────────────────────

  // Get visible posts based on filter
  const visiblePosts = filterChannel === 'all'
    ? Object.entries(channels).flatMap(([chId, posts]) =>
        (posts || []).map(p => ({ ...p, channel: chId }))
      )
    : (channels[filterChannel] || []).map(p => ({ ...p, channel: filterChannel }));
  const sortedPosts = visiblePosts.sort((a, b) => new Date(b.ts) - new Date(a.ts));

  // Render image grid
  const renderImageGrid = (attachments) => {
    const images = attachments?.filter(a => a.kind === 'image') || [];
    if (images.length === 0) return null;

    const gridStyle = {
      display: 'grid',
      gap: '8px',
      marginTop: '12px',
      borderRadius: '8px',
      overflow: 'hidden',
    };

    if (images.length === 1) {
      return (
        <div style={gridStyle}>
          <img
            src={images[0].dataUrl}
            alt="post"
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
            onClick={() => setLightboxSrc(images[0].dataUrl)}
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div style={{ ...gridStyle, gridTemplateColumns: '1fr 1fr' }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img.dataUrl}
              alt="post"
              style={{ width: '100%', height: '280px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
              onClick={() => setLightboxSrc(img.dataUrl)}
            />
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div style={gridStyle}>
          <img
            src={images[0].dataUrl}
            alt="post"
            style={{ width: '100%', height: '360px', objectFit: 'cover', cursor: 'pointer', gridColumn: '1 / -1', borderRadius: '8px' }}
            onClick={() => setLightboxSrc(images[0].dataUrl)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {images.slice(1).map((img, i) => (
              <img
                key={i}
                src={img.dataUrl}
                alt="post"
                style={{ width: '100%', height: '200px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
                onClick={() => setLightboxSrc(img.dataUrl)}
              />
            ))}
          </div>
        </div>
      );
    }

    // 4+: 2x2 grid with overlay on last
    return (
      <div style={{ ...gridStyle, gridTemplateColumns: '1fr 1fr' }}>
        {images.slice(0, 4).map((img, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img
              src={img.dataUrl}
              alt="post"
              style={{ width: '100%', height: '250px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' }}
              onClick={() => setLightboxSrc(img.dataUrl)}
            />
            {i === 3 && images.length > 4 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                +{images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render attachments (non-image)
  const renderAttachments = (attachments) => {
    const nonImages = attachments?.filter(a => a.kind !== 'image') || [];
    if (nonImages.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {nonImages.map((att, i) => {
          if (att.kind === 'video') {
            return (
              <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #DDE3EB' }}>
                <video src={att.dataUrl} controls style={{ display: 'block', width: '360px', maxHeight: '280px' }} />
              </div>
            );
          }
          // Document
          return (
            <a
              key={i}
              href={att.dataUrl}
              download={att.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #DDE3EB',
                background: '#F5F7FA',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#5AAFB5')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDE3EB')}
            >
              <span style={{ fontSize: '1.5rem' }}>{fileIcon(att.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#2B4C6F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#7A8BA0' }}>{formatFileSize(att.size)}</div>
              </div>
            </a>
          );
        })}
      </div>
    );
  };

  // Reaction bar
  const renderReactionBar = (post, commentId = null) => {
    const target = commentId ? post.comments?.find(c => c.id === commentId) : post;
    if (!target?.reactions || Object.keys(target.reactions).length === 0) return null;

    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
        {Object.entries(target.reactions).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => toggleReaction(post.id, emoji, commentId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '0.85rem',
              border: `1px solid ${users.includes('You') ? '#E05B6F' : '#DDE3EB'}`,
              background: users.includes('You') ? '#FDF0F2' : '#F5F7FA',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: '600',
              color: '#2B4C6F',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E05B6F';
              e.currentTarget.style.background = '#FDF0F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = users.includes('You') ? '#E05B6F' : '#DDE3EB';
              e.currentTarget.style.background = users.includes('You') ? '#FDF0F2' : '#F5F7FA';
            }}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        ))}
      </div>
    );
  };

  // Post card
  const PostCard = ({ post }) => {
    const av = getAvatar(post.author);
    const channelInfo = CHANNELS.find(c => c.id === post.channel);
    const hasImages = post.attachments?.some(a => a.kind === 'image');

    return (
      <div
        key={post.id}
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #DDE3EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Post header */}
        <div style={{ padding: '12px 16px', borderBottom: hasImages ? '1px solid #DDE3EB' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: av.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              {av.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1A2A3F' }}>{post.author}</span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#EDF5FA',
                    color: '#2B4C6F',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                  }}
                >
                  #{channelInfo?.name || post.channel}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7A8BA0', marginTop: '2px' }}>{formatTime(post.ts)}</div>
            </div>
          </div>
        </div>

        {/* Post text */}
        {post.text && (
          <div style={{ padding: '12px 16px', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', wordBreak: 'break-word' }}>
            {post.text}
          </div>
        )}

        {/* Images */}
        {hasImages && (
          <div style={{ borderTop: '1px solid #DDE3EB' }}>
            <div style={{ padding: '12px 16px' }}>
              {renderImageGrid(post.attachments)}
            </div>
          </div>
        )}

        {/* Other attachments */}
        {renderAttachments(post.attachments) && (
          <div style={{ padding: post.text || hasImages ? '0 16px 12px' : '12px 16px' }}>
            {renderAttachments(post.attachments)}
          </div>
        )}

        {/* Reactions */}
        {renderReactionBar(post) && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid #EDF0F5' }}>
            {renderReactionBar(post)}
          </div>
        )}

        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid #EDF0F5',
            fontSize: '0.9rem',
            color: '#7A8BA0',
          }}
        >
          <button
            onClick={() => setReactionPickerOpen(reactionPickerOpen === post.id ? null : post.id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#7A8BA0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E05B6F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7A8BA0')}
          >
            👍 Like
          </button>
          <button
            onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#7A8BA0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#5AAFB5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7A8BA0')}
          >
            💬 {post.comments?.length || 0}
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#7A8BA0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2B4C6F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7A8BA0')}
          >
            ↗️ Share
          </button>
        </div>

        {/* Reaction picker */}
        {reactionPickerOpen === post.id && (
          <div
            style={{
              padding: '8px 16px',
              background: '#F5F7FA',
              borderTop: '1px solid #EDF0F5',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => toggleReaction(post.id, emoji)}
                style={{
                  padding: '4px 8px',
                  background: 'white',
                  border: '1px solid #DDE3EB',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)';
                  e.currentTarget.style.background = '#FDF0F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Comments section */}
        {expandedComments[post.id] && (
          <div style={{ borderTop: '1px solid #EDF0F5', padding: '12px 16px', background: '#F9FAFB' }}>
            {/* Existing comments */}
            {post.comments?.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {post.comments.map(comment => {
                  const comAv = getAvatar(comment.author);
                  return (
                    <div key={comment.id} style={{ marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid #DDE3EB', paddingTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '6px',
                            background: comAv.color,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            flexShrink: 0,
                          }}
                        >
                          {comAv.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2B4C6F' }}>{comment.author}</div>
                          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', marginTop: '2px' }}>{comment.text}</div>
                          <div style={{ fontSize: '0.7rem', color: '#7A8BA0', marginTop: '4px' }}>{formatTime(comment.ts)}</div>
                          {renderReactionBar(post, comment.id)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comment input */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #DDE3EB' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  background: '#5AAFB5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  flexShrink: 0,
                }}
              >
                ME
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                <input
                  value={replyText[post.id] || ''}
                  onChange={(e) => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addComment(post.id);
                    }
                  }}
                  placeholder="Write a comment..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: '1px solid #DDE3EB',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#5AAFB5')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#DDE3EB')}
                />
                <button
                  onClick={() => addComment(post.id)}
                  style={{
                    padding: '6px 16px',
                    background: '#5AAFB5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#4A9FA5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#5AAFB5')}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#F5F7FA', overflow: 'hidden' }}>
      {/* ── MAIN FEED (70%) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Post composer */}
        <div style={{ background: 'white', padding: '20px', borderBottom: '1px solid #DDE3EB', flexShrink: 0 }}>
          <div style={{ maxWidth: '100%' }}>
            {/* Author row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: '#5AAFB5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                }}
              >
                ME
              </div>
              <input
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) createPost();
                }}
                placeholder="What's on your mind?"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '20px',
                  border: '1px solid #DDE3EB',
                  fontSize: '0.95rem',
                  background: '#F5F7FA',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#5AAFB5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#DDE3EB')}
              />
            </div>

            {/* Preview pending files */}
            {pendingFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {pendingFiles.map((file, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #DDE3EB',
                      background: '#F5F7FA',
                    }}
                  >
                    {file.kind === 'image' ? (
                      <img src={file.dataUrl} alt="preview" style={{ maxWidth: '120px', maxHeight: '120px' }} />
                    ) : (
                      <div style={{ padding: '12px', textAlign: 'center' }}>{fileIcon(file.name)}</div>
                    )}
                    <button
                      onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#EDF5FA',
                    color: '#2B4C6F',
                    border: '1px solid #5AAFB5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#D9ECEF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#EDF5FA')}
                >
                  📷 Photo
                </button>
                <select
                  value={activeChannel}
                  onChange={(e) => setActiveChannel(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DDE3EB',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: 'white',
                  }}
                >
                  {CHANNELS.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      #{ch.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={createPost}
                disabled={!postText.trim() && pendingFiles.length === 0}
                style={{
                  padding: '8px 24px',
                  borderRadius: '8px',
                  background: !postText.trim() && pendingFiles.length === 0 ? '#C0C8D4' : '#2B4C6F',
                  color: 'white',
                  border: 'none',
                  cursor: !postText.trim() && pendingFiles.length === 0 ? 'default' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!(!postText.trim() && pendingFiles.length === 0)) {
                    e.currentTarget.style.background = '#1A2A3F';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!postText.trim() && pendingFiles.length === 0)) {
                    e.currentTarget.style.background = '#2B4C6F';
                  }
                }}
              >
                Post
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => processFiles(e.currentTarget.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {sortedPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A8BA0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#2B4C6F' }}>No posts yet</p>
              <p style={{ fontSize: '0.95rem' }}>Share a photo or thought to get the conversation started</p>
            </div>
          ) : (
            sortedPosts.map(post => <PostCard key={post.id} post={post} />)
          )}
          <div ref={msgEndRef} />
        </div>
      </div>

      {/* ── SIDEBAR (30%) ── */}
      <div style={{ width: '30%', background: 'white', borderLeft: '1px solid #DDE3EB', display: 'flex', flexDirection: 'column', flexShrink: 0, maxWidth: '420px' }}>
        {/* Channel filter */}
        <div style={{ padding: '16px', borderBottom: '1px solid #DDE3EB', flexShrink: 0 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1A2A3F', margin: '0 0 12px', fontFamily: "'Instrument Serif', Georgia, serif" }}>Channels</h3>
          <button
            onClick={() => setFilterChannel('all')}
            style={{
              width: '100%',
              padding: '8px 12px',
              marginBottom: '6px',
              textAlign: 'left',
              background: filterChannel === 'all' ? '#EDF5FA' : 'transparent',
              border: filterChannel === 'all' ? '1px solid #5AAFB5' : '1px solid #DDE3EB',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: filterChannel === 'all' ? '600' : '400',
              color: '#2B4C6F',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (filterChannel !== 'all') e.currentTarget.style.background = '#F5F7FA';
            }}
            onMouseLeave={(e) => {
              if (filterChannel !== 'all') e.currentTarget.style.background = 'transparent';
            }}
          >
            📌 All Posts
          </button>
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setFilterChannel(ch.id)}
              style={{
                width: '100%',
                padding: '8px 12px',
                marginBottom: '6px',
                textAlign: 'left',
                background: filterChannel === ch.id ? '#EDF5FA' : 'transparent',
                border: filterChannel === ch.id ? '1px solid #5AAFB5' : '1px solid #DDE3EB',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: filterChannel === ch.id ? '600' : '400',
                color: '#2B4C6F',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (filterChannel !== ch.id) e.currentTarget.style.background = '#F5F7FA';
              }}
              onMouseLeave={(e) => {
                if (filterChannel !== ch.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              #{ch.name}
            </button>
          ))}
        </div>

        {/* Quick chat for active channel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #DDE3EB', flexShrink: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1A2A3F', margin: 0, fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Quick Chat
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#7A8BA0', margin: '4px 0 0' }}>#{activeChannel}</p>
          </div>

          {/* Mini messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {channels[activeChannel]?.slice(-5).map(msg => {
              const av = getAvatar(msg.author);
              return (
                <div key={msg.id} style={{ fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: '600', color: '#2B4C6F', marginBottom: '2px' }}>{msg.author}</div>
                  <div style={{ color: '#334155', lineHeight: '1.3', wordBreak: 'break-word', fontSize: '0.75rem' }}>
                    {msg.text?.substring(0, 60)}
                    {msg.text && msg.text.length > 60 ? '...' : ''}
                  </div>
                  <div style={{ color: '#7A8BA0', fontSize: '0.7rem', marginTop: '2px' }}>{formatTime(msg.ts)}</div>
                </div>
              );
            })}
            {channels[activeChannel]?.length === 0 && (
              <div style={{ color: '#7A8BA0', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>No messages yet</div>
            )}
          </div>

          {/* Quick message input */}
          <div style={{ padding: '12px', borderTop: '1px solid #DDE3EB', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Quick message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const text = e.currentTarget.value;
                  if (text.trim()) {
                    const msg = {
                      id: String(Date.now()),
                      author: 'You',
                      text,
                      ts: new Date().toISOString(),
                      channel: activeChannel,
                      attachments: undefined,
                      reactions: {},
                      comments: [],
                    };
                    setChannels(prev => ({
                      ...prev,
                      [activeChannel]: [...(prev[activeChannel] || []), msg],
                    }));
                    e.currentTarget.value = '';
                  }
                }
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #DDE3EB',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#5AAFB5')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#DDE3EB')}
            />
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          <img src={lightboxSrc} alt="lightbox" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

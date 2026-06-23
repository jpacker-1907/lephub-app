// ══════════════════════════════════════════════════════════════
// STRIDE CREDENTIALING — VIDEO RESOURCES
// Curated video playlists for each module + embedded videos per lesson
// v42: Cleaned out all unverified (hallucinated) video IDs from v38.
//      Only manually-verified videos from authoritative sources are included.
//      Sources we trust: Banyan Global, FBCG, CFAR, John Davis / Cambridge
//      Family Enterprise Group, Harvard Business School Wingspan, FFI.
// ══════════════════════════════════════════════════════════════

// Each video entry: { id: YouTube ID, title, speaker, duration, description }
// id MUST be a real, manually-verified YouTube video ID. No exceptions.

const FOUR_ROOM_CASE_STUDY = {
  id: 'VYyQimHtkMQ',
  title: 'Case Study: The Four-Room Model in Practice',
  speaker: 'BanyanGlobal Family Business Advisors',
  duration: '10:21',
  description: 'A real family shows how using the Four-Room Model (Owner Room, Board Room, Management Room, Family Room) transformed their decision-making, relationships, and preparation of the next generation.',
};

export const MODULE_VIDEOS = {
  // ═══ RISING GENERATION ═══
  'rg-m1': { playlist: [], lessonVideos: {} },
  'rg-m2': { playlist: [], lessonVideos: {} },
  'rg-m3': { playlist: [FOUR_ROOM_CASE_STUDY], lessonVideos: {} },
  'rg-m4': { playlist: [], lessonVideos: {} },
  'rg-m5': { playlist: [], lessonVideos: {} },
  'rg-m6': { playlist: [], lessonVideos: {} },

  // ═══ SENIOR GENERATION ═══
  'sg-m1': { playlist: [], lessonVideos: {} },
  'sg-m2': { playlist: [FOUR_ROOM_CASE_STUDY], lessonVideos: {} },
  'sg-m3': { playlist: [], lessonVideos: {} },
  'sg-m4': { playlist: [], lessonVideos: {} },
  'sg-m5': { playlist: [], lessonVideos: {} },
  'sg-m6': { playlist: [], lessonVideos: {} },

  // ═══ ADVANCED / ADVISOR ═══
  'adv-m1': { playlist: [], lessonVideos: {} },
  'adv-m2': { playlist: [], lessonVideos: {} },
  'adv-m3': { playlist: [FOUR_ROOM_CASE_STUDY], lessonVideos: {} },
  'adv-m4': { playlist: [], lessonVideos: {} },
  'adv-m5': { playlist: [], lessonVideos: {} },
  'adv-m6': { playlist: [], lessonVideos: {} },
};

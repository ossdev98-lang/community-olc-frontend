import { mockShops, pendingShops } from './shops.js';
import { mockRequirements, getActiveRequirements, getMyRequirements } from './requirements.js';
import { mockConversations, getConversationsForShop, getConversationsForRequirement } from './conversations.js';
import { mockNotifications } from './notifications.js';

const STORAGE_KEY = 'olc_mock_data';
const DEFAULT_PLATFORM_SETTINGS = {
  platformName: 'Ozone Lapcare Community',
  defaultDuration: '24',
  maxDuration: '72',
  maxImagesPerPost: '5',
  requireApproval: true,
  allowGuestView: false,
  maintenanceMode: false,
  emailNotifications: true,
  pushNotifications: false,
};
let idSequence = 0;

const createUniqueId = (prefix, records = []) => {
  const existing = new Set(records.map(record => record.id));
  let id;
  do {
    id = `${prefix}_${Date.now()}_${idSequence++}`;
  } while (existing.has(id));
  return id;
};

const normalizeIds = (records, prefix) => {
  const used = new Set();
  let changed = false;
  const normalized = records.map(record => {
    if (!used.has(record.id)) {
      used.add(record.id);
      return record;
    }
    changed = true;
    const nextId = createUniqueId(`${prefix}_recovered`, [...records, ...Array.from(used, id => ({ id }))]);
    used.add(nextId);
    return { ...record, id: nextId };
  });
  return { records: normalized, changed };
};

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

let state = loadState() || {
  requirements: mockRequirements,
  conversations: mockConversations,
  notifications: mockNotifications,
  shops: mockShops,
  pendingShops,
  savedRequirements: ['req_3', 'req_6'],
  platformSettings: DEFAULT_PLATFORM_SETTINGS,
};

if (Array.isArray(state.conversations)) {
  const normalized = normalizeIds(state.conversations, 'conv');
  state.conversations = normalized.records;
  if (normalized.changed) saveState(state);
}

const persist = () => saveState(state);

export const mockService = {
  getPlatformSettings: () => ({ ...DEFAULT_PLATFORM_SETTINGS, ...state.platformSettings }),
  updatePlatformSettings: (settings) => {
    state.platformSettings = { ...DEFAULT_PLATFORM_SETTINGS, ...state.platformSettings, ...settings };
    persist();
    return { ...state.platformSettings };
  },

  // Auth
  getCurrentUser: () => ({ ...mockShops[0], role: 'member' }),
  getAdminUser: () => ({ id: 'admin_1', name: 'Admin', email: 'admin@ozonelap.in', role: 'admin' }),

  // Requirements
  getRequirements: () => state.requirements.filter(r => r.expiresAt > Date.now() && r.status === 'active'),
  getAllRequirements: () => state.requirements,
  getRequirementById: (id) => state.requirements.find(r => r.id === id),
  getMyRequirements: (shopId) => state.requirements.filter(r => r.shopId === shopId),
  createRequirement: (data) => {
    const req = {
      id: createUniqueId('req', state.requirements),
      shopId: 'shop_1',
      shopName: 'TechZone Computer Store',
      shopCity: 'Jaipur',
      shopVerified: true,
      ...data,
      publishedAt: Date.now(),
      expiresAt: Date.now() + data.duration * 3600000,
      status: 'active',
      inquiryCount: 0,
      savedBy: [],
    };
    state.requirements = [req, ...state.requirements];
    persist();
    return req;
  },
  closeRequirement: (id) => {
    state.requirements = state.requirements.map(r =>
      r.id === id ? { ...r, status: 'closed' } : r
    );
    persist();
  },
  renewRequirement: (id, duration) => {
    state.requirements = state.requirements.map(r =>
      r.id === id ? { ...r, status: 'active', expiresAt: Date.now() + duration * 3600000, publishedAt: Date.now() } : r
    );
    persist();
  },

  // Conversations
  getConversations: (shopId) => state.conversations.filter(c => c.participants.includes(shopId)),
  getConversationById: (id) => state.conversations.find(c => c.id === id),
  getConversationsForRequirement: (reqId, ownerId) =>
    state.conversations.filter(c => c.requirementId === reqId && c.ownerId === ownerId),
  sendMessage: (convId, message) => {
    state.conversations = state.conversations.map(c => {
      if (c.id !== convId) return c;
      const msg = { id: createUniqueId('msg', c.messages), ...message, timestamp: Date.now(), read: false };
      return { ...c, messages: [...c.messages, msg], lastMessage: message.content || 'Sent a quotation', lastMessageAt: Date.now() };
    });
    persist();
  },
  createConversation: (data) => {
    const existing = state.conversations.find(c =>
      c.requirementId === data.requirementId &&
      c.ownerId === data.ownerId &&
      c.responderId === data.responderId
    );
    if (existing) return existing;

    const conv = {
      id: createUniqueId('conv', state.conversations),
      ...data,
      messages: [],
      lastMessage: '',
      lastMessageAt: Date.now(),
      unreadCount: {},
      status: 'active',
      contactShared: {},
    };
    state.conversations = [conv, ...state.conversations];
    persist();
    return conv;
  },
  markConversationRead: (convId, shopId) => {
    state.conversations = state.conversations.map(c => {
      if (c.id !== convId) return c;
      return { ...c, unreadCount: { ...c.unreadCount, [shopId]: 0 }, messages: c.messages.map(m => ({ ...m, read: true })) };
    });
    persist();
  },
  shareContact: (convId, shopId) => {
    state.conversations = state.conversations.map(c => {
      if (c.id !== convId) return c;
      return { ...c, contactShared: { ...c.contactShared, [shopId]: true } };
    });
    persist();
  },

  // Notifications
  getNotifications: () => state.notifications,
  markNotificationRead: (id) => {
    state.notifications = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    persist();
  },
  markAllNotificationsRead: () => {
    state.notifications = state.notifications.map(n => ({ ...n, read: true }));
    persist();
  },

  // Saved
  getSavedRequirements: () => state.savedRequirements || [],
  toggleSave: (reqId) => {
    const saved = state.savedRequirements || [];
    state.savedRequirements = saved.includes(reqId) ? saved.filter(id => id !== reqId) : [...saved, reqId];
    persist();
    return state.savedRequirements.includes(reqId);
  },

  // Shops
  getShops: () => state.shops.filter(s => s.status === 'approved'),
  getShopById: (id) => [...state.shops, ...state.pendingShops].find(s => s.id === id),
  getPendingShops: () => state.pendingShops,
  approveShop: (id) => {
    const shop = state.pendingShops.find(s => s.id === id);
    if (shop) {
      state.shops = [...state.shops, { ...shop, status: 'approved', verified: true }];
      state.pendingShops = state.pendingShops.filter(s => s.id !== id);
      persist();
    }
  },
  rejectShop: (id) => {
    state.pendingShops = state.pendingShops.filter(s => s.id !== id);
    persist();
  },
  suspendShop: (id) => {
    state.shops = state.shops.map(s => s.id === id ? { ...s, status: 'suspended' } : s);
    persist();
  },

  // Admin stats
  getAdminStats: () => ({
    totalShops: state.shops.length + state.pendingShops.length,
    approvedShops: state.shops.filter(s => s.status === 'approved').length,
    pendingApprovals: state.pendingShops.length,
    activeRequirements: state.requirements.filter(r => r.status === 'active' && r.expiresAt > Date.now()).length,
    expiredRequirements: state.requirements.filter(r => r.status === 'expired' || r.expiresAt <= Date.now()).length,
    totalInquiries: state.conversations.length,
    suspendedShops: state.shops.filter(s => s.status === 'suspended').length,
  }),
};

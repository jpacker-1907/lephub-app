import {
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  requestPasswordRecovery,
  signup,
  updateUser,
} from '@netlify/identity';

function normalizeUser(user) {
  if (!user) return null;
  const metadata = user.userMetadata || {};
  const name = metadata.name || metadata.full_name || user.name || user.email || '';
  return {
    id: user.id,
    email: user.email,
    name,
    orgName: metadata.orgName || '',
    role: metadata.role || 'owner',
    tier: user.appMetadata?.tier || 'free',
    initials: name.trim().split(/\s+/).map(part => part[0]).join('').toUpperCase(),
  };
}

let callbackPromise;

export const auth = {
  async signUp({ email, password, name, orgName, role }) {
    const user = await signup(email.toLowerCase().trim(), password, { name, orgName, role });
    const currentUser = await getUser();
    return {
      user: currentUser?.id === user.id ? normalizeUser(currentUser) : null,
      confirmationRequired: currentUser?.id !== user.id,
    };
  },

  async signIn({ email, password }) {
    return { user: normalizeUser(await login(email.toLowerCase().trim(), password)) };
  },

  async signOut() {
    await logout();
    localStorage.removeItem('lep_current_user');
  },

  async getCurrentUser() {
    return normalizeUser(await getUser());
  },

  resetPassword(email) {
    return requestPasswordRecovery(email.toLowerCase().trim());
  },

  handleCallback() {
    if (!callbackPromise) callbackPromise = handleAuthCallback();
    return callbackPromise;
  },

  async setPassword(password, inviteToken) {
    const user = inviteToken
      ? await acceptInvite(inviteToken, password)
      : await updateUser({ password });
    return { user: normalizeUser(user) };
  },

  onAuthStateChange(callback) {
    return onAuthChange((event, user) => callback(event, normalizeUser(user)));
  },
};

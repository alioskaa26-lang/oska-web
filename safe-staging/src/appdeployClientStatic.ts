type AuthUser = {
  userId: string;
  email?: string;
  name?: string;
  picture?: string;
  scope: string;
};

const noBackend = () => Promise.reject(new Error('AppDeploy backend is not available in static QA preview.'));

export const api = {
  async get(url: string) {
    if (url === '/api/site') return { data: { configured: false, config: null } };
    if (url === '/api/admin/configured') return { data: { configured: false } };
    return noBackend();
  },
  post: noBackend,
  put: noBackend,
  delete: noBackend,
};

export const auth = {
  isSignedIn: () => false,
  getUser: async (): Promise<AuthUser | null> => null,
  getAccessToken: async (): Promise<string | null> => null,
  signIn: noBackend,
  signOut: async () => undefined,
};

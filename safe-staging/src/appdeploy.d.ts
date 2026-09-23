declare module '@appdeploy/client' {
  export type AuthUser = {
    userId: string;
    email?: string;
    name?: string;
    picture?: string;
    scope: string;
  };

  export const api: {
    get(url: string, data?: unknown): Promise<{ data: unknown }>;
    post(url: string, data?: unknown): Promise<{ data: unknown }>;
    put(url: string, data?: unknown): Promise<{ data: unknown }>;
    delete(url: string, data?: unknown): Promise<{ data: unknown }>;
  };

  export const auth: {
    signIn(options?: { scope?: string }): Promise<{ user: AuthUser; accessToken: string; expiresIn: number }>;
    getUser(): Promise<AuthUser | null>;
    getAccessToken(): Promise<string | null>;
    signOut(): Promise<void>;
    isSignedIn(): boolean;
  };
}

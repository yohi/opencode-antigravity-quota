export interface StoredCredential {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    projectId?: string;
    email?: string;
}
export declare function loadStoredCredential(): Promise<StoredCredential | null>;
export declare function saveStoredCredential(credential: StoredCredential): Promise<void>;
export declare function deleteStoredCredential(): Promise<void>;
export declare function isAccessTokenValid(credential: StoredCredential): boolean;
//# sourceMappingURL=token-storage.d.ts.map
// src/app/core/models/user.model.ts
export interface UserProfile {
    sub: string;
    email: string;
    name: string;
    picture: string;
    phone?: string;
    roles?: string[];
}
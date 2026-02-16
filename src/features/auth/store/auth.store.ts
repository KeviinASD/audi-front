import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IAuthResponse, ILoginRequest, IUser } from '../interfaces';
import api, { AUTH_TOKEN_KEY } from '@/lib/api/api';
import { toast } from 'sonner';

interface AuthState {
    user: IUser | null;
    loading: boolean;
    login: (data: ILoginRequest) => Promise<boolean>;
    logout: () => void;
    setUser: (user: IUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loading: false,
            login: async (data: ILoginRequest) => {
                set({ loading: true });
                try {
                    const res = await api.post<IAuthResponse>('/auth/login', data);
                    const { user, access_token } = res.data;

                    localStorage.setItem(AUTH_TOKEN_KEY, access_token);

                    set({
                        user,
                        loading: false
                    })

                    toast.success(`Bienvenido ${user?.username} :3`, { position: 'top-center' });
                    return true;
                } catch (error: any) {
                    
                    let errorMessage = "Login failed. Please check your credentials.";
                    if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    
                    toast.error(errorMessage, { richColors: true, position: 'top-left' });
                    set({ loading: false });
                    return false;
                }
            },
            logout() {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                set({ user: null });
            },
            setUser(user: IUser | null) {
                set({ user });
            }
        }),
        {
            name: 'auth_storage',
            partialize: (state) => ({
                user: state.user
            })
        }
    )
)
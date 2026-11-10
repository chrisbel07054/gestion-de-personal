import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      rol: null,
      usuario: null,
      usuarioId: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false, // 1. Añadido para controlar la carga inicial del almacenamiento

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setSession: (payload) => {
        const { token, rol, usuarioId, usuario } = payload;

        set({
          token,
          rol,
          usuario,
          usuarioId,
          isAuthenticated: Boolean(token),
          isLoading: false,
        });

        if (token) {
          localStorage.setItem('token', token);
        }
      },

      login: async (credentials) => {
        const { login } = await import('../services/authService.js');

        set({ isLoading: true });

        try {
          const response = await login(credentials);
          const token = response?.token;
          const rol = response?.rol ? String(response.rol).trim().toUpperCase() : null;

          if (!token) {
            throw new Error('No se recibió token del backend');
          }

          const usuario = credentials?.usuario || null;
          const usuarioId = get().usuarioId;

          set({
            token,
            rol,
            usuario,
            usuarioId,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('token', token);

          return { ok: true, rol, token };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          rol: null,
          usuario: null,
          usuarioId: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      restoreSession: () => {
        const token = localStorage.getItem('token');

        if (!token) {
          set({ token: null, rol: null, usuario: null, usuarioId: null, isAuthenticated: false });
          return;
        }

        set({ token, isAuthenticated: true, isLoading: false });
      },
    }),
    {
      name: 'auth-session',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
      partialize: (state) => ({
        token: state.token,
        rol: state.rol,
        usuario: state.usuario,
        usuarioId: state.usuarioId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
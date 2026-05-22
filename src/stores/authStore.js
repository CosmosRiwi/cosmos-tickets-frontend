import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: null,
  empleado: null,

  login: (token, empleado) => set({ token, empleado }),

  logout: () => set({ token: null, empleado: null }),
}))

export default useAuthStore
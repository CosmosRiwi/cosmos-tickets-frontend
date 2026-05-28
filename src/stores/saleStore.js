import { create } from 'zustand';

export const useSaleStore = create((set) => ({
  client: null,
  selectedEvent: null,
  selectedSeats: [],
  

  setClient: (clientData) => set({ client: clientData }),
  setEvent: (eventData) => set({ selectedEvent: eventData }),
  setSeats: (seats) => set({ selectedSeats: seats }),

  clearSale: () => set({ client: null, selectedEvent: null, selectedSeats: [] })
}));
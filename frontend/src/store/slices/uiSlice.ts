import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activeTab: string;
  selectedThreatId: string | null;
  activeInvestigationId: string | null;
  currentUser: {
    username: string;
    role: string;
    token: string;
  } | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  activeTab: 'dashboard',
  selectedThreatId: null,
  activeInvestigationId: null,
  currentUser: {
    username: 'sec_admin',
    role: 'Principal SOC Analyst',
    token: 'mock-jwt-token-xyz'
  }
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSelectedThreat: (state, action: PayloadAction<string | null>) => {
      state.selectedThreatId = action.payload;
    },
    setActiveInvestigation: (state, action: PayloadAction<string | null>) => {
      state.activeInvestigationId = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
    },
    loginMock: (state) => {
      state.currentUser = {
        username: 'sec_admin',
        role: 'Principal SOC Analyst',
        token: 'mock-jwt-token-xyz'
      };
    }
  }
});

export const {
  toggleSidebar,
  setActiveTab,
  setSelectedThreat,
  setActiveInvestigation,
  logout,
  loginMock
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewMode = 'management' | 'participation';

const VIEW_MODE_KEY = 'viewMode';
const VIEW_MODE_CHOSEN_KEY = 'viewModeChosen';

const loadViewMode = (): ViewMode => {
  try {
    const stored = sessionStorage.getItem(VIEW_MODE_KEY);
    if (stored === 'management' || stored === 'participation') return stored;
  } catch {}
  return 'management';
};

const loadViewModeChosen = (): boolean => {
  try {
    return sessionStorage.getItem(VIEW_MODE_CHOSEN_KEY) === 'true';
  } catch {}
  return false;
};

interface UiState {
  viewMode: ViewMode;
  viewModeChosen: boolean;
  showLoginDestinationModal: boolean;
}

const initialState: UiState = {
  viewMode: loadViewMode(),
  viewModeChosen: loadViewModeChosen(),
  showLoginDestinationModal: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
      state.viewModeChosen = true;
      state.showLoginDestinationModal = false;
      sessionStorage.setItem(VIEW_MODE_KEY, action.payload);
      sessionStorage.setItem(VIEW_MODE_CHOSEN_KEY, 'true');
    },
    promptLoginDestination(state) {
      state.showLoginDestinationModal = true;
    },
    dismissLoginDestinationModal(state) {
      state.showLoginDestinationModal = false;
    },
    resetUiState(state) {
      state.viewMode = 'management';
      state.viewModeChosen = false;
      state.showLoginDestinationModal = false;
      sessionStorage.removeItem(VIEW_MODE_KEY);
      sessionStorage.removeItem(VIEW_MODE_CHOSEN_KEY);
    },
  },
});

export const { setViewMode, promptLoginDestination, dismissLoginDestinationModal, resetUiState } =
  uiSlice.actions;
export default uiSlice.reducer;

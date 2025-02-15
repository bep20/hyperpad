import { create } from 'zustand';

const reducer = (state, { type }) => {
  switch (type) {
    case 'OPEN_NAVBAR':
      return {
        ...state,
        isNavBarOpen: true,
      };
    case 'CLOSE_NAVBAR':
      return {
        ...state,
        isNavBarOpen: false,
      };
    case 'TOGGLE_MENU':
      return {
        ...state,
        isNavBarOpen: !state?.isNavBarOpen,
      };
    default:
      return state;
  }
};

const store = set => ({
  isNavBarOpen: true,
  dispatch: args => set(state => reducer(state, args)),
});

export const useMenu = create(store);

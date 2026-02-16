import { type NavigateFunction } from 'react-router-dom';

let navigator: NavigateFunction;

export const setNavigator = (navFn: NavigateFunction) => {
  navigator = navFn;
};

export const navigateTo = (path: string) => {
  if (navigator) {
    navigator(path);
  } else {
    console.warn('Navigator not initialized');
  }
};

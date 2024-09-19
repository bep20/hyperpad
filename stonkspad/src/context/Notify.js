import React, { useReducer, createContext } from 'react';
import notification from 'antd/es/notification';

export const NotifyContext = createContext();

export const NotifyContextProvider = ({ children }) => {
  const [notifyApi, contextHolder] = notification.useNotification({
    stack: {
      threshold: 3,
    },
  });

  return (
    <NotifyContext.Provider value={[notifyApi]}>
      {contextHolder}
      {children}
    </NotifyContext.Provider>
  );
};

import React, { useState, createContext } from "react";
import axiosInstance from "./axiosInstance";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  const handleUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/userInfo");
      if (response.status === "OK") {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await axiosInstance.post("/refresh-token");
      if (response.status === "OK") {
        await handleUserInfo();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        handleRefresh,
        handleUserInfo,
        userInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

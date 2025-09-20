import { createContext, useContext, useState } from 'react';

const WaterDataContext = createContext();

export const WaterDataProvider = ({ children }) => {
  const [waterData, setWaterData] = useState({
    ph: null,
    do: null,
    score: null,
    temperature: null,
  });

  return (
    <WaterDataContext.Provider value={{ waterData, setWaterData }}>
      {children}
    </WaterDataContext.Provider>
  );
};

export const useWaterData = () => useContext(WaterDataContext);
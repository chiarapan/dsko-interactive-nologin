import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

// IndexedDB wrapper
const DB_NAME = "OptimizerDB";
const STORE_NAME = "OptimizerStore";

const withStore = async (callback, mode = "readonly") => {
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => rej(req.error);
    req.onsuccess = () => res(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
  });

  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    callback(store);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

const IDB = {
  get: (key) =>
    new Promise((res) => {
      withStore((store) => {
        const req = store.get(key);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
    }),
  set: (key, value) =>
    withStore((store) => store.put(value, key), "readwrite"),
  del: (key) =>
    withStore((store) => store.delete(key), "readwrite"),
};

const OptimizerContext = createContext();
export const useOptimizerSession = () => useContext(OptimizerContext);

// Generate a simple session ID: timestamp + random 4-digit number
const generateSessionId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `${timestamp}-${randomNum}`;
};

// Provider
export const OptimizerProvider = ({ children }) => {
  const [csvData, setCsvDataState] = useState(null);
  const [yamlData, setYamlDataState] = useState(null);
  const [numParticles, setNumParticlesState] = useState(undefined);
  const [numParticlesInput, setNumParticlesInput] = useState("");
  const [sessionId, setSessionIdState] = useState(null);
  const importanceCacheRef = useRef(null);

 

  // Load session from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const [cachedCSV, cachedYAML, cachedNumParticles, cachedId] = await Promise.all([
          IDB.get("csvData"),
          IDB.get("yamlData"),
          IDB.get("numParticles"),
          IDB.get("sessionId"),
        ]);

        if (cachedId) setSessionIdState(cachedId);
        if (cachedCSV) setCsvDataState(cachedCSV);
        if (cachedYAML) setYamlDataState(cachedYAML);
        const isValidNum = Number(cachedNumParticles) > 0;
        if (isValidNum) {
          setNumParticlesState(cachedNumParticles);
          
        }

      } catch (error) {
        console.error("Failed to load optimizer session:", error);
      }
    })();
  }, []);

  // Wrapped setters that persist after ensuring session ID exists
  const setCsvData = async (data) => {
    setCsvDataState(data);
    await IDB.set("csvData", data);
  };

  const setYamlData = async (data) => {
    setYamlDataState(data);
    await IDB.set("yamlData", data);
  };

  const setNumParticles = async (value) => {
    setNumParticlesState(value);
    await IDB.set("numParticles", value);
  };

  const setSessionId = async (id) => {
    setSessionIdState(id);
    await IDB.set("sessionId", id);
  };

  const clearSession = async () => {
    try {
      await Promise.all([
        IDB.del("csvData"),
        IDB.del("yamlData"),
        IDB.del("numParticles"),
        IDB.del("sessionId"),
      ]);
      setCsvDataState(null);
      setYamlDataState(null);
      setNumParticlesState(undefined);
      setNumParticlesInput("");
      setSessionIdState(null);
      importanceCacheRef.current = null;
    } catch (error) {
      console.error("Failed to clear optimizer session:", error);
    }
  };

  const clearSessionById = async (sessionId) => {
  try {
    // Compose keys based on sessionId
    await Promise.all([
      IDB.del(`csvData-${sessionId}`),
      IDB.del(`yamlData-${sessionId}`),
      IDB.del(`numParticles-${sessionId}`),
      IDB.del(`sessionId-${sessionId}`),
    ]);
    console.log(`Cleared session data from IndexedDB for session ${sessionId}`);
  } catch (error) {
    console.error(`Failed to clear IndexedDB data for session ${sessionId}:`, error);
  }
};

 
  

  const value = {
    csvData,
    setCsvData,
    yamlData,
    setYamlData,
    numParticles,
    setNumParticles,
    numParticlesInput,
    setNumParticlesInput,
    sessionId,
    setSessionId,
    importanceCacheRef,
    clearSessionById,
    clearSession,
  };

  return (
    <OptimizerContext.Provider value={value}>
      {children}
    </OptimizerContext.Provider>
  );
};

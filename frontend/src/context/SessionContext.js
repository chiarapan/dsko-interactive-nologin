import React, {
  createContext, useContext, useState, useEffect, useRef
} from "react";

// IDB wrapper
const DB_NAME = "SessionDB";
const STORE_NAME = "SessionStore";

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
      withStore(store => {
        const req = store.get(key);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
    }),
  set: (key, value) =>
    withStore(store => store.put(value, key), "readwrite"),
  del: (key) =>
    withStore(store => store.delete(key), "readwrite")
};

// LocalStorage wrapper 
const LS = {
  get: (k, def = null) => {
    const raw = localStorage.getItem(k);
    if (raw === null) return def;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },
  set: (k, v) => {
    const val = typeof v === "string" ? v : JSON.stringify(v);
    localStorage.setItem(k, val);
  },
  rm: (...ks) => ks.forEach(k => localStorage.removeItem(k))
};

const SessionContext = createContext();
export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [jobId, _setJobId] = useState(LS.get("jobId"));
  const [sessionID, setSessionID] = useState(LS.get("sessionID"));
  const [bandFileName, _setBandFileName] = useState(LS.get("bandFileName"));
  const [structureFileName, _setStructureFileName] = useState(LS.get("structureFileName"));
  const [_selection, _setSelection] = useState(LS.get("selection", "snap"));
  const [_selectionType, _setSelectionType] = useState("single");
  const [breakIndices, _setBreakIndices] = useState(LS.get("breakIndices", []));
  const [valenceNumber, _setValenceNumber] = useState(LS.get("valenceNumber") ?? null);


  const setSelection = (mode) => {
    LS.set("selection", mode);
    _setSelection(mode);
  };

  const setSelectionType = (mode) => {
    LS.set("selectionType", mode);
    _setSelectionType(mode);
  };

  const setBreakIndices = (indices) => {
    LS.set("breakIndices", indices);
    _setBreakIndices(indices);
  };

  const [session, setSession] = useState(null);
  const firstLoadDone = useRef(false);

  const setJobId = (id) => {
    _setJobId(id);
    LS.set("jobId", id);
    setSession(s => s ? { ...s, jobId: id } : s);
  };

  const setBandFileName = (name) => {
    _setBandFileName(name);
    LS.set("bandFileName", name);
  };

  const setStructureFileName = (name) => {
    _setStructureFileName(name);
    LS.set("structureFileName", name);
  };

  const setDefaultValenceNumber = (val) => {
    if (valenceNumber !== null) return;
    _setValenceNumber(val);
    LS.set("valenceNumber", val);
    setSession(s => s ? { ...s, valenceNumber: val } : s);
  };

  useEffect(() => {
    const load = async () => {
      const light = LS.get("currentSession", {
        bandData: null,
        structureData: null,
        selectionMode: false,
        status: "inactive",
        jobId: null,
        uploads: { band: false, structure: false },
      });

      const bandData = await IDB.get("bandData");
      const structureData = await IDB.get("structureData");
      const points = await IDB.get("points");

      setSession({
        ...light,
        bandData: bandData ?? light.bandData,
        structureData: structureData ?? light.structureData,
        points: points ?? light.points,
        jobId: LS.get("jobId"),
        valenceNumber: LS.get("valenceNumber") ?? null,

      });

      _setJobId(LS.get("jobId"));
      _setSelection(LS.get("selection", "snap"));
      _setSelectionType(LS.get("selectionType", "single"));
      _setBreakIndices(LS.get("breakIndices", []));
      _setValenceNumber(LS.get("valenceNumber") ?? null);


      firstLoadDone.current = true;
    };
    load();
  }, []);

  useEffect(() => {
    if (!firstLoadDone.current || !session) return;

    const { jobId, bandData, structureData, points, ...light } = session;

    LS.set("currentSession", light);
    LS.set("breakIndices", breakIndices);

    if (bandData !== undefined) IDB.set("bandData", bandData);
    if (structureData !== undefined) IDB.set("structureData", structureData);
    if (points !== undefined) IDB.set("points", points);
  }, [session, breakIndices]);

  const startNewSession = (bandData) => {
    const newSess = {
      bandData,
      structureData: session?.structureData ?? null,
      status: "active",
      selectionMode: false,
      uploads: { band: true, structure: !!session?.structureData },
      jobId: jobId ?? null,
    };
    setSession(newSess);
  };

  const endSession = async () => {
    const ended = {
      ...session,
      status: "ended",
      endedAt: new Date().toISOString()
    };
    LS.set("lastSession", ended);

    _setBandFileName(null);
    _setStructureFileName(null);
    _setJobId(null);
    setSessionID(null);
    _setValenceNumber(null);


    setSession({
      bandData: null,
      structureData: null,
      selectionMode: false,
      status: "inactive",
      jobId: null,
      uploads: { band: false, structure: false },
      sessionID: null,
      valenceNumber: null,

    });

    LS.rm(
      "currentSession",
      "selectedPoints",
      "bandFileName",
      "structureFileName",
      "jobId",
      "sessionID",
      "selection",
      "selectionType",
      "breakIndices",
      "valenceNumber"

    );

    await Promise.all([
      IDB.del("bandData"),
      IDB.del("structureData"),
      IDB.del("points"),
    ]);
  };

  const addSelectedPoint = (p) =>
    setSession(s => ({ ...s, selectedPoints: [...(s.selectedPoints || []), p] }));

  const clearSelectedPoints = () =>
    setSession(s => ({ ...s, selectedPoints: [] }));

  const removeSelectedPoint = (idx) =>
    setSession(s => ({
      ...s,
      selectedPoints: s.selectedPoints?.filter((_, i) => i !== idx) || []
    }));

  const setStructureData = (data) =>
    setSession(s => ({
      ...s,
      structureData: data,
      uploads: { ...s.uploads, structure: !!data }
    }));

  const setBandData = (data) =>
    setSession(s => ({
      ...s,
      bandData: data,
      uploads: { ...s.uploads, band: !!data }
    }));

  const updateSessionData = ({ bandData, structureData, selectedPoints }) =>
    setSession(s => ({
      ...s,
      bandData: bandData ?? s.bandData,
      structureData: structureData ?? s.structureData,
      selectedPoints: selectedPoints ?? s.selectedPoints
    }));

  const setSelectionMode = (mode) =>
    setSession(s => ({ ...s, selectionMode: mode }));

  if (!firstLoadDone.current) return null;

  return (
    <SessionContext.Provider value={{
      session,
      startNewSession: (bandData) => {
        const newSess = {
          bandData,
          structureData: session?.structureData ?? null,
          status: "active",
          selectionMode: false,
          uploads: { band: true, structure: !!session?.structureData },
          jobId: jobId ?? null,
          valenceNumber,
        };
        setSession(newSess);
      },
      endSession,
      clearSession: endSession,
      addSelectedPoint,
      clearSelectedPoints,
      removeSelectedPoint,
      setStructureData,
      setBandData,
      updateSessionData,
      setSelectionMode,
      setSelectedPoints: (pts) => setSession(s => ({ ...s, selectedPoints: pts })),
      setSelection,
      setSelectionType,
      selectionType: _selectionType,
      selection: _selection,
      jobId, setJobId,
      bandFileName, setBandFileName,
      structureFileName, setStructureFileName,
      sessionID, setSessionID,
      breakIndices, setBreakIndices,
      valenceNumber,
      setDefaultValenceNumber,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

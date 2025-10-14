import React, { createContext, useContext, useReducer } from "react";
import {
  getNovels,
  addNovel as svcAddNovel,
  updateNovel as svcUpdateNovel,
  deleteNovel as svcDeleteNovel,
} from "../services/novelService";

const NovelContext = createContext();

const initialState = {
  novels: [],
  isLoading: false,
  lastVisible: null,
  hasMore: true,
  lastSearch: "",
};

function novelReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        novels: action.refresh
          ? action.payload.novels
          : [...state.novels, ...action.payload.novels],
        lastVisible: action.payload.lastVisible || null,
        hasMore: Boolean(action.payload.lastVisible),
        isLoading: false,
        lastSearch: action.search,
      };
    case "ADD":
      return { ...state, novels: [action.payload, ...state.novels] };
    case "UPDATE":
      return {
        ...state,
        novels: state.novels.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case "DELETE":
      return {
        ...state,
        novels: state.novels.filter((n) => n.id !== action.payload),
      };
    default:
      return state;
  }
}

export const NovelProvider = ({ children }) => {
  const [state, dispatch] = useReducer(novelReducer, initialState);

  const fetchNovels = async (searchTerm = "", refresh = false) => {
    try {
      dispatch({ type: "FETCH_START" });
      const res = await getNovels({
        pageSize: 12,
        lastDoc: refresh ? null : state.lastVisible,
        searchTerm,
        forceRefresh: refresh,
      });
      dispatch({
        type: "FETCH_SUCCESS",
        payload: res,
        refresh,
        search: searchTerm,
      });
    } catch (err) {
      console.error("Fetch novels error:", err);
      dispatch({ type: "FETCH_SUCCESS", payload: { novels: [] }, refresh });
    }
  };

  const addNovel = async (novel) => {
    const newId = await svcAddNovel(novel);
    dispatch({ type: "ADD", payload: { id: newId, ...novel } });
  };

  const updateNovel = async (id, data) => {
    await svcUpdateNovel(id, data);
    dispatch({ type: "UPDATE", payload: { id, ...data } });
  };

  const deleteNovel = async (id) => {
    await svcDeleteNovel(id);
    dispatch({ type: "DELETE", payload: id });
  };

  return (
    <NovelContext.Provider
      value={{
        ...state,
        fetchNovels,
        addNovel,
        updateNovel,
        deleteNovel,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};

export const useNovels = () => useContext(NovelContext);

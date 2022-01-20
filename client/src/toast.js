import { createContext, useCallback, useContext, useReducer } from "react";

const ToastContext = createContext();

const ADD_TOAST = "ADD_TOAST";
const REMOVE_TOAST = "REMOVE_TOAST";

export const ToastContextProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case ADD_TOAST:
          return {
            ...state,
            toasts: state.toasts.concat([{ ...action.payload, id: state.id }]),
            id: state.id + 1,
          };

        case REMOVE_TOAST:
          return {
            ...state,
            toasts: state.toasts.filter(
              (toast) => toast.id !== action.payload.id
            ),
          };

        default:
          return state;
      }
    },
    { id: 1, toasts: [] }
  );

  const addToast = useCallback(({ heading, message }) => {
    dispatch({ type: ADD_TOAST, payload: { heading, message } });
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: REMOVE_TOAST, payload: { id } });
  }, []);

  const context = {
    addToast,
    removeToast,
    toasts: state.toasts,
  };

  return (
    <ToastContext.Provider value={context}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

interface ToastContextProviderProps {
  children: ReactNode;
}

interface Toast {
  readonly id: number;
  readonly heading: string;
  readonly message: string;
}

type ToastContent = Omit<Toast, "id">;

interface ToastContextState {
  readonly id: number;
  readonly toasts: Toast[];
}

interface AddToastAction {
  readonly type: "ADD_TOAST";
  readonly payload: ToastContent;
}

interface RemoveToastAction {
  readonly type: "REMOVE_TOAST";
  readonly payload: Pick<Toast, "id">;
}

type ToastAction = AddToastAction | RemoveToastAction;

type ToastContextReducer = (
  state: ToastContextState,
  action: ToastAction
) => ToastContextState;

interface ToastContextValue {
  addToast: (content: ToastContent) => void;
  removeToast: (id: Toast["id"]) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  removeToast: () => {},
  toasts: [],
});

export const ToastContextProvider = (props: ToastContextProviderProps) => {
  const { children } = props;
  const [state, dispatch] = useReducer<ToastContextReducer>(
    (state, action) => {
      switch (action.type) {
        case "ADD_TOAST":
          return {
            ...state,
            toasts: state.toasts.concat([{ ...action.payload, id: state.id }]),
            id: state.id + 1,
          };

        case "REMOVE_TOAST":
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

  const addToast = useCallback(({ heading, message }: ToastContent) => {
    dispatch({ type: "ADD_TOAST", payload: { heading, message } });
  }, []);

  const removeToast = useCallback((id: number) => {
    dispatch({ type: "REMOVE_TOAST", payload: { id } });
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

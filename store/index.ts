import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from "next-redux-wrapper";

import { nodesApi } from "./apis/nodes";
import { oauth2Api } from "./apis/oauth2";
import { webhooksApi } from "./apis/webhooks";
import { workflowsApi } from "./apis/workflows";

import { authSlice } from "./slices/auth";
import { canvasSlice } from "./slices/canvas";

const combinedReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,

  // app reducers
  [canvasSlice.name]: canvasSlice.reducer,

  // api reducers
  [nodesApi.reducerPath]: nodesApi.reducer,
  [oauth2Api.reducerPath]: oauth2Api.reducer,
  [webhooksApi.reducerPath]: webhooksApi.reducer,
  [workflowsApi.reducerPath]: workflowsApi.reducer,
});

const reducer: typeof combinedReducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    };

    // this state gets preserved on client side nav
    if (state?.[authSlice.name].loggedIn)
      nextState[authSlice.name].loggedIn = state[authSlice.name].loggedIn;
    return nextState;
  } else return combinedReducer(state, action);
};

export const makeStore = () =>
  configureStore({
    reducer,
    middleware: (gDM) =>
      gDM()
        .concat(nodesApi.middleware)
        .concat(webhooksApi.middleware)
        .concat(workflowsApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const wrapper = createWrapper<AppStore>(makeStore, { debug: true });

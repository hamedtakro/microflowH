import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";

import { backendApiBaseURL as baseUrl } from "utils/constants";
import {
  INode,
  INodeData,
  INodeExecutionData,
  INodeOptionsValue,
  ITestNodeBody,
  ITriggerNode,
  WebhookMethod,
} from "utils/interfaces";

type AllNodesResponse = Array<SpecificNodeResponse>;
type SpecificNodeResponse = INode | ITriggerNode;
type LoadMethodNodeResponse = Array<INodeOptionsValue>;
type TestNodeResponse =
  | Array<INodeExecutionData>
  | {
      webhookEndPoint: any;
      httpMethod: WebhookMethod;
    };

interface ILoadMethodNodeArgs {
  name: string;
  body: INodeData;
}
interface ITestNodeArgs {
  name: string;
  body: ITestNodeBody;
}

export const nodesApi = createApi({
  reducerPath: "nodesApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    getAllNodes: builder.query<AllNodesResponse, void>({
      query: () => "nodes",
    }),

    getSpecificNode: builder.query<SpecificNodeResponse, string>({
      query: (name) => `/nodes/${name}`,
    }),

    loadMethodNode: builder.mutation<
      LoadMethodNodeResponse,
      ILoadMethodNodeArgs
    >({
      query: ({ name, ...body }) => ({
        url: `/node-load-method/${name}`,
        body,
      }),
    }),

    testNode: builder.mutation<TestNodeResponse, ITestNodeArgs>({
      query: ({ name, ...body }) => ({
        url: `/node-test/${name}`,
        body,
      }),
    }),

    removeTestTriggers: builder.mutation({
      query: () => ({
        url: `/remove-test-triggers`,
      }),
    }),
  }),
});

// use in function components
export const {
  useGetAllNodesQuery,
  useGetSpecificNodeQuery,
  useLoadMethodNodeMutation,
  useTestNodeMutation,
  useRemoveTestTriggersMutation,
  util: { getRunningQueriesThunk, getRunningMutationsThunk },
} = nodesApi;

export const {
  getAllNodes,
  getSpecificNode,
  loadMethodNode,
  testNode,
  removeTestTriggers,
} = nodesApi.endpoints;

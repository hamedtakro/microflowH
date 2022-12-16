import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { DragEvent, useCallback, useRef, useState } from "react";
import { batch } from "react-redux";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  MiniMap,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Viewport,
} from "reactflow";

import SaveWorkflow from "components/dialogs/saveWorkflow";
import Link from "components/link";
import AddNodes from "containers/addNodes";
import ButtonEdge from "containers/buttonEdge";
import CanvasNode from "containers/canvasNode";
import { useAppDispatch, useAppSelector } from "hooks/reduxHooks";
import "reactflow/dist/style.css";
import { wrapper } from "store";
import {
  getAllNodes,
  getRunningQueriesThunk,
  removeTestTriggers,
  useGetAllNodesQuery,
} from "store/apis/nodes";
import { deleteAllTestWebhooks } from "store/apis/webhooks";
import {
  useCreateNewWorkflowMutation,
  useUpdateWorkflowMutation,
} from "store/apis/workflows";
import {
  selectCanvasState,
  setDirty,
  setSelectedNode,
  setWorkflow,
} from "store/slices/canvas";
import {
  addAnchors,
  checkMultipleTriggers,
  generateWebhookEndpoint,
  getEdgeLabelName,
  getUniqueNodeId,
} from "utils/genericHelpers";
import { INodeData, IWorkflowResponse } from "utils/interfaces";
import theme from "utils/theme";
import { CustomNode } from "utils/types";

const edgeTypes = { buttonEdge: ButtonEdge };
const nodeTypes = { customNode: CanvasNode };
const defaultViewport: Viewport = { x: 10, y: 15, zoom: 5 };

// determine proper fetch time
export const getStaticProps = wrapper.getServerSideProps(
  (store) => async () => {
    store.dispatch(getAllNodes.initiate());
    store.dispatch(removeTestTriggers.initiate());
    store.dispatch(deleteAllTestWebhooks.initiate());
    store.dispatch(
      setWorkflow({ name: "Untitled workflow" } as IWorkflowResponse)
    );
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return { props: {} };
  }
);

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { workflow } = useAppSelector(selectCanvasState);
  const { data: allNodes } = useGetAllNodesQuery();

  const reactFlowWrapper = useRef<HTMLElement>(null);

  // TODO deprecate in favor of useReactFlow hook inside provider
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance>();

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /*** Save workflow: Move */
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [createWorkflow, createResult] = useCreateNewWorkflowMutation();
  const [updateWorkflow, updateResult] = useUpdateWorkflowMutation();

  /*** TO BE MOVED */
  const handleSaveWorkflow = useCallback(
    async (name: string) => {
      // TODO: depending on where this function lands, we can use the
      // useReactflow instance hook instead
      if (!rfInstance) return;

      // prepare data
      const flowData = JSON.stringify(rfInstance.toObject());

      // save new flow
      try {
        if (!workflow?.shortId) {
          const response = await createWorkflow({
            name,
            deployed: false,
            flowData,
          }).unwrap();
          setWorkflow(response);
        } else {
          // update existing workflow
          updateWorkflow({ shortId: workflow.shortId, name, flowData });
        }
      } catch (error) {
        console.error(`Error occurred saving workflow: ${name}`, error);
      }
    },
    [createWorkflow, rfInstance, updateWorkflow, workflow?.shortId]
  );

  /********************************************
   *                Handlers                  *
   ********************************************/
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setRfInstance(instance);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: "buttonEdge",
        id: `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        data: { label: getEdgeLabelName(connection.sourceHandle) },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      dispatch(setDirty());
    },
    [dispatch, setEdges]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, clickedNode: CustomNode) => {
      dispatch(setSelectedNode(clickedNode));
    },
    [dispatch]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: CustomNode, nodes: CustomNode[]) => {
      dispatch(setDirty());
    },
    [dispatch]
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const reactflowBounds =
        reactFlowWrapper?.current?.getBoundingClientRect();

      if (!reactflowBounds || !rfInstance) return;

      const rawNodeData = event.dataTransfer.getData("application/reactflow");

      // invalid element dropped
      if (!rawNodeData || typeof rawNodeData === "undefined") return;

      // valid element, parse data
      const nodeData: INodeData = JSON.parse(rawNodeData);

      // trying to add a trigger when one already exists
      if (
        (nodeData.type === "webhook" || nodeData.type === "trigger") &&
        checkMultipleTriggers(nodes)
      ) {
        alert("Workflow can only contain 1 trigger or webhook node");
        return;
      }

      // build new node
      if (nodeData.type === "webhook")
        nodeData.webhookEndpoint = generateWebhookEndpoint();

      const id = getUniqueNodeId(nodeData, nodes);
      const position = rfInstance.project({
        x: event.clientX - reactflowBounds.left - 100,
        y: event.clientY - reactflowBounds.top - 50,
      });

      const newNode = {
        id,
        position,
        type: "customNode",
        data: addAnchors(nodeData, nodes, id),
      };

      batch(() => {
        dispatch(setSelectedNode(newNode));
        dispatch(setDirty());
      });
      setNodes((nds) => nds.concat(newNode));
    },
    [dispatch, nodes, rfInstance, setNodes]
  );

  /********************************************
   *                 Render                   *
   ********************************************/
  return (
    <Box>
      <Link href="/">Home</Link>
      <Button onClick={() => setOpenSaveDialog(true)}>Save</Button>
      <Box
        sx={{ marginTop: "80px", border: 1, height: "90vh", width: "100%" }}
        ref={reactFlowWrapper}
      >
        <ReactFlowProvider>
          <ReactFlow
            onInit={onInit}
            nodes={nodes}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeDragStop={onNodeDragStop}
            // Edges props
            edges={edges}
            edgeTypes={edgeTypes}
            onConnect={onConnect}
            onEdgesChange={onEdgesChange}
            // Drag and drop
            onDragOver={onDragOver}
            onDrop={onDrop}
            // styling
            fitView
            defaultViewport={defaultViewport}
          >
            <Controls
              style={{
                display: "flex",
                flexDirection: "row",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <AddNodes nodesData={allNodes || []} />
            <Background color="#00f" gap={16} />
            <MiniMap
              nodeStrokeColor={() => theme.palette.primary.main}
              nodeColor={() => theme.palette.primary.main}
              nodeBorderRadius={2}
              pannable
              zoomable
            />
          </ReactFlow>

          <SaveWorkflow
            open={openSaveDialog}
            onCancel={() => setOpenSaveDialog(false)}
            onConfirm={(name) => {
              handleSaveWorkflow(name);
              setOpenSaveDialog(false);
            }}
            labels={{
              title: `Save New Workflow`,
              cancel: "Cancel",
              confirm: "Save",
            }}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}

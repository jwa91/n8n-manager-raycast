// src/types.ts

/**
 * Defines the structure for user-specific preferences for the Raycast extension.
 */
export interface Preferences {
  n8nWebhookUrl: string
  apiToken: string
}

/**
 * Defines the parameters that can be used to construct paths or query strings for n8n API requests.
 */
export interface N8nApiPathParams {
  workflowId?: string
  mode?: "summary" | "full"
  includedWorkflows?: "active" | "inactive" | "all"
}

/**
 * Represents the basic, shared properties common to all workflow representations.
 */
export interface WorkflowBase {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * Represents a summary view of a workflow, extending `WorkflowBase` with activity status.
 */
export interface WorkflowSummary extends WorkflowBase {
  active: boolean
}

/**
 * Represents a tag associated with an n8n workflow.
 */
export interface WorkflowTag {
  createdAt: string
  updatedAt: string
  id: string
  name: string
}

/**
 * Defines the generic structure for parameters within a workflow node.
 * Allows for any key-value pairs, where values can be of any type.
 */
export interface WorkflowNodeParameters {
  [key: string]: unknown
}

/**
 * Defines the structure for credentials referenced within a workflow node's parameters.
 * Maps a credential key to its ID and name.
 */
export interface WorkflowNodeCredentials {
  [key: string]: {
    id: string
    name: string
  }
}

/**
 * Represents a single node within an n8n workflow.
 */
export interface WorkflowNode {
  parameters: WorkflowNodeParameters
  id: string
  name: string
  type: string
  typeVersion: number
  position?: [number, number]
  webhookId?: string
  credentials?: WorkflowNodeCredentials
}

/**
 * Defines the target of a connection between nodes in a workflow.
 */
export interface WorkflowConnectionTarget {
  node: string
  type: string
  index: number
}

/**
 * Defines the structure of connections originating from a single output port of a workflow node.
 * It can have a 'main' output and/or other named outputs, each leading to an array of target connections.
 */
export interface WorkflowConnectionType {
  main?: WorkflowConnectionTarget[][]
  [outputName: string]: WorkflowConnectionTarget[][] | undefined
}

/**
 * Represents all connections within a workflow.
 * It's a map where each key is a source node's ID, and the value describes its outgoing connections.
 */
export interface WorkflowConnections {
  [sourceNodeId: string]: WorkflowConnectionType
}

/**
 * Defines generic settings associated with an n8n workflow.
 */
export interface WorkflowSettings {
  executionOrder?: string
  [key: string]: unknown
}

/**
 * Represents metadata associated with an n8n workflow.
 */
export interface WorkflowMeta {
  templateCredsSetupCompleted?: boolean
  instanceId?: string
  [key: string]: unknown
}

/**
 * Represents the full, detailed structure of an n8n workflow, extending `WorkflowSummary`.
 */
export interface WorkflowFull extends WorkflowSummary {
  nodes: WorkflowNode[]
  connections: WorkflowConnections
  settings: WorkflowSettings | null
  staticData: unknown | null
  meta: WorkflowMeta | null
  pinData: Record<string, unknown> | null
  versionId?: string
  tags: WorkflowTag[] | null
}

/**
 * A union type that can represent either a summary or a full representation of a workflow.
 */
export type Workflow = WorkflowSummary | WorkflowFull

/**
 * Defines the structure of the result for actions that trigger a workflow with JSON data.
 */
export interface TriggerActionResult {
  success: boolean
  message: string
  responseDataToCopy?: unknown
}

/**
 * Defines the structure of the result for "quick trigger" actions (triggering without a JSON payload).
 */
export interface QuickTriggerActionResult {
  success: boolean
  message: string
}

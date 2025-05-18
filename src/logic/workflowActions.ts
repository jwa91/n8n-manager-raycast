// src/logic/workflowActions.ts
// This module orchestrates application logic by calling API services and utilities.

import * as n8nApiService from "../services/n8nApiService";
import type {
  N8nApiPathParams,
  QuickTriggerActionResult,
  TriggerActionResult,
  WorkflowFull,
  WorkflowSummary,
} from "../types";
import { parseJsonInput } from "../utils/jsonUtils";

/**
 * Fetches a list of workflows, optionally filtered by status and searched by text.
 * If `searchText` resembles a workflow ID, a direct fetch for that ID is attempted.
 * @param filter - The status of workflows to include (e.g., "active", "all").
 * @param searchText - Optional. A workflow ID for direct fetch, or text for potential name filtering (if supported by service/client).
 * @returns A Promise resolving to an array of WorkflowSummary objects, or a single WorkflowSummary if an ID matches directly via the service.
 * @throws Error if the underlying API call fails, allowing the caller to handle UI feedback.
 */
export async function listWorkflows(
  filter: N8nApiPathParams["includedWorkflows"],
  searchText?: string,
): Promise<WorkflowSummary[] | WorkflowSummary> {
  // Errors from n8nApiService.searchWorkflows will propagate.
  return n8nApiService.searchWorkflows(filter, searchText);
}

/**
 * Retrieves the full, detailed information for a specific workflow.
 * @param workflowId - The unique identifier of the workflow.
 * @returns A Promise resolving to the WorkflowFull object, or null if the workflow is not found.
 * @throws Error if the underlying API call fails, allowing the caller to handle UI feedback.
 */
export async function getWorkflowDetails(
  workflowId: string,
): Promise<WorkflowFull | null> {
  // Errors from n8nApiService.getWorkflowDetails will propagate.
  return n8nApiService.getWorkflowDetails(workflowId);
}

/**
 * Executes a "quick trigger" for a specified workflow (without a JSON payload).
 * @param workflowId - The ID of the workflow to trigger.
 * @param workflowName - The display name of the workflow, used for generating feedback messages.
 * @returns A Promise resolving to a QuickTriggerActionResult indicating success.
 * @throws Error if the underlying API call fails, allowing the caller to handle UI feedback.
 */
export async function quickTriggerWorkflow(
  workflowId: string,
  workflowName: string,
): Promise<QuickTriggerActionResult> {
  // Errors from n8nApiService.triggerWorkflowExecution will propagate.
  await n8nApiService.triggerWorkflowExecution(
    workflowId,
    undefined /* no data */,
  );
  // If the above call does not throw, consider it a success from the perspective of this action.
  return {
    success: true,
    message: `Workflow "${workflowName}" was triggered successfully.`,
  };
}

/**
 * Triggers a specified workflow with a given JSON data payload.
 * @param workflowId - The ID of the workflow to trigger.
 * @param workflowName - The display name of the workflow, for feedback messages.
 * @param jsonDataString - A string containing the JSON data payload.
 * @returns A Promise resolving to a TriggerActionResult.
 * @throws Error if jsonDataString is invalid JSON, or if the underlying API call fails.
 */
export async function triggerWorkflowWithJson(
  workflowId: string,
  workflowName: string,
  jsonDataString: string,
): Promise<TriggerActionResult> {
  const { data: parsedJsonData, error: jsonParseError } =
    parseJsonInput(jsonDataString);

  if (jsonParseError) {
    // Handle JSON parsing error specifically before attempting API call.
    throw new Error(jsonParseError);
  }

  // Errors from n8nApiService.triggerWorkflowExecution will propagate.
  const apiResponseData = await n8nApiService.triggerWorkflowExecution(
    workflowId,
    parsedJsonData,
  );
  return {
    success: true,
    message: `Workflow "${workflowName}" triggered successfully with JSON data.`,
    responseDataToCopy: apiResponseData,
  };
}

/**
 * Fetches a list of workflow summaries, suitable for populating selection UI elements like dropdowns.
 * Fetches all workflows by default, regardless of their active status.
 * @returns A Promise resolving to an array of WorkflowSummary objects.
 * @throws Error if the underlying API call fails, allowing the caller to handle UI feedback.
 */
export async function getWorkflowsForSelection(): Promise<WorkflowSummary[]> {
  // Errors from n8nApiService.getWorkflowSummaries will propagate.
  return n8nApiService.getWorkflowSummaries("all");
}

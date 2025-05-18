// src/services/n8nApiService.ts
// This module handles all direct interactions with the n8n API.
import { Toast, getPreferenceValues, showToast } from "@raycast/api";
import axios from "axios";
import type {
  AxiosError,
  Method as AxiosMethod,
  AxiosRequestConfig,
} from "axios";
import type {
  N8nApiPathParams,
  Preferences,
  WorkflowFull,
  WorkflowSummary,
} from "../types";

/**
 * Defines the expected structure for a successful response from n8n API service operations
 * conducted by this module.
 * @template T - The type of the data payload within the response.
 */
export interface N8nApiResponse<T = unknown> {
  /** The data payload of the API response. */
  data: T;
  /** The HTTP status code of the response. */
  status: number;
  /** The HTTP status text of the response. */
  statusText: string;
}

/**
 * Represents the expected structure of an error object that might be returned
 * within the data payload of an n8n API error response.
 * Used internally for parsing more specific error messages.
 */
interface N8nErrorData {
  message: string;
  code?: number; // Optional: Some n8n errors might include a code.
  stack?: string; // Optional: Some n8n errors might include a stack trace.
  details?: Record<string, unknown>; // Optional: For any other details.
}

// --- Internal Helper Functions ---

// Validates that essential n8n preferences (URL and API token) are configured in Raycast.
async function validateN8nPreferences(): Promise<
  Pick<Preferences, "n8nWebhookUrl" | "apiToken">
> {
  const prefs = getPreferenceValues<Preferences>();
  if (!prefs.n8nWebhookUrl || !prefs.apiToken) {
    await showToast({
      style: Toast.Style.Failure,
      title: "n8n Configuration Error",
      message:
        "n8n Webhook URL or API Token is missing. Please configure them in extension preferences.",
    });
    throw new Error("n8n Webhook URL or API Token not configured.");
  }
  return prefs;
}

// Builds a query parameter object for n8n API requests based on provided N8nApiPathParams.
function buildN8nQueryParams(
  params?: N8nApiPathParams,
): Record<string, string> {
  const qp: Record<string, string> = {};
  if (!params) return qp;
  const { mode, workflowId, includedWorkflows } = params;
  if (mode) qp.mode = mode;
  if (workflowId) qp.workflowId = workflowId;
  if (includedWorkflows) qp.includedWorkflows = includedWorkflows;
  return qp;
}

// Constructs HTTP headers for n8n API requests, including Authorization and Content-Type if a body is present.
function buildN8nHeaders(
  apiToken: string,
  method: AxiosMethod,
  body?: unknown,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiToken}`,
  };
  const upperMethod = method.toUpperCase();
  if ((upperMethod === "POST" || upperMethod === "PUT") && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

// Assembles the complete Axios request configuration object.
function buildN8nAxiosConfig(
  url: string,
  method: AxiosMethod,
  headers: Record<string, string>,
  params: Record<string, string>,
  data?: unknown,
): AxiosRequestConfig {
  return { url, method, headers, params, data };
}

// Extracts a user-friendly error message from an AxiosError, prioritizing messages from the n8n API response data.
function extractN8nErrorMessage(err: AxiosError): string {
  const res = err.response;
  const defaultMessage = `n8n API Error: ${res?.status ?? "Unknown Status"} ${res?.statusText ?? "Unknown Status Text"}`;
  let detailedMessage = "";

  if (res?.data) {
    const errorData = res.data as Partial<N8nErrorData>;
    if (
      typeof errorData === "object" &&
      errorData !== null &&
      typeof errorData.message === "string" &&
      errorData.message.trim() !== ""
    ) {
      detailedMessage = errorData.message;
    } else if (typeof res.data === "string" && res.data.trim() !== "") {
      // Handle cases where the error response data is just a plain string.
      detailedMessage = res.data;
    }
  }

  if (detailedMessage) {
    return `${defaultMessage}: ${detailedMessage}`;
  }
  // Fallback if response data didn't provide a more specific message, but the Axios error message itself is informative.
  if (
    err.message &&
    !err.message.toLowerCase().includes("request failed with status code")
  ) {
    return err.message;
  }
  return defaultMessage;
}

// Core internal function for making HTTP requests to the n8n API and processing the response/errors.
async function baseN8nApiRequest<T = unknown>(
  method: AxiosMethod,
  pathParams?: N8nApiPathParams,
  requestBody?: unknown,
): Promise<N8nApiResponse<T>> {
  const { n8nWebhookUrl, apiToken } = await validateN8nPreferences();
  const queryParams = buildN8nQueryParams(pathParams);
  const headers = buildN8nHeaders(apiToken, method, requestBody);
  const config = buildN8nAxiosConfig(
    n8nWebhookUrl,
    method,
    headers,
    queryParams,
    requestBody,
  );

  try {
    const response = await axios(config);
    return {
      data: response.data as T,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(extractN8nErrorMessage(error));
    }
    // For non-Axios errors, ensure a standard Error object is thrown.
    if (error instanceof Error) {
      throw new Error(
        error.message || "An unexpected error occurred during the API request.",
      );
    }
    throw new Error("An unknown error occurred during the API request.");
  }
}

// --- Exported n8n API Service Functions ---

/**
 * Fetches a list of workflow summaries from the n8n instance.
 * Normalizes the response to always return an array, as the API might return a single object
 * if only one workflow matches the criteria.
 * @param filter - Optional. The status of workflows to fetch (active, inactive, or all). Defaults to "all".
 * @returns A Promise resolving to an array of WorkflowSummary objects.
 * @throws Error if the API request fails.
 */
export async function getWorkflowSummaries(
  filter: N8nApiPathParams["includedWorkflows"] = "all",
): Promise<WorkflowSummary[]> {
  const params: N8nApiPathParams = {
    mode: "summary",
    includedWorkflows: filter,
  };
  const response = await baseN8nApiRequest<WorkflowSummary[] | WorkflowSummary>(
    "GET",
    params,
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Handle cases where API might return a single object instead of an array.
  if (
    response.data &&
    typeof response.data === "object" &&
    "id" in response.data
  ) {
    return [response.data as WorkflowSummary];
  }
  return []; // Return empty array if data is not in expected format or is empty.
}

/**
 * Searches workflows by a potential ID or fetches workflows based on a filter.
 * If `searchText` resembles a workflow ID, it's used for a direct lookup.
 * Otherwise, this function relies on the API's behavior for the given filter without specific name searching.
 * @param filter - The status filter for workflows (e.g., "active", "all").
 * @param searchText - Optional. If it matches an ID pattern, it's used to fetch a specific workflow.
 * @returns A Promise resolving to an array of WorkflowSummary objects or a single WorkflowSummary if an ID match occurs.
 * @throws Error if the API request fails.
 */
export async function searchWorkflows(
  filter: N8nApiPathParams["includedWorkflows"],
  searchText?: string,
): Promise<WorkflowSummary[] | WorkflowSummary> {
  const params: N8nApiPathParams = {
    mode: "summary",
    includedWorkflows: filter,
  };
  // If searchText looks like an ID, pass it as workflowId for server-side lookup.
  if (searchText && /^[a-zA-Z0-9]{10,}$/.test(searchText)) {
    params.workflowId = searchText;
  }
  const response = await baseN8nApiRequest<WorkflowSummary[] | WorkflowSummary>(
    "GET",
    params,
  );
  // Returns the direct API response data, which could be a single object or an array.
  return response.data;
}

/**
 * Internal helper to normalize and validate the response for a single workflow detail request.
 * @param responseData - The data received from the API (WorkflowFull, array of WorkflowFull, or undefined/null).
 * @param requestedId - The ID of the workflow that was requested.
 * @returns The found WorkflowFull object if it matches the requestedId; otherwise, null.
 */
function normalizeAndValidateWorkflowDetails(
  responseData: WorkflowFull | WorkflowFull[] | undefined | null,
  requestedId: string,
): WorkflowFull | null {
  if (!responseData) {
    return null; // No data received.
  }

  let identifiedWorkflow: WorkflowFull | undefined;

  if (Array.isArray(responseData)) {
    // If API returns an array, find the specific workflow matching the requested ID.
    identifiedWorkflow = responseData.find((wf) => wf.id === requestedId);
    // If an array was returned but no ID matched, identifiedWorkflow will be undefined.
    // This scenario is handled by the checks below.
  } else if (
    typeof responseData === "object" &&
    responseData !== null &&
    "id" in responseData
  ) {
    // If API returns a single object.
    identifiedWorkflow = responseData as WorkflowFull;
  }
  // If responseData was not a recognizable workflow object or array, identifiedWorkflow remains undefined.

  if (!identifiedWorkflow) {
    // No identifiable workflow structure found, or an empty array, or an array without the matching ID.
    return null;
  }

  // We have an identifiedWorkflow object; now validate its ID.
  if (identifiedWorkflow.id === requestedId) {
    return identifiedWorkflow; // Correct workflow found and validated.
  }

  // Identified workflow's ID does not match the requested ID, which is unexpected for a 'full' mode request by ID.
  console.warn(
    `n8nApiService: API returned data for workflow ID "${identifiedWorkflow.id}", but ID "${requestedId}" was requested for full details. Discarding mismatched data.`,
  );
  return null;
}

/**
 * Fetches the full details for a specific workflow by its ID.
 * @param workflowId - The ID of the workflow to fetch. Must be a non-empty string.
 * @returns A Promise resolving to the WorkflowFull object, or null if not found or if the API response is inconsistent.
 * @throws Error if the API request itself fails (e.g., network error, auth error).
 */
export async function getWorkflowDetails(
  workflowId: string,
): Promise<WorkflowFull | null> {
  if (!workflowId) {
    // Prevent API call if workflowId is not provided.
    return null;
  }
  const params: N8nApiPathParams = { mode: "full", workflowId };
  // Errors from baseN8nApiRequest (like network or auth issues) will propagate.
  const response = await baseN8nApiRequest<WorkflowFull | WorkflowFull[]>(
    "GET",
    params,
  );
  return normalizeAndValidateWorkflowDetails(response.data, workflowId);
}

/**
 * Triggers a specific workflow execution by its ID.
 * @param workflowId - The ID of the workflow to trigger.
 * @param data - Optional. The data payload (typically an object) to send with the trigger request.
 * @returns A Promise resolving to the raw response data from the API (type unknown).
 * @throws Error if the API request fails.
 */
export async function triggerWorkflowExecution(
  workflowId: string,
  data?: unknown,
): Promise<unknown> {
  const pathParams: N8nApiPathParams = { workflowId };
  const response = await baseN8nApiRequest<unknown>("POST", pathParams, data);
  // Returns the data part of the API response, which can be any structure.
  return response.data;
}

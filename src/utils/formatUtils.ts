// src/utils/formatUtils.ts
// Helper functions for data formatting and display.
import type { Preferences } from "../types"

/**
 * @private
 * Converts various types of response data into a standardized string representation,
 * primarily for being copied to the clipboard.
 * Handles null, undefined, strings, objects (JSON stringified), and other primitives.
 * @param responseData - The data to be stringified.
 * @returns A string representation of the data, or an error message string if stringification fails.
 */
function _convertResponseToStringForCopy(responseData: unknown): string {
  if (responseData === null || responseData === undefined) {
    return ""
  }
  if (typeof responseData === "string") {
    return responseData
  }
  if (typeof responseData === "object") {
    try {
      return JSON.stringify(responseData, null, 2)
    } catch (e) {
      return "[Error: Could not stringify response object]"
    }
  }
  // For other types (boolean, number, etc.), attempt to convert to string.
  try {
    return String(responseData)
  } catch (e) {
    return "[Error: Could not convert response to string]"
  }
}

/**
 * Formats the response message from a workflow trigger attempt for user display.
 * @param responseData - The data received from the API after a trigger attempt.
 * @param status - The HTTP status code of the API response.
 * @param statusText - The HTTP status text of the API response.
 * @param workflowDisplayName - The display name of the workflow that was triggered.
 * @returns An object containing a user-friendly `message` and the `fullResponseForCopy` string.
 */
export function formatTriggerResponseMessage(
  responseData: unknown,
  status: number,
  statusText: string,
  workflowDisplayName: string,
): { message: string; fullResponseForCopy: string } {
  const fullResponseForCopy = _convertResponseToStringForCopy(responseData)
  const SANE_STATUS_TEXT_LIMIT = 50
  // Sanitize statusText to prevent overly long messages from unusual API responses.
  const sanitizedStatusText =
    statusText && statusText.length < SANE_STATUS_TEXT_LIMIT ? statusText : ""

  let responseMessage: string

  if (status >= 200 && status < 300) {
    responseMessage = `Workflow "${workflowDisplayName}" triggered successfully (Status: ${status}).`
  } else {
    const statusPart = `Status: ${status}${sanitizedStatusText ? ` ${sanitizedStatusText}` : ""}`
    responseMessage = `Workflow "${workflowDisplayName}" trigger attempt finished (${statusPart}). Check details if an error occurred.`
  }

  return { message: responseMessage, fullResponseForCopy }
}

/**
 * Extracts the base URL (protocol and host) from the n8n webhook URL stored in preferences.
 * @param preferences - The Raycast preferences object containing `n8nWebhookUrl`.
 * @returns The base URL (e.g., "https://n8n.yourdomain.com") or an empty string if parsing fails or URL is not set.
 */
export function getN8nInstanceBaseUrl(preferences: Preferences): string {
  if (preferences.n8nWebhookUrl) {
    try {
      const parsedUrl = new URL(preferences.n8nWebhookUrl)
      return `${parsedUrl.protocol}//${parsedUrl.host}`
    } catch (e) {
      // Intentionally suppress error logging here; empty string return indicates failure.
      return ""
    }
  }
  return ""
}

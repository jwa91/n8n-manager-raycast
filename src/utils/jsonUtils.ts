// src/utils/jsonUtils.ts
// Helper functions for JSON processing

/**
 * Parses a JSON string and returns the parsed data or an error message.
 * If the input string is empty or whitespace, it returns undefined data.
 * @param jsonStr The JSON string to parse.
 * @returns An object with 'data' (parsed JSON) or 'error' (error message).
 */
export function parseJsonInput(jsonStr: string): { data?: unknown; error?: string } {
  if (jsonStr.trim() === "") {
    return { data: undefined } // Successfully "parsed" an empty input as no data
  }
  try {
    return { data: JSON.parse(jsonStr) }
  } catch (e) {
    // Check if the error is an instance of Error to safely access its message property
    const errorMessage = e instanceof Error ? e.message : "Unknown JSON parsing error"
    return { error: `Invalid JSON format: ${errorMessage}. Please correct or leave empty.` }
  }
}

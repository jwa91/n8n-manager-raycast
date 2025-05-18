// src/views/TriggerWorkflowFormView.tsx
// This view component renders the form used to trigger an n8n workflow, optionally with JSON data.

import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  Icon,
  type Toast,
  useNavigation,
} from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import * as workflowActions from "../logic/workflowActions";
import type { TriggerActionResult, WorkflowSummary } from "../types";
import { parseJsonInput } from "../utils/jsonUtils";
import {
  hideToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "../utils/toastUtils";

/**
 * Props for the `TriggerWorkflowFormView` component.
 */
export interface TriggerWorkflowFormViewProps {
  /** Optional: The ID of the workflow to pre-select in the form. */
  initialWorkflowId?: string;
  /** Optional: The name of the workflow to display if `initialWorkflowId` is provided,
   * useful before the full workflow list is loaded. */
  initialWorkflowName?: string;
}

/**
 * Internal helper to determine the selected workflow ID.
 * Prioritizes `initialPropId`, then validates `currentSelectedId` against `WorkspaceedWorkflows`,
 * then defaults to the first fetched workflow, or retains `currentSelectedId` / empty.
 * @param fetchedWorkflows - The list of available workflows.
 * @param currentSelectedId - The currently selected workflow ID in the state.
 * @param initialPropId - The initial workflow ID passed as a prop.
 * @returns The ID of the workflow to be selected.
 */
function determineNewSelectedWorkflowId(
  fetchedWorkflows: WorkflowSummary[],
  currentSelectedId: string | undefined,
  initialPropId: string | undefined,
): string {
  if (initialPropId) {
    return initialPropId;
  }
  if (fetchedWorkflows.length > 0) {
    const isCurrentStillValid = fetchedWorkflows.some(
      (wf) => wf.id === currentSelectedId,
    );
    if (currentSelectedId && isCurrentStillValid) {
      return currentSelectedId;
    }
    return fetchedWorkflows[0].id; // Default to first if current is invalid or not set.
  }
  return currentSelectedId || ""; // Fallback if no workflows fetched or retain current.
}

/**
 * Internal helper to display success feedback toast after a workflow trigger
 * and then navigate back.
 * @param result - The result object from the trigger action.
 * @param workflowDisplayName - The name of the triggered workflow for display.
 * @param popNavigation - Callback to pop the current view from navigation stack.
 */
async function showTriggerSuccessFeedback(
  result: TriggerActionResult,
  workflowDisplayName: string,
  popNavigation: () => void,
) {
  let fullResponseForCopy = "";
  if (result.responseDataToCopy !== undefined) {
    try {
      fullResponseForCopy = JSON.stringify(result.responseDataToCopy, null, 2);
    } catch {
      // Fallback to string conversion if JSON.stringify fails (e.g., for non-plain objects).
      fullResponseForCopy = String(result.responseDataToCopy);
    }
  }

  if (fullResponseForCopy) {
    await showSuccessToast(workflowDisplayName, result.message, {
      title: "Copy Full Response",
      onAction: (toastInstance) => {
        Clipboard.copy(fullResponseForCopy);
        toastInstance.title = "Response Copied!";
      },
    });
  } else {
    await showSuccessToast(workflowDisplayName, result.message);
  }
  popNavigation();
}

/**
 * A Raycast Form view for selecting an n8n workflow and optionally providing JSON data to trigger it.
 * It handles fetching workflows for selection, input validation, and orchestrating the trigger action.
 */
export function TriggerWorkflowFormView(props: TriggerWorkflowFormViewProps) {
  const { initialWorkflowId, initialWorkflowName } = props;
  const { pop } = useNavigation(); // Hook for programmatic navigation.

  // State for the list of available workflows in the dropdown.
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  // State to manage the loading indicator for the workflow dropdown.
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState<boolean>(true);
  // State for the currently selected workflow ID in the dropdown.
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    initialWorkflowId || "",
  );
  // State for the JSON data input by the user.
  const [jsonData, setJsonData] = useState<string>("");
  // State for displaying any validation errors related to the JSON input.
  const [jsonDataError, setJsonDataError] = useState<string | undefined>();

  // Effect to load workflows for the dropdown when the component mounts or initialWorkflowId changes.
  useEffect(() => {
    const fetchAndSetWorkflows = async () => {
      setIsLoadingWorkflows(true);
      try {
        const fetched = await workflowActions.getWorkflowsForSelection();
        setWorkflows(fetched);
        setSelectedWorkflowId((currentId) =>
          determineNewSelectedWorkflowId(fetched, currentId, initialWorkflowId),
        );
      } catch (error) {
        showErrorToast(
          "Failed to load workflows",
          error instanceof Error ? error.message : String(error),
        );
        setWorkflows([]); // Clear workflows on error to prevent stale data.
      } finally {
        setIsLoadingWorkflows(false);
      }
    };
    fetchAndSetWorkflows();
    // This effect depends on initialWorkflowId to re-fetch/re-evaluate if a specific workflow is passed.
  }, [initialWorkflowId]);

  // Memoized function to get the display name of the currently selected workflow.
  const getSelectedWorkflowDisplayName = useCallback((): string => {
    const selectedWF = workflows.find((wf) => wf.id === selectedWorkflowId);
    // Prioritize initialWorkflowName if it matches the ID, useful if workflows list is loading.
    if (selectedWorkflowId === initialWorkflowId && initialWorkflowName) {
      return initialWorkflowName;
    }
    return (
      selectedWF?.name ||
      initialWorkflowName ||
      selectedWorkflowId ||
      "Selected Workflow"
    );
  }, [workflows, selectedWorkflowId, initialWorkflowId, initialWorkflowName]);

  // Handles the core logic of submitting the workflow trigger request.
  const performSubmit = async () => {
    const workflowDisplayName = getSelectedWorkflowDisplayName();
    let loadingToastInstance: Toast | undefined;

    try {
      loadingToastInstance = await showLoadingToast(
        `Triggering: ${workflowDisplayName}...`,
      );
      const result = await workflowActions.triggerWorkflowWithJson(
        selectedWorkflowId,
        workflowDisplayName,
        jsonData,
      );
      if (loadingToastInstance) await hideToast(loadingToastInstance); // Hide loading toast before showing success/error.
      await showTriggerSuccessFeedback(result, workflowDisplayName, pop);
    } catch (error) {
      if (loadingToastInstance) await hideToast(loadingToastInstance);
      await showErrorToast(
        `Failed to trigger ${workflowDisplayName}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  // Validates inputs and then calls performSubmit.
  const handleSubmit = async () => {
    if (!selectedWorkflowId) {
      await showErrorToast(
        "No Workflow Selected",
        "Please select a workflow to trigger.",
      );
      return;
    }
    const { error: jsonParseErrorVal } = parseJsonInput(jsonData); // Validate JSON input.
    if (jsonParseErrorVal) {
      setJsonDataError(jsonParseErrorVal);
      return;
    }
    setJsonDataError(undefined); // Clear any previous JSON error.
    await performSubmit();
  };

  // Validates JSON input when the text area loses focus.
  const handleJsonBlur = useCallback(() => {
    if (jsonData.trim() === "") {
      setJsonDataError(undefined); // Clear error if input is empty.
      return;
    }
    const { error: jsonErrorOnBlur } = parseJsonInput(jsonData);
    setJsonDataError(jsonErrorOnBlur);
  }, [jsonData]); // Depends on the current jsonData.

  // Determines the navigation title based on the selected workflow.
  const currentWorkflowForTitle = workflows.find(
    (wf) => wf.id === selectedWorkflowId,
  );
  const navigationTitleDisplay =
    currentWorkflowForTitle?.name ||
    (selectedWorkflowId === initialWorkflowId
      ? initialWorkflowName
      : undefined) || // Use initial name if selection matches and list not fully resolved
    "Trigger n8n Workflow";

  return (
    <Form
      isLoading={isLoadingWorkflows}
      navigationTitle={
        navigationTitleDisplay !== "Trigger n8n Workflow" // Avoid "Trigger: Trigger n8n Workflow"
          ? `Trigger: ${navigationTitleDisplay}`
          : navigationTitleDisplay
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Trigger Workflow"
            icon={Icon.Play}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="selectedWorkflowId"
        title="Workflow to Trigger"
        value={selectedWorkflowId}
        onChange={setSelectedWorkflowId}
        storeValue={!initialWorkflowId} // Persist selection if not initially set by props.
        error={
          !isLoadingWorkflows && workflows.length > 0 && !selectedWorkflowId
            ? "Please select a workflow"
            : undefined
        }
      >
        {/* Option to show the initial workflow if it's not yet in the loaded list (e.g., during initial load). */}
        {initialWorkflowId &&
          initialWorkflowName &&
          !workflows.some((wf) => wf.id === initialWorkflowId) && (
            <Form.Dropdown.Item
              value={initialWorkflowId}
              title={`${initialWorkflowName} (Pre-selected)`}
              key="initial-preselected" // Unique key for this potential item.
            />
          )}
        {workflows.map((wf) => (
          <Form.Dropdown.Item key={wf.id} value={wf.id} title={wf.name} />
        ))}
        {/* Placeholder if loading and an initial workflow is expected but not yet in the 'workflows' state. */}
        {isLoadingWorkflows &&
          initialWorkflowId &&
          initialWorkflowName &&
          workflows.length === 0 && (
            <Form.Dropdown.Item
              value={initialWorkflowId}
              title={`${initialWorkflowName} (Loading...)`}
              key="initial-loading"
            />
          )}
      </Form.Dropdown>

      <Form.TextArea
        id="jsonData"
        title="JSON Data Payload (Optional)"
        placeholder={'e.g., {"key": "value"}. Leave empty if no data needed.'}
        info="This will be sent as the request body to your n8n trigger (if provided)."
        value={jsonData}
        onChange={setJsonData}
        error={jsonDataError}
        onBlur={handleJsonBlur} // Provide live validation feedback.
      />
    </Form>
  );
}

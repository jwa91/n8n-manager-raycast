// src/commands/list-workflows.command.tsx
// This file defines the Raycast command for listing, searching, and managing n8n workflows.

import { type Toast, getPreferenceValues, useNavigation } from "@raycast/api"
import { useCallback, useEffect, useMemo, useState } from "react"
import * as workflowActions from "../logic/workflowActions"
import type {
  N8nApiPathParams,
  Preferences,
  QuickTriggerActionResult,
  WorkflowSummary,
} from "../types"
import { getN8nInstanceBaseUrl } from "../utils/formatUtils"
import { hideToast, showErrorToast, showLoadingToast, showSuccessToast } from "../utils/toastUtils"

import { TriggerWorkflowFormView } from "../views/TriggerWorkflowFormView"
import { WorkflowDetailView } from "../views/WorkflowDetailView"
import { WorkflowListView } from "../views/WorkflowListView"

/**
 * Normalizes the result from `workflowActions.listWorkflows` (which can be an array or single object)
 * into an array of WorkflowSummary for consistent state management.
 * @param result - The data returned from `workflowActions.listWorkflows`.
 * @param setStateCallback - The React state setter function for the workflows list.
 */
function updateWorkflowsStateFromResult(
  result: WorkflowSummary[] | WorkflowSummary | undefined,
  setStateCallback: React.Dispatch<React.SetStateAction<WorkflowSummary[]>>,
) {
  if (Array.isArray(result)) {
    setStateCallback(result)
  } else if (result && typeof result === "object" && "id" in result) {
    // API might return a single object if an ID search was performed.
    setStateCallback([result as WorkflowSummary])
  } else {
    // Default to an empty array if the result is unexpected or undefined.
    setStateCallback([])
  }
}

/**
 * Raycast command component for listing and interacting with n8n workflows.
 * It handles fetching workflow data, managing search and filter states,
 * and orchestrating actions like triggering or inspecting workflows.
 */
export default function ListWorkflowsCommand() {
  // State for all workflows fetched based on current filter (before client-side name search)
  const [allFetchedWorkflows, setAllFetchedWorkflows] = useState<WorkflowSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>("") // Manages search input
  const [activeFilter, setActiveFilter] = useState<N8nApiPathParams["includedWorkflows"]>("active")

  const { push } = useNavigation() // For navigating to other views
  const preferences = getPreferenceValues<Preferences>()
  const n8nInstanceHost = getN8nInstanceBaseUrl(preferences)

  // Effect to fetch workflows when the active filter or search text changes.
  useEffect(() => {
    const performLoadWorkflows = async () => {
      setIsLoading(true)
      try {
        const result = await workflowActions.listWorkflows(activeFilter, searchText)
        updateWorkflowsStateFromResult(result, setAllFetchedWorkflows)
      } catch (error) {
        showErrorToast(
          "Failed to fetch workflows",
          error instanceof Error ? error.message : String(error),
        )
        setAllFetchedWorkflows([]) // Ensure list is cleared on error.
      } finally {
        setIsLoading(false)
      }
    }

    performLoadWorkflows()
  }, [activeFilter, searchText]) // Re-fetches if filter or search text changes.

  // Memoized derivation of workflows to display, applying client-side name filtering
  // if searchText is not an ID pattern (ID search is handled by the API/logic layer).
  const displayedWorkflows = useMemo(() => {
    if (searchText && !/^[a-zA-Z0-9]{10,}$/.test(searchText)) {
      // Apply client-side name filtering if searchText is not ID-like.
      return allFetchedWorkflows.filter((wf) =>
        wf.name.toLowerCase().includes(searchText.toLowerCase()),
      )
    }
    // If searchText is ID-like or empty, show all fetched workflows (already filtered by ID if applicable).
    return allFetchedWorkflows
  }, [allFetchedWorkflows, searchText])

  // Handles the "Quick Execute" action for a workflow.
  const handleQuickExecute = async (workflow: WorkflowSummary) => {
    let loadingToastInstance: Toast | undefined
    try {
      loadingToastInstance = await showLoadingToast(`Executing: ${workflow.name}...`)
      const result: QuickTriggerActionResult = await workflowActions.quickTriggerWorkflow(
        workflow.id,
        workflow.name,
      )

      if (loadingToastInstance) await hideToast(loadingToastInstance)

      if (result.success) {
        await showSuccessToast("Workflow Executed", result.message)
      } else {
        // This case handles if the action might return success: false, though current stub throws.
        await showErrorToast(
          "Execution Problem",
          result.message || `Problem triggering ${workflow.name}.`,
        )
      }
    } catch (error) {
      // Catches errors thrown by workflowActions.quickTriggerWorkflow (e.g., API failures).
      if (loadingToastInstance) await hideToast(loadingToastInstance)
      await showErrorToast(
        `Failed to execute ${workflow.name}`,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  // Navigates to the form for triggering a workflow with JSON data.
  const handleExecuteWithJson = useCallback(
    (workflow: WorkflowSummary) => {
      push(
        <TriggerWorkflowFormView
          initialWorkflowId={workflow.id}
          initialWorkflowName={workflow.name}
        />,
      )
    },
    [push], // push is a stable function from useNavigation
  )

  // Navigates to the detail view for inspecting a workflow.
  const handleInspect = useCallback(
    (workflow: WorkflowSummary) => {
      push(<WorkflowDetailView workflowId={workflow.id} workflowName={workflow.name} />)
    },
    [push], // push is a stable function from useNavigation
  )

  return (
    <WorkflowListView
      workflows={displayedWorkflows}
      isLoading={isLoading}
      searchText={searchText}
      currentFilter={activeFilter}
      n8nInstanceHost={n8nInstanceHost}
      onSearchTextChange={setSearchText}
      onFilterChange={setActiveFilter}
      onQuickExecute={handleQuickExecute}
      onExecuteWithJson={handleExecuteWithJson}
      onInspect={handleInspect}
    />
  )
}

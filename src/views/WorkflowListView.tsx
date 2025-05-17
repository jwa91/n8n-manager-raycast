// src/views/WorkflowListView.tsx
// This view component is responsible for rendering the list of n8n workflows.

import { Icon, List } from "@raycast/api"
import { WorkflowListItem } from "../components/WorkflowListItem"
import type { N8nApiPathParams, WorkflowSummary } from "../types"

/**
 * Props for the `WorkflowListView` component.
 */
export interface WorkflowListViewProps {
  /** An array of workflow summaries to be displayed in the list. */
  workflows: WorkflowSummary[]
  /** Boolean indicating whether the list is currently in a loading state. */
  isLoading: boolean
  /** Optional: The current search text entered by the user, managed by the parent command. */
  searchText?: string
  /** The currently active filter for workflow status (e.g., "active", "inactive", "all"). */
  currentFilter: N8nApiPathParams["includedWorkflows"]
  /** The base URL of the n8n instance, used for "Open in n8n" links within list items. */
  n8nInstanceHost: string
  /** Callback function invoked when the search text changes. */
  onSearchTextChange: (text: string) => void
  /** Callback function invoked when the workflow status filter changes. */
  onFilterChange: (newFilter: N8nApiPathParams["includedWorkflows"]) => void
  /** Callback function for handling the "Quick Execute" action on a workflow item. */
  onQuickExecute: (workflow: WorkflowSummary) => void
  /** Callback function for handling the "Execute with JSON" action on a workflow item. */
  onExecuteWithJson: (workflow: WorkflowSummary) => void
  /** Callback function for handling the "Inspect Workflow" action on a workflow item. */
  onInspect: (workflow: WorkflowSummary) => void
}

/**
 * A presentational React component that renders a Raycast List view for n8n workflows.
 * It displays workflows using `WorkflowListItem` and includes controls for searching and filtering.
 * All data and action handlers are received via props from a parent command component.
 */
export function WorkflowListView(props: WorkflowListViewProps) {
  const {
    workflows,
    isLoading,
    searchText,
    currentFilter,
    n8nInstanceHost,
    onSearchTextChange,
    onFilterChange,
    onQuickExecute,
    onExecuteWithJson,
    onInspect,
  } = props

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={onSearchTextChange}
      throttle // Enables throttling for search text input to optimize performance.
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter displayed workflows by status"
          value={currentFilter}
          onChange={(newValue) => {
            // newValue is guaranteed to be one of the N8nApiPathParams["includedWorkflows"] values
            // based on the Dropdown.Item values provided.
            onFilterChange(newValue as N8nApiPathParams["includedWorkflows"])
          }}
        >
          <List.Dropdown.Item title="Active Workflows" value="active" icon={Icon.PlayFilled} />
          <List.Dropdown.Item title="Inactive Workflows" value="inactive" icon={Icon.Pause} />
          <List.Dropdown.Item title="All Workflows" value="all" icon={Icon.BulletPoints} />
        </List.Dropdown>
      }
    >
      {workflows.length === 0 && !isLoading ? (
        // Display an empty view message if no workflows match and not currently loading.
        <List.EmptyView
          title="No Workflows Found"
          description={
            searchText
              ? "No workflows match your search criteria."
              : `No ${currentFilter} workflows found.`
          }
          icon={Icon.Warning}
        />
      ) : (
        // Map over the workflows array to render each item using WorkflowListItem.
        workflows.map((wf) => (
          <WorkflowListItem
            key={wf.id} // React key for list items.
            workflow={wf}
            n8nInstanceHost={n8nInstanceHost}
            onQuickExecute={onQuickExecute}
            onExecuteWithJson={onExecuteWithJson}
            onInspect={onInspect}
          />
        ))
      )}
    </List>
  )
}

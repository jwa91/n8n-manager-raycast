// src/components/WorkflowListItem.tsx
// This component renders a single item in the workflow list.

import { Action, ActionPanel, Color, Icon, List } from "@raycast/api"
import type { WorkflowSummary } from "../types"

/**
 * Props for the `WorkflowListItem` component.
 */
export interface WorkflowListItemProps {
  /** The workflow data to display. */
  workflow: WorkflowSummary
  /** The base URL of the n8n instance, used for generating "Open in n8n" links. */
  n8nInstanceHost: string
  /** Callback function to execute when the 'Quick Execute' action is triggered. */
  onQuickExecute: (workflow: WorkflowSummary) => void
  /** Callback function to execute when the 'Execute with JSON' action is triggered. */
  onExecuteWithJson: (workflow: WorkflowSummary) => void
  /** Callback function to execute when the 'Inspect Workflow' action is triggered. */
  onInspect: (workflow: WorkflowSummary) => void
}

/**
 * A React component that renders a single workflow item for display in a Raycast List.
 * It shows workflow details like name, ID, status, and creation date, along with relevant actions.
 */
export function WorkflowListItem({
  workflow,
  n8nInstanceHost,
  onQuickExecute,
  onExecuteWithJson,
  onInspect,
}: WorkflowListItemProps) {
  // Construct accessories for the list item, such as status tag and creation date.
  const accessories = [
    {
      tag: {
        value: workflow.active ? "Active" : "Inactive",
        color: workflow.active ? Color.Green : Color.Red,
      },
      tooltip: workflow.active ? "Workflow is Active" : "Workflow is Inactive",
    },
    workflow.createdAt
      ? {
          icon: Icon.Calendar,
          date: new Date(workflow.createdAt),
          tooltip: `Created At: ${new Date(workflow.createdAt).toLocaleString()}`,
        }
      : null,
  ].filter(Boolean) as List.Item.Accessory[] // Ensures only non-null accessories are passed

  return (
    <List.Item
      title={workflow.name}
      subtitle={`ID: ${workflow.id}`}
      accessories={accessories}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Workflow Actions">
            <Action
              title="Execute Workflow (Quick)"
              icon={Icon.Bolt}
              onAction={() => onQuickExecute(workflow)}
            />
            <Action
              title="Execute Workflow with JSON..."
              icon={Icon.Play}
              onAction={() => onExecuteWithJson(workflow)}
            />
            <Action
              title="Inspect Workflow..."
              icon={Icon.BlankDocument}
              onAction={() => onInspect(workflow)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="General">
            {n8nInstanceHost && (
              <Action.OpenInBrowser
                title="Open in n8n"
                icon={Icon.Globe}
                url={`${n8nInstanceHost}/workflow/${workflow.id}`}
              />
            )}
            <Action.CopyToClipboard
              title="Copy Workflow ID"
              content={workflow.id}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
              icon={Icon.CopyClipboard}
            />
            {n8nInstanceHost && (
              <Action.OpenInBrowser
                title="Open n8n Instance Home"
                url={n8nInstanceHost}
                icon={Icon.House}
                shortcut={{ modifiers: ["opt", "shift"], key: "h" }}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  )
}

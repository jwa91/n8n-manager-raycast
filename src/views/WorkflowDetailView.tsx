// src/views/WorkflowDetailView.tsx
// This view component displays detailed information about a single n8n workflow.

import {
  Action,
  ActionPanel,
  Color,
  Detail,
  Icon,
  getPreferenceValues,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import * as workflowActions from "../logic/workflowActions";
import type { Preferences, WorkflowFull } from "../types";
import { getN8nInstanceBaseUrl } from "../utils/formatUtils";
import { showErrorToast } from "../utils/toastUtils";

/**
 * Props for the `WorkflowDetailView` component.
 */
export interface WorkflowDetailViewProps {
  /** The unique identifier of the workflow to display details for. */
  workflowId: string;
  /** Optional: The name of the workflow, used for an initial title display while data is loading. */
  workflowName?: string;
}

/**
 * A Raycast Detail view component that fetches and displays comprehensive information
 * about a specific n8n workflow, using the metadata panel for structured details.
 */
export function WorkflowDetailView(props: WorkflowDetailViewProps) {
  const { workflowId, workflowName: initialWorkflowNameFromProps } = props;

  const [workflow, setWorkflow] = useState<WorkflowFull | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const preferences = getPreferenceValues<Preferences>();
  const n8nInstanceHost = getN8nInstanceBaseUrl(preferences);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!workflowId) {
        setWorkflow(null);
        setIsLoading(false);
        showErrorToast(
          "Error Displaying Workflow",
          "No Workflow ID was provided to the detail view.",
        );
        return;
      }

      setIsLoading(true);
      setWorkflow(null);
      try {
        const fetchedWorkflow =
          await workflowActions.getWorkflowDetails(workflowId);
        setWorkflow(fetchedWorkflow);
      } catch (error) {
        showErrorToast(
          `Failed to fetch details for ${initialWorkflowNameFromProps || workflowId}`,
          error instanceof Error ? error.message : String(error),
        );
        setWorkflow(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [workflowId, initialWorkflowNameFromProps]);

  const markdownContent = useMemo(() => {
    if (isLoading) {
      return `Loading details for ${initialWorkflowNameFromProps || `workflow ID: ${workflowId}`}...`;
    }
    if (!workflow) {
      return `# Error\n\nDetails for workflow ID \`${workflowId}\` could not be retrieved or found. Please check the ID or your connection.`;
    }
    // Main content is just the workflow name; details are in metadata.
    return `# ${workflow.name}`;
  }, [workflow, isLoading, workflowId, initialWorkflowNameFromProps]);

  const navigationTitle =
    workflow?.name || initialWorkflowNameFromProps || `Workflow ${workflowId}`;

  const nodeCount = workflow?.nodes?.length ?? 0;
  const connectionCount = useMemo(() => {
    if (!workflow?.connections) return 0;
    return Object.values(workflow.connections).reduce(
      (totalConnections, nodeConnections) =>
        totalConnections +
        Object.values(nodeConnections).reduce(
          (countInNode, outputTargetsArray) =>
            countInNode + (outputTargetsArray?.flat().length ?? 0),
          0,
        ),
      0,
    );
  }, [workflow?.connections]);

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdownContent}
      navigationTitle={navigationTitle}
      metadata={
        workflow && !isLoading ? (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="ID"
              text={workflow.id}
              icon={Icon.Hashtag}
            />
            <Detail.Metadata.Label
              title="Active"
              text={
                workflow.active
                  ? { value: "Yes", color: Color.Green }
                  : { value: "No", color: Color.Red }
              }
              icon={
                workflow.active
                  ? { source: Icon.CheckCircle, tintColor: Color.Green }
                  : { source: Icon.XMarkCircle, tintColor: Color.Red }
              }
            />
            <Detail.Metadata.Label
              title="Created At"
              text={new Date(workflow.createdAt).toLocaleString()}
              icon={Icon.Calendar}
            />
            <Detail.Metadata.Label
              title="Updated At"
              text={new Date(workflow.updatedAt).toLocaleString()}
              icon={Icon.Calendar}
            />
            <Detail.Metadata.Separator />
            <Detail.Metadata.Label
              title="Nodes"
              text={String(nodeCount)}
              icon={Icon.BulletPoints}
            />
            <Detail.Metadata.Label
              title="Connections"
              text={String(connectionCount)}
              icon={Icon.Link}
            />
            {workflow.tags && workflow.tags.length > 0 && (
              <>
                <Detail.Metadata.Separator />
                <Detail.Metadata.TagList title="Tags">
                  {workflow.tags.map((tag) => (
                    <Detail.Metadata.TagList.Item
                      key={tag.id}
                      text={tag.name}
                    />
                  ))}
                </Detail.Metadata.TagList>
              </>
            )}
            {n8nInstanceHost && (
              <>
                <Detail.Metadata.Separator />
                <Detail.Metadata.Link
                  title="Open in n8n"
                  target={`${n8nInstanceHost}/workflow/${workflow.id}`}
                  text="View Workflow Online"
                />
              </>
            )}
          </Detail.Metadata>
        ) : null
      }
      actions={
        workflow && !isLoading ? (
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Full JSON"
              content={JSON.stringify(workflow, null, 2)}
              icon={Icon.CopyClipboard}
            />
            <Action.CopyToClipboard
              title="Copy Workflow ID"
              content={workflow.id}
              icon={Icon.Tag}
              shortcut={{ modifiers: ["cmd", "shift"], key: "i" }}
            />
          </ActionPanel>
        ) : null
      }
    />
  );
}

# n8n Raycast Extension Roadmap - Phase 1

## To-Do List

### Improve WorkflowDetailView.tsx

- [ ] Refactor `WorkflowDetailView.tsx` to use `<Detail.Metadata.Label>` for ID, Active, Created At, Updated At.
- [ ] Add `<Detail.Metadata.TagList>` to `WorkflowDetailView.tsx` for displaying workflow tags.
- [ ] Display node count and connection count using `<Detail.Metadata.Label>` in `WorkflowDetailView.tsx`.
- [ ] Add `<Detail.Metadata.Separator>` for visual grouping in `WorkflowDetailView.tsx`.
- [ ] Add "Open in n8n" link using `<Detail.Metadata.Link>` in `WorkflowDetailView.tsx`.

### Favourites feature

- [ ] Implement "Add to Favorites" action in `WorkflowListItem.tsx`.
- [ ] Implement "Remove from Favorites" action in `WorkflowListItem.tsx`.
- [ ] Implement "Add to Favorites" / "Remove from Favorites" action in `WorkflowDetailView.tsx`.
- [ ] Use Raycast `LocalStorage` to store and retrieve favorite workflow IDs.
- [ ] Add a "Favorites" filter option to `WorkflowListView.tsx`'s search bar accessory.
- [ ] Add a new command "Show Favorite Workflows" (or integrate into existing list view filter).
- [ ] **[Research]** Investigate Raycast capabilities for dynamically assigning hotkeys to specific workflows (for favorites).

### API modifications needed

- [ ] Add API call in `n8nApiService.ts` to toggle workflow active status (activate).
- [ ] Add API call in `n8nApiService.ts` to toggle workflow active status (deactivate).
- [ ] Implement logic in `workflowActions.ts` for activating/deactivating workflows.
- [ ] Add "Activate Workflow" / "Deactivate Workflow" actions in `WorkflowListItem.tsx`.
- [ ] Add "Activate Workflow" / "Deactivate Workflow" actions in `WorkflowDetailView.tsx`.
- [ ] Update UI (optimistically or re-fetch) after toggling workflow status.
- [ ] Add API call in `n8nApiService.ts` to fetch workflow executions.
- [ ] Implement logic in `workflowActions.ts` for fetching workflow executions.
- [ ] Design and implement UI for displaying workflow executions (e.g., in `WorkflowDetailView` or a new view).

## Future Ideas / Backlog

- Display workflow diagram (Mermaid to Image).
- Show latest execution status directly on `WorkflowListItem`.
- Implement a "View Executions" action on `WorkflowListItem` navigating to a detailed execution list.
- Display detailed execution logs/data.
- Add ability to create basic workflows via API.
- Manage workflow tags (add/remove).
- Global search for other n8n elements (credentials, etc.).
- Dashboard/Summary view for n8n instance.
- More informative/contextual toasts with "Copy Error Details" action.
- Robust validation for user preferences (e.g., URL format).
- Optimistic UI updates for more actions.
- API service robustness (retry logic).
- Caching for API responses to improve performance.
- Real-time updates for workflow status/executions (Advanced).
- Refine `TriggerWorkflowFormView` with JSON templates/snippets.
- Refine `TriggerWorkflowFormView` to remember last used JSON per workflow.
- Consider a dedicated "View Workflow Executions" command.
- Offer to copy full workflow JSON directly from the `WorkflowDetailView` (if not already obvious/easy).
- Add direct links to specific n8n instance pages (e.g., credentials, general logs).
- Workflow execution log streaming (Advanced).

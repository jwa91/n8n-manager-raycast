# n8n Manager for Raycast

> Search and execute n8n workflows directly from Raycast

## What is n8n Manager?

_TODO_

## Features

- **Search**: Quickly find workflows by name or ID
- **Filter**: View active, inactive, or all workflows
- **Execute**: Run workflows with or without data
- **Inspect**: View detailed information about workflows
- **Copy**: Copy workflow IDs or JSON data for easy reference

## Requirements

- [Raycast](https://www.raycast.com/) installed
- A running [n8n](https://n8n.io/) instance
- A special workflow in your n8n instance (see below)

## Installation

### 1. Install the Workflow Manager Workflow in n8n

This extension requires a special workflow in your n8n instance:

1. Log into your n8n instance
2. Import the [workflow-manager-template.json](https://creators.n8n.io/workflows/4166)
3. Configure the workflow:
   - (configuration instructions _TODO_)
   - (screenshots _TODO_)
4. Activate the workflow and note the webhook URL

### 2. Install the Raycast Extension

1. Open Raycast
2. Go to Store
3. Search for "n8n Manager"
4. Click Install
5. Configure the extension with your n8n webhook URL and API token

## Configuration

### Settings Explained

- **n8n Webhook URL**: The full URL of your workflow manager webhook (e.g., `https://n8n.yourdomain.com/webhook/workflow-manager`)
- **n8n API Bearer Token**: The token for authentication with your n8n instance

### Security

Tips about secure token storage, etc. _TODO_

## Usage

### Searching and Filtering Workflows

(Explanation and screenshots) _TODO_

### Executing Workflows

(Explanation and screenshots) _TODO_

#### Quick Execute

(Explanation) _TODO_

#### Execute with JSON

(Explanation with examples) _TODO_

### Viewing Workflow Details

(Explanation and screenshots) _TODO_

## Roadmap

Upcoming features:

- Workflow caching for faster loading times
- Pagination for large workflow collections
- Execution history tracking
- Support for workflow parameters

## For Developers

### Project Documentation

This project includes detailed documentation about its structure and code conventions:

- [Project Structure](docs/project-structure.md) - Overview of the directory structure and layer responsibilities
- [Code Conventions](docs/code-conventions.md) - Coding principles and standards used in this project

### Development Setup

Instructions for setting up the development environment:

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Configure your dev environment
4. Start development with `pnpm dev`

## License

MIT

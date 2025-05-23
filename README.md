# n8n Manager for Raycast

> Search and execute n8n workflows directly from Raycast

## What is n8n Manager?

n8n Manager is a Raycast extension that lets you interact with your n8n.io workflows directly from the Raycast command bar. Search, filter, execute, and inspect your n8n workflows with speed and ease. It requires a companion workflow (installation detailed below) on your n8n instance to enable these management capabilities.

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
2. Import the [workflow-manager.json](https://n8n.io/workflows/4166-n8n-workflow-manager-api/)
   _Note: Updated to official workflow link_
3. Configure the workflow by following the instructions from the sticky notes
4. Activate the workflow and note the webhook URL

### 2. Install the Raycast Extension

**⭐ Status: Currently Under Review ⭐**

This extension has been submitted to the Raycast Store and is currently awaiting review. I will update these instructions once it is approved and directly installable from the Store!

**In the meantime, if you'd like to use or test the extension, you can install it locally by following these steps:**

1.  **Clone the Repository:**
    * Open your terminal and navigate to the directory where you want to place the project.
    * Run: `git clone https://github.com/jwa91/n8n-manager-raycast` 
    * Change into the cloned directory: `cd n8n-manager-raycast`

2.  **Install Dependencies:**
    * Run: `npm install`

3.  **Run in Development Mode:**
    * Run: `npm run dev`
    * This command builds the extension and loads it into Raycast in developer mode. Raycast should automatically detect and enable it. You can then access its commands. (If you haven't before, you might need to enable "Developer Mode" for extensions in Raycast's advanced preferences.)

4.  **Configure the Extension:**
    * The first time you try to use a command from the extension (e.g., "List Workflows"), Raycast will prompt you to enter the required preferences: your "n8n Webhook URL" and "n8n API Bearer Token".

---

**Once approved and available in the Raycast Store, the installation will be simple:**

1. Open Raycast
2. Go to Store
3. Search for "n8n Manager"
4. Click Install
5. Configure the extension with your n8n webhook URL and API token

## Configuration

### Settings Explained

- **n8n Webhook URL**: The full URL of your workflow manager webhook (e.g., `https://n8n.yourdomain.com/webhook/workflow-manager`)
  _! make sure you copy the *production* webhook url_
- **n8n API Bearer Token**: The token for authentication with your n8n instance

### Security

The API uses a Bearer token authentication.
_! make sure to chose a strong key for it_

## Usage

### First use

If you use the extension for the first time, you will be asked for a webhoook url and a Bearer key:

![First Use](media/welcome-first-use.png)

### Searching and Filtering Workflows

The `list workflows` command by default shows all active workflows:

![list  workflows](media/list-workflows.png)

Inactive workflows can be listed from the dropdown:

![list  workflows status](media/list-workflows-status-dropdown.png)

Workflows can be searched by both name and id:

![list  workflows search](media/list-workflows-search.png)

### Executing Workflows

#### Quick Execute

THis is the default action for workflows; the action assumes no mandatory input for execution

![Execute quick](media/execute-workflow-pending.png)

#### Execute with JSON

If workflows need specific input to be executed, this input can be provided in json format from this action
_Note: a better way of handling those kinds of workflows is on the roadmap_

![Execute with input](media/execute-with-input.png)

### Viewing Workflow Details

Workflows can also be inspected within raycast with this action; the provided info will be enhanced in the comming weeks

![Inspect workflow](media/inspect-workflow.png)

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
2. Install dependencies with `npm install`
3. Configure your dev environment
4. Start development with `npm run dev`

## License

MIT
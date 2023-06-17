## Launchpad

The `Launchpad` contract is a crowdfunding platform that enables project owners to raise funds for their projects. Contributors can contribute to the projects they are interested in, and project owners can withdraw the raised amount if the project successfully achieves the goal amount within the deadline. In case a project fails to reach its goal amount within the deadline, contributors have the option to claim a refund for their contributions. Below is the detailed documentation for the contract:

### Enums

- `Status`: This enum represents the status of a project. It can have the following values:
  - `Active`: The project is currently accepting contributions.
  - `Successful`: The project has reached its funding goal.
  - `Failed`: The project did not reach its funding goal within the specified deadline.

### Structs

- `Project`: This struct represents a crowdfunding project. Each project has the following properties:
  - `creator`: The address of the project creator.
  - `title`: The title of the project.
  - `description`: The description of the project.
  - `goalAmount`: The funding goal amount for the project.
  - `deadline`: The deadline for the project.
  - `raisedAmount`: The total amount raised for the project.
  - `contributorsCount`: The number of contributors to the project.
  - `projectStatus`: The status of the project, defined by the `Status` enum.

### Storage Variables

- `projects`: This public array stores all the crowdfunding projects created on the platform.
- `contributions`: This mapping stores the contributions made by contributors to projects. It maps a project index to a nested mapping of contributor addresses to their contribution amounts.

### Events

- `ProjectCreated`: This event is emitted when a new project is created. It provides the project index, title, and creator's address.
- `Contributed`: This event is emitted when a user contributes funds to a project. It provides the project index, contributor's address, and the contributed amount.
- `Withdrawed`: This event is emitted when the creator of a project withdraws funds after the project has raised the goal amount and the deadline has passed. It provides the project index, creator's address, and the withdrawn amount.
- `Refunded`: This event is emitted when a contributor claims a refund for a failed project. It provides the project index, contributor's address, and the refunded amount.

### Functions

- `createProject`: This function allows a user to create a new crowdfunding project. It requires the project title, description, goal amount, and duration as parameters.
- `contribute`: This function allows a user to contribute funds to a project. It requires the project index and payable value as parameters.
- `withdrawFunds`: This function allows the creator of a project to withdraw funds after the project the project has raised the goal amount and the deadline has passed. It requires the project index as a parameter.
- `claimRefund`: This function allows a contributor to claim a refund for a failed project which was not able to raise the goal amount within the deadline. It requires the project index and returns a boolean indicating the success of the refund claim.
- `computeStatus`: This internal function computes and updates the status of a project based on its raised amount and deadline. It requires the project index as a parameter.
- `getProjectDetails`: This function retrieves the details of a project. It requires the project index and returns the project's creator, title, description, goal amount, deadline, raised amount, contributors count, and project status.
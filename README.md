## Launchpad

The `Launchpad` contract is a crowdfunding platform that enables project owners to raise funds for their projects. 
 
### Features

- `Project Creation`: The contract allows project owners to create crowdfunding projects. Each project has a project owner, a title, a description, a funding goal amount, and a deadline.

- `Contribution`: Contributors can contribute funds to the projects by specifying the project ID and sending the desired amount of Ether.

- `Milestone-based Withdrawal`: If a project is successfully completed, meaning it reaches its funding goal within the specified deadline, the project creator can create a milestone-based withdraw request. This request includes the amount required and an objective that specifies how the requested funds will be used.

- `Voting on Withdraw Requests`: Once a withdraw request is created, contributors can vote on the request. If more than 50% of the contributors vote in favor of the request, it is approved.

- `Withdrawal of Approved Funds`: Upon successful approval of a withdraw request, the project creator can withdraw the requested amount of funds. This transfer is made to the project creator's address.

- `Refunds for Failed Projects`: If a project fails to reach its funding goal within the deadline, the project funding is considered as failed. In this case, contributors can claim a refund and withdraw the amount they have contributed. The refund is sent to the contributor's address.

### Enums

- #### Status

  The `Status` enum represents the status of a project. It has three possible values:

  1. `Active`: The project is currently accepting contributions.
  2. `Successful`: The project has reached its funding goal.
  3. `Failed`: The project did not reach its funding goal within the specified deadline.

### Structs

- #### Project

  The `Project` struct represents a crowdfunding project. It contains the following properties:

  - `projectId`: The ID of the project.
  - `creator`: The address of the project creator.
  - `title`: The title of the project.
  - `description`: The description of the project.
  - `goalAmount`: The funding goal amount for the project.
  - `deadline`: The deadline for the project.
  - `raisedAmount`: The total amount raised for the project.
  - `withdrawnAmount`: The total amount withdrawn from the project.
  - `contributorsCount`: The number of contributors to the project.
  - `projectStatus`: The status of the project.

- #### WithdrawRequest

  The `WithdrawRequest` struct represents a withdraw request for a project. It contains the following properties:

  - `projectId`: The ID of the project.
  - `creator`: The address of the withdraw request creator.
  - `description`: The description of the withdraw request, including milestones.
  - `amount`: The amount requested for withdrawal.
  - `voteCount`: The total number of votes received for the withdraw request.
  - `isWithdrawn`: A boolean indicating whether the requested amount has been withdrawn.

### Storage Variables

- #### projectCount
  The `projectCount` variable stores the total number of projects created.

- #### withdrawRequestCount
  The `withdrawRequestCount` variable stores the total number of withdraw requests created.

- #### withdrawRequests

  The `withdrawRequests` mapping stores withdraw requests by their ID. Given a withdraw request ID, it returns the corresponding `WithdrawRequest` struct.

- #### projects

  The `projects` array contains all the crowdfunding projects created.

- #### contributions

  The `contributions` mapping stores contributions to projects. It maps a project index to a contributor address and their corresponding contribution amount.

- #### voters

  The `voters` mapping stores the voting status of contributors for withdraw requests. It maps a withdraw request index to a voter address and their corresponding voting status.

### Events

- #### ProjectCreated

  The `ProjectCreated` event is emitted when a new project is created. It includes the project ID, title, and creator's address.

- #### Contributed

  The `Contributed` event is emitted when a contribution is made to a project. It includes the project ID, contributor's address, and the contribution amount.

- #### WithdrawRequestCreated

  The `WithdrawRequestCreated` event is emitted when a withdraw request is created. It includes the withdraw request count, project ID, creator's address, description, and the requested amount.

- #### Voted

  The `Voted` event is emitted when a contributor votes for a withdraw request. It includes the withdraw request index, voter's address, and the number of votes.

- #### Withdrawed

  The `Withdrawed` event is emitted when funds are withdrawn from a project. It includes the project ID, the project creator's address, and the amount withdrawn.

- #### Refunded

  The `Refunded` event is emitted when a refund is claimed by a contributor. It includes the project ID, contributor's address, and the refunded amount.

### Functions

The contract provides the following functions:

- #### createProject

  The `createProject` function allows a user to create a new crowdfunding project. It takes the title, description, funding goal amount, and duration as parameters.

- #### contribute

  The `contribute` function allows a user to contribute funds to a project. It takes the project ID as a parameter.

- #### createWithdrawRequest

  The `createWithdrawRequest` function allows the project creator to create a withdraw request. It takes the project ID, creator's address, description, and requested amount as parameters.

- #### voteWithdrawRequest

  The `voteWithdrawRequest` function allows contributors to vote for a withdraw request. It takes the withdraw request ID as a parameter.

- #### withdrawFunds

  The `withdrawFunds` function allows the project creator to withdraw funds from a successful project. It takes the withdraw request ID as a parameter.

- #### claimRefund

  The `claimRefund` function allows contributors to claim a refund for a failed project. It takes the project ID as a parameter.

- #### getProjectDetails

  The `getProjectDetails` function retrieves the details of a project. It takes the project ID as a parameter and returns the project details.

- #### computeStatus

  The `computeStatus` function is an internal function that computes the status of a project based on its raised amount and deadline. It takes the project index as a parameter and updates the project status accordingly.

These functions provide the necessary functionality to create projects, contribute to projects, create withdraw requests, vote for withdraw requests, and withdraw funds or claim refunds based on the project status.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Launchpad
 * @dev A contract for a crowdfunding platform that allows project creators to raise fund for 
 * their project. 
*/

contract Launchpad {

    /**
     * @dev Enums
    */

    /**
     * @dev Represents the status of a project.
     * - Active: The project is currently accepting contributions.
     * - Successful: The project has reached its funding goal.
     * - Failed: The project did not reach its funding goal within the specified deadline.
    */

    enum Status {
        Active,
        Successful,
        Failed
    }


    /**
     * @dev Structs
    */

    /**
     * @dev Represents a crowdfunding project.
     * Each project has a projectId, creator, title, description, funding goal, deadline, raised amount,
     * withdrawnAmount, contributors count, and project status.
    */

    struct Project {
        uint256 projectId;
        address payable creator;
        string title;
        string description;
        uint256 goalAmount; 
        uint256 deadline;
        uint256 raisedAmount; 
        uint256 withdrawnAmount; 
        uint256 contributorsCount;
        Status projectStatus;
        
    }

    /**
     * @dev Represents a withdraw request.
     * Each withdraw request has a projectId, creator, description, amount, votes,
     * voteCount, and isWithdrawn.
    */

    struct WithdrawRequest {
        uint256 projectId;
        address payable creator;
        string description;
        uint256 amount; 
        uint256 voteCount; 
        bool isWithdrawn;
    }

    /**
     * @dev Storage Variables
    */

    /**
     * @dev Project count.
    */

    uint256 public projectCount;

    /**
     * @dev Withdraw request count.
    */

    uint256 public withdrawRequestCount;

    /**
     * @dev Withdraw request index to WithdrawRequest.
    */

    mapping (uint256 => WithdrawRequest) public withdrawRequests;


    /**
     * @dev An array of all projects created.
    */

    Project[] private projects;

    /**
     * @dev A mapping that stores contributions to projects.
     * It maps a project index to a contributor address and their corresponding contribution amount.
    */

    mapping(uint256 => mapping(address => uint256)) public contributions;

    /**
     * @dev A mapping that stores votting to withdraw request.
     * It maps a withdraw request index to a voter address and their corresponding voting status.
    */

    mapping(uint256 => mapping(address => bool)) public voters;


    /**
     * @dev Events
    */


    /**
     * @dev Emitted when a new project is created.
     * @param _projectId The ID of the created project.
     * @param _title The title of the created project.
     * @param _creator The address of the project creator.
    */
    event ProjectCreated(uint256 indexed _projectId, string _title, address indexed _creator);

    /**
     * @dev Emitted when a contribution is made to a project.
     * @param _projectId The ID of the project.
     * @param _contributor The address of the contributor.
     * @param _amount The contribution amount.
    */
    event Contributed(uint256 indexed _projectId, address indexed _contributor, uint256 _amount);

    event WithdrawRequestCreated(uint256 indexed _withdrawRequestCount, uint256 indexed _projectId, address _creator , string _description, uint256 _amount);

    event Voted(uint256 indexed _withdrawRequestIndex, address indexed _voter, uint256 _votes);

    /**
     * @dev Emitted when funds are withdrawn from a project.
     * @param _projectId The ID of the project.
     * @param _creator The address of the project creator.
     * @param _amount The amount withdrawn.
    */
    event Withdrawed(uint256 indexed _projectId, address indexed _creator, uint256 _amount);

    /**
     * @dev Emitted when a refund is claimed by a contributor.
     * @param _projectId The ID of the project.
     * @param _contributor The address of the contributor.
     * @param _amount The refunded amount.
    */
    event Refunded(uint256 indexed _projectId, address indexed _contributor, uint256 _amount);


    /**
     * @dev Functions
    */

    /**
     * @dev Creates a new crowdfunding project.
     * @param _title The title of the project.
     * @param _description The description of the project.
     * @param _goalAmount The funding goal amount for the project.
     * @param _duration The duration (in seconds) until the project deadline.
    */
    function createProject(
        string memory _title, 
        string memory _description, 
        uint256 _goalAmount,    
        uint256 _duration 
    ) external {

        projectCount++;
        Project memory newProject = Project({
            projectId: projectCount,
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            deadline : block.timestamp + _duration,
            raisedAmount: 0,
            withdrawnAmount:0,
            contributorsCount: 0,
            projectStatus: Status.Active
        });
        projects.push(newProject);
        emit ProjectCreated(projectCount, _title, msg.sender);
    }   

    /**
     * @dev Contributes funds to a crowdfunding project.
     * @param _projectId The ID of the project.
    */
    function contribute(uint256 _projectId) external payable {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        uint256 _projectIndex = _projectId - 1; // as project Id starts from 1
        Project storage project = projects[_projectIndex];
        require(project.projectStatus == Status.Active, "Project is not Active");
        require(block.timestamp < project.deadline, "Project is Expired");
        project.raisedAmount += msg.value;
        if(contributions[_projectId][msg.sender] == 0)
            project.contributorsCount += 1;
        contributions[_projectId][msg.sender] += msg.value;
        computeStatus(_projectIndex);
        emit Contributed(_projectId, msg.sender, msg.value);
    }


    /**
     * @dev Creates a Withdraw Request.
     * @param _projectId The ID of the project.
     * @param _creator The address of the project creator.
     * @param _description The description of the withdraw request including the milestones.
     * @param _amount The amount required.
    */
    function createWithdrawRequest(
        uint256 _projectId, 
        address payable _creator,
        string memory _description,
        uint256 _amount
    ) public {

        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        uint256 _projectIndex = _projectId - 1; // as project Id starts from 1
        Project storage project = projects[_projectIndex];
        require(project.creator == msg.sender, "Only the project creator can withdraw fund");
        require(block.timestamp > project.deadline, "Project is still Active");
        computeStatus(_projectIndex);
        require(project.projectStatus == Status.Successful, "Project status is not Successful");

        require(project.raisedAmount - project.withdrawnAmount - _amount >= 0,'Insufficiant balance');


        WithdrawRequest memory newRequest = WithdrawRequest({
            projectId: _projectId,
            creator: payable(msg.sender),
            description : _description,
            amount : _amount,
            voteCount : 0,
            isWithdrawn : false
        });

        withdrawRequestCount++;
        withdrawRequests[withdrawRequestCount]= newRequest;

        emit WithdrawRequestCreated(withdrawRequestCount, _projectIndex, _creator, _description, _amount );
    }


    /**
     * @dev Withdraws funds from a successful project.
     * @param _withdrawRequestId The ID of the withdraw request.
    */

    function voteWithdrawRequest(
        uint256 _withdrawRequestId
    ) public {
        require(_withdrawRequestId > 0 && _withdrawRequestId <= withdrawRequestCount, "Invalid withdraw request ID");
        uint256 _withdrawRequestIndex = _withdrawRequestId - 1;  // as Id starts from 1
        WithdrawRequest storage requestDetails = withdrawRequests[_withdrawRequestIndex];
        uint256 _projectId = requestDetails.projectId;
        uint256 contribution = contributions[_projectId][msg.sender];

        require(contribution > 0,'Only contributors can vote !');

        require(voters[_projectId][msg.sender] == false,'You already voted !');
        voters[_projectId][msg.sender] = true;
        requestDetails.voteCount += contribution; // adding votes equivalent to the contribution amount.
        emit Voted(_withdrawRequestId, msg.sender, contribution);
    }


    /**
     * @dev Withdraws funds from a successful project.
     * @param _withdrawRequestId The ID of the withdraw request.
    */
    function withdrawFunds(uint256 _withdrawRequestId) external {
        require(_withdrawRequestId > 0 && _withdrawRequestId <= withdrawRequestCount, "Invalid withdraw request ID");
        uint256 _withdrawRequestIndex = _withdrawRequestId - 1;  // as Id starts from 1
        WithdrawRequest storage requestDetails = withdrawRequests[_withdrawRequestIndex];
        uint256 _projectIndex = requestDetails.projectId - 1;
        require(_projectIndex < projectCount, "Invalid project index");

        Project storage project = projects[_projectIndex];
        require(project.creator == msg.sender, "Only the project creator can withdraw fund");
        require(block.timestamp > project.deadline, "Project is still Active");
        computeStatus(_projectIndex);
        require(project.projectStatus == Status.Successful, "Project status is not Successful");
        require(requestDetails.isWithdrawn == false,'Already withdrawn');

        uint256 _raisedAmount = project.raisedAmount;
        require(requestDetails.voteCount >= _raisedAmount / 2,'At least 50% vote is required');

        require(_raisedAmount - project.withdrawnAmount - requestDetails.amount >= 0,'Insufficiant balance');
        
        requestDetails.isWithdrawn = true;
        requestDetails.creator.transfer(requestDetails.amount);


        emit Withdrawed(requestDetails.projectId, msg.sender, requestDetails.amount);
    }


    
    /**
     * @dev Claims a refund for a failed project.
     * @param _projectId The ID of the project.
     * @return A boolean indicating the success of the refund claim.
    */
    function claimRefund(uint256 _projectId) external returns(bool) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        uint256 _projectIndex = _projectId - 1; // as project Id starts from 1

        Project storage project = projects[_projectIndex];
        if(project.projectStatus == Status.Active)
            computeStatus(_projectIndex);
        require(project.projectStatus == Status.Failed, 'The project is not Failed');
        uint256 contributionAmount = contributions[_projectId][msg.sender];
        require(contributionAmount > 0,'You have not contributed to this project !');
        contributions[_projectIndex][msg.sender] = 0;
        payable(msg.sender).transfer(contributionAmount);
        emit Refunded(_projectId, msg.sender, contributionAmount);
        return true;
    }

    /**
     * @dev Retrieves the details of a project.
     * @param _projectId The ID of the project to fetch details for.
     * @return projectId ID of the project.
     * @return creator The address of the project creator.
     * @return title The title of the project.
     * @return description The description of the project.
     * @return goalAmount The funding goal amount for the project.
     * @return deadline The deadline for the project.
     * @return raisedAmount The total amount raised for the project.
     * @return withdrawnAmount The total amount withdrawn.
     * @return contributorsCount The number of contributors to the project.
     * @return projectStatus The status of the project.
    */
    function getProjectDetails(uint256 _projectId) external view returns (
        uint256 projectId,
        address payable creator,
        string memory title,
        string memory description,
        uint256 goalAmount,
        uint256 deadline,
        uint256 raisedAmount,
        uint256 withdrawnAmount,
        uint256 contributorsCount,
        Status projectStatus
    ) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        uint256 _projectIndex = _projectId - 1; // as project Id starts from 1

        Project storage project = projects[_projectIndex];
        return (
            project.projectId,
            project.creator,
            project.title,
            project.description,
            project.goalAmount,
            project.deadline,
            project.raisedAmount,
            project.withdrawnAmount,
            project.contributorsCount,
            project.projectStatus
        );
    }

    /**
     * @dev Computes the status of a project based on its raised amount and deadline.
     * @param _projectIndex The index of the project in the `projects` array.
    */
    function computeStatus(uint256 _projectIndex) internal {
        Project storage project = projects[_projectIndex];
        if(project.raisedAmount >= project.goalAmount){
            project.projectStatus = Status.Successful;
        } else if(block.timestamp > project.deadline && project.raisedAmount < project.goalAmount) {
            project.projectStatus = Status.Failed;
        }
    }
}

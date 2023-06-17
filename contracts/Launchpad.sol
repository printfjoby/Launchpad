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
     * Each project has a creator, title, description, funding goal, deadline, raised amount,
     * contributors count, and project status.
    */

    struct Project {
        address payable creator;
        string title;
        string description;
        uint256 goalAmount; 
        uint256 deadline;
        uint256 raisedAmount; 
        uint256 contributorsCount;
        Status projectStatus;
    }


    /**
     * @dev Storage Variables
    */

    /**
     * @dev An array of all projects created.
    */

    Project[] public projects;

    /**
     * @dev A mapping that stores contributions to projects.
     * It maps a project index to a contributor address and their corresponding contribution amount.
    */

    mapping(uint256 => mapping(address => uint256)) public contributions;


    /**
     * @dev Events
    */


    /**
     * @dev Emitted when a new project is created.
     * @param _projectIndex The index of the created project in the `projects` array.
     * @param _title The title of the created project.
     * @param _creator The address of the project creator.
    */
    event ProjectCreated(uint256 indexed _projectIndex, string _title, address indexed _creator);

    /**
     * @dev Emitted when a contribution is made to a project.
     * @param _projectIndex The index of the project in the `projects` array.
     * @param _contributor The address of the contributor.
     * @param _amount The contribution amount.
    */
    event Contributed(uint256 indexed _projectIndex, address indexed _contributor, uint256 _amount);

    /**
     * @dev Emitted when funds are withdrawn from a project.
     * @param _projectIndex The index of the project in the `projects` array.
     * @param _creator The address of the project creator.
     * @param _amount The amount withdrawn.
    */
    event Withdrawed(uint256 indexed _projectIndex, address indexed _creator, uint256 _amount);

    /**
     * @dev Emitted when a refund is claimed by a contributor.
     * @param _projectIndex The index of the project in the `projects` array.
     * @param _contributor The address of the contributor.
     * @param _amount The refunded amount.
    */
    event Refunded(uint256 indexed _projectIndex, address indexed _contributor, uint256 _amount);


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
        Project memory newProject = Project({
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            deadline : block.timestamp + _duration,
            raisedAmount: 0,
            contributorsCount: 0,
            projectStatus: Status.Active
        });
        projects.push(newProject);
        uint256 projectIndex = projects.length - 1;
        emit ProjectCreated(projectIndex, _title, msg.sender);
    }   

    /**
     * @dev Contributes funds to a crowdfunding project.
     * @param _projectIndex The index of the project in the `projects` array.
    */
    function contribute(uint256 _projectIndex) external payable {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];
        require(project.projectStatus == Status.Active, "Project is not Active");
        require(block.timestamp < project.deadline, "Project is Expired");
        project.raisedAmount += msg.value;
        if(contributions[_projectIndex][msg.sender] == 0)
            project.contributorsCount += 1;
        contributions[_projectIndex][msg.sender] += msg.value;
        computeStatus(_projectIndex);
        emit Contributed(_projectIndex, msg.sender, msg.value);
    }


    /**
     * @dev Withdraws funds from a successful project.
     * @param _projectIndex The index of the project in the `projects` array.
    */
    function withdrawFunds(uint256 _projectIndex) external {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];
        require(project.creator == msg.sender, "Only the project creator can withdraw fund");
        require(block.timestamp > project.deadline, "Project is still Active");
        computeStatus(_projectIndex);
        require(project.projectStatus == Status.Successful, "Project status is not Successful");
        uint256 amount = project.raisedAmount;
        project.raisedAmount = 0;
        project.creator.transfer(amount);
        emit Withdrawed(_projectIndex, msg.sender, amount);
    }
    
    /**
     * @dev Claims a refund for a failed project.
     * @param _projectIndex The index of the project in the `projects` array.
     * @return A boolean indicating the success of the refund claim.
    */
    function claimRefund(uint256 _projectIndex) external returns(bool) {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];
        if(project.projectStatus == Status.Active)
            computeStatus(_projectIndex);
        require(project.projectStatus == Status.Failed, 'The project is not Failed');
        uint256 contributionAmount = contributions[_projectIndex][msg.sender];
        require(contributionAmount > 0,'You have not contributed to this project !');
        contributions[_projectIndex][msg.sender] = 0;
        payable(msg.sender).transfer(contributionAmount);
        emit Refunded(_projectIndex, msg.sender, contributionAmount);
        return true;
    }

    /**
     * @dev Retrieves the details of a project.
     * @param _projectIndex The index of the project to fetch details for.
     * @return creator The address of the project creator.
     * @return title The title of the project.
     * @return description The description of the project.
     * @return goalAmount The funding goal amount for the project.
     * @return deadline The deadline for the project.
     * @return raisedAmount The total amount raised for the project.
     * @return contributorsCount The number of contributors to the project.
     * @return projectStatus The status of the project.
    */
    function getProjectDetails(uint256 _projectIndex) external view returns (
        address payable creator,
        string memory title,
        string memory description,
        uint256 goalAmount,
        uint256 deadline,
        uint256 raisedAmount,
        uint256 contributorsCount,
        Status projectStatus
    ) {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];

        return (
            project.creator,
            project.title,
            project.description,
            project.goalAmount,
            project.deadline,
            project.raisedAmount,
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

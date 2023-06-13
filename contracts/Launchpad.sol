// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Launchpad {

    /* Enums */

    enum Status {
        Active,
        Successful,
        Expired
    }


    /* Structs */

    struct Project {
        address payable creator;
        string title;
        string description;
        uint256 goalAmount; 
        uint256 deadline;
        uint256 closedDate;
        uint256 raisedAmount; 
        uint256 contributorsCount;
        Status projectStatus;
    }


    /* Storage Variables */

    Project[] public projects;

    // mapping from Project index to contributor address to contribution amount
    mapping(uint256 => mapping(address => uint256)) contributions;


    /* Events */
    event ProjectCreated(uint256 indexed _projectIndex, string _title, address indexed _creator);


    /* Functions */

    function createProject(
        string memory _title, 
        string memory _description, 
        uint256 _goalAmount,    
        uint256 _deadline 
    ) external {
        Project memory newProject = Project({
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            deadline : _deadline,
            closedDate: 0,
            raisedAmount: 0,
            contributorsCount: 0,
            projectStatus: Status.Active
        });
        projects.push(newProject);
    }

    function contribute(uint256 _projectIndex) external payable {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];
        require(project.projectStatus == Status.Active, "Project is not Active");
        require(block.timestamp < project.deadline, "Project is Expired");
        project.raisedAmount += msg.value;
        project.contributorsCount += 1;
        contributions[_projectIndex][msg.sender] += msg.value;

        if (project.raisedAmount >= project.goalAmount) {
            project.projectStatus = Status.Successful;
        }
    }


    function withdrawFunds(uint256 _projectIndex) external {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];
        require(project.creator == msg.sender, "Only the project creator can withdraw funds");
        require(project.projectStatus != Status.Active, "Project is Active");
        require(block.timestamp > project.deadline, "Project is not Expired");

        uint256 amount = project.raisedAmount;
        project.raisedAmount = 0;
        project.creator.transfer(amount);
    }
    


    function getProjectDetails(uint256 _projectIndex) external view returns (
        address payable creator,
        string memory title,
        string memory description,
        uint256 goalAmount,
        uint256 deadline,
        uint256 closedDate,
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
            project.closedDate,
            project.raisedAmount,
            project.contributorsCount,
            project.projectStatus
        );
    }
}

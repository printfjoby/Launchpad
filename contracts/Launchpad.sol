// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Launchpad {

    /* Enums */

    enum Status {
        Active,
        Successful,
        Failed
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
    mapping(uint256 => mapping(address => uint256)) public contributions;


    /* Events */
    event ProjectCreated(uint256 indexed _projectIndex, string _title, address indexed _creator);


    /* Functions */

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
        computeStatus(_projectIndex);
    }


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
    }
    

    function claimRefund(uint256 _projectIndex) public returns(bool) {
        require(_projectIndex < projects.length, "Invalid project index");
        Project storage project = projects[_projectIndex];
        if(project.projectStatus == Status.Active)
            computeStatus(_projectIndex);
        require(project.projectStatus == Status.Failed, 'The project is not Failed');
        uint256 contributionAmount = contributions[_projectIndex][msg.sender];
        require(contributionAmount > 0,'You have not contributed to this project !');
        address payable contributor = payable(msg.sender);
        contributor.transfer(contributionAmount);
        contributions[_projectIndex][msg.sender] = 0;
        return true;
    }

    function computeStatus(uint256 _projectIndex) internal {
        Project storage project = projects[_projectIndex];
        if(project.raisedAmount >= project.goalAmount){
            project.projectStatus = Status.Successful;
        } else if(block.timestamp > project.deadline && project.raisedAmount < project.goalAmount) {
            project.projectStatus = Status.Failed;
        }
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

const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Create Project", function () {
  let launchpad;
  let creator;
  let contributor1;
  let contributor2;
  let title;
  let description;
  let goalAmount;
  let Duration_In_Sec; 

  
  beforeEach(async function () {
    [creator, contributor1, contributor2] = await ethers.getSigners();

    launchpad = await ethers.deployContract("Launchpad");
    await launchpad.waitForDeployment();

    title = "My Project";
    description = "Description of my project";
    goalAmount = ethers.parseEther("10");
    Duration_In_Sec = 5 * 60; // 5min

    await launchpad.createProject(title, description, goalAmount, Duration_In_Sec);

  });

  it("should create a project", async function () {
    const projectId = 1;
    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.creator).to.equal(creator.address);
    expect(projectDetails.title).to.equal(title);
    expect(projectDetails.description).to.equal(description);
    expect(projectDetails.deadline).to.equal((await time.latest()) + Duration_In_Sec);
    expect(projectDetails.raisedAmount).to.equal(0);
    expect(projectDetails.projectStatus).to.equal(0);
  });

  it("should fail when invalid project index given to get project details", async function () {
    const projectId = 2;
    await expect( 
      launchpad.connect(creator).getProjectDetails(projectId)
    ).to.be.revertedWith("Invalid project ID");
    
  });
  

});


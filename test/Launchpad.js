const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Launchpad", function () {
  let launchpad;
  let creator;
  let contributor1;
  let contributor2;

  beforeEach(async function () {
    [creator, contributor1, contributor2] = await ethers.getSigners();

    launchpad = await ethers.deployContract("Launchpad");
    await launchpad.waitForDeployment();

  });
  
  it("should create a project", async function () {
    const title = "My Project";
    const description = "Description of my project";
    const goalAmount = ethers.parseEther("10");
    const Duration_In_Sec = 5 * 60; // 5min
    const deadline = (await time.latest()) + Duration_In_Sec;

    await launchpad.createProject(title, description, goalAmount, deadline);

    const projectDetails = await launchpad.getProjectDetails(0);
    expect(projectDetails.creator).to.equal(creator.address);
    expect(projectDetails.title).to.equal(title);
    expect(projectDetails.description).to.equal(description);
    expect(projectDetails.deadline).to.equal(deadline);
    expect(projectDetails.raisedAmount).to.equal(0);
    expect(projectDetails.projectStatus).to.equal(0);
  });

});

const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Claim Refund", function () {
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

  it("should be able to claim refund if the project is failed", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("9");

    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    await hre.network.provider.send("evm_increaseTime", [Duration_In_Sec]);

    await expect(launchpad.connect(contributor1).claimRefund(projectId))
    .to.emit(launchpad, "Refunded")
    .withArgs(projectId, contributor1.address, contributionAmount);

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.projectStatus).to.equal(2);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(0);
    
  });

  it("should not be able to claim refund if the project index is invalid ", async function () {
    const projectId = 1;
    const newProjectId = 2;
    const contributionAmount = ethers.parseEther("9");

    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    await hre.network.provider.send("evm_increaseTime", [Duration_In_Sec]);

    await expect( 
      launchpad.connect(contributor1).claimRefund(newProjectId)
    ).to.be.revertedWith("Invalid project ID");

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.projectStatus).to.equal(0);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });

  it("should not be able to claim refund if the project is Active ", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("9");

    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    await expect( 
      launchpad.connect(contributor1).claimRefund(projectId)
    ).to.be.revertedWith("The project is not Failed");

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.projectStatus).to.equal(0);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });

  it("should not be able to claim refund if the project is Successful ", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("10");

    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    await hre.network.provider.send("evm_increaseTime", [Duration_In_Sec]);

    await expect( 
      launchpad.connect(contributor1).claimRefund(projectId)
    ).to.be.revertedWith("The project is not Failed");

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.projectStatus).to.equal(1);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });

  it("should not be able to claim refund if not contributed to the project ", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("9");

    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    await hre.network.provider.send("evm_increaseTime", [Duration_In_Sec]);

    await expect( 
      launchpad.connect(contributor2).claimRefund(projectId)
    ).to.be.revertedWith("You have not contributed to this project !");

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.projectStatus).to.equal(0);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });
  

});


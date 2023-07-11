const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Contribute", function () {
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

  it("should contibute to a project", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("5");
  
    await expect(launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount}))
      .to.emit(launchpad, "Contributed")
      .withArgs(projectId, contributor1.address, contributionAmount);

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.raisedAmount).to.equal(contributionAmount);
    expect(projectDetails.projectStatus).to.equal(0);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });

  it("should fail on accessing invalid project index", async function () {
    const projectId = 2;
    const contributionAmount = ethers.parseEther("10");
    await expect( 
      launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount})
    ).to.be.revertedWith("Invalid project ID");
    
  });

  it("should fail when trying to contribute after achieving the goal amount", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("10");

    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    const additionalAmount = ethers.parseEther("1");
    await expect( 
      launchpad.connect(contributor1).contribute(projectId, {value:additionalAmount})
    ).to.be.revertedWith("Project is not Active");;


    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.creator).to.equal(creator.address);
    expect(projectDetails.raisedAmount).to.equal(contributionAmount);
    expect(projectDetails.projectStatus).to.equal(1);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });

  it("should fail when trying to contribute after the deadline", async function () {
    const projectId = 1;
    const contributionAmount = ethers.parseEther("9");
    
    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    await hre.network.provider.send("evm_increaseTime", [Duration_In_Sec]);

    const additionalAmount = ethers.parseEther("1");
    await expect( 
      launchpad.connect(contributor1).contribute(projectId, {value:additionalAmount})
    ).to.be.revertedWith("Project is Expired");;

    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(projectDetails.raisedAmount).to.equal(contributionAmount);
    const contribution = await launchpad.contributions(projectId, contributor1.address);
    expect(contribution).to.equal(contributionAmount);
    
  });

    

});


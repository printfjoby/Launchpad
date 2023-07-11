const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Withdraw Fund", function () {
  let launchpad;
  let creator;
  let contributor1;
  let contributor2;
  let title;
  let description;
  let goalAmount;
  let Duration_In_Sec; 
  let New_Duration_In_Sec;

  
  beforeEach(async function () {
    [creator, contributor1, contributor2] = await ethers.getSigners();

    launchpad = await ethers.deployContract("Launchpad");
    await launchpad.waitForDeployment();

    title = "My Project";
    description = "Description of my project";
    goalAmount = ethers.parseEther("10");
    Duration_In_Sec = 5 * 60; // 5min
    New_Duration_In_Sec = 5 * 60 + 1 ;

    await launchpad.createProject(title, description, goalAmount, Duration_In_Sec);

    const contributionAmount = ethers.parseEther("10");
    const projectId = 1;
    await launchpad.connect(contributor1).contribute(projectId, {value:contributionAmount});

    const withdrawRequestDesc ="Phase 1 : 5 ETH";
    const withdrawRequestAmount = ethers.parseEther("5");

    await hre.network.provider.send("evm_increaseTime", [New_Duration_In_Sec]);
    
    await launchpad.connect(creator).createWithdrawRequest(
      projectId, creator, withdrawRequestDesc, withdrawRequestAmount
    );


  });


  it("should withdraw raised fund when the project is completed Successfully", async function () {
    const withdrawRequestId = 1;
    const projectId = 1;
    const withdrawRequestAmount = ethers.parseEther("5");

    await launchpad.connect(contributor1).voteWithdrawRequest(withdrawRequestId);

    await expect(launchpad.connect(creator).withdrawFunds(withdrawRequestId))
    .to.emit(launchpad, "Withdrawed")
    .withArgs(projectId, creator.address, withdrawRequestAmount);

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(withdrawRequestDetails.isWithdrawn).to.equal(true);
   
    expect(projectDetails.withdrawnAmount).to.equal(withdrawRequestAmount);
    
  });


  it("should fail when invalid withdraw request ID is given", async function () {
    const withdrawRequestId = 1;
    const invalidRequestId = 2;
    const projectId = 1;

    await launchpad.connect(contributor1).voteWithdrawRequest(withdrawRequestId);

    await expect(launchpad.connect(creator).withdrawFunds(invalidRequestId)
    ).to.be.revertedWith("Invalid withdraw request ID");

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(withdrawRequestDetails.isWithdrawn).to.equal(false);
    expect(projectDetails.withdrawnAmount).to.equal(0);
    
  });


  it("should fail when non-creator try to withdraw raised fund", async function () {
    const withdrawRequestId = 1;
    const projectId = 1;

    await launchpad.connect(contributor1).voteWithdrawRequest(withdrawRequestId);

    await expect(launchpad.connect(contributor2).withdrawFunds(withdrawRequestId)
    ).to.be.revertedWith("Only the project creator can withdraw fund");

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(withdrawRequestDetails.isWithdrawn).to.equal(false);
    expect(projectDetails.withdrawnAmount).to.equal(0);
    
  });

  it("should fail when already withdrawn", async function () {
    const withdrawRequestId = 1;
    const projectId = 1;
    const withdrawRequestAmount = ethers.parseEther("5");

    await launchpad.connect(contributor1).voteWithdrawRequest(withdrawRequestId);

    await launchpad.connect(creator).withdrawFunds(withdrawRequestId);

    await expect(launchpad.connect(creator).withdrawFunds(withdrawRequestId)
    ).to.be.revertedWith("Already withdrawn");

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    const projectDetails = await launchpad.getProjectDetails(projectId);
    expect(withdrawRequestDetails.isWithdrawn).to.equal(true);
    expect(projectDetails.withdrawnAmount).to.equal(withdrawRequestAmount);
    
  });


});


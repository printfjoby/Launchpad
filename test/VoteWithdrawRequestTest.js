const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Launchpad", function () {
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

  it("should able to vote for a withdraw request of a contributed project", async function () {
    const projectId = 1;
    const withdrawRequestId = 1;   
    const contributionAmount = await launchpad.contributions(projectId, contributor1.address);

    await expect(launchpad.connect(contributor1).voteWithdrawRequest(withdrawRequestId))
    .to.emit(launchpad, "Voted")
    .withArgs(withdrawRequestId, contributor1.address, contributionAmount); 

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    expect(withdrawRequestDetails.voteCount).to.equal(contributionAmount);

    const voteStatus = await launchpad.voters(projectId, contributor1.address);
    expect(voteStatus).to.equal(true);

  });

  it("should fail when invalid withdraw request ID is used for voting", async function () {
    const projectId = 1;
    const withdrawRequestId = 2;   

    await expect(launchpad.connect(contributor1).voteWithdrawRequest(
      withdrawRequestId)
    ).to.be.revertedWith("Invalid withdraw request ID");

    const voteStatus = await launchpad.voters(projectId, contributor1.address);
    expect(voteStatus).to.equal(false);

  });

  it("should fail when non contributor try to vote for a withdraw request", async function () {
    const projectId = 1;
    const withdrawRequestId = 1;   

    await expect(launchpad.connect(contributor2).voteWithdrawRequest(
      withdrawRequestId)
    ).to.be.revertedWith("Only contributors can vote !");

    const voteStatus = await launchpad.voters(projectId, contributor2.address);
    expect(voteStatus).to.equal(false);

  });

  it("should fail if already voted", async function () {
    const projectId = 1;
    const withdrawRequestId = 1;   

    await launchpad.connect(contributor1).voteWithdrawRequest(withdrawRequestId);

    await expect(launchpad.connect(contributor1).voteWithdrawRequest(
      withdrawRequestId)
    ).to.be.revertedWith("You already voted !");

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    const contributionAmount = await launchpad.contributions(projectId, contributor1.address);
    expect(withdrawRequestDetails.voteCount).to.equal(contributionAmount);

  });
    

});


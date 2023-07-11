const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Create Wtihdraw Request", function () {
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

  });

  it("should create a withdraw request", async function () {
    const projectId = 1;
    const withdrawRequestDesc ="Phase 1 : 5 ETH";
    const withdrawRequestAmount = ethers.parseEther("5");

    await hre.network.provider.send("evm_increaseTime", [New_Duration_In_Sec]);
    
    await launchpad.connect(creator).createWithdrawRequest(
      projectId, creator, withdrawRequestDesc, withdrawRequestAmount
    );
    const withdrawRequestId = 1;

    const withdrawRequestDetails = await launchpad.withdrawRequests(withdrawRequestId);
    
    expect(withdrawRequestDetails.projectId).to.equal(projectId);
    expect(withdrawRequestDetails.creator).to.equal(creator.address);
    expect(withdrawRequestDetails.description).to.equal(withdrawRequestDesc);
    expect(withdrawRequestDetails.amount).to.equal(withdrawRequestAmount);
    expect(withdrawRequestDetails.voteCount).to.equal(0);
    expect(withdrawRequestDetails.isWithdrawn).to.equal(false);

    const withdrawRequestCount = await launchpad.withdrawRequestCount();
    expect(withdrawRequestCount).to.equal(1);

  });

 

  it("should fail when invalid project ID given to create withdraw request", async function () {
    const projectId = 2;
    const withdrawRequestDesc ="Phase 1 : 5 ETH";
    const withdrawRequestAmount = ethers.parseEther("5");
   
    await hre.network.provider.send("evm_increaseTime", [New_Duration_In_Sec]);

    await expect(launchpad.connect(creator).createWithdrawRequest(
      projectId, creator, withdrawRequestDesc, withdrawRequestAmount)
    ).to.be.revertedWith("Invalid project ID");
    
  });

  it("should fail when non creator try to create withdraw request", async function () {
    const projectId = 1;
    const withdrawRequestDesc ="Phase 1 : 5 ETH";
    const withdrawRequestAmount = ethers.parseEther("5");
    
    await hre.network.provider.send("evm_increaseTime", [New_Duration_In_Sec]);

    await expect(launchpad.connect(contributor1).createWithdrawRequest(
      projectId, creator, withdrawRequestDesc, withdrawRequestAmount)
    ).to.be.revertedWith("Only the project creator can withdraw fund");
    
  });

  it("should fail when specified withdraw amount is higher than available balance", async function () {
    const projectId = 1;
    const withdrawRequestDesc ="Phase 1 : 5 ETH";
    const withdrawRequestAmount = ethers.parseEther("11");
    
    await hre.network.provider.send("evm_increaseTime", [New_Duration_In_Sec]);

    await expect(launchpad.connect(creator).createWithdrawRequest(
      projectId, creator, withdrawRequestDesc, withdrawRequestAmount)
    ).to.be.revertedWith("Insufficient balance");
    
  });


    

});


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


    describe("Creator", function () {

      it("should create a project", async function () {
        const projectIndex = 0;
        const projectDetails = await launchpad.getProjectDetails(projectIndex);
        expect(projectDetails.creator).to.equal(creator.address);
        expect(projectDetails.title).to.equal(title);
        expect(projectDetails.description).to.equal(description);
        expect(projectDetails.deadline).to.equal((await time.latest()) + Duration_In_Sec);
        expect(projectDetails.raisedAmount).to.equal(0);
        expect(projectDetails.projectStatus).to.equal(0);
      });

      it("should fail when invalid project index given to withdraw raised fund", async function () {
        const projectIndex = 1;
        await expect( 
          launchpad.connect(creator).withdrawFunds(projectIndex)
        ).to.be.revertedWith("Invalid project index");
        
      });

      it("should fail when non-creator try to withdraw raised fund", async function () {
        const projectIndex = 0;
        await expect( 
          launchpad.connect(contributor1).withdrawFunds(projectIndex)
        ).to.be.revertedWith("Only the project creator can withdraw fund");
        
      });


    });



  describe("Contributor", function () {
  
    it("should contibute to a project", async function () {
      const contributionAmount = ethers.parseEther("5");
      const projectIndex = 0;
      await launchpad.connect(contributor1).contribute(projectIndex, {value:contributionAmount});
  
      const projectDetails = await launchpad.getProjectDetails(projectIndex);
      expect(projectDetails.raisedAmount).to.equal(contributionAmount);
      expect(projectDetails.projectStatus).to.equal(0);
      const contribution = await launchpad.contributions(projectIndex, contributor1.address);
      expect(contribution).to.equal(contributionAmount);
      
    });
  
    it("should fail on accessing invalid project index", async function () {
      const contributionAmount = ethers.parseEther("10");
      const projectIndex = 1;
      await expect( 
        launchpad.connect(contributor1).contribute(projectIndex, {value:contributionAmount})
      ).to.be.revertedWith("Invalid project index");
      
    });
  
    it("should fail when trying to contribute after achieving the goal amount", async function () {
      const contributionAmount = ethers.parseEther("10");
  
      await launchpad.connect(contributor1).contribute(0, {value:contributionAmount});
  
      const additionalAmount = ethers.parseEther("1");
      await expect( 
        launchpad.connect(contributor1).contribute(0, {value:additionalAmount})
      ).to.be.revertedWith("Project is not Active");;
  
  
      const projectDetails = await launchpad.getProjectDetails(0);
      expect(projectDetails.creator).to.equal(creator.address);
      expect(projectDetails.raisedAmount).to.equal(contributionAmount);
      expect(projectDetails.projectStatus).to.equal(1);
      const contribution = await launchpad.contributions(0, contributor1.address);
      expect(contribution).to.equal(contributionAmount);
      
    });

    it("should fail when trying to contribute after the deadline", async function () {
      const contributionAmount = ethers.parseEther("10");
  
      await launchpad.connect(contributor1).contribute(0, {value:contributionAmount});
  
      const additionalAmount = ethers.parseEther("1");
      await expect( 
        launchpad.connect(contributor1).contribute(0, {value:additionalAmount})
      ).to.be.revertedWith("Project is not Active");;
  
  
      const projectDetails = await launchpad.getProjectDetails(0);
      expect(projectDetails.creator).to.equal(creator.address);
      expect(projectDetails.raisedAmount).to.equal(contributionAmount);
      expect(projectDetails.projectStatus).to.equal(1);
      const contribution = await launchpad.contributions(0, contributor1.address);
      expect(contribution).to.equal(contributionAmount);
      
    });
  
  });

});


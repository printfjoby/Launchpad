async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    const Launchpad = await ethers.deployContract("Launchpad");

    await Launchpad.waitForDeployment();
  
    console.log("Launchpad address:", await Launchpad.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
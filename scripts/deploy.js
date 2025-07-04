async function main() {
  const Voting = await ethers.getContractFactory("Voting");

  // Start deployment, returning a promise that resolves to a contract object
  const Voting_ = await Voting.deploy(["Mark", "Mike", "Henry", "Rock"], 90);
  
  // Wait for deployment to complete
  await Voting_.deployed();
  
  console.log("Contract deployed to address:", Voting_.address);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });
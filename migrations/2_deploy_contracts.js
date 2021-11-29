const EventTicketing = artifacts.require("./EventTicketing.sol");

module.exports = function (deployer) {
  deployer.deploy(EventTicketing);
};

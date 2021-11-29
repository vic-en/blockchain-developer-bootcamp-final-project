const { catchRevert } = require("./exceptionsHelpers.js");
const EventTicketing = artifacts.require("EventTicketing");

const createEventEntry = async (instance, tx = {}) => {
  await instance.addToEventList(
    3,
    web3.utils.toWei("0.156"),
    "ConsenSys Bootcamp",
    "https://google.com",
    tx
  );
};

contract("EventTicketing", function (accounts ) {
  const [contractOwner, mod1, mod2, attendee] = accounts;
  const deposit = web3.utils.toBN(2);

  beforeEach(async () => {
    instance = await EventTicketing.new();
    await createEventEntry(instance, { from: mod1 });
  });

  it("Confirm eventList is updated properly", async function () {
    const totalEvents = await instance.getTotalEventsCount();
    const eventInfo = await instance.getEventInfo(1);
    assert.equal(totalEvents, 1);
    assert.equal(eventInfo.eventName, "ConsenSys Bootcamp");
    assert.equal(eventInfo.price.toString(), web3.utils.toWei("0.156"));
    assert.equal(eventInfo.state.toString(), 0);
    assert.equal(eventInfo.capacity.toString(), 3);
    assert.equal(eventInfo.totalAttendees.toString(), 0);
    assert.equal(eventInfo.url, "https://google.com");
    assert.equal(eventInfo.creator, mod1);
  });

  it("Confirm event entry can be updated", async function () {
    const updateState = await instance.updateEventState(1, { from: mod1 });
    const eventInfo = await instance.getEventInfo(1);
    assert.equal(eventInfo.state.toString(), 1);
  });

  it("Confirm only moderators of an event can update status of that event", async function () {
    await catchRevert(instance.updateEventState(1, { from: mod2 }));
  });

  it("Confirm moderator can be added and can update event state", async function () {
    const result = await instance.addEventModerator(1, mod2, { from: mod1 });
    const updateState = await instance.updateEventState(1, { from: mod2 });
    const eventInfo = await instance.getEventInfo(1);
    assert.equal(result.logs[0].args.sender, mod1);
    assert.equal(result.logs[0].args.account, mod2);
    assert.equal(eventInfo.state.toString(), 1);
  });

  it("Confirm attendee can buy event ticket", async function () {
    const amtBeingSent = web3.utils.toWei("0.156") * 2; // twice the ticket cost
    const attendeeBalanceBefore = await web3.eth.getBalance(attendee);
    const butTicket = await instance.buyEventTicket(1, { from: attendee, value: amtBeingSent });
    const attendeeBalanceAfter = await web3.eth.getBalance(attendee);
    const ticketStatus = await instance.getAttendeeTicketStatus(1, attendee, { from: attendee });
    assert.isBelow(attendeeBalanceBefore - attendeeBalanceAfter, amtBeingSent); // implies excess to returned
    assert.equal(butTicket.logs[0].args.eventId.toString(), 1);
    assert.equal(butTicket.logs[0].args.attendee, attendee);
    assert.isTrue(ticketStatus);
  });

  it("Confirm only those who bought a ticket get a confirmed ticket status", async function () {
    const ticketStatus = await instance.getAttendeeTicketStatus(1, attendee, { from: attendee });
    assert.isFalse(ticketStatus);
  });

  it("Confirm event creator can view and withdraw accumulated balance", async function () {
    const butTicket = await instance.buyEventTicket(1, { from: attendee, value: web3.utils.toWei("0.156") });
    const totalEscrowFundBefore = await instance.escrowBalance({ from: mod1 });
    const withdrawFund = await instance.withdrawFromEscrow({ from: mod1 });
    const totalEscrowFundAfter = await instance.escrowBalance({ from: mod1 });
    assert.equal(totalEscrowFundBefore, web3.utils.toWei("0.156"));
    assert.equal(totalEscrowFundAfter, web3.utils.toWei("0"));
  });
});

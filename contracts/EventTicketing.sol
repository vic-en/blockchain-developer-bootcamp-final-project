// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/escrow/Escrow.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Contract for decentralized event ticketing
/// @author Victor Adeleke
/// @notice Allows event organizer(s) to sell event tickets.
contract EventTicketing is Ownable, AccessControl {
  using SafeMath for uint256;

  /// @notice Emitted when an organizer creates an event.
  /// @param eventId Event's id
  /// @param organizer organizer's address
  event LogEventAdded(uint256 indexed eventId, address indexed organizer);

  /// @notice Emitted when a moderator updates the state of an event
  /// @param eventId Event's id
  event LogEventStateUpdated(uint256 indexed eventId);

  /// @notice Emitted when an attendee purchases an event ticket.
  /// @param eventId Event's id
  /// @param attendee attendee's address
  event LogEventTicketPurchased(uint256 indexed eventId, address indexed attendee);

  /// @dev creates an instance of excrow
  Escrow escrow;

  /// @dev Keeps count of events.
  uint256 private eventsCounter = 0;

  /// @dev Enum of states of an event
  enum State { StartingSoon, Ended }

  /// @dev struct of info for an event
  struct EventInfo {
    uint256 eventId;
    uint256 capacity;
    uint256 totalAttendees;
    mapping (address => bool) attendees;
    uint256 price;
    string eventName;
    string url;
    State status;
    address payable creator;
  }

  mapping (uint256 => EventInfo) public eventList;

  mapping (uint256 => bytes32) public eventRoles;

  /// @dev checks that event creators have deposit in escrow
  modifier hasDeposits() {
    require (escrow.depositsOf(msg.sender) > 0, 'NO_DEPOSIT');
    _;
  }

  /// @dev checks that tickets can still be booked for an event
  /// @param _eventId id of the event to check availability
  modifier isTicketAvailable(uint256 _eventId) {
    require(eventList[_eventId].capacity > eventList[_eventId].totalAttendees, 'SOLD_OUT');
    _;
  }

  /// @dev checks that event caller is the creator of the event
  /// @param _eventId id of the event to be check
  modifier isEventAdmin(uint256 _eventId) {
    require(eventList[_eventId].creator == msg.sender, 'ADMIN_ONLY');
    _;
  }

  /// @dev checks that attendee is paying enough to cover cost of event ticket
  /// @param _price cost of event ticket
  modifier paidEnough(uint256 _price) {
    require(msg.value >= _price, 'INSUFFICIENT_AMOUNT');
    _;
  }

  /// @dev does refund for cases where attendee pay more than cost of event ticket
  /// @param _eventId id of the event to check for ticket cost
  modifier checkValue(uint256 _eventId) {
    //refund them after pay for ticket
    _;
    uint256 _price = eventList[_eventId].price;
    uint256 amountToRefund = msg.value - _price;
    payable(msg.sender).transfer(amountToRefund);
  }

  constructor() {
    escrow = new Escrow();
  }

  /// @notice To know the total number of events created through this contract
  /// @return total number of events created so far.
  function getTotalEventsCount() public view returns (uint256) {
    return eventsCounter;
  }

  /// @notice add an event info
  /// @param _capacity allowed capacity for event
  /// @param _price cost of event ticket
  /// @param _eventName name of event being created
  /// @param _url http link containing detailed info about event
  function addToEventList(uint256 _capacity, uint256 _price, string calldata _eventName, string calldata _url) public {
    eventsCounter += 1;
    EventInfo storage eInfo = eventList[eventsCounter];
    eInfo.eventId = eventsCounter;
    eInfo.capacity = _capacity;
    eInfo.totalAttendees = 0;
    eInfo.price = _price;
    eInfo.eventName = _eventName;
    eInfo.url = _url;
    eInfo.status = State.StartingSoon;
    eInfo.creator = payable(msg.sender);

    eventRoles[eventsCounter] = keccak256(abi.encodePacked((eventsCounter)));

    _setupRole(eventRoles[eventsCounter], msg.sender);

    emit LogEventAdded(eventsCounter, msg.sender);
  }

  /// @notice update an event state
  /// @param _eventId id of the event to be updated
  function updateEventState(uint256 _eventId) public onlyRole(eventRoles[_eventId]) {
    EventInfo storage eInfo = eventList[_eventId];
    eInfo.status = State.Ended;

    emit LogEventStateUpdated(_eventId);
  }

  /// @notice add an event info
  /// @param _eventId id of the event that will have a new moderator
  /// @param _moderator address of new moderator to be added
  function addEventModerator(uint256 _eventId, address _moderator) public isEventAdmin(_eventId) {
    _setupRole(eventRoles[_eventId], _moderator);
  }

  /// @notice get info about a particular event
  /// @param _eventId id of event to get info about
  /// @return eventName name of event
  /// @return eventId id of event
  /// @return price cost of event ticket
  /// @return capacity number of attendees registered attendees sofar
  /// @return totalAttendees number of allowed attendees
  /// @return state the state of the event
  /// @return url http link containing detailed info about event
  /// @return creator the address of the account that created this event
  function getEventInfo(uint256 _eventId) public view
  returns (string memory eventName, uint256 eventId, uint256 price, uint256 capacity, uint256 totalAttendees, uint256 state, string memory url, address creator)
  {
  eventName = eventList[_eventId].eventName;
  eventId = _eventId;
  price = eventList[_eventId].price;
  capacity = eventList[_eventId].capacity;
  totalAttendees = eventList[_eventId].totalAttendees;
  state = uint8(eventList[_eventId].status);
  url = eventList[_eventId].url;
  creator = eventList[_eventId].creator;
  return (eventName, eventId, price, capacity, totalAttendees, state, url, creator);
  }

  /// @notice For booking a ticket for an event
  /// @param _eventId the id of the event to book ticket for
  function buyEventTicket(uint256 _eventId) public payable isTicketAvailable(_eventId) paidEnough(_eventId) checkValue(_eventId) {
  escrow.deposit{value: eventList[_eventId].price}(eventList[_eventId].creator);
  eventList[_eventId].attendees[msg.sender] = true;
  eventList[_eventId].totalAttendees += 1;
  emit LogEventTicketPurchased(_eventId, msg.sender);
  }

  /// @notice Used to know if an attendee has bought a ticket
  /// @param _eventId the id of the event to check
  /// @param _attendee the address  of the attendee to confirm
  function getAttendeeTicketStatus(uint256 _eventId, address _attendee) public view returns (bool) {
    return eventList[_eventId].attendees[_attendee];
  }

  /// @notice Allows event creator to see the accumulated amounts for tickets sold
  /// @return uint256 the amount accrued so far
  function escrowBalance() external view returns (uint256) {
    return escrow.depositsOf(msg.sender);
  }

  /// @notice Allows event creator to withdraw the accumulated amounts for tickets sold
  function withdrawFromEscrow() external hasDeposits {
    escrow.withdraw(payable(msg.sender));
  }

}

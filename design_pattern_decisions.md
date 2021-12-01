# Design patterns used

## Access Control Design Patterns

- `AccessControl` design pattern used in `updateEventState()` function. This function do not need to be used by anyone else apart from the event creator/moderators, i.e. the party that is responsible for managing the event operations.

## Inheritance and Interfaces

- `EventTicketing` contract inherits the OpenZeppelin `Ownable` and `AccessControl` contract to enable ownership for one managing user/party.

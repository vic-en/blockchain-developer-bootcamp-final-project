# Final project - Decentralized Ticketing System

## Deployed version url:
https://consensys-project-vic-en.vercel.app/


## How to run this project locally:

### Prerequisites

- Node.js >= v14
- Truffle and Ganache
- Yarn
- `git checkout master`

### Contracts

- Run `yarn install` in project root to install Truffle build and smart contract dependencies
- Run local testnet in port `7545` with an Ethereum client, e.g. Ganache
- `truffle migrate --network development`
- `truffle console --network development`
- Run tests in Truffle console: `test`
- `development` network id is 1337, remember to change it in Metamask as well!

### Frontend

- `cd client`
- `yarn install`
- `yarn start`
- Open `http://localhost:3000`

### How to populate locally deployed contract with listings

- `truffle migrate --network development`
- `cd client && yarn install`
- `yarn build && yarn start`
- Open local ui from `http://localhost:3000`
- Make sure your Metamask localhost network is in port `7545` and chain id is `1337`.
- If you get `TXRejectedError` when sending a transaction, reset your Metamask account from Advanced settings.
- Navigate to the link to add events on `http://localhost:3000/create` then add an event.
- Return to the homepage and test the purchasing ticket works by clicking on the `Buy Ticket` link.

## Screencast link

https://youtu.be/3Vb_6CLiUVY

## Public Ethereum wallet for certification:

`0x4286F42d354441590959345bD121fe464b204116`

## Project description

Event ticketing allows event organizers to create custom EVENT tickets to SELL for their events.

Event organizers create an event and specify max number of attendees along with other informations. Attendees puchase event tickets with the event is yet to expire. Event tickets funds accumulate in escrow of the event creator which can be withdrawn at any time. Event moderators can verify that an attendee has purchased a ticket just by querying the contract with the address of the attendee. Event moderators can update the state of event to "expired", after which attendee(s) will not be able to puchase tickets.

- Attendees can proof they purchased a ticket by showing ownership or presenting the address they used to purchase the ticket.

## Simple workflow

1. Enter service web site
2. Login with Metamask
3. Select event you want to purchase ticket for.
4. Pay for ticker to event.
5. Event creators have a separate page to create event with details.

## Directory structure

- `client`: Project's React frontend.
- `contracts`: Smart contracts that are deployed in the Ropsten testnet.
- `migrations`: Migration files for deploying contracts in `contracts` directory.
- `test`: Tests for smart contracts.

## Environment variables (not needed for running project locally)

```
ROPSTEN_INFURA_PROJECT_URL=
PRIVATE_KEY=
```

## TODO features

- Add more features for Event creator to view and withdraw accumulated funds on frontend
- Improve aesthetics of frontend.

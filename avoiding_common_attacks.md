# Contract security measures

## SWC-103 (Floating pragma)

Specific compiler pragma `0.8.10` used in contracts to avoid accidental bug inclusion through outdated compiler versions.

## SWC-105 (Unprotected Ether Withdrawal)

`withdrawFromEscrow` is protected with `hasDeposits` modifier which uses OpenZeppelin `Escrow`'s to determine if caller has withdrawable Ethers.

## SWC-101 (Integer Overflow and Underflow)

OpenZeppelin `SafeMath` library is used to cover arithmetic operations consistently throughout the smart contract system.

## SWC-102 (Outdated Compiler Version)

The latest solidity compiler version `0.8.10` is used which was released 22 days ago (on November 8, 2021).

## Modifiers used only for validation

All modifiers in contract(s) only validate data with `require` statements.

## Pull over push

All functions that modify state are based on receiving calls rather than making contract calls.

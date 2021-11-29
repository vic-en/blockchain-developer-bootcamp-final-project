import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { Link, Redirect } from 'react-router-dom';
import { useContract } from '../../hooks/useContract';
import { useEventTicketing } from '../../hooks/useEventTicketing';
import EventTicketingABI from '../../../contract-build/contracts/EventTicketing.json';
import Text from '../../components/Text';
import { colors } from '../../theme';

const AddEventState = {
  LOADING: 'LOADING',
  WAITING: 'WAITING_CONFIRMATIONS',
  READY: 'READY',
  ERROR: 'ERROR',
  BOUGHT: 'BOUGHT',
};

const KEYCODE_DUMMY = 455224;
const CONFIRMATION_COUNT = 2;

const CreateButton = styled(Button).attrs({ variant: 'outline-success' })`
  color: ${colors.green};
  border-color: ${colors.green};
  margin-top: 20px;
`;

const AddEvent = ({ location, eventTicketingAddress }) => {
  const [status, setStatus] = useState(AddEventState.READY);
  const [mmError, setMmError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const { active, account, chainId } = useWeb3React();
  const contract = useContract(eventTicketingAddress, EventTicketingABI.abi);
  const searchParams = new URLSearchParams(location.search);
  // const eventId = searchParams.get('id');
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  const handleSubmit = async (event) => {
    setStatus(AddEventState.LOADING);
    try {
      setStatus(AddEventState.WAITING);
      event.preventDefault();
      console.log(inputs);
      console.log(inputs.price * 1e9);
      const transaction = await contract.addToEventList(
        inputs.capacity,
        inputs.price * 1e9,
        inputs.name,
        inputs.url,
        { from: account, });
      const confirmations = chainId === 3 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(AddEventState.BOUGHT);
    } catch (e) {
      setStatus(AddEventState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError(e.message);
      }
    }
  };

  if (!active) return <Redirect to="/" />;

  const { LOADING, WAITING, READY, BOUGHT, ERROR } = AddEventState;

  return (
    <Container fluid className="mt-5 d-flex flex-column justify-content-center align-items-center">
      <Text t1>Create Event Tickets:</Text>
      <Text style={{ maxWidth: '70%', margin: '35px', textAlign: 'right' }}>
      Fill the following form to create an entry for you event:
      <form onSubmit={handleSubmit}>
        <label>Enter name of event:
        <input
          type="text"
          name="name"
          value={inputs.name || ""}
          onChange={handleChange}
        />
        </label>
        <br/>
        <label>Enter number of tickets to make available for sale:
          <input
            type="number"
            name="capacity"
            min="1"
            value={inputs.capacity || "1"}
            onChange={handleChange}
          />
          </label><br/>
          <label>Enter cost of each event ticket(in ETH):
          <input
            type="float"
            name="price"
            min="0"
            value={inputs.price || "0.001"}
            onChange={handleChange}
          />
          </label><br/>
          <label>Enter an HTTP link for users to get more info about event:
          <input
            type="text"
            name="url"
            value={inputs.url || ""}
            onChange={handleChange}
          />
          </label><br/>
          <input type="submit" />
      </form>
      </Text>
      {status === LOADING ||
        (status === WAITING && (
          <>
            <Spinner
              animation="border"
              size="sm"
              style={{ color: colors.green, marginTop: '20px', marginBottom: '20px' }}
            />
            {status === WAITING && <Text>You'll need at least {CONFIRMATION_COUNT} network confirmations... </Text>}
          </>
        ))}
      {status === BOUGHT && !!txHash && (
        <>
          <Text t3 color={colors.green} style={{ marginTop: '20px', marginBottom: '20px' }}>
            You've create an event successfully!
          </Text>
          <Text>
            See this transaction in{' '}
            <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">
              Etherscan
            </Link>
          </Text>
        </>
      )}
      {status === ERROR && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }} color={colors.red}>
            {mmError || 'Error encountered!'}
          </Text>
        </>
      )}
      <Link style={{ marginTop: '20px' }} to="/">
        Back to front page
      </Link>
    </Container>
  );
};

const AddEventWrapper = ({ location }) => {
  const { eventTicketingAddress } = useEventTicketing();
  if (!eventTicketingAddress) return null;
  return <AddEvent location={location} eventTicketingAddress={eventTicketingAddress} />;
};

export default AddEventWrapper;

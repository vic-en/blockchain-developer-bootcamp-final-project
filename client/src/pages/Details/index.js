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

const DetailsState = {
  LOADING: 'LOADING',
  WAITING: 'WAITING_CONFIRMATIONS',
  READY: 'READY',
  ERROR: 'ERROR',
  BOUGHT: 'BOUGHT',
};

const KEYCODE_DUMMY = 455224;
const CONFIRMATION_COUNT = 2;

const BuyButton = styled(Button).attrs({ variant: 'outline-success' })`
  color: ${colors.green};
  border-color: ${colors.green};
  margin-top: 20px;
`;

const Details = ({ location, eventTicketingAddress }) => {
  const [status, setStatus] = useState(DetailsState.READY);
  const [mmError, setMmError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [events, setEvents] = useState(undefined);
  const { active, account, chainId } = useWeb3React();
  const contract = useContract(eventTicketingAddress, EventTicketingABI.abi);
  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get('id');

  useEffect(() => {
    const getEventInfo = async () => {
      const events = await contract.getEventInfo(eventId);
      setEvents(events);
    };
    getEventInfo();
  }, []);

  const onBuyClick = async () => {
    setStatus(DetailsState.LOADING);
    try {
      setStatus(DetailsState.WAITING);
      const transaction = await contract.buyEventTicket(eventId, {
        from: account,
        value: events.price,
      });
      const confirmations = chainId === 3 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(DetailsState.BOUGHT);
    } catch (e) {
      setStatus(DetailsState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError(e.message);
      }
    }
  };

  if (!active) return <Redirect to="/" />;

  const { LOADING, WAITING, READY, BOUGHT, ERROR } = DetailsState;

  return (
    <Container fluid className="mt-5 d-flex flex-column justify-content-center align-items-center">
      <Text t1>Event Ticket:</Text>
      <Text style={{ maxWidth: '50%', margin: '10px', textAlign: 'center' }}>
      Tickets are still available for event with id {eventId}.
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
      {status === READY && (
        <BuyButton disabled={!events} onClick={onBuyClick}>
          Buy Ticket Now
        </BuyButton>
      )}
      {status === BOUGHT && !!txHash && (
        <>
          <Text t3 color={colors.green} style={{ marginTop: '20px', marginBottom: '20px' }}>
            You've registered successfully!
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

const DetailsWrapper = ({ location }) => {
  const { eventTicketingAddress } = useEventTicketing();
  if (!eventTicketingAddress) return null;
  return <Details location={location} eventTicketingAddress={eventTicketingAddress} />;
};

export default DetailsWrapper;

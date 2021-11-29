import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import Text from '../../components/Text';
import { Link, Redirect } from 'react-router-dom';
import Listings from '../../components/Listings';
import { useEventTicketing } from '../../hooks/useEventTicketing';
import { colors } from '../../theme';

const Home = () => {
  const { active } = useWeb3React();
  const { eventTicketingAddress } = useEventTicketing();

  const NotActive = () => {
    return (
      <Text>
        Connect{' '}
        {
          <Text>
            <a style={{ color: colors.green }} href="./" target="blank">
              Ropsten
            </a>
          </Text>
        }{' '}
        wallet to continue.
      </Text>
    );
  };

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      <Text center t1 style={{ marginBottom: '20px' }}>
        Event ticketing system.
      </Text>
      <Link to={{ pathname: `/create` }}>
        Click here to add an event.
      </Link>
      {!active && <NotActive />}
      {eventTicketingAddress && <Listings eventTicketingAddress={eventTicketingAddress} />}
    </Container>
  );
};

export default Home;

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';
import Text from './Text';
import { useContract } from '../hooks/useContract';
import { shortenAddress } from '../utils/shortenAddress';
import { colors } from '../theme';

import EventTicketingABI from '../../contract-build/contracts/EventTicketing.json';

const listingState = {
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
};

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  max-width: 90%;
  flex-wrap: wrap;
`;

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  max-width: 175px;
`;

const StyledItemTextContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
`;

const FilteredEventListing = ({ listings, status }) => {
  const filtered = listings.filter((l) => BigNumber.from(l.state).toNumber() === status);

  if (filtered.length < 1) {
    return <Text>Nothing here 🤷</Text>;
  }

  return (
    <StyledDiv>
      {filtered.map((l, id) => {
        return <ListingItem item={l} />;
      })}
    </StyledDiv>
  );
};

const ListingItem = ({ item }) => {
  return (
    <StyledItem>
      <StyledItemTextContainer>
        <Text center>{item.eventName}</Text>
        <Text center bold color={colors.green}>
          {formatEther(item.price)} ETH
        </Text>
        <Link
          style={{ textAlign: 'center' }}
          to={item.url}
        >
          Event info
        </Link>
        {item.state.toString() === '0' && item.totalAttendees < item.capacity && (
          <Link
            style={{ textAlign: 'center' }}
            to={{ pathname: '/details', search: `?id=${item.eventId}` }}
          >
            Buy Ticket Now!
          </Link>
          
        )}
        {item.state.toString() === '1' && item.tenant && <Text center>Event Expired</Text>}
        <Text center>Event creator: {shortenAddress(item.creator)}</Text>
      </StyledItemTextContainer>
    </StyledItem>
  );
};

const Listings = ({ eventTicketingAddress }) => {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState(listingState.LOADING);
  const { active } = useWeb3React();
  const contract = useContract(eventTicketingAddress, EventTicketingABI.abi);

  const getProperties = useCallback(async (contract) => {
    try {
      // still on the lookout for optimal solidity data structures, this ain't it
      const idListLengthBN = await contract.getTotalEventsCount();
      const events = [];
      for (let x=1; x<=idListLengthBN.toString(); x++) { events.push(x); }
      const arr = await Promise.all(events.map((id) => contract.getEventInfo(id)));
      setListings(arr);
      setStatus(listingState.READY);
    } catch (e) {
      console.log('error:', e);
      setStatus(listingState.ERROR);
    }
  }, []);

  useEffect(() => {
    if (active) {
      getProperties(contract);
    }
  }, [active]);

  if (!active) {
    return null;
  }

  if (status === listingState.LOADING) {
    return <Spinner animation="border" size="sm" style={{ color: colors.green, marginTop: '20px' }} />;
  }

  return (
    <>
      <Text t3 color={colors.green}>
        Available Events:
      </Text>
      <FilteredEventListing listings={listings} status={0} />
      <Text t3 color={colors.red} style={{ marginTop: '20px' }}>
        Expired Events:
      </Text>
      <FilteredEventListing listings={listings} status={1} />
    </>
  );
};

export default Listings;

import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import EventTicketingABI from '../../contract-build/contracts/EventTicketing.json';

export function useEventTicketing() {
  const { chainId } = useWeb3React();
  const [eventTicketingAddress, setEventTicketingAddress] = useState(null);

  useEffect(() => {
    if (chainId) {
      console.log(chainId);
      setEventTicketingAddress(EventTicketingABI.networks[chainId]?.address);
      console.log(eventTicketingAddress);
    }
  }, [chainId]);

  return {
    eventTicketingAddress,
  };
}

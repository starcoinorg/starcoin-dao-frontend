import { Flex, Button, Spinner } from '@chakra-ui/react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { utils, bcs } from '@starcoin/starcoin';
import { nodeUrlMap } from '../utils/consts';
import { hexlify } from '@ethersproject/bytes';
import { getTxnData, getEventsByTxnHash } from '../utils/sdk';
import { sleep } from '../utils/common';
import { useState } from 'react';
import { deployContract } from '../utils/stcWalletSdk';
import { useOverlay } from '../contexts/OverlayContext';

const DaoDeploy = ({ blob, handleUpdate }) => {
  const { injectedProvider } = useInjectedProvider();
  const [loading, setLoading] = useState(false);
  const { successToast, errorToast } = useOverlay();

  const onClick = async () => {
    setLoading(true);

    const transactionHash = await deployContract(injectedProvider, blob);

    setLoading(false);

    successToast({
      title: 'Dao Summoned!',
      description: `Your dao has been summoned. View the transaction here: ${transactionHash}`,
    });

    handleUpdate();
  };

  return (
    <Flex w='100%' display='flex'>
      {!loading ? (
        <Button mx='auto' size='sm' onClick={onClick} mt={10}>
          Deploy
        </Button>
      ) : (
        <Spinner size='sm' mx='auto' mt={10} />
      )}
    </Flex>
  );
};

export default DaoDeploy;

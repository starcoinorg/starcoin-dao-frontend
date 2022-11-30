import { Flex, Button, Spinner } from '@chakra-ui/react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { utils, bcs } from '@starcoin/starcoin';
import { nodeUrlMap } from '../utils/consts';
import { hexlify } from '@ethersproject/bytes';
import { getTxnData, getEventsByTxnHash } from '../utils/sdk';
import { sleep } from '../utils/common';
import ContentBox from '../components/ContentBox';
import { useState } from 'react';
import { deployContract } from '../utils/stcWalletSdk';
import { useOverlay } from '../contexts/OverlayContext';
import { polling } from '../utils/polling';

const DaoDeploy = ({ blob, handleUpdate }) => {
  const { injectedProvider } = useInjectedProvider();
  const [loading, setLoading] = useState(false);
  const { successToast, errorToast } = useOverlay();

  const onClick = async () => {
    setLoading(true);

    try {
      const transactionHash = await deployContract(injectedProvider, blob);

      await polling(injectedProvider, transactionHash);

      setLoading(false);

      successToast({
        title: 'Dao Summoned!',
        description: `Your dao has been summoned. View the transaction here: ${transactionHash}`,
      });

      handleUpdate();
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <Flex w='100%' display='flex'>
      <Flex as={ContentBox} w='50%' margin='0 auto'>
        {!loading ? (
          <Button mx='auto' size='sm' onClick={onClick} mt={10}>
            Deploy
          </Button>
        ) : (
          <Spinner size='sm' mx='auto' mt={10} />
        )}
      </Flex>
    </Flex>
  );
};

export default DaoDeploy;

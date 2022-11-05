import { Flex, Button, Spinner } from '@chakra-ui/react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { utils, bcs } from '@starcoin/starcoin';
import { nodeUrlMap } from '../utils/consts';
import { hexlify } from '@ethersproject/bytes';
import { getTxnData, getEventsByTxnHash } from '../utils/sdk';
import { sleep } from '../utils/common';
import { useState } from 'react';

const DaoAccountCreate = ({ next }) => {
  const { address, injectedProvider } = useInjectedProvider();
  const [loading, setLoading] = useState(false);

  const hasHaveCap = async () => {
    const result = await injectedProvider.getResources(address);

    console.log(result);

    let capAddress =
      result['0x00000000000000000000000000000001::DAOAccount::DAOAccountCap'];

    return capAddress ? capAddress['dao_address'] : undefined;
  };

  const onClick = async () => {
    setLoading(true);

    let capAddress = await hasHaveCap();

    if (capAddress) {
      console.log('cap address ' + capAddress);
      next(capAddress);
    } else {
      let tx = await createDaoAccount();

      if (tx) {
        let txData = await getTxnData(injectedProvider, tx);
        let count = 0;

        while (!txData && count++ < 60) {
          await sleep(1000);
          txData = await getTxnData(injectedProvider, tx);
          window.console.info('tx', count, txData);
        }

        capAddress = await hasHaveCap();

        if (capAddress) {
          next(capAddress);
        }
      }
    }

    setLoading(false);
  };

  const createDaoAccount = async () => {
    const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(
      '0x1::DAOAccount::create_account_entry',
      [],
      [],
      nodeUrlMap[window.starcoin.networkVersion],
    );
    // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
    const payloadInHex = (function() {
      const se = new bcs.BcsSerializer();
      scriptFunction.serialize(se);
      return hexlify(se.getBytes());
    })();

    const txParams = {
      data: payloadInHex,
      expiredSecs: 10,
    };

    const transactionHash = injectedProvider
      .getSigner()
      .sendUncheckedTransaction(txParams);

    return transactionHash;
  };

  return (
    <Flex w='100%' display='flex'>
      {!loading ? (
        <Button mx='auto' size='sm' onClick={onClick} mt={10}>
          Create Dao Account
        </Button>
      ) : (
        <Spinner size='sm' mx='auto' mt={10} />
      )}
    </Flex>
  );
};

export default DaoAccountCreate;

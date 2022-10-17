import React, { useEffect, useState } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Flex, Stack, Button, Link, Spinner } from '@chakra-ui/react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useOverlay } from '../contexts/OverlayContext';
import MainViewLayout from '../components/mainViewLayout';
import CheckpointCard from '../components/checkpointCard';
import TextBox from '../components/TextBox';
import { get_chain_info, get_block_by_hash } from '../utils/chain';
import {
  checkpoint,
  listCheckpoints,
  updateStateRoot,
} from '../utils/checkpoints';

const Checkpoints = () => {
  const { address, injectedChain, injectedProvider } = useInjectedProvider();
  const [loading, setLoading] = useState(true);
  const [checkpoints, setCheckpoints] = useState({});
  const { errorToast } = useOverlay();

  useEffect(() => {
    const getSnaphots = async () => {
      try {
        const checkpoints = await listCheckpoints();
        setCheckpoints(checkpoints);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
        errorToast({
          title: 'Fetching snapshot proposals failed.',
        });
      }
    };

    getSnaphots();
  }, [injectedChain]);

  const createCheckpoint = async () => {
    try {
      await checkpoint(injectedProvider);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateRootState = async (_, checkpoint) => {
    try {
      const block = await get_block_by_hash(
        injectedChain.chainId,
        checkpoint.block_hash,
      );
      console.log('block:', block);

      await updateStateRoot(injectedProvider, block.raw.header);
    } catch (err) {
      console.log(err);
    }
  };

  const newSnapshotButton = (
    <Flex>
      <Button
        as={Link}
        rightIcon={<RiAddFill />}
        isExternal
        mr={10}
        onClick={createCheckpoint}
      >
        New Checkpoint
      </Button>
    </Flex>
  );

  return (
    <MainViewLayout
      header='Checkpoints'
      headerEl={newSnapshotButton}
      isDao={false}
    >
      <Flex as={Stack} direction='column' spacing={4} w='100%'>
        {!loading ? (
          Object.keys(checkpoints).length > 0 ? (
            Object.values(checkpoints)
              .slice(0, 10)
              .map(checkpoint => (
                <CheckpointCard
                  checkpoint={checkpoint}
                  onClickUpdateRootState={event =>
                    handleUpdateRootState(event, checkpoint)
                  }
                />
              ))
          ) : (
            <Flex mt='100px' w='100%' justify='center'>
              <TextBox variant='value' size='lg'>
                No checkpoints Found.
              </TextBox>
            </Flex>
          )
        ) : (
          <Spinner size='xl' />
        )}
      </Flex>
    </MainViewLayout>
  );
};

export default Checkpoints;

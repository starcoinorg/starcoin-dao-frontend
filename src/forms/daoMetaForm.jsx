import React, { useState } from 'react';
import { AiOutlineCaretDown, AiFillQuestionCircle } from 'react-icons/ai';
import {
  RiDiscordFill,
  RiTelegramFill,
  RiTwitterFill,
  RiGlobeLine,
  RiMediumFill,
} from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import {
  Flex,
  FormControl,
  Input,
  Textarea,
  Image,
  Stack,
  InputGroup,
  InputLeftAddon,
  Box,
  Button,
  Spinner,
  Select,
  FormHelperText,
  HStack,
} from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import ContentBox from '../components/ContentBox';
import TextBox from '../components/TextBox';
import { daoPresets } from '../utils/summoning';
import { themeImagePath } from '../utils/metadata';
import ImageUploadModal from '../modals/imageUploadModal';
import { DaoService } from '../services/daoService';
import { deployContract } from '../utils/stcWalletSdk';
import { useOverlay } from '../contexts/OverlayContext';

const puposes = daoPresets('0x1').map(preset => preset.presetName);

const DaoMetaForm = ({ metadata, handleUpdate }) => {
  const [ipfsHash, setIpfsHash] = useState();
  const [loading, setLoading] = useState();
  const [uploading, setUploading] = useState();

  const { address, injectedProvider } = useInjectedProvider();
  const { register, handleSubmit } = useForm();
  const { successToast, errorToast } = useOverlay();

  const daoService = new DaoService();

  const onSubmit = async data => {
    setLoading(true);

    try {
      if (ipfsHash) {
        data.avatarImg = ipfsHash;
      }

      data.tags = data.tags.split(',');

      const cfg = {
        ...data,
        name: data.name.toUpperCase(),
        address: address,

        proposalConfig: {
          voting_delay: 1 * 60 * 60 * 24,
          voting_period: 1 * 60 * 60 * 24,
          voting_quorum_rate: 100 / 100,
          min_action_delay: 1 * 60 * 60 * 24,
          min_proposal_deposit: 1 * 10 ** 18,
        },
      };

      const daoBlobBuf = await daoService.createDao(cfg);
      const transactionHash = await deployContract(
        injectedProvider,
        daoBlobBuf,
      );

      setLoading(false);
      successToast({
        title: 'Dao Summoned!',
        description: `Your dao has been summoned. View the transaction here: ${transactionHash}`,
      });

      handleUpdate({
        chainId: injectedProvider.chainId,
        daoAddress: address,
      });
    } catch (err) {
      setLoading(false);
      errorToast({
        title: 'Error Summoning Dao',
        description: err.message,
      });
    }
  };

  return (
    <Flex as={ContentBox} w='100%'>
      <>
        {loading ? (
          <Spinner />
        ) : (
          <>
            {metadata && (
              <Flex
                as='form'
                onSubmit={handleSubmit(onSubmit)}
                direction='column'
                w='100%'
              >
                <FormControl id='avatarImg' mb={4}>
                  <HStack spacing={4}>
                    {ipfsHash || metadata.avatarImg ? (
                      <>
                        <Image
                          src={themeImagePath(ipfsHash || metadata.avatarImg)}
                          alt='brand image'
                          w='50px'
                          h='50px'
                        />
                      </>
                    ) : null}

                    <ImageUploadModal
                      ipfsHash={ipfsHash}
                      setIpfsHash={setIpfsHash}
                      setUploading={setUploading}
                      uploading={uploading}
                      matchMeta={metadata?.avatarImg}
                      setLabel='Upload Avatar'
                      changeLabel='Change Avatar'
                    />
                  </HStack>
                </FormControl>
                <FormControl id='name' mb={4}>
                  <TextBox size='xs' mb={2}>
                    Name
                  </TextBox>
                  <Flex>
                    <Input
                      ref={register({ required: true })}
                      defaultValue={metadata.name}
                      placeholder='Name your DAO...'
                      name='name'
                    />
                  </Flex>
                </FormControl>

                <FormControl id='description' mb={4}>
                  <TextBox size='xs' mb={2}>
                    Description
                  </TextBox>
                  <Textarea
                    ref={register({ required: true })}
                    defaultValue={metadata.description}
                    placeholder='Describe your DAO...'
                    name='description'
                  />
                </FormControl>

                <FormControl id='longDescription' mb={4}>
                  <TextBox size='xs' mb={2}>
                    Long Description
                  </TextBox>
                  <Textarea
                    ref={register}
                    defaultValue={metadata.longDescription}
                    placeholder='More content (not currently displayed in the app, maybe soon)'
                    name='longDescription'
                  />
                </FormControl>

                <FormControl id='purpose' mb={4}>
                  <TextBox size='xs' mb={2}>
                    Purpose
                  </TextBox>

                  <Select
                    ref={register({ required: true })}
                    defaultValue={metadata.purpose || 'Grants'}
                    w='80%'
                    icon={<AiOutlineCaretDown />}
                    name='purpose'
                  >
                    {puposes.map(value => (
                      <Box as='option' key={value}>
                        {value}
                      </Box>
                    ))}
                  </Select>
                </FormControl>

                <FormControl id='tags' mb={4}>
                  <TextBox size='xs' mb={2}>
                    Tags
                  </TextBox>
                  <Input
                    ref={register}
                    defaultValue={metadata.tags}
                    placeholder='Ethereum, Clubs'
                    name='tags'
                  />
                  <FormHelperText>Comma-separated list</FormHelperText>
                </FormControl>

                <TextBox size='xs' mb={2}>
                  Community Links
                </TextBox>
                <Stack spacing={2}>
                  <FormControl id='website' mb={4}>
                    <InputGroup>
                      <InputLeftAddon bg='transparent'>
                        <RiGlobeLine />
                      </InputLeftAddon>
                      <Input
                        ref={register}
                        defaultValue={metadata.links?.website}
                        placeholder='https://daohaus.club'
                        name='links.website'
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl id='twitter' mb={4}>
                    <InputGroup>
                      <InputLeftAddon bg='transparent'>
                        <RiTwitterFill />
                      </InputLeftAddon>
                      <Input
                        ref={register}
                        defaultValue={metadata.links?.twitter}
                        placeholder='@nowdaoit'
                        name='links.twitter'
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl id='discord' mb={4}>
                    <InputGroup>
                      <InputLeftAddon bg='transparent'>
                        <RiDiscordFill />
                      </InputLeftAddon>
                      <Input
                        ref={register}
                        defaultValue={metadata.links?.discord}
                        placeholder='https://discord.gg/daohaus'
                        name='links.discord'
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl id='telegram' mb={4}>
                    <InputGroup>
                      <InputLeftAddon bg='transparent'>
                        <RiTelegramFill />
                      </InputLeftAddon>
                      <Input
                        ref={register}
                        defaultValue={metadata.links?.telegram}
                        placeholder='https://t.me/'
                        name='links.telegram'
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl id='medium' mb={4}>
                    <InputGroup>
                      <InputLeftAddon bg='transparent'>
                        <RiMediumFill />
                      </InputLeftAddon>
                      <Input
                        ref={register}
                        defaultValue={metadata.links?.medium}
                        placeholder='https://medium.com/'
                        name='links.medium'
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl id='other' mb={4}>
                    <InputGroup>
                      <InputLeftAddon bg='transparent'>
                        <AiFillQuestionCircle />
                      </InputLeftAddon>
                      <Input
                        ref={register}
                        defaultValue={metadata.links?.other}
                        placeholder='https://hotdogs.com'
                        name='links.other'
                      />
                    </InputGroup>
                  </FormControl>
                </Stack>

                <Button type='submit' disabled={loading} my={4}>
                  Create
                </Button>
              </Flex>
            )}
          </>
        )}
      </>
    </Flex>
  );
};

export default DaoMetaForm;

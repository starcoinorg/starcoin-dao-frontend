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
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Box,
  Button,
  Spinner,
  Select,
  FormHelperText,
  HStack,
  useToast,
} from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import ContentBox from '../components/ContentBox';
import TextBox from '../components/TextBox';
import { daoPresets, pluginPresets } from '../utils/summoning';
import { themeImagePath } from '../utils/metadata';
import ImageUploadModal from '../modals/imageUploadModal';
import { DaoService } from '../services/daoService';
import { deployContract } from '../utils/stcWalletSdk';
import { useOverlay } from '../contexts/OverlayContext';
import { MultiSelect } from 'chakra-multiselect';
import { callContractWithSigner, callV2 } from '../utils/sdk';
import ImageUploader from 'react-images-upload';
import { fileToBase64 } from '../utils/fileUtils';
import { polling } from '../utils/polling';

const puposes = daoPresets('0x1').map(preset => preset.presetName);
const plugins = pluginPresets('0x1').map(preset => preset.presetName);

const DaoMetaForm = ({ metadata, next }) => {
  const toast = useToast();
  const [ipfsHash, setIpfsHash] = useState();
  const [loading, setLoading] = useState();
  const [uploading, setUploading] = useState();

  const { address, injectedProvider } = useInjectedProvider();
  const { register, handleSubmit } = useForm();
  const { successToast, errorToast } = useOverlay();

  const daoService = new DaoService();

  const [myPlugins, setMyPlugins] = useState(['InstallPluginProposalPlugin']);

  const [nftImages, setNFTImages] = useState();
  const onDrop = pictures => {
    setNFTImages(pictures);
  };

  const onSubmit = async data => {
    setLoading(true);

    if (nftImages == null || nftImages.length == 0) {
      toast({
        title: 'Tips',
        description: 'Please select NFT image.',
        status: 'error',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      });

      return;
    }

    try {
      const nftData = await fileToBase64(nftImages[0]);
      console.log('nftData', nftData);
      data.nftImage = nftData;

      data.tags = data.tags.split(',');
      data.members = data.members.split(',');
      data.proposal.voting_delay = data.proposal.voting_delay * 1000 * 60;
      data.proposal.voting_period = data.proposal.voting_period * 1000 * 60;
      data.proposal.min_action_delay =
        data.proposal.min_action_delay * 1000 * 60;

      const cfg = {
        ...data,
        name: data.name.toUpperCase(),
        address: metadata.address,
        plugins: myPlugins,

        proposalConfig: {
          ...data.proposal,
        },
      };

      const dao = await daoService.createDao(cfg);

      let s = await callContractWithSigner(
        injectedProvider,
        '0x1::DAOAccount::submit_upgrade_plan_entry',
        [],
        [dao.hash.toString(), 1, false],
      );

      await polling(injectedProvider, s);

      next(dao.blobBuf, cfg);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      errorToast({
        title: 'Error Summoning Dao',
        description: err.message,
      });
    }
  };

  return (
    <Flex w='100%'>
      <Flex as={ContentBox} w='50%' margin='0 auto'>
        <Flex
          direction='column'
          w='100%'
          as='form'
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormControl id='daoAddress' mb={4}>
            <TextBox size='xs' mb={2}>
              address
            </TextBox>
            <Flex>
              <Input
                ref={register({ required: true })}
                defaultValue={metadata.address}
                disabled={true}
                name='address'
              />
            </Flex>
          </FormControl>

          <FormControl id='avatarImg' mb={4}>
            <TextBox size='xs' mb={2}>
              NFT image:
            </TextBox>
            <ImageUploader
              withIcon={true}
              withPreview={true}
              singleImage={true}
              onChange={onDrop}
              imgExtension={['.jpg', '.gif', '.png', '.gif']}
              maxFileSize={5242880}
            />
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

          <FormControl id='plugins' mb={4}>
            <TextBox size='xs' mb={2}>
              Plugins
            </TextBox>

            <MultiSelect
              w='80%'
              options={plugins}
              value={myPlugins}
              onChange={v => {
                console.log(v.length);
                if (v.length === 0) {
                  setMyPlugins(['InstallPluginProposalPlugin']);
                } else {
                  setMyPlugins(v);
                }
              }}
            />
          </FormControl>

          <FormControl id='init_menmber' mb={4}>
            <TextBox size='xs' mb={2}>
              Init Member
            </TextBox>
            <Textarea
              ref={register}
              defaultValue={metadata.members}
              placeholder='Invate Members, sprit ,'
              name='members'
            />
            <FormHelperText>Comma-separated list</FormHelperText>
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
            Proposal Config
          </TextBox>
          <Stack>
            <FormControl id='voting_delay'>
              <InputGroup>
                <InputLeftAddon bg='transparent' w='22%'>
                  <TextBox size='sm' margin='0 auto'>
                    voting delay
                  </TextBox>
                </InputLeftAddon>
                <NumberInput w='100%' defaultValue={metadata.voting_delay}>
                  <NumberInputField
                    ref={register({
                      required: true,
                    })}
                    name='proposal.voting_delay'
                    borderRadius='0'
                  />
                </NumberInput>
                <InputRightAddon children='Minute' w='76px' margin='0 auto' />
              </InputGroup>
            </FormControl>
            <FormControl id='voting_period' mb={4}>
              <InputGroup>
                <InputLeftAddon bg='transparent' w='22%'>
                  <TextBox size='sm' margin='0 auto'>
                    voting period
                  </TextBox>
                </InputLeftAddon>
                <NumberInput w='100%' defaultValue={metadata.voting_period}>
                  <NumberInputField
                    ref={register({
                      required: true,
                    })}
                    name='proposal.voting_period'
                    borderRadius='0'
                  />
                </NumberInput>
                <InputRightAddon children='Minute' w='76px' margin='0 auto' />
              </InputGroup>
            </FormControl>
            <FormControl id='min_action_delay' mb={4}>
              <InputGroup>
                <InputLeftAddon bg='transparent' w='22%'>
                  <TextBox size='sm' margin='0 auto'>
                    min action delay
                  </TextBox>
                </InputLeftAddon>
                <NumberInput w='100%' defaultValue={metadata.min_action_delay}>
                  <NumberInputField
                    ref={register({
                      required: true,
                    })}
                    name='proposal.min_action_delay'
                    borderRadius='0'
                  />
                </NumberInput>
                <InputRightAddon children='Minute' w='76px' margin='0 auto' />
              </InputGroup>
            </FormControl>
            <FormControl id='voting_quorum_rate' mb={4}>
              <InputGroup>
                <InputLeftAddon bg='transparent' w='22%'>
                  <TextBox size='sm' margin='0 auto'>
                    voting quorum rate
                  </TextBox>
                </InputLeftAddon>
                <NumberInput
                  w='100%'
                  defaultValue={metadata.voting_quorum_rate}
                >
                  <NumberInputField
                    ref={register({
                      required: true,
                    })}
                    name='proposal.voting_quorum_rate'
                    borderRadius='0'
                  />
                </NumberInput>
                <InputRightAddon children='%' w='76px' margin='0 auto' />
              </InputGroup>
            </FormControl>
            <FormControl id='min_proposal_deposit' mb={4}>
              <InputGroup>
                <InputLeftAddon bg='transparent' w='22%'>
                  <TextBox size='sm' margin='0 auto'>
                    min proposal deposit
                  </TextBox>
                </InputLeftAddon>
                <NumberInput
                  w='100%'
                  defaultValue={metadata.min_proposal_deposit}
                >
                  <NumberInputField
                    ref={register({
                      required: true,
                    })}
                    name='proposal.min_proposal_deposit'
                    borderRadius='0'
                  />
                </NumberInput>
                <InputRightAddon children='Token' w='76px' margin='0 auto' />
              </InputGroup>
            </FormControl>
          </Stack>
          <TextBox size='xs' mb={2} mt={4}>
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
          {loading ? (
            <Spinner size='sm' mx='auto' mt={10} />
          ) : (
            <Button type='submit' disabled={loading} my={4}>
              Create
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DaoMetaForm;

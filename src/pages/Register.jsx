import React, { useEffect, useState, useMemo } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { useHistory, useParams, Link as RouterLink } from 'react-router-dom';
import { Flex, Icon, Box, Button } from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useUser } from '../contexts/UserContext';
import DaoMetaForm from '../forms/daoMetaForm';
import Layout from '../components/layout';
import MainViewLayout from '../components/mainViewLayout';
import { Step, Steps, useSteps } from 'chakra-ui-steps';
import DaoAccountCreate from '../forms/daoAccountCreate';
import DaoDeploy from '../forms/daoDeploy';

const Register = () => {
  const { registerchain, daoid } = useParams();
  const { refetchUserHubDaos } = useUser();
  const history = useHistory();
  const { address, injectedChain, requestWallet } = useInjectedProvider();
  const [currentDao, setCurrentDao] = useState();
  const [needsNetworkChange, setNeedsNetworkChange] = useState();
  const [blob, setBlob] = useState();

  useEffect(() => {
    if (address && injectedChain) {
      setCurrentDao({
        address: daoid,
        name: '',
        description: '',
        longDescription: '',
        purpose: '',
        summonerAddress: address,
        members: address,
        version: '2.1',
        voting_delay: 5,
        voting_period: 20,
        voting_quorum_rate: 5,
        min_action_delay: 5,
        min_proposal_deposit: 100000000,
      });

      setNeedsNetworkChange(injectedChain.chain_id !== registerchain);
    }
  }, [address, injectedChain]);

  const handleUpdate = async ret => {
    refetchUserHubDaos();
    sessionStorage.removeItem('exploreDaoData');

    history.push(`/dao/${ret.chainId}/${ret.daoAddress}`);
  };

  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const steps = [
    {
      label: 'Create Dao Account',
      content: (
        <DaoAccountCreate
          next={v => {
            currentDao.address = v;
            nextStep();
            console.log(currentDao);
          }}
        />
      ),
    },
    {
      label: 'Create Dao',
      content: (
        <DaoMetaForm
          handleUpdate={handleUpdate}
          metadata={currentDao}
          next={v => {
            setBlob(v);
            nextStep();
          }}
        />
      ),
    },
    {
      label: 'Deploy',
      content: (
        <DaoDeploy
          blob={blob}
          handleUpdate={() => {
            handleUpdate({
              chainId: injectedChain.chainId,
              daoAddress: currentDao.address,
            });
          }}
        ></DaoDeploy>
      ),
    },
  ];
  return (
    <Layout>
      <MainViewLayout header='Register'>
        {injectedChain && !needsNetworkChange ? (
          <>
            {currentDao ? (
              <>
                <Flex flexDir='column' width='100%'>
                  <Flex as={RouterLink} to='/' align='center' mr={4} mb={4}>
                    <Icon as={BiArrowBack} color='secondary.500' mr={2} />
                    Back
                  </Flex>

                  <Steps activeStep={activeStep} width='100%'>
                    {steps.map(({ label, content }) => (
                      <Step label={label} key={label}>
                        <Box w='100%' mt={4} mb={4} display='flex'>
                          {content}
                        </Box>
                      </Step>
                    ))}
                  </Steps>
                </Flex>
              </>
            ) : (
              <Box
                fontSize={['lg', null, null, '3xl']}
                fontFamily='heading'
                fontWeight={700}
                ml={10}
              >
                loading...
              </Box>
            )}
          </>
        ) : (
          <Box
            rounded='lg'
            bg='blackAlpha.600'
            borderWidth='1px'
            borderColor='whiteAlpha.200'
            p={6}
            m={[10, 'auto', 0, 'auto']}
            w='50%'
            textAlign='center'
          >
            <Box
              fontSize={['lg', null, null, '3xl']}
              fontFamily='heading'
              fontWeight={700}
              ml={10}
            >
              {`You need to switch your network to to register this dao.`}
            </Box>
          </Box>
        )}
      </MainViewLayout>
    </Layout>
  );
};

export default Register;

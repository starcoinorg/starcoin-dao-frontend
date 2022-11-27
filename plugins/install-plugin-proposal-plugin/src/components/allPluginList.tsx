import React, {useEffect, useState} from 'react';
import {Flex, Center, Spinner, Stack, Link, Text} from '@chakra-ui/react';
import {useSubAppContext} from '../contexts/SubAppContext';
import PluginCard from './pluginCard';
import {listPlugins, isPluginInstalled, IPlugin, getPluginCount} from '../utils/daoPluginApi';

const AllPluginList = ({daoId, installedPluginIds}) => {
    const [allPlugins, setAllPlugins] = useState<Map<number, Array<IPlugin>>>(new Map());
    const [plugins, setPlugins] = useState<Array<IPlugin>>([]);
    const [loading, setLoading] = useState(true);
    const {injectedProvider} = useSubAppContext();
    const [pages, setPages] = useState({
        index: 0,
        offset: 3,
        total: 0
    });

    useEffect(() => {
        const loadPlugins = async () => {
            try {

                if (pages.total === 0) {
                    const result = await getPluginCount(injectedProvider);
                    setPages({
                        ...pages,
                        total: result
                    })
                    return
                }

                console.log(allPlugins);
                const exPlugin = allPlugins.get(pages.index);
                if (exPlugin) {
                    setPlugins(exPlugin);
                    return
                }

                setLoading(true)

                console.log("loading data ");
                console.log(pages.index * pages.offset);
                console.log((pages.index + 1) * pages.offset);

                const plugins = await listPlugins(
                    injectedProvider,
                    pages.index * pages.offset,
                    pages.offset);

                console.log(plugins);
                setAllPlugins(new Map(allPlugins).set(pages.index, plugins));
                setPlugins(plugins);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        };

        loadPlugins();
    }, [daoId, pages]);

    const previous = () => {
        if (pages.index > 0) {
            setPages({
                ...pages,
                index: pages.index -= 1
            });
        }
    }

    console.log(pages)

    const next = () => {
        if ((pages.index + 1) * pages.offset < pages.total) {
            setPages({
                ...pages,
                index: pages.index += 1
            });
        }
    }

    return (
        <Flex as={Stack} direction='column' spacing={4} w='100%'>
            {!loading ? (
                <>
                    {
                        Object.keys(plugins).length > 0 ? (
                            Object.values(plugins)
                                .slice(0, 10)
                                .map(plugin_info => (
                                    <PluginCard
                                        key={plugin_info.id}
                                        daoId={daoId}
                                        plugin_info={plugin_info}
                                        installed={isPluginInstalled(installedPluginIds, plugin_info.type)}
                                    />
                                ))
                        ) : (
                            <Flex mt='100px' w='100%' justify='center'>
                                No Plughin.
                            </Flex>
                        )
                    }

                    {
                        <Flex direction='row' justify='space-evenly' p={6}>
                            <Link
                                to='#'
                                onClick={previous}
                            >
                                Previous
                            </Link>
                            <Text>
                                Page {pages.index + 1} of{' '}
                                {Math.ceil(pages.total / pages.offset)}
                            </Text>
                            <Link
                                to='#'
                                onClick={next}
                            >
                                Next
                            </Link>
                        </Flex>
                    }
                </>
            ) : (
                <Center mt='100px' w='100%'>
                    <Spinner size='xl'/>
                </Center>
            )}
        </Flex>
    );
};

export default AllPluginList;
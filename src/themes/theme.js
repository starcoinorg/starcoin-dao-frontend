import { extendTheme } from '@chakra-ui/react';
import { lighten, darken } from 'polished';
// theme
import { defaultTheme } from './defaultTheme';
// core Chakra components
import Badge from './core/badge';
import Button from './core/button';
import FormLabel from './core/formLabel';
import Heading from './core/heading';
import IconButton from './core/iconButton';
import Input from './core/input';
import Link from './core/link';
import Menu from './core/menu';
import Modal from './core/modal';
import NumberInput from './core/numberInput';
import Popover from './core/popover';
import Tabs from './core/tabs';
import Textarea from './core/textarea';
// Custom Chakra Components
import ContentBoxComponent from './components/contentBox';
import TextBoxComponent from './components/textBox';
import { StepsStyleConfig, Steps } from 'chakra-ui-steps';
import { MultiSelectTheme, MultiSelect } from 'chakra-multiselect';

export const CARD_BG = '#0b0b0b';

export const createTheme = daoTheme => {
  const daoThemeKeys = Object.keys(daoTheme);

  const themeOverrides = {
    ...defaultTheme,
    ...daoThemeKeys.reduce((acc, prop) => {
      acc[prop] = daoTheme[prop] || defaultTheme[prop];
      return acc;
    }, {}),
  };

  return extendTheme({
    active: true,
    colors: {
      secondaryAlpha: themeOverrides.secondaryAlpha,
      primaryAlpha: themeOverrides.primaryAlpha,
      primary: {
        50: lighten(0.4, themeOverrides.primary500),
        100: lighten(0.3, themeOverrides.primary500),
        200: lighten(0.2, themeOverrides.primary500),
        300: lighten(0.1, themeOverrides.primary500),
        400: lighten(0.05, themeOverrides.primary500),
        500: themeOverrides.primary500,
        600: darken(0.05, themeOverrides.primary500),
        700: darken(0.1, themeOverrides.primary500),
        800: darken(0.15, themeOverrides.primary500),
        900: darken(0.2, themeOverrides.primary500),
      },
      background: {
        50: lighten(0.4, themeOverrides.bg500),
        100: lighten(0.3, themeOverrides.bg500),
        200: lighten(0.2, themeOverrides.bg500),
        300: lighten(0.1, themeOverrides.bg500),
        400: lighten(0.05, themeOverrides.bg500),
        500: themeOverrides.bg500,
        600: darken(0.05, themeOverrides.bg500),
        700: darken(0.1, themeOverrides.bg500),
        800: darken(0.15, themeOverrides.bg500),
        900: darken(0.2, themeOverrides.bg500),
      },
      secondary: {
        50: lighten(0.4, themeOverrides.secondary500),
        100: lighten(0.3, themeOverrides.secondary500),
        200: lighten(0.2, themeOverrides.secondary500),
        300: lighten(0.1, themeOverrides.secondary500),
        400: lighten(0.05, themeOverrides.secondary500),
        500: themeOverrides.secondary500,
        600: darken(0.05, themeOverrides.secondary500),
        700: darken(0.1, themeOverrides.secondary500),
        800: darken(0.15, themeOverrides.secondary500),
        900: darken(0.2, themeOverrides.secondary500),
      },
      mode: {
        50: themeOverrides.modeAlpha500,
        100: themeOverrides.modeAlpha500,
        200: themeOverrides.modeAlpha500,
        300: themeOverrides.modeAlpha500,
        400: themeOverrides.modeAlpha500,
        500: themeOverrides.modeAlpha500,
        600: themeOverrides.modeAlpha500,
        700: themeOverrides.modeAlpha500,
        800: themeOverrides.modeAlpha500,
        900: themeOverrides.modeAlpha500,
      },
      chakraProgressBarHack: {
        200: themeOverrides.secondary500,
        500: themeOverrides.secondary500,
      },
    },
    images: {
      avatarImg: themeOverrides.avatarImg,
      bgImg: themeOverrides.bgImg,
    },
    fonts: {
      heading: themeOverrides.headingFont,
      body: themeOverrides.bodyFont,
      mono: themeOverrides.monoFont,
      hub: 'Mirza',
      accessory: 'Roboto Mono',
      space: 'Space Mono',
    },
    daoMeta: {
      proposals: themeOverrides.daoMeta.proposals,
      proposal: themeOverrides.daoMeta.proposal,
      bank: themeOverrides.daoMeta.bank,
      members: themeOverrides.daoMeta.members,
      member: themeOverrides.daoMeta.member,
      boosts: themeOverrides.daoMeta.boosts,
      boost: themeOverrides.daoMeta.boost,
      settings: themeOverrides.daoMeta.settings,
      ragequit: themeOverrides.daoMeta.ragequit,
      guildKick: themeOverrides.daoMeta.guildKick,
      minion: themeOverrides.daoMeta.minion,
      minions: themeOverrides.daoMeta.minions,
      // f04title: themeOverrides.daoMeta.f04title,
      // f04heading: themeOverrides.daoMeta.f04heading,
      // f04subhead: themeOverrides.daoMeta.f04subhead,
      // f04cta: themeOverrides.daoMeta.f04cta,
    },
    components: {
      // core components
      Badge,
      Button,
      FormLabel,
      Heading,
      IconButton,
      Input,
      Link,
      Menu,
      Modal,
      NumberInput,
      Popover,
      Tabs,
      Textarea,
      // custom components
      ContentBoxComponent,
      TextBoxComponent,
      Steps: {
        ...StepsStyleConfig,
        baseStyle: props => {
          const baseStyle = StepsStyleConfig.baseStyle(props);
          baseStyle.label.color = '#FFFFF';
          baseStyle.step.color = '#EB8A23';
          return {
            ...baseStyle,
          };
        },
      },
      MultiSelect: {
        ...MultiSelectTheme,
        baseStyle: props => {
          const baseStyle = MultiSelectTheme.baseStyle(props);
          baseStyle.list.bg = 'black';
          baseStyle.item._active.bg = '#EB8A23';
          baseStyle.button._active.bg = 'black';
          baseStyle.button._focus.bg = 'black';
          return {
            ...baseStyle,
          };
        },
      },
    },
    styles: {
      bgOverlayOpacity: themeOverrides.bgOverlayOpacity,
      global: {
        'html, body': {
          fontSize: 'm',
          color: 'mode.900',
          lineHeight: 'tall',
          overflowX: 'hidden',
        },
        a: {
          transition: 'all 0.15s linear',
          color: 'secondary.400',
          _hover: { textDecoration: 'none', color: 'secondary.500' },
        },
      },
    },
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
  });
};
export const useDefault = createTheme({});

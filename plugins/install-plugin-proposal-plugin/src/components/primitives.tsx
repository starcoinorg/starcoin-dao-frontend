
import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';

import { format } from 'date-fns';

export const formatDate = (dateTimeMillis, formatDate = 'MMM dd, yyyy') => {
  return format(new Date(dateTimeMillis), formatDate);
};

export const generateProposalDateText = dateTimeMillis => {
  return formatDate(dateTimeMillis, "hh:mm aaaaa'm' MMM dd, yyyy");
};

export const Label = props => {
  const { text, children } = props;
  return (
    <Text
      textTransform={props.textTransform || 'uppercase'}
      letterSpacing={props.letterSpacing || '0.1rem'}
      fontWeight='700'
      lineHeight='168.4%;'
      {...props}
    >
      {text || children}
    </Text>
  );
};

export const CardLabel = props => (
  <Label fontSize='xs' opacity='0.8' letterSpacing='0.25rem' {...props} />
);

export const PropCardDate = ({ label, dateTimeMillis, opacity }) => {
  const submissionDateText = useMemo(() => {
    if (dateTimeMillis) {
      return generateProposalDateText(dateTimeMillis);
    }
  }, [dateTimeMillis]);
  return (
    <CardLabel
      textTransform='none'
      opacity={opacity}
    >{`${label} ${submissionDateText}`}</CardLabel>
  );
};
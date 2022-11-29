import { utils } from 'web3';

export const hexVectorToStringArray = vec => {
  let rets = new Array();

  for (const i in vec) {
    const item = utils.hexToString(vec[i]);
    rets.push(item);
  }

  return rets;
};

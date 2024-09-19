import BezierEasing from 'bezier-easing';
import { cloneDeep } from 'lodash';
import { CLUSTER_TYPE, MIN_RADIUS } from './constants';
import { RPC_ENUMS } from '../../../constants';
import { NETWORKS } from '../../../context/AppStore';
import {
  SOLANA_DEVNET_SECONDARY_URL,
  SOLANA_DEVNET_URL,
  SOLANA_MAINNET_SECONDARY_URL,
  SOLANA_MAINNET_URL,
} from '../../../envs/urls';

export const AddClusterType = (type, nodes, links, hiddenAddresses = []) => {
  const new_nodes = cloneDeep(nodes);

  const map1 = new Map();
  new_nodes.forEach(node => {
    node.hidden = hiddenAddresses.includes(node?.address);

    map1.set(
      `${type === CLUSTER_TYPE.GROUP ? 'group' : 'peripheral'}_${node.address}`,
      [node.address],
    );
  });

  const new_links = cloneDeep(links);

  new_links.forEach(link => {
    link.hidden =
      hiddenAddresses.includes(link.source) ||
      hiddenAddresses.includes(link.target);
    if (link.hidden) return;

    const linkSrc = link.source;
    const linkTarget = link.target;
    let srcGroup = null;
    let targetGroup = null;
    map1.forEach((values, key) => {
      if (values.includes(linkSrc)) {
        srcGroup = key;
      }
      if (values.includes(linkTarget)) {
        targetGroup = key;
      }
    });
    if (srcGroup !== targetGroup) {
      const targetGroupNodes = map1.get(targetGroup);
      const sourceGroupNodes = map1.get(srcGroup);
      if (sourceGroupNodes && targetGroupNodes) {
        map1.set(srcGroup, [...sourceGroupNodes, ...targetGroupNodes]);
        map1.delete(targetGroup);
      }
    }
  });

  const map2 = new Map();

  map1.forEach((values, key) => {
    values.forEach(val => {
      map2.set(val, key);
    });
  });

  new_nodes.forEach(node => {
    node[type] = map2.get(node.address);
  });

  return { updatedNodes: new_nodes, updatedLinks: new_links };
};

export const calculateRadius = percentage =>
  Math.max(Math.sqrt(percentage) * 10, MIN_RADIUS);

export const getNodeDefaultRadialCoord = node =>
  (1 - BezierEasing(0, 1, 0, 1)(node?.percentage / 100)) * 300;

export const GET_RPC_URLS = networkType => {
  return {
    [RPC_ENUMS.PRIMARY]:
      networkType === NETWORKS?.MAINNET
        ? SOLANA_MAINNET_URL
        : SOLANA_DEVNET_URL,
    [RPC_ENUMS.SECONDARY]:
      networkType === NETWORKS.MAINNET
        ? SOLANA_MAINNET_SECONDARY_URL
        : SOLANA_DEVNET_SECONDARY_URL,
  };
};

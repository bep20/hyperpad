import { CreateFairLaunch } from './container/CreateFairLaunch';
import { CreateLaunchpad } from './container/CreateLaunchpad';
import { CreateToken } from './container/CreateToken';
import { LaunchPadList } from './container/LaunchPadList';

export const BASE_ROUTE = 'launchpad';

export const SUB_ROUTES = [
  {
    path: 'createlaunchpad',
    component: CreateLaunchpad,
  },
  {
    path: 'createfairlaunch',
    component: CreateFairLaunch,
  },
  {
    path: 'createtoken',
    component: CreateToken,
  },
  {
    path: 'launchpadlist',
    component: LaunchPadList,
  },
];

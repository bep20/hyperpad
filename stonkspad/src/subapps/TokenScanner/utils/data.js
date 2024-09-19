export const graphData = {
  nodes: {
    total_amt: 32,
    decimal_places: 3,
    token_name: 'hypersol',
    data: [
      {
        id: 'A',
        owner: 'OwnerA',
        amount: 1,
        name: 'test ownerA',
        isOwnerContract: false,
      },
      {
        id: 'B',
        owner: 'OwnerB',
        amount: 1,
        name: 'test owner B',
        isOwnerContract: false,
      },
      {
        id: 'C',
        owner: 'OwnerC',
        amount: 1,
        name: 'test owner C',
        isOwnerContract: false,
      },

      {
        id: 'D',
        owner: 'OwnerD',
        amount: 1,
        name: 'test owner D',
        isOwnerContract: false,
      },
      {
        id: 'E',
        owner: 'OwnerE',
        amount: 1,
        name: 'test owner E',
        isOwnerContract: false,
      },
      {
        id: 'F',
        owner: 'OwnerF',
        amount: 1,
        name: 'test owner F',
        isOwnerContract: false,
      },
      {
        id: 'G',
        owner: 'OwnerG',
        amount: 1,
        name: 'test owner G',
        isOwnerContract: false,
      },
    ],
  },

  links: [
    {
      source: 'A',
      target: 'B',
      forward: 23,
      backward: 0,
    },
    {
      source: 'B',
      target: 'C',
      forward: 0,
      backward: 33,
    },
    {
      source: 'A',
      target: 'C',
      forward: 34,
      backward: 42,
    },
    {
      source: 'E',
      target: 'G',
      forward: 0,
      backward: 42,
    },
  ],
};

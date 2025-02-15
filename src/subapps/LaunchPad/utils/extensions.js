import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeDefaultAccountStateInstruction,
  createInitializeInterestBearingMintInstruction,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeTransferFeeConfigInstruction,
} from '@solana/spl-token';

export const createTransferTaxInstructions = ({
  mint,
  feeConfigAuthority,
  withHeldAuthority,
  feeBasisPoints,
  maxFee,
}) => {
  const instructions = [];

  instructions.push(
    createInitializeTransferFeeConfigInstruction(
      mint,
      feeConfigAuthority,
      withHeldAuthority,
      feeBasisPoints,
      maxFee,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  return instructions;
};

export const createPermanantDeligateInstructions = ({
  mint,
  permanentDeligate,
}) => {
  const instructions = [];

  instructions.push(
    createInitializePermanentDelegateInstruction(
      mint,
      permanentDeligate,
      TOKEN_2022_PROGRAM_ID,
    ),
  );
  return instructions;
};

export const createNonTransferableInstructions = ({ mint }) => {
  const instructions = [];

  instructions.push(
    createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
  );
  return instructions;
};

export const createInterestBearingInstructions = ({
  mint,
  interestAuthority,
  interestRate,
}) => {
  const instructions = [];

  instructions.push(
    createInitializeInterestBearingMintInstruction(
      mint,
      interestAuthority,
      interestRate,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  return instructions;
};

export const createDefaultStateInstructions = ({ mint, defaultState }) => {
  const instructions = [];

  instructions.push(
    createInitializeDefaultAccountStateInstruction(
      mint,
      defaultState,
      TOKEN_2022_PROGRAM_ID,
    ),
  );
  return instructions;
};

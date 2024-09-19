import React from 'react'
import TokenDetailsTabs from '../components/TokenDetailsTabs'
import { TokenMintAuthority } from '../components/TokenMintAuthority'

const MintAuthority = () => {
  return (
    <div>
        <TokenDetailsTabs tabDiscription="Mint Authority"/>
        <TokenMintAuthority/>
        
    </div>
  )
}

export default MintAuthority
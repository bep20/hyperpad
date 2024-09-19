import React from 'react';
import { FaMedium, FaReddit, FaTelegram, FaXTwitter } from 'react-icons/fa6';
import useDevice from '../hooks/useDevice';

const Footer = () => {
  const { isMobile } = useDevice();
  const data = [
    { icon: FaXTwitter, url: 'https://x.com/HyperSolX' },
    { icon: FaTelegram, url: 'https://t.me/hypersol' },
    { icon: FaMedium, url: 'https://hypersol.medium.com/' },
    { icon: FaReddit, url: 'https://www.reddit.com/r/HyperSOL/' },
  ];
  return (
    <div className='flex gap-x-8 sm:gap-x-4 justify-between items-center h-40 border-t p-5 bg-white w-full mt-auto'>
      <div className='flex flex-col items-center gap-y-4 '>
        <img
          className={isMobile ? 'h-[30px]' : 'h-[40px]'}
          src='/images/logo.png'
          alt='Logo'
        />
        <p className='text-xs w-[125px] text-center'>
          The Ultimate Tool Suite On Solana Network
        </p>
      </div>
      <div className='flex flex-1 flex-col justify-center items-center gap-y-4 max-w-[300px]'>
        <div className='w-full flex justify-between gap-x-4'>
          {data?.map((ele, index) => (
            <a key={index} href={ele.url} target='_blank' rel='no-referrer'>
              <ele.icon size='30px' fill='#9830ed' />
            </a>
          ))}
        </div>
        <p className='text-xs text-center mb-0'>All rights reserved</p>
      </div>
    </div>
  );
};

export default Footer;

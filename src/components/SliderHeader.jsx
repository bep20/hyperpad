import React, { useMemo } from 'react';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useMenu } from '../store/useMenu';
import useDevice from '../hooks/useDevice';

const SliderHeader = ({ showLogo, showToggleIcon, bg = 'transparent' }) => {
  const [isNavBarOpen, dispatchMenu] = useMenu(state => [
    state.isNavBarOpen,
    state.dispatch,
  ]);

  const handleMenuToggle = () => {
    dispatchMenu({ type: 'TOGGLE_MENU' });
  };

  const { isMobile } = useDevice();
  const ToggleIcon = useMemo(
    () => (isNavBarOpen ? MenuFoldOutlined : MenuUnfoldOutlined),
    [isNavBarOpen],
  );

  return (
    <div
      style={{ background: bg }}
      // eslint-disable-next-line no-nested-ternary
      className={`pr-3 flex items-center ${isNavBarOpen ? 'justify-between' : isMobile ? 'justify-start' : 'justify-center'} ${isMobile && !isNavBarOpen ? 'flex-row-reverse' : ''} gap-x-3 px-2 py-4 border-b ${isMobile ? 'h-[48px]' : 'h-[68px]'} sticky top-0`}>
      {showLogo && (
        <img
          alt=''
          className={isMobile ? 'h-[30px]' : 'h-[35px]'}
          src='/images/logo.png'
        />
      )}

      {showToggleIcon && (
        <ToggleIcon
          className='navbarToggle'
          style={{ color: '#9800ed', cursor: 'pointer', fontSize: '1.5rem' }}
          onClick={handleMenuToggle}
        />
      )}
    </div>
  );
};

export default SliderHeader;

import React from 'react';
import Button from 'antd/es/button';

export const HyperSButton = ({
  text,
  onClick,
  btnSize = 'large-btn',
  ...props
}) => (
  <Button
    className={`secondary-button ${btnSize}`}
    onClick={onClick}
    {...props}>
    {text}
  </Button>
  );

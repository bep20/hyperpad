import React from 'react';
import Button from 'antd/es/button';

export const HyperButton = ({
  text,
  icon,
  onClick,
  disabled,
  btnSize = 'large-btn',
  className = '',
  ...props
}) => (
  <Button
    icon={icon}
    disabled={disabled}
    onClick={onClick}
    {...props}
    className={`${className} primary-button ${btnSize}`}>
    {text}
  </Button>
);

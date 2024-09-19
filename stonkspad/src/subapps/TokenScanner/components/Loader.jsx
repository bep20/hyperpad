import React from 'react';
import Skeleton from 'antd/es/skeleton';

const Loader = () => {
  return (
    <div className=' overflow-y-auto p-[10px] flex flex-col gap-y-2'>
      {Array(13)
        .fill()
        .map(_ => (
          <Skeleton.Input active block />
        ))}
    </div>
  );
};

export default Loader;

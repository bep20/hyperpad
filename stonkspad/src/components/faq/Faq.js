import React from 'react';
import Collapse from 'antd/es/collapse';
import Space from 'antd/es/space';
import '../../style/faq.less';

export const FaqSection = ({ faqItems = [] }) => (
  <Space direction='vertical' style={{ width: '100%' }}>
    <div className='faqHeading'>
      <h2>FREQUENTLY ASKED QUESTIONS</h2>
    </div>
    <div className='faqOption'>
      {faqItems.map(item => (
        <Collapse
          className='collapsePannel'
          collapsible='header'
          defaultActiveKey={['1']}
          items={[
                {
                  key: item.key,
                  label: item.label,
                  children: item.children,
                },
              ]}
            />
          ))}
    </div>
  </Space>
  );

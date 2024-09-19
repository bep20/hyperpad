import React, { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { BOT_STATUS, BOT_STATUS_COLORS } from '../../../constants';

const renderActiveShape = props => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor='middle' fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill='none'
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none' />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill='#333'>{`Txn count:  ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill='#999'>
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const Piechart = ({ statistics, total, width = 500, height = 500 }) => {
  const [activeIdx, setActiveIdx] = useState(1);
  const onPieEnter = (_, index) => {
    setActiveIdx(index);
  };
  const {
    insyncCount = 0,
    successCount = 0,
    failureCount = 0,
  } = statistics || {};
  const pendingCount = useMemo(
    () => total - (insyncCount + successCount),
    [insyncCount, successCount, total],
  );

  const data = [
    {
      name: BOT_STATUS.INSYNC,
      value: insyncCount,
      color: BOT_STATUS_COLORS.INSYNC,
    },
    {
      name: BOT_STATUS.COMPLETED,
      value: successCount,
      color: BOT_STATUS_COLORS.COMPLETED,
    },
    {
      name: BOT_STATUS.PENDING,
      value: pendingCount,
      color: BOT_STATUS_COLORS.PENDING,
    },
  ];
  return (
    <div>
      <h3>Bot Statistics:-</h3>
      <p>Statistics of bumpi bot transaction.</p>
      <PieChart
        width={width}
        height={height}
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset',
          backgroundColor: '#ffffff',
        }}>
        <Pie
          activeIndex={activeIdx}
          activeShape={renderActiveShape}
          data={data}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={80}
          dataKey='value'
          onMouseEnter={onPieEnter}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry?.color} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

export default Piechart;

import React from 'react';

import SampleLabel, { SampleLabelProps } from './SampleLabel';

export interface PrintableSampleCardProps {
  labels: SampleLabelProps[];
}

/**
 * A container for printing on a 50 mm–wide receipt printer.
 * Each SampleLabel has its own fixed 80 mm height.
 */
const PrintableSampleCard = ({
  ref,
  labels,
}: PrintableSampleCardProps & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div
    ref={ref}
    style={{
      width: '50mm',
      //height: `${labels.length * 80}mm`,
      border: '0px dashed #000',
      padding: '0mm',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '2mm',
      background: '#fff',
    }}
  >
    {labels.map(label => (
      <SampleLabel key={label.sampleCode} {...label} />
    ))}
  </div>
);

PrintableSampleCard.displayName = 'PrintableSampleCard';

export default PrintableSampleCard;

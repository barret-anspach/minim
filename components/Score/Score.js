"use client";

import React from 'react';

import Event from '../Event';
import Item from '../Item';
import Measure from '../Measure';
import Staff from '../Staff';
import StaffDisplayItem from '../StaffDisplayItem';
import Systems from '../Systems';
import { withNoSSR } from '../../hooks/withNoSSR';
import { useMeasuresContext } from '../../contexts/MeasuresContext';
import { toDuration } from '../../utils/methods';

const metadata = require('../../public/fonts/bravura/bravura_metadata.json');

function Score({ score }) {
  const { context: { initialized, measures } } = useMeasuresContext();

  return initialized && (
    <Systems id="systems">
      {score.global.measures.map((globalMeasure, index) => (
        <Measure
          index={index}
          key={`measure_${index}`}
          measure={measures[index]}
          final={index + 1 === score.global.measures.length}
          parts={score.parts}
        >
          {score.parts.map((part, partIndex) => new Array(part.staves).fill(null).map((_, staffIndex) => (
            <Staff
              id={`par${partIndex}_mea${index}_sta${staffIndex}`}
              key={`par${partIndex}_mea${index}_sta${staffIndex}`}
              number={(partIndex + 1) * (staffIndex + 1)}
              clef={part.measures[index].clefs[staffIndex]}
            >
              {index === 0 && (
                <Item size={2} pitch={'g4'} column={'m-text'} padEnd={1}>{part.name}</Item>
              )}
              {index !== 0 && measures[index].first && (
                <Item size={2} pitch={'g4'} column={'m-text'} padEnd={1}>{part.shortName}</Item>
              )}
              {measures[index].first && (
                <>
                  <Item pitch="g4" column={'m-cle'} padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                  <StaffDisplayItem type="key" start="m-key">
                    <Item pitch="b4" column={1}></Item>
                    <Item pitch="e5" column={2}></Item>
                  </StaffDisplayItem>
                </>
              )}
              {globalMeasure.time && (
                <StaffDisplayItem type="tim" start="m-tim">
                  <Item text pitch="b4">{globalMeasure.time.count}</Item>
                  <Item text pitch="e4">{globalMeasure.time.unit}</Item>
                </StaffDisplayItem>
              )}
              {part.measures[index].sequences.map((sequence) => sequence.content.map((event, eventIndex, events) =>
                event.type === 'tuplet' ? (
                  <Item text={true}>t</Item>
                ) : (
                  <Item
                    key={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                    column={`e ${toDuration(eventIndex, events) + 1}`}
                    pitch={`${event.pitch.step.toLowerCase()}${event.pitch.octave}`}
                  >
                    .
                  </Item>
                )
              ))}
            </Staff>
          )))}
        </Measure>
      ))}
    </Systems>
  )
}

export default withNoSSR(Score);

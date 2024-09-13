"use client";

import React from 'react';

import Item from './../Item';
import Key from './../Key';
import Measure from './../Measure';
import Meter from './../Meter';
import Staff from './../Staff';
import Systems from './../Systems';
import Tuplet from './../Tuplet/Tuplet';

import { withNoSSR } from './../../hooks/withNoSSR';
import { useMeasuresContext } from './../../contexts/MeasuresContext';
import SystemIncipit from './../SystemIncipit/SystemIncipit';
import Chord from '../Chord/Chord';

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
                  <SystemIncipit
                    globalMeasure={globalMeasure}
                    nextGlobalMeasure={score.global.measures[index + 1]}
                    first={measures[index].first}
                    last={measures[index].last}
                    index={index}
                    part={part}
                    staffIndex={staffIndex}
                  />
                </>
              )}
              {!measures[index].first && globalMeasure.time && (
                <Meter
                  count={globalMeasure.time.count}
                  unit={globalMeasure.time.unit}
                />
              )}
              {part.measures[index].sequences.map((sequence) => sequence.content.map((event, eventIndex, events) =>
                event.type === 'tuplet' ? (
                  <Tuplet 
                    key={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                    id={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                    clef={part.measures[index].clefs[staffIndex].clef}
                    event={event}
                    eventIndex={eventIndex}
                    events={events}
                  />
                ) : (
                  <Chord
                    key={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                    id={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                    clef={part.measures[index].clefs[staffIndex].clef}
                    event={event}
                    eventIndex={eventIndex}
                    events={events}
                  />
                ))
              )}
              {
                index - 1 !== score.global.measures.length &&
                measures[index].last &&
                score.global.measures[index + 1] && (
                  <SystemIncipit
                    globalMeasure={globalMeasure}
                    nextGlobalMeasure={score.global.measures[index + 1]}
                    first={measures[index].first}
                    last={measures[index].last}
                    part={part}
                    index={index}
                    staffIndex={staffIndex}
                  />
                )
              }
            </Staff>
          )))}
        </Measure>
      ))}
    </Systems>
  )
}

export default withNoSSR(Score);
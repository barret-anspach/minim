"use client";

import React, { useEffect } from "react";

import Chord from "../Chord/Chord";
import Measure from "./../Measure";
import Staff from "./../Staff";
import MeasureDisplayMatter from "../MeasureDisplayMatter/MeasureDisplayMatter";
import Tuplet from "./../Tuplet/Tuplet";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";

function Score({ score }) {
  const {
    actions,
    context: { initialized, flows },
  } = useMeasuresContext();

  return (
    initialized && (
      <>
        {Object.values(flows).map((flow) =>
          flow.map((measure, index, measures) => (
            <Measure
              index={index}
              key={`measure_${index}`}
              measure={measure}
              final={index + 1 === measures.length}
              parts={score.parts}
            >
              {score.parts.map((part, partIndex) =>
                Array.from({ length: part.global.staves }, (_, i) => i).map(
                  (staffIndex) => (
                    <Staff
                      id={`par${partIndex}_mea${index}_sta${staffIndex}`}
                      key={`par${partIndex}_mea${index}_sta${staffIndex}`}
                      number={(partIndex + 1) * (staffIndex + 1)}
                      clef={part.global.clefs.find(
                        (c) => c.staff === staffIndex + 1,
                      )}
                      part={part}
                      index={index}
                      measure={measure}
                    >
                      <MeasureDisplayMatter
                        globalMeasure={measure}
                        globalMeasures={measures}
                        nextGlobalMeasure={measures[index + 1]}
                        first={measure.first}
                        last={measure.last}
                        index={index}
                        part={part}
                        partIndex={partIndex}
                        staffIndex={staffIndex}
                      />
                      {/** TODO: Mid-measure Key and Clef changes */}
                      {/** TODO: Beams */}
                      {/** Sequence are voices in a given part */}
                      {measure.voices.map((voice) =>
                        voice.sequence.map((event, eventIndex, events) =>
                          event.type === "tuplet" ? (
                            <Tuplet
                              key={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                              id={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                              clef={part.global.clefs[staffIndex].clef}
                              event={event}
                              eventIndex={eventIndex}
                              events={events}
                              measureIndex={index}
                              staffIndex={staffIndex}
                            />
                          ) : (
                            <Chord
                              key={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                              id={`par${partIndex}_mea${index}_sta${staffIndex}_eve${eventIndex}`}
                              clef={part.global.clefs[staffIndex].clef}
                              event={event}
                              eventIndex={eventIndex}
                              events={events}
                              measureIndex={index}
                              staffIndex={staffIndex}
                            />
                          ),
                        ),
                      )}
                      {index - 1 !== measures.length &&
                        measure.last &&
                        measures[index + 1] && (
                          <MeasureDisplayMatter
                            globalMeasure={measure}
                            globalMeasures={measures}
                            nextGlobalMeasure={measures[index + 1]}
                            first={measure.first}
                            last={measure.last}
                            index={index}
                            part={part}
                            partIndex={partIndex}
                            staffIndex={staffIndex}
                          />
                        )}
                    </Staff>
                  ),
                ),
              )}
            </Measure>
          )),
        )}
      </>
    )
  );
}

export default withNoSSR(Score);

"use client";

import React, { Fragment } from "react";

import Barline from "./../Barline/Barline";
import Chord from "../Chord/Chord";
import Staff from "./../Staff";
import MeasureDisplayMatter from "../MeasureDisplayMatter/MeasureDisplayMatter";
import Tuplet from "./../Tuplet/Tuplet";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";
import { getStavesForFlow } from "../../utils/methods";

function Flow({ id }) {
  const {
    context: { initialized, flows },
  } = useMeasuresContext();
  const allStaves = getStavesForFlow(flows, id);

  return (
    initialized && (
      <Fragment key={id}>
        {allStaves.map(({ part, staves }) =>
          staves.map(({ clef, staffIndex, staffBounds }) => (
            <Fragment key={`${id}_sta${staffIndex}`}>
              {flows[id].measures.map((measure, measureIndex, measures) => (
                <Fragment key={`${id}_mea${measureIndex}`}>
                  <MeasureDisplayMatter
                    flowId={id}
                    index={measureIndex}
                    measure={measure}
                    part={part}
                    staffIndex={staffIndex}
                  />
                  {/** TODO: Bracket placeholder */}
                  {/** TODO: Interpret layout groups */}
                  {staffIndex === 0 && (
                    <>
                      {(measureIndex === 0 ||
                        measure.positionInSystem.first) && (
                        <Barline
                          type={"regular"}
                          separation={true}
                          row={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                          column={`e${measure.position.start}-bracket / e${measure.position.start}-bracket`}
                          height="100%"
                        />
                      )}
                      <Barline
                        type={"regular"}
                        separation={true}
                        row={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                        column={`e${measure.position.start}-bar / e${measure.position.start}-cle`}
                      />
                      {measure.positionInSystem.last &&
                        measureIndex !== measures.length - 1 && (
                          <Barline
                            row={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                            column={`e${measure.position.end}-me-bar`}
                          />
                        )}
                      {measureIndex === measures.length - 1 && (
                        <Barline
                          type={"final"}
                          row={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                          column={`e${measure.position.end}-me-bar`}
                        />
                      )}
                    </>
                  )}
                </Fragment>
              ))}
              {/* TODO: Use start/end positions of events in the Part the staff's being drawn for! */}
              <Staff
                id={`${id}s${staffIndex + 1}`}
                key={`${id}s${staffIndex + 1}`}
                number={`${id}s${staffIndex + 1}`}
                clef={clef}
                part={part}
                start={`e${flows[id].events[0].position.start}-bar`}
                end={`e${flows[id].events.at(-1).position.end}-end`}
              />
            </Fragment>
          )),
        )}
        {flows[id].events.map((event, eventIndex, events) =>
          event.type === "tuplet" ? (
            <Tuplet
              key={`${event.renderId}_tup`}
              id={`${event.renderId}_tup`}
              clef={event.clefs[event.staff - 1].clef}
              event={event}
              eventIndex={eventIndex}
              events={events}
            />
          ) : (
            <Chord
              key={`${event.renderId}_cho`}
              id={`${event.renderId}_cho`}
              clef={event.clefs[event.staff - 1].clef}
              event={event}
              eventIndex={eventIndex}
              events={events}
            />
          ),
        )}
        {/* {flows[id].parts.map((part) =>
          Array.from({ length: part.global.staves }, (_, i) => i).map(
            (_, staffIndex) =>
              
          ),
        )} */}
      </Fragment>
    )
  );
}

export default withNoSSR(Flow);

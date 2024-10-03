"use client";

import React, { Fragment } from "react";

import Event from "./../Event/Event";
import Chord from "../Chord/Chord";
import Staff from "./../Staff";
import MeasureDisplayMatter from "../MeasureDisplayMatter/MeasureDisplayMatter";
import Tuplet from "./../Tuplet/Tuplet";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";

function Flow({ id }) {
  const {
    context: { initialized, flows },
  } = useMeasuresContext();

  const flow = flows[id];

  const allStaves = flows[id].parts.map((part) => ({
    part,
    staves: Array.from({ length: part.global.staves }, (_, i) => ({
      staffIndex: i,
      clef: part.global.clefs.find((c) => c.staff === i + 1),
    })),
  }));

  return (
    initialized && (
      <Fragment key={id}>
        {allStaves.map(({ part, staves }) =>
          staves.map(({ clef, staffIndex }) => (
            <Staff
              id={`${id}s${staffIndex + 1}`}
              key={`${id}s${staffIndex + 1}`}
              number={`${id}s${staffIndex + 1}`}
              clef={clef}
              part={part}
              start={`e${flows[id].events[0].position.start}-bar`}
              end={`e${flows[id].events[flow.events.length - 1].position.start}-me-bar`}
            />
          )),
        )}
        {flows[id].events.map((event, eventIndex, events) =>
          event.type === "tuplet" ? (
            <Tuplet
              key={`${event.id}_tup`}
              id={`${event.id}_tup`}
              clef={event.clefs[event.staff - 1].clef}
              event={event}
              eventIndex={eventIndex}
              events={events}
            />
          ) : (
            <Chord
              key={`${event.id}_cho`}
              id={`${event.id}_cho`}
              clef={event.clefs[event.staff - 1].clef}
              event={event}
              eventIndex={eventIndex}
              events={events}
            />
          ),
        )}
      </Fragment>
    )
  );
}

export default withNoSSR(Flow);

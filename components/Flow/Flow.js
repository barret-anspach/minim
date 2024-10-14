"use client";

import React, { Fragment } from "react";

import { BeamGroup } from "../BeamGroup/BeamGroup";
import Chord from "../Chord/Chord";
import MeasureDisplayMatter from "../MeasureDisplayMatter/MeasureDisplayMatter";
import Tuplet from "./../Tuplet/Tuplet";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";

import styles from "./Flow.module.css";

function Flow({ period, periodFlow, id }) {
  const {
    context: { initialized },
  } = useMeasuresContext();

  return (
    initialized && (
      <Fragment key={id}>
        {periodFlow.map((event, eventIndex, events) => (
          <Fragment key={`${id}e${eventIndex}_items`}>
            {event.type === "tuplet" && (
              <Tuplet
                key={`${event.renderId}_tup`}
                id={`${event.renderId}_tup`}
                clef={event.clefs[event.staff - 1].clef}
                event={event}
                eventIndex={eventIndex}
                events={events}
              />
            )}
            {event.type === "event" && (
              <Chord
                key={`${event.renderId}_cho`}
                id={`${event.renderId}_cho`}
                clef={event.clefs[event.staff - 1].clef}
                event={event}
                eventIndex={eventIndex}
                events={events}
              />
            )}
          </Fragment>
        ))}
      </Fragment>
    )
  );
}

export default withNoSSR(Flow);

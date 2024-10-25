"use client";

import React, { Fragment, useEffect, useState } from "react";

import Chord from "../Chord/Chord";
import Tuplet from "./../Tuplet/Tuplet";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";

import styles from "./Flow.module.css";

/**
 *
 * @type event.type can be one of:
 *       - event
 *       - tuplet
 *       - ottava
 *       - grace (grace note(s))
 *       - dynamic (NOTE: duration-less!)
 *       - space
 */

function Flow({ id, period, systemStart, systemEnd }) {
  const {
    context: { initialized },
  } = useMeasuresContext();
  const [flowEvents, setFlowEvents] = useState(period.flows[id]);

  // TODO: Period child components would benefit from these side effects, not just Flow
  useEffect(() => {
    function switchOrAddEvents(events, clipEvents) {
      const switched = [...events];
      clipEvents.forEach((clipEvent) => {
        const flowEventIndex = events.findIndex(
          (e) => e.renderId === clipEvent.renderId,
        );
        if (flowEventIndex !== -1) {
          switched[flowEventIndex] = clipEvent;
        } else {
          // make sure clipEvent belongs in this period
          if (
            clipEvent.position.start >= period.position.start &&
            clipEvent.position.end <= period.position.end
          ) {
            switched.push(clipEvent);
          }
        }
      });
      setFlowEvents(switched);
    }
    if (!systemStart && !systemEnd) {
      setFlowEvents(period.flows[id]);
    }
    if (systemStart && period.flowsClipped[id].start.length > 0) {
      switchOrAddEvents(period.flows[id], period.flowsClipped[id].start);
    }
    if (systemEnd && period.flowsClipped[id].end.length > 0) {
      switchOrAddEvents(period.flows[id], period.flowsClipped[id].end);
    }
  }, [
    id,
    period.flows,
    period.flowsClipped,
    systemStart,
    systemEnd,
    period.index,
    period.position.start,
    period.position.end,
  ]);

  return (
    initialized && (
      <Fragment key={`per${period.index}_${id}`}>
        {flowEvents.map((event, eventIndex, events) => (
          <Fragment key={`per${period.index}_${id}e${eventIndex}_items`}>
            {event.type === "tuplet" && (
              <Tuplet
                key={`${event.renderId}_tup`}
                id={`${event.renderId}_tup`}
                clef={event.clefs[event?.staff - 1].clef}
                event={event}
                eventIndex={eventIndex}
                events={events}
              />
            )}
            {event.type === "event" && (
              <Chord
                key={`${event.renderId}_cho`}
                id={`${event.renderId}_cho`}
                clef={event.clefs[event?.staff - 1].clef}
                event={event}
                eventIndex={eventIndex}
                events={events}
                period={period}
              />
            )}
          </Fragment>
        ))}
      </Fragment>
    )
  );
}

export default Flow;

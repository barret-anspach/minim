"use client";

import React, { Fragment, useEffect, useState } from "react";

import Chord from "../chord";
import Tuplet from "../tuplet";

import { useMeasuresContext } from "../../contexts/MeasuresContext";

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
  const [[previouslyAtSystemStart, previouslyAtSystemEnd], setPosition] =
    useState([systemStart, systemEnd]);
  const [addedEventRenderIds, _] = useState(new Set());

  // TODO: Period child components would benefit from these side effects,
  // not just Flow.
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
          // clipEvent doesn't exist in event flow; add: AND,
          // make sure clipEvent belongs in this period.
          if (
            systemStart &&
            clipEvent.position.start >= period.position.start &&
            clipEvent.position.end <= period.position.end
          ) {
            switched.push(clipEvent);
            addedEventRenderIds.add(clipEvent.renderId);
          }
        }
      });
      setFlowEvents(switched);
    }

    if (
      !previouslyAtSystemStart &&
      !systemEnd &&
      !previouslyAtSystemEnd &&
      !systemEnd
    ) {
      // √√√
      // Do nothing!
    } else {
      if (
        (previouslyAtSystemStart && !systemStart && !systemEnd) ||
        (previouslyAtSystemEnd && !systemStart && !systemEnd)
      ) {
        // Return events minus clipEvent substitutions/additions
        setFlowEvents(period.flows[id]);
        addedEventRenderIds.clear();
      } else {
        if (
          (systemStart && previouslyAtSystemEnd) ||
          (systemEnd && previouslyAtSystemStart)
        ) {
          addedEventRenderIds.clear();
        }
        switchOrAddEvents(
          period.flows[id],
          systemStart
            ? period.flowsClipped[id].start || []
            : period.flowsClipped[id].end || [],
        );
      }
    }
    setPosition([systemStart, systemEnd]);
  }, [
    id,
    period.flows,
    period.flowsClipped,
    systemStart,
    systemEnd,
    period.index,
    period.position.start,
    period.position.end,
    previouslyAtSystemStart,
    previouslyAtSystemEnd,
    addedEventRenderIds,
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

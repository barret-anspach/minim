"use client";

import React, { Fragment } from "react";

import Chord from "../chord";
import Tuplet from "../tuplet";

import { useMeasuresContext } from "../../contexts/MeasuresContext";
import useFlowEvents from "../../hooks/useFlowEvents";
import { MNX } from "../../types/mnx";
import { Minim } from "../../types/minim";

type FlowProps = {
  id: MNX.Defs.ID;
  period: Minim.Period.PeriodItem;
  systemStart: boolean;
  systemEnd: boolean;
};

/**
 * @type event.type can be one of:
 *       - event
 *       - tuplet
 *       - ottava
 *       - grace (grace note(s))
 *       - dynamic (NOTE: duration-less!)
 *       - space
 */

function Flow({ id, period, systemStart, systemEnd }: FlowProps) {
  const {
    context: { initialized },
  } = useMeasuresContext();
  const flowEvents: Minim.Event.EventItem[] = useFlowEvents({
    id,
    period,
    systemStart,
    systemEnd,
  });

  return initialized ? (
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
              period={period}
            />
          )}
          {event.type === "event" && (
            <Chord
              key={`${event.renderId}_cho`}
              id={`${event.renderId}_cho`}
              clef={event.clefs[event?.staff - 1].clef}
              event={event as Minim.Event.Clip}
              period={period}
            />
          )}
        </Fragment>
      ))}
    </Fragment>
  ) : (
    <></>
  );
}

export default Flow;

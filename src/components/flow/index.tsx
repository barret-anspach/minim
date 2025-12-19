"use client";

import { Fragment } from "react";

import Chord from "./../../components/chord/index.js";
import Tuplet from "./../../components/tuplet/index.js";

import { useMeasuresContext } from "./../../contexts/MeasuresContext.js";
import useFlowEvents from "../../hooks/useFlowEvents.js";

import { MNX } from "./../../types/mnx/index.js";
import { Minim } from "./../../types/minim/index.js";

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

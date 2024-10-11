"use client";

import React, { Fragment } from "react";

import Barline from "./../Barline/Barline";
import { BeamGroup } from "../BeamGroup/BeamGroup";
import Chord from "../Chord/Chord";
import Staff from "./../Staff";
import MeasureDisplayMatter from "../MeasureDisplayMatter/MeasureDisplayMatter";
import Tuplet from "./../Tuplet/Tuplet";

import { withNoSSR } from "./../../hooks/withNoSSR";
import { useMeasuresContext } from "./../../contexts/MeasuresContext";
import Item from "../Item";

import styles from "./Flow.module.css";
import Bracket from "../Bracket/Bracket";

function Flow({ period, periodFlow, id }) {
  const {
    context: { initialized, flows },
  } = useMeasuresContext();

  return (
    initialized && (
      <Fragment key={id}>
        {period.staves[id].map(({ part, staves }) =>
          staves.map(({ pitches, rangeClef, staffIndex, staffBounds }) => (
            <Fragment key={`${id}s${staffIndex + 1}_items`}>
              {period.index === 0 && staffIndex === 0 && (
                <Item
                  className={styles.partLabel}
                  column={`e0-text`}
                  pitch={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                >
                  {part.name}
                </Item>
              )}
              {period.positionInSystem.first &&
                period.index !== 0 &&
                staffIndex === 0 && (
                  <Item
                    className={styles.partLabel}
                    column={`e${period.key}-text`}
                    pitch={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                  >
                    {part.shortName}
                  </Item>
                )}
              <Staff
                id={`${id}s${staffIndex + 1}`}
                key={`${id}s${staffIndex + 1}`}
                pitches={pitches}
                rangeClef={rangeClef}
                staffBounds={staffBounds}
                start={`e${period.position.start}-bar`}
                end={`e${period.position.end}-end`}
              />
            </Fragment>
          )),
        )}
        {periodFlow.map((event, eventIndex, events) => (
          <Fragment key={`${id}e${eventIndex}_items`}>
            {event.type === "displayEvent" &&
              period.staves[id].map(({ staves }) =>
                staves.map(({ clef, rangeClef, staffBounds, staffIndex }) => (
                  <MeasureDisplayMatter
                    key={`${id}e${eventIndex}s${staffIndex}_dis`}
                    clef={clef.clef}
                    event={event}
                    flowId={id}
                    rangeClef={rangeClef}
                    staffBounds={staffBounds}
                    staffIndex={staffIndex}
                  />
                )),
              )}
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

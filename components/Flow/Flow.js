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
import { getStavesForFlow } from "../../utils/methods";
import Item from "../Item";

import styles from "./Flow.module.css";
import Bracket from "../Bracket/Bracket";

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
              {staffIndex === 0 && (
                <Item
                  className={styles.partLabel}
                  column={`e0-text`}
                  pitch={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                >
                  {part.name}
                </Item>
              )}
              {flows[id].measures.map((measure, measureIndex, measures) => (
                <Fragment key={`${id}_mea${measureIndex}`}>
                  <MeasureDisplayMatter
                    flowId={id}
                    index={measureIndex}
                    measure={measure}
                    part={part}
                    staffIndex={staffIndex}
                  />
                  {staffIndex === 0 && (
                    <>
                      {/** Bracket or Brace */}
                      {/** TODO: Interpret layout groups */}
                      {(measureIndex === 0 ||
                        measure.positionInSystem.first) && (
                        <Bracket
                          type={"brace"}
                          size={"regular"}
                          row={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                          column={`e${measure.position.start}-bracket / e${measure.position.start}-bracket`}
                        />
                      )}
                      {/* TODO: Handle barlines through multiple parts */}
                      <Barline
                        type={"regular"}
                        separation={true}
                        row={`${id}s${staffIndex + 1}${staffBounds.upper.id}/${id}s${staves.length}${staves[staves.length - 1].staffBounds.lower.id}`}
                        column={`e${measure.position.start}-bar / e${measure.position.start}-cle`}
                      />
                      {measure.positionInSystem.last &&
                        measureIndex !== measures.length - 1 && (
                          <Barline
                            type={"regular"}
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
        {/* Beams */}
        {flows[id].beamGroups.map((beamGroup, beamIndex) => (
          <BeamGroup
            key={`beamGroup_${beamIndex}`}
            beamGroup={beamGroup}
            prefix={id}
          />
        ))}
      </Fragment>
    )
  );
}

export default withNoSSR(Flow);

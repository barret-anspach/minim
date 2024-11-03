import { useEffect, useState } from "react";

export default function useFlowEvents({ id, period, systemStart, systemEnd }) {
  const [flowEvents, setFlowEvents] = useState(period.flows[id]);
  const [[previouslyAtSystemStart, previouslyAtSystemEnd], setPosition] =
    useState([systemStart, systemEnd]);
  const [addedEventRenderIds, _] = useState(new Set());

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

  return flowEvents;
}

"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { Minim } from "../../types/minim";

import Flow from "../flow";
import Period from "../period";
import Systems from "../systems";

import { useMeasuresContext } from "../../contexts/MeasuresContext";

import styles from "./styles.module.css";

type ScoreProps = {
  compositionMetadata: Minim.Document.ScoreData;
  movementMetadata: Minim.Document.ScoreData;
  className?: string;
};

const Score: React.FC<ScoreProps> = function ({
  className,
  compositionMetadata,
  movementMetadata,
}) {
  const {
    context: { initialized, periods },
  } = useMeasuresContext();
  const periodRefs = useRef<HTMLDivElement[]>([]);
  const [periodPositions, setPeriodPositions] = useState<boolean[]>(
    Array.from({ length: Object.keys(periods).length }, (_, i) => i === 0),
  );
  // TODO: In using periodPositions to determine which periods are in a given system,
  // we can set flex–basis on periods to "soften" some of flexbox's spacing choices,
  // and even provide a means to customize period spacing.
  const getSystemsFromPeriodPositions = useCallback(
    (positions: typeof periodPositions) => {
      const result = [];
      let i = 0,
        ri = -1;
      for (const period of positions) {
        const value = Object.values(periods)[i];
        if (period) {
          ri++;
          result[ri] = [value];
        } else {
          result[ri].push(value);
        }
        i++;
      }
      return result;
    },
    [periods],
  );
  // const [systems, setSystems] = useState(
  //   getSystemsFromPeriodPositions(periodPositions),
  // );
  const handleRefRegistration = useCallback(
    (index: number) => (element: HTMLDivElement) => {
      if (element) periodRefs.current[index] = element;
    },
    [],
  );

  useLayoutEffect(() => {
    function onResize() {
      const observer = new ResizeObserver(
        debounce(
          (entries) => {
            const firstChildOffsetLeft = (entries[0].target as HTMLDivElement)
              .offsetLeft;
            const newArr = [...periodPositions];
            for (let i = 0; i < entries.length; i++) {
              newArr[i] =
                (entries[i].target as HTMLDivElement).offsetLeft ===
                firstChildOffsetLeft;
            }
            if (periodPositions.some((p, i) => p !== newArr[i])) {
              setPeriodPositions(newArr);
              // setSystems(getSystemsFromPeriodPositions(newArr));
            }
          },
          88,
          { leading: true, trailing: true },
        ),
      );

      if (periodRefs.current) {
        periodRefs.current.forEach((ref) => {
          if (ref) {
            observer.observe(ref, {});
          }
        });
      }

      return observer;
    }
    const observer = onResize();
    // Calculate layout/period positions when printing
    window.addEventListener("beforeprint", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("beforeprint", onResize);
    };
  }, [getSystemsFromPeriodPositions, periodPositions]);

  return initialized ? (
    <main className={clsx(styles.score, className)} role="main">
      <header className={styles.header}>
        {compositionMetadata && (
          <>
            <div className={styles.title}>
              <h1>{compositionMetadata.name}</h1>
              {movementMetadata && <h2>{movementMetadata.name}</h2>}
            </div>
            <p>{compositionMetadata.composer}</p>
          </>
        )}
      </header>
      <div className={styles.systems}>
        <Systems id="systems">
          {Object.values(periods).map((period, _, periods) => (
            <Period
              ref={handleRefRegistration(period.index)}
              key={`per${period.index}`}
              index={period.index}
              period={period}
              systemStart={periodPositions[period.index]}
              systemEnd={
                periodPositions[period.index + 1] ??
                period.index === periods.length - 1
              }
            >
              {Object.keys(period.flows).map((flowId) => (
                <Flow
                  key={`per${period.index}_${flowId}`}
                  id={flowId}
                  period={period}
                  systemStart={periodPositions[period.index]}
                  systemEnd={
                    periodPositions[period.index + 1] ??
                    period.index === periods.length - 1
                  }
                />
              ))}
            </Period>
          ))}
        </Systems>
      </div>
      {/* <Editor view={view} setView={handleView} /> */}
    </main>
  ) : (
    <></>
  );
};

export default Score;

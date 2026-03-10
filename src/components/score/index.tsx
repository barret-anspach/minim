"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";

import Flow from "./../../components/flow/index.js";
import Period from "./../../components/period/index.js";
import Systems from "./../../components/systems/index.js";

import { useMeasuresContext } from "./../../contexts/MeasuresContext.js";

import styles from "./styles.module.css";
import { cx } from "./../../utils/classNames";

type ScoreProps = {
  className?: string;
};

const Score: FC<ScoreProps> = function ({ className }) {
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

  useEffect(() => {
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
            if (
              periodPositions.some((p, i) => p !== newArr[i]) ||
              periodPositions.length === 0
            ) {
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
  }, [getSystemsFromPeriodPositions, Object.keys(periods), periodPositions]);

  return initialized ? (
    <main className={cx(styles.score, className)} role="main">
      <Systems id="systems" className={styles.systems}>
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
    </main>
  ) : (
    <></>
  );
};

export default Score;

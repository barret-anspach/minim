import Event from "./../../components/event/index.js";

import { durationMap } from "./../../constants/durations.js";

import styles from "./styles.module.css";

import { Minim } from "./../../types/minim/index.js";
import { MNX } from "./../../types/mnx/index.js";
import { cx } from "./../../utils/classNames.js";

const tempoBaseMap = {
  key: durationMap.key,
  value: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
};

type TempoProps = {
  id: MNX.Defs.ID;
  beat: Minim.Grid.Column;
  pitch: Minim.Grid.Row;
  tempo: Minim.Component.TempoPositioned;
};

export default function Tempo({ id, beat, pitch, tempo }: TempoProps) {
  // TODO: account for a pulse value expressed as a tuplet
  // TODO: more generally, we'll need to be able to render multiple notes with ties /
  // tuplets / etc to resolve the duration and semantic meaning of the tempo
  return (
    <Event data-tempo className={styles.tempo} beat={beat} pitch={pitch}>
      <span className={cx(styles.pulse, styles.musicTextFont)}>
        {
          tempoBaseMap.value[
            tempoBaseMap.key.findIndex((t) => t === tempo.value.base)
          ]
        }
        {tempo.value.dots
          ? Array.from({ length: tempo.value.dots }).map((_, dotIndex) => (
              <span key={`${id}_dot${dotIndex}`} className={styles.dot}>
                
              </span>
            ))
          : null}
      </span>
      <span className={cx(styles.mm, styles.textFont)}>= {tempo.bpm}</span>
    </Event>
  );
}

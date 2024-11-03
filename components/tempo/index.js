import { durationMap } from "../../constants/durations";
import Event from "../event";
import styles from "./styles.module.css";

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

export default function Tempo({ id, beat, pitch, tempo }) {
  // TODO: account for a pulse value expressed as a tuplet
  // TODO: more generally, we'll need to be able to render multiple notes with ties /
  // tuplets / etc to resolve the duration and semantic meaning of the tempo
  return (
    <Event className={styles.tempo} beat={beat} pitch={pitch}>
      <span className={styles.pulse}>
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
      <span className={styles.mm}>= {tempo.bpm}</span>
    </Event>
  );
}

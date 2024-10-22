import Item from "../Item";
import styles from "./Dynamic.module.css";

const dynamicMap = {
  key: [
    "dynamicPiano",
    "dynamicMezzo",
    "dynamicForte",
    "dynamicRinforzando",
    "dynamicSforzando",
    "dynamicZ",
    "dynamicNiente",
    "dynamicPPPPPP",
    "dynamicPPPPP",
    "dynamicPPPP",
    "dynamicPPP",
    "dynamicPP",
    "dynamicMP",
    "dynamicMF",
    "dynamicPF",
    "dynamicFF",
    "dynamicFFF",
    "dynamicFFFF",
    "dynamicFFFFF",
    "dynamicFFFFFF",
    "dynamicFortePiano",
    "dynamicForzando",
    "dynamicSforzando1",
    "dynamicSforzandoPiano",
    "dynamicSforzandoPianissimo",
    "dynamicSforzato",
    "dynamicSforzatoPiano",
    "dynamicSforzatoFF",
    "dynamicRinforzando1",
    "dynamicRinforzando2",
  ],
  shorthand: [
    "p",
    "m",
    "f",
    "r",
    "s",
    "z",
    "n",
    "pppppp",
    "ppppp",
    "pppp",
    "ppp",
    "pp",
    "mp",
    "mf",
    "pf",
    "ff",
    "fff",
    "ffff",
    "fffff",
    "ffffff",
    "fp",
    "fz",
    "sf",
    "sfp",
    "sfpp",
    "sfz",
    "sfzp",
    "sffz",
    "rf",
    "rfz",
  ],
  value: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
};

// Do we consider a Dynamic a marking on a chord? There are conditions where a dynamic isn't related to an event ...

export default function Dynamic({ dynamic, pitch = "c4" }) {
  return (
    <Item
      className={styles.dynamic}
      column={`e${dynamic.position.at}-not`}
      pitch={`${dynamic.flowId}p${dynamic.partIndex}s${dynamic.staff + 1}${pitch}`}
    >
      {dynamicMap.value[dynamicMap.shorthand.indexOf(dynamic.value)]}
    </Item>
  );
}

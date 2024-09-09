export function approxEqual(a, b, epsilon = 5) {
  return Math.abs(a - b) <= epsilon;
}

const durationMap = {
  key: [
    "duplexMaxima",
    "maxima",
    "longa",
    "breve",
    "whole",
    "half",
    "quarter",
    "eighth",
    "16th",
    "32nd",
    "64th",
    "128th",
    "256th",
    "512th",
    "1024th",
    "2048th",
    "4096th"
  ], value: [
    32768, // duplexMaxima
    16384, // maxima
    8192, // longa
    4096, // whole
    2048, // half
    1024, // quarter
    512, // eighth
    256, // 16th
    128, // 32nd
    64, // 64th
    32, // 128th
    16, // 256th
    8, // 512th
    4, // 1024th
    2, // 2048th
    1 // 4096th
  ],
}

export function timeSignatureToDuration(count, unit) {
  return count * (durationMap.value[durationMap.key.indexOf('whole')] / unit);
}

export function toDuration(index, events) {
  return events.slice(0, index).reduce((acc, e) =>
    acc +
      (
        durationMap.value[durationMap.key.indexOf(e.duration.base)] *
          (1 + (1 - Math.pow(2, e.duration.dots ? e.duration.dots * -1 : 0)))
      ), 0)
}

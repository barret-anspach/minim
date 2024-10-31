import { useMemo } from "react";

import styles from "./styles.module.css";

function Brace({ size }) {
  switch (size) {
    case "flat": {
      return (
        <svg
          id="braceFlat"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1.11 19.82"
          preserveAspectRatio="none"
        >
          <g id="braceFlat-g" data-name="braceFlat">
            <path
              d="M0,9.92c.3-.63.48-.85.48-1.77V2.48C.48,1.45.48.83.62.46c.12-.36.44-.46.46-.46.04,0,.04.04.04.08,0,.06-.14.04-.28.28-.12.22-.14.62-.14.99v3.93c0,.56.02,1.11.02,1.67,0,.26,0,.54-.02.81,0,.58-.1,1.29-.4,1.81,0,.06-.14.34-.2.36.06,0,.2.28.2.34.3.52.4,1.23.4,1.81.02.28.02.56.02.81,0,.56-.02,1.11-.02,1.67v3.93c0,.4.02.77.14.99.14.24.28.22.28.3,0,.02-.04.06-.04.06-.02-.02-.34-.1-.46-.44-.14-.4-.14-1.01-.14-2.04v-5.67c0-.91-.18-1.13-.48-1.75Z"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    }
    case "small": {
      return (
        <svg
          id="braceSmall"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2.04 19.78"
          preserveAspectRatio="none"
        >
          <g id="braceSmall-g" data-name="braceSmall">
            <path
              d="M0,9.88c.58-.63.95-1.17.95-2.12C.95,6.47.24,5.65.24,3.65S1.31.69,1.77.14c.08-.1.12-.14.16-.14s.06.04.08.06c.02,0,.04.04.04.08,0,.06-.02.12-.1.22-.1.18-.93.91-.93,1.98s.77,3,.91,4.23c.02.1.02.22.02.32,0,1.19-.66,2.62-1.25,3.02.59.38,1.25,1.81,1.25,3,0,.1,0,.22-.02.34-.14,1.21-.91,3.11-.91,4.21s.83,1.81.93,2c.08.08.1.14.1.2,0,.04-.02.08-.04.08-.02.02-.04.06-.08.06s-.08-.04-.16-.14c-.46-.56-1.53-1.47-1.53-3.49s.71-2.84.71-4.13c0-.85-.4-1.51-.95-2.14Z"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    }
    case "large": {
      return (
        <svg
          id="braceLarge"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1.33 19.78"
          preserveAspectRatio="none"
        >
          <g id="braceLarge-g" data-name="braceLarge">
            <path
              d="M0,9.9c.5-.63.83-1.15.83-2.08C.83,6.57.2,5.77.2,3.81S.69.67,1.09.14c.06-.1.1-.14.14-.14.06,0,.1.04.1.1,0,.02-.02.06-.02.08l-.22.4c-.26.62-.46,1.29-.46,1.96,0,1.07.54,2.92.65,4.11.02.1.02.22.02.32,0,1.17-.54,2.58-1.07,2.94.54.36,1.07,1.77,1.07,2.94,0,.12,0,.22-.02.32-.12,1.17-.65,3.03-.65,4.09s.5,2.08.59,2.24c.04.04.04.08.04.14,0,.08-.02.16-.04.16-.06,0-.1-.06-.14-.12-.4-.56-.89-1.71-.89-3.69,0-1.45.63-2.68.63-4.07,0-1.29-.52-1.61-.83-2Z"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    }
    case "larger": {
      return (
        <svg
          id="braceLarger"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1.19 19.78"
          preserveAspectRatio="none"
        >
          <g id="braceLarger-g" data-name="braceLarger">
            <path
              d="M.75,8.11C.75,6.86.2,5.77.2,3.81S.62.67.97.14c.04-.04.1-.14.12-.14.04,0,.06.02.08.06,0,.08-.02.16-.04.22-.12.3-.26.59-.36.87-.16.44-.26.91-.26,1.39,0,1.07.48,3.41.6,4.6v.32c0,1.17-.48,2.04-.95,2.44.5.36.95,1.27.95,2.44v.32c-.12,1.17-.6,3.53-.6,4.58s.52,2.06.6,2.22c.02.02.08.16.08.24,0,.04-.08.08-.08.08-.02,0-.1-.08-.14-.12-.36-.56-.77-1.71-.77-3.69,0-1.45.56-2.98.56-4.36,0-1.29-.46-1.31-.75-1.71.46-.63.75-.85.75-1.79Z"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    }
    case "regular":
    default: {
      return (
        <svg
          id="brace"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1.33 19.78"
          preserveAspectRatio="none"
        >
          <g id="brace-g" data-name="brace">
            <path
              d="M0,9.9c.5-.63.83-1.15.83-2.08C.83,6.57.2,5.77.2,3.81S.69.67,1.09.14c.06-.1.1-.14.14-.14.06,0,.1.04.1.1,0,.02-.02.06-.02.08l-.22.4c-.26.62-.46,1.29-.46,1.96,0,1.07.54,2.92.65,4.11.02.1.02.22.02.32,0,1.17-.54,2.58-1.07,2.94.54.36,1.07,1.77,1.07,2.94,0,.12,0,.22-.02.32-.12,1.17-.65,3.03-.65,4.09s.5,2.08.59,2.24c.04.04.04.08.04.14,0,.08-.02.16-.04.16-.06,0-.1-.06-.14-.12-.4-.56-.89-1.71-.89-3.69,0-1.45.63-2.68.63-4.07,0-1.29-.52-1.61-.83-2Z"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    }
  }
}

export default function Bracket({ type, size = "regular", column, row }) {
  const style = useMemo(
    () => ({
      "--column": column,
      "--row": row,
    }),
    [column, row],
  );

  switch (type) {
    case "brace": {
      return (
        <div className={styles.brace} style={style}>
          <Brace size={size} />
        </div>
      );
    }
    case "bracket":
    default: {
      return (
        <div className={styles.bracket} style={style}>
          <span className={styles.bracketTop}></span>
          <div className={styles.bracketBar} />
          <span className={styles.bracketBottom}></span>
        </div>
      );
    }
  }
}

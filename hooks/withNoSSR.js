import dynamic from "next/dynamic";
export const withNoSSR = (Component) =>
  dynamic(() => Promise.resolve(Component), { ssr: false });

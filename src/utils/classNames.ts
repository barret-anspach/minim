type cxClass = string | number | bigint | boolean;
type cxArgs = cxClass | cxClass[] | null | undefined;

export function cx(...args: cxArgs[]) {
  return args.flat().filter(Boolean).join(" ");
}

import { DataType } from "csstype";
import { Minim } from "./minim";

declare module "csstype" {
  export interface Properties {
    //
    "--bounds"?: string;
    "--columns"?: DataType.GridLine;
    "--duration"?: Minim.DisplayUnit.Duration;
    "--end"?: string;
    "--indent"?: string;
    "--rows"?: DataType.GridLine;
    // Item, Barline
    "--column"?: DataType.GridLine | string;
    "--padEnd"?: string;
    "--pitch"?: string; // TODO: Would be nice to enforce format
    "--row"?: DataType.GridLine | string;
    "--separation"?: string;
    "--size"?: string;
    "--start"?: string;
    "--weight"?: string;
  }
}

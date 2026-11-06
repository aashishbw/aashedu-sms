import type { CSSProperties } from "react";

export function institutionTheme(primary: string | null, secondary: string | null): CSSProperties {
  const properties: Record<string,string> = {};
  if (primary) {
    const [red,green,blue]=[1,3,5].map(index => {
      const value=parseInt(primary.slice(index,index+2),16)/255;
      return value<=0.04045 ? value/12.92 : ((value+0.055)/1.055)**2.4;
    });
    properties["--institution-primary"]=primary;
    properties["--institution-link-light"]="color-mix(in srgb,"+primary+" 48%,#000)";
    properties["--institution-link-dark"]="color-mix(in srgb,"+primary+" 38%,#fff)";
    properties["--institution-button-text"]=.2126*red+.7152*green+.0722*blue > .179 ? "#000" : "#fff";
  }
  if (secondary) {
    properties["--institution-soft-light"]="color-mix(in srgb,"+secondary+" 20%,#fff)";
    properties["--institution-soft-dark"]="color-mix(in srgb,"+secondary+" 20%,#182332)";
  }
  return properties;
}

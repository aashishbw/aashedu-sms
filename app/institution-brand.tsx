import { GraduationCap } from "lucide-react";

export function InstitutionMark({logoUrl}:{logoUrl:string|null}) {
  return logoUrl
    ? <img className="institution-logo" src={logoUrl} width={42} height={42} alt=""/>
    : <span className="institution-logo"><GraduationCap size={21} aria-hidden="true"/></span>;
}

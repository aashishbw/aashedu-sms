import { z } from "zod";
import { scopeFor, type AccessUser } from "./scopes";
import type { Field } from "./catalog";
export function filters(user:AccessUser,key:string,fields:Field[],params:{q?:string;from?:string;to?:string}) {
  const text=fields.filter(field=>field.type==="text").slice(0,3);
  const date=fields.find(field=>field.type==="date")?.name ?? "createdAt";
  const from=z.iso.date().safeParse(params.from);
  const to=z.iso.date().safeParse(params.to);
  const end=to.success ? new Date(to.data+"T00:00:00Z") : null;
  if(end) end.setUTCDate(end.getUTCDate()+1);
  return {AND:[
    {archived:false,...scopeFor(user,key)},
    ...(params.q && text.length ? [{OR:text.map(field=>({[field.name]:{contains:params.q!.slice(0,100),mode:"insensitive"}}))}] : []),
    ...(from.success || end ? [{[date]:{...(from.success ? {gte:new Date(from.data+"T00:00:00Z")} : {}),...(end ? {lt:end} : {})}}] : [])
  ]};
}

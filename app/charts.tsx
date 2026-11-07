"use client";
import { formatMoney } from "../lib/currency";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export function CountsChart({data,title,currency}: {data:{label:string;value:number}[];title:string;currency?:string}) {
  const format = (value:number) => currency ? formatMoney(value,currency) : String(value);
  return <section className="card"><h2>{title}</h2>
    {data.length ? <div style={{height:210}} role="img" aria-label={data.map(item=>item.label+" "+format(item.value)).join(", ")}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{left:0,right:12}}>
        <XAxis dataKey="label" tick={{fill:"var(--muted)",fontSize:11}}/><YAxis width={48} tick={{fill:"var(--muted)",fontSize:11}}/>
        <Tooltip formatter={value => format(Number(value))} cursor={{fill:"var(--soft)"}} contentStyle={{background:"var(--surface)",color:"var(--text)"}}/>
        <Bar dataKey="value" fill="var(--brand)" radius={[5,5,0,0]}/>
      </BarChart></ResponsiveContainer>
    </div> : <p className="muted">No data to chart.</p>}
  </section>;
}

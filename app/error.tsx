"use client";
export default function ErrorPage({reset}: {reset:()=>void}) { return <main className="content"><h1>Something went wrong</h1><p>The workspace could not complete this request.</p><button onClick={reset}>Try again</button></main>; }

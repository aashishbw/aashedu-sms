import assert from "node:assert/strict";

const base=process.env.SMOKE_URL ?? "http://127.0.0.1:3000";
const request=(path,options={})=>fetch(base+path,{redirect:"manual",...options});

async function form(path, values, cookie, name) {
  const page=await request(path,{headers:cookie?{cookie}:{}});
  assert.equal(page.status,200,`Form page ${path}`);
  const html=await page.text();
  const forms=html.match(/<form\b[\s\S]*?<\/form>/g) ?? [];
  const selected=forms.find(item=>item.includes('name="'+name+'"')&&item.includes("$ACTION_"));
  assert.ok(selected,`Server form ${name}`);
  const data=new FormData();
  for(const input of selected.match(/<input\b[^>]*>/g) ?? []){
    const key=input.match(/\bname="(\$ACTION_[^"]+)"/)?.[1];
    if(key) data.append(key,(input.match(/\bvalue="([^"]*)"/)?.[1] ?? "").replaceAll("&quot;",'"').replaceAll("&amp;","&"));
  }
  for(const [key,value] of Object.entries(values)) data.set(key,value);
  return request(path,{method:"POST",headers:{origin:base,...(cookie?{cookie}:{})},body:data});
}
async function signIn(role) {
  const response=await form("/login",{email:role+"@demo.example",password:"Campus-demo-2026!"},null,"email");
  assert.equal(response.status,303);
  assert.equal(response.headers.get("location"),"/");
  const cookie=response.headers.getSetCookie().find(value=>value.startsWith("school_session="));
  assert.ok(cookie);
  return cookie.split(";")[0];
}
assert.equal((await request("/export/students")).status,404);
const anonymous=await request("/"); assert.ok(anonymous.headers.get("location")==="/login" || (await anonymous.text()).includes("NEXT_REDIRECT;replace;/login;"));
const admin=await signIn("super_admin");
const student=await signIn("student");
const accountant=await signIn("accountant");
assert.equal((await request("/export/payments",{headers:{cookie:student}})).status,404);
const userPage=await request("/users",{headers:{cookie:student}}); assert.ok(userPage.status===404 || (await userPage.text()).includes("NEXT_HTTP_ERROR_FALLBACK;404"));
const announcement=await request("/modules/communication",{headers:{cookie:student}});
assert.equal(announcement.status,200);

const name="Smoke Student "+Date.now();
const add=await form("/modules/students?add=1",{name,status:"Active",admissionNo:"",email:"",guardianName:"",emergencyPhone:""},admin,"name");
assert.equal(add.status,303);
assert.match(add.headers.get("location") ?? "",/saved=1/);
const csv=await request("/export/students?q="+encodeURIComponent(name),{headers:{cookie:admin}});
assert.equal(csv.status,200);
assert.match(await csv.text(),new RegExp(name));
const hidden=await request("/export/students?q="+encodeURIComponent(name),{headers:{cookie:student}});
assert.equal(hidden.status,200);
assert.doesNotMatch(await hidden.text(),new RegExp(name));
const pdf=await request("/export/students?format=pdf&q="+encodeURIComponent(name),{headers:{cookie:admin}});
assert.equal(pdf.status,200);
assert.ok((await pdf.text()).startsWith("%PDF-"));
const invoicePage=await request("/modules/payments?add=1",{headers:{cookie:accountant}});
assert.equal(invoicePage.status,200);
const invoice=(await invoicePage.text()).match(/<option value="([^"]+)">DEMO-INV-001<[/]option>/)?.[1];
assert.ok(invoice);
const reference="SMOKE-PAY-"+Date.now();
const overpay=await form("/modules/payments?add=1",{reference,invoiceId:invoice,amount:"100.01",day:"2026-11-01"},accountant,"amount");
assert.equal(overpay.status,303);
assert.match(decodeURIComponent(overpay.headers.get("location") ?? ""),/cannot.exceed.the.balance/);
const posted=await form("/modules/payments?add=1",{reference,invoiceId:invoice,amount:"0.10",day:"2026-11-01"},accountant,"amount");
assert.equal(posted.status,303);
assert.match(posted.headers.get("location") ?? "",/saved=1/);
console.log("Smoke checks passed: authentication, protected routes, student creation, student scope, CSV and PDF.");




import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
const hits = new Map<string, number[]>();
function limited(ip:string){ const now=Date.now(), arr=(hits.get(ip)||[]).filter(t=>now-t<60_000); arr.push(now); hits.set(ip,arr); return arr.length>5; }
function summary(d:any){ return `RinnOZ Commission Order
Time: ${new Date().toISOString()}
Language: ${d.language}
Name: ${d.name}
Email: ${d.email}
Contact: ${d.contactPlatform} ${d.contactHandle}
Payment: ${d.paymentMethod}
Style/Type: ${d.commissionStyle} / ${d.type}
Characters: ${d.characterCount}
Usage: ${d.usage}
Deadline: ${d.deadline}
Description: ${d.description}
Lore: ${d.lore}
Design/accessories: ${d.design}
References: ${d.references}
Vibe: ${d.vibe}
Notes: ${d.notes}
Source: ${d.source || 'website'}`; }
export async function POST(req:NextRequest){
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'local'; if(limited(ip)) return NextResponse.json({ok:false,error:'Too many submissions. Please wait a minute.'},{status:429});
 const d=await req.json(); if(d.website) return NextResponse.json({ok:true});
 for (const k of ['name','email','paymentMethod','commissionStyle','type','description','references']) if(!d[k]) return NextResponse.json({ok:false,error:`Missing field: ${k}`},{status:400});
 if(!d.tos) return NextResponse.json({ok:false,error:'Please agree to the Terms of Service.'},{status:400});
 const to=process.env.ORDER_EMAIL_TO||'takayuki.rinnozuki@gmail.com'; const from=process.env.ORDER_EMAIL_FROM||'commissions@rinnoz.vercel.app';
 const text=summary(d); const subject=`[RinnOZ Commission] New order from ${d.name} - ${d.commissionStyle}/${d.type}`;
 try{
  if(process.env.RESEND_API_KEY){ const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from,to,subject,text,reply_to:d.email})}); if(!r.ok) throw new Error(await r.text()); }
  else if(process.env.SMTP_HOST){ const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined}); await transporter.sendMail({from,to,subject,text,replyTo:d.email}); }
  else { const r=await fetch(`https://formsubmit.co/ajax/${to}`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({_subject:subject,email:d.email,name:d.name,message:text})}); if(!r.ok) throw new Error('Email provider env not configured and FormSubmit fallback failed.'); }
  return NextResponse.json({ok:true,summary:text});
 } catch(e:any){ return NextResponse.json({ok:false,error:e.message||'Send failed',summary:text,mailto:`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`},{status:500}); }
}

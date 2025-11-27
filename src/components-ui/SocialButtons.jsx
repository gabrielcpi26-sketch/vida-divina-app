
import React from 'react'

export default function SocialButtons({ social, setSocial }){
  function socialHref(kind){
    const v = kind==='tt' ? social.tiktok : kind==='ig' ? social.instagram : social.facebook;
    if(!v) return null;
    if(/^https?:\/\//i.test(v)) return v;
    if(kind==='tt') return `https://www.tiktok.com/@${v}`;
    if(kind==='ig') return `https://www.instagram.com/${v}/`;
    return `https://www.facebook.com/${v}`;
  }
  function openSocialSettings(){
    const t = prompt('Usuario de TikTok (sin @) o URL', social.tiktok||''); if(t==null) return;
    const i = prompt('Usuario de Instagram (sin @) o URL', social.instagram||''); if(i==null) return;
    const f = prompt('Usuario/URL de Facebook', social.facebook||''); if(f==null) return;
    setSocial({ tiktok: t.trim(), instagram: i.trim(), facebook: f.trim() });
  }
  function handleSocialClick(kind,e){ const href=socialHref(kind); if(!href){ e?.preventDefault?.(); openSocialSettings(); } }
  return (
    <div className="fixed bottom-5 left-5 flex flex-col gap-2 z-40">
      <a href={socialHref('tt')||undefined} onClick={(e)=>handleSocialClick('tt',e)} target={socialHref('tt')?'_blank':undefined} rel={socialHref('tt')?'noreferrer':undefined} className="px-4 py-3 rounded-full shadow-lg bg-black text-white text-sm hover:opacity-90" title={social.tiktok ? (socialHref('tt')?.replace(/^https?:\/\/+/, '') || `@${social.tiktok}`) : 'Configurar TikTok'}>TikTok</a>
      <a href={socialHref('ig')||undefined} onClick={(e)=>handleSocialClick('ig',e)} target={socialHref('ig')?'_blank':undefined} rel={socialHref('ig')?'noreferrer':undefined} className="px-4 py-3 rounded-full shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white text-sm hover:opacity-90" title={social.instagram ? (socialHref('ig')?.replace(/^https?:\/\/+/, '') || `@${social.instagram}`) : 'Configurar Instagram'}>Instagram</a>
      <a href={socialHref('fb')||undefined} onClick={(e)=>handleSocialClick('fb',e)} target={socialHref('fb')?'_blank':undefined} rel={socialHref('fb')?'noreferrer':undefined} className="px-4 py-3 rounded-full shadow-lg bg-blue-600 text-white text-sm hover:bg-blue-700" title={social.facebook ? (socialHref('fb')?.replace(/^https?:\/\/+/, '') || `${social.facebook}`) : 'Configurar Facebook'}>Facebook</a>
    </div>
  );
}

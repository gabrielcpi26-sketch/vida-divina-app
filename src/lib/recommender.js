
export function bmiFrom(h, w) { if (!h || !w) return null; const m = h/100; if (m<=0) return null; return +(w/(m*m)).toFixed(1); }
export function bmiCategory(bmi) { if (bmi==null) return null; if (bmi<18.5) return {id:'under',label:'Bajo peso'}; if (bmi<25) return {id:'normal',label:'Saludable'}; if (bmi<30) return {id:'over',label:'Sobrepeso'}; return {id:'obese',label:'Obesidad'}; }
export function recommend(bmi, objective) {
  if (bmi==null) return null; const o = objective || 'salud_general';
  const R=(primaryId,note,alts=[])=>({primaryId,note,alts});
  const common={
    energia:R('black-coffee','Energía y enfoque diario',['atom','premium-coffee','mocha']),
    digestion:R('te-divina','Mantenimiento digestivo y detox',['ignite','te-menta','te-jamaica']),
    descanso:R('sleepnlose','Descanso y control de peso',['ace-lavanda','te-manzanilla','ace-menta']),
    salud:R('time-cap','Soporte integral e inmunidad',['gano-cap','chaga-cap','antiox-drink']),
    masa:R('whey','Aumenta masa y recuperación',['vida-protein','lean','vida-fuel']),
    bajar:R('atom','Control de apetito y energía',['sculpt','cheat','te-rojo']),
  };
  if (o==='aumentar_masa') return R('vida-protein','Apoyo al aumento de masa y fuerza',['whey','lean','vida-fuel']);
  if (bmi<18.5){ if (o==='definir_musculo') return common.masa; if (o==='energia_enfoque') return common.energia; if (o==='digestion_detox') return common.digestion; if (o==='descanso_estres') return common.descanso; if (o==='bajar_peso') return R('whey','Primero nutrirte; evita dietas agresivas',['vida-protein','lean']); return common.salud; }
  if (bmi<25){ if (o==='bajar_peso') return common.bajar; if (o==='definir_musculo') return common.masa; if (o==='energia_enfoque') return common.energia; if (o==='digestion_detox') return common.digestion; if (o==='descanso_estres') return common.descanso; return common.salud; }
  if (bmi<30){ if (o==='bajar_peso') return R('sculpt','Soporte para control de peso',['atom','cheat','te-rojo']); if (o==='definir_musculo') return R('lean','Déficit calórico con proteína',['whey','vida-protein']); if (o==='energia_enfoque') return common.energia; if (o==='digestion_detox') return common.digestion; if (o==='descanso_estres') return common.descanso; return common.salud; }
  if (o==='bajar_peso') return R('hcg','Plan estructurado; acompaña con asesoría',['atom','cheat','te-divina']);
  if (o==='definir_musculo') return R('whey','Preserva músculo en control de peso',['lean','vida-protein']);
  if (o==='energia_enfoque') return common.energia; if (o==='digestion_detox') return common.digestion; if (o==='descanso_estres') return common.descanso; return common.salud;
}

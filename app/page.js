"use client";
import React, { useState, useEffect } from 'react';

export default function DashboardEclat() {
  const [hojaFicha, setHojaFicha] = useState([]);
  const [hojaHistorial, setHojaHistorial] = useState([]);
  const [pacienteSel, setPacienteSel] = useState(null);
  const [atencionSel, setAtencionSel] = useState(null);
  const [vista, setVista] = useState('ficha'); 
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      // @ts-ignore
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      // Carga de las dos pestañas específicas
      const wsFicha = wb.Sheets["Ficha clínica"];
      const wsHistorial = wb.Sheets["Historial Atenciones"];
      
      if (wsFicha) setHojaFicha(XLSX.utils.sheet_to_json(wsFicha));
      if (wsHistorial) setHojaHistorial(XLSX.utils.sheet_to_json(wsHistorial));
    };
    reader.readAsBinaryString(file);
  };

  const listaPacientes = [...new Set(hojaFicha.map(d => d['Nombre paciente']))]
    .filter(p => p?.toString().toLowerCase().includes(busqueda.toLowerCase()));

  // Filtrar datos por paciente seleccionado
  const datosFichaPaciente = hojaFicha.find(d => d['Nombre paciente'] === pacienteSel);
  const atencionesPaciente = hojaHistorial.filter(d => d['Nombre paciente'] === pacienteSel);

  // Función para renderizar campos dinámicos de la Ficha Clínica (A-AN)
  const renderizarCamposFicha = (inicio, fin) => {
    if (!datosFichaPaciente) return null;
    return Object.entries(datosFichaPaciente).map(([key, value], index) => {
      // Aquí podrías filtrar por el índice de columna si fuera necesario, 
      // pero por ahora mostramos los datos que existan en el objeto
      return (
        <div key={key} className="flex justify-between border-b border-white/20 py-1 text-sm">
          <span className="font-bold opacity-70 uppercase text-[10px]">{key}:</span>
          <span className="text-right">{value || "---"}</span>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-200 p-4 font-sans text-slate-800">
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="max-w-6xl mx-auto bg-white min-h-[90vh] shadow-2xl rounded-sm border-t-8 border-[#085162] flex flex-col">
        
        {/* CABECERA */}
        <div className="p-6 border-b flex justify-between items-start bg-slate-50">
          <div className="w-1/3 relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Paciente</label>
            <input 
              type="text" 
              value={busqueda || pacienteSel || ""}
              placeholder="Escriba para buscar..." 
              className="w-full p-2 border border-slate-300 rounded mt-1 shadow-sm focus:ring-2 focus:ring-[#085162] outline-none"
              onChange={(e) => { setBusqueda(e.target.value); setPacienteSel(null); }}
            />
            {busqueda && (
              <div className="absolute z-50 w-full bg-white border shadow-xl mt-1 max-h-40 overflow-y-auto">
                {listaPacientes.map(p => (
                  <button key={p} onClick={() => { setPacienteSel(p); setBusqueda(""); setAtencionSel(null); }} className="w-full text-left p-2 hover:bg-[#085162] hover:text-white border-b text-sm">{p}</button>
                ))}
              </div>
            )}
          </div>
          <button className="bg-[#085162] text-white px-4 py-2 text-[10px] font-bold rounded shadow active:scale-95 relative">
            BOTÓN PARA CARGAR ARCHIVO
            <input type="file" onChange={manejarArchivo} className="absolute inset-0 opacity-0 cursor-pointer" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex w-full px-6 mt-4 gap-2">
          <button onClick={() => setVista('ficha')} className={`flex-1 p-3 text-lg font-bold transition-all ${vista === 'ficha' ? 'bg-[#085162] text-white' : 'bg-slate-300 text-slate-500'}`}>Ficha clínica</button>
          <button onClick={() => setVista('historial')} className={`flex-1 p-3 text-lg font-bold transition-all ${vista === 'historial' ? 'bg-[#085162] text-white' : 'bg-slate-300 text-slate-500'}`}>Historial</button>
        </div>

        <div className="flex-1 p-6">
          {!pacienteSel ? (
            <div className="text-center mt-20 opacity-30 font-bold uppercase tracking-widest">Seleccione un paciente</div>
          ) : (
            <div className="animate-in fade-in duration-500">
              
              {/* VISTA FICHA CLÍNICA */}
              {vista === 'ficha' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#085162] text-white p-6 rounded shadow-lg overflow-y-auto max-h-[600px]">
                    <h3 className="text-xs font-black opacity-60 mb-4 border-b border-white/30 pb-2 tracking-widest uppercase italic">Antecedentes Médicos (Col A-AB)</h3>
                    <div className="space-y-2">{renderizarCamposFicha()}</div>
                  </div>
                  <div className="bg-[#085162] text-white p-6 rounded shadow-lg overflow-y-auto max-h-[600px]">
                    <h3 className="text-xs font-black opacity-60 mb-4 border-b border-white/30 pb-2 tracking-widest uppercase italic">Hábitos (Col AC-AN)</h3>
                    <p className="text-sm opacity-80 italic">Aquí se listarán los campos detectados en tu Excel para estas columnas.</p>
                  </div>
                </div>
              )}

              {/* VISTA HISTORIAL */}
              {vista === 'historial' && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Columna Fechas */}
                  <div className="col-span-3 border-r pr-4">
                    <h4 className="bg-[#085162] text-white text-[10px] p-2 font-bold uppercase mb-3 text-center italic">Fecha Atenciones</h4>
                    <div className="flex flex-col gap-2">
                      {atencionesPaciente.map((at, idx) => (
                        <div key={idx}>
                          <button onClick={() => setAtencionSel(at)} className={`w-full p-2 text-xs font-bold rounded transition-all ${atencionSel === at ? 'bg-[#FF7A8A] text-white' : 'bg-[#FF7A8A]/20 text-[#FF7A8A]'}`}>
                            {at['Fecha de atención'] || at['Fecha']}
                          </button>
                          {atencionSel === at && (
                            <div className="bg-cyan-50 border border-cyan-100 p-3 text-[10px] mt-1 rounded italic shadow-inner">
                              <span className="font-bold text-cyan-700 block mb-1">TRATAMIENTO:</span>
                              {at['Tratamiento realizado'] || at['Tratamiento']}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuadrícula Historial */}
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                    {[
                      { t: 'Biotipo (sebo)', k: 'Biotipo', i: '💧', sub: ['Frente', 'Mejillas', 'Nariz', 'Mentón'] },
                      { t: 'Hidratación', k: 'Hidratacion', i: '🌊', sub: ['Nivel de deshidratación'] },
                      { t: 'Sensibilidad', k: 'Sensibilidad', i: '⚠️' },
                      { t: 'Turgencia', k: 'Turgencia', i: '🖐️' },
                      { t: 'Pigmentación', k: 'Pigmentacion', i: '🎨' },
                      { t: 'Textura', k: 'Textura', i: '〰️' },
                      { t: 'Patologías cutáneas', k: 'Patologias', i: '🛡️' },
                      { t: 'Lesiones y otros hallazgos', k: 'Lesiones', i: '🔍' },
                    ].map(card => (
                      <div key={card.t} className="border-2 border-slate-200 p-4 relative rounded shadow-sm hover:border-[#085162] transition-colors bg-white">
                        <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter">{card.t}</h5>
                        <div className="mt-2">
                          <p className="text-sm font-bold text-slate-700">{atencionSel ? atencionSel[card.t] || atencionSel[card.k] : '---'}</p>
                          {card.sub && atencionSel && (
                            <div className="mt-2 grid grid-cols-2 gap-1 border-t pt-1">
                              {card.sub.map(s => (
                                <p key={s} className="text-[9px] text-slate-500"><span className="font-bold uppercase">{s}:</span> {atencionSel[s] || '-'}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-2 right-2 text-3xl opacity-10 grayscale">{card.i}</span>
                      </div>
                    ))}
                    
                    {/* Info Adicional */}
                    <div className="col-span-2 bg-cyan-50 border-2 border-cyan-100 p-4 rounded-sm">
                      <h5 className="text-[10px] font-bold text-cyan-600 uppercase mb-2">Información adicional (Diagnóstico y Recomendación)</h5>
                      <div className="grid grid-cols-2 gap-4 text-xs italic leading-snug">
                        <div><span className="font-bold text-cyan-800 uppercase text-[9px]">Diagnóstico:</span><p>{atencionSel?.['Diagnóstico'] || '---'}</p></div>
                        <div><span className="font-bold text-cyan-800 uppercase text-[9px]">Recomendación:</span><p>{atencionSel?.['Recomendación'] || '---'}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      
      // Intentamos por nombre, si no, tomamos la primera y segunda hoja
      const nombreFicha = wb.SheetNames.find(n => n.includes("Ficha")) || wb.SheetNames[0];
      const nombreHistorial = wb.SheetNames.find(n => n.includes("Historial")) || wb.SheetNames[1];
      
      setHojaFicha(XLSX.utils.sheet_to_json(wb.Sheets[nombreFicha]));
      setHojaHistorial(XLSX.utils.sheet_to_json(wb.Sheets[nombreHistorial]));
    };
    reader.readAsBinaryString(file);
  };

  const listaPacientes = [...new Set(hojaFicha.map(d => d['Nombre paciente']))]
    .filter(p => p?.toString().toLowerCase().includes(busqueda.toLowerCase()));

  const datosFichaPaciente = hojaFicha.find(d => d['Nombre paciente'] === pacienteSel);
  const atencionesPaciente = hojaHistorial.filter(d => d['Nombre paciente'] === pacienteSel);

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
              placeholder="Buscar paciente..." 
              className="w-full p-2 border border-slate-300 rounded mt-1 shadow-sm focus:ring-2 focus:ring-[#085162] outline-none"
              onChange={(e) => { setBusqueda(e.target.value); setPacienteSel(null); }}
            />
            {busqueda && (
              <div className="absolute z-50 w-full bg-white border shadow-xl mt-1 max-h-40 overflow-y-auto">
                {listaPacientes.map(p => (
                  <button key={p} onClick={() => { setPacienteSel(p); setBusqueda(""); setAtencionSel(null); }} className="w-full text-left p-2 hover:bg-[#085162] hover:text-white border-b text-sm transition-colors">{p}</button>
                ))}
              </div>
            )}
          </div>
          <button className="bg-[#085162] text-white px-4 py-2 text-[10px] font-bold rounded shadow active:scale-95 relative">
            CARGAR EXCEL ACTUALIZADO
            <input type="file" onChange={manejarArchivo} className="absolute inset-0 opacity-0 cursor-pointer" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex w-full px-6 mt-4 gap-2">
          <button onClick={() => setVista('ficha')} className={`flex-1 p-3 text-lg font-bold transition-all ${vista === 'ficha' ? 'bg-[#085162] text-white shadow-inner' : 'bg-slate-300 text-slate-500 hover:bg-slate-400'}`}>Ficha clínica</button>
          <button onClick={() => setVista('historial')} className={`flex-1 p-3 text-lg font-bold transition-all ${vista === 'historial' ? 'bg-[#085162] text-white shadow-inner' : 'bg-slate-300 text-slate-500 hover:bg-slate-400'}`}>Historial</button>
        </div>

        <div className="flex-1 p-6">
          {!pacienteSel ? (
            <div className="text-center mt-20 opacity-30 font-bold uppercase tracking-widest animate-pulse">Cargue el archivo y seleccione un paciente</div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* VISTA FICHA CLÍNICA */}
              {vista === 'ficha' && (
                <div className="grid grid-cols-2 gap-6 h-full">
                  <div className="bg-[#085162] text-white p-6 rounded shadow-lg overflow-y-auto max-h-[550px]">
                    <h3 className="text-xs font-black opacity-60 mb-4 border-b border-white/30 pb-2 tracking-widest uppercase italic">Antecedentes Médicos (A-AB)</h3>
                    <div className="space-y-1">
                      {datosFichaPaciente && Object.entries(datosFichaPaciente).slice(0, 28).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/10 py-1 text-[11px]">
                          <span className="font-bold opacity-70 uppercase mr-4">{key}</span>
                          <span className="text-right">{val || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#085162] text-white p-6 rounded shadow-lg overflow-y-auto max-h-[550px]">
                    <h3 className="text-xs font-black opacity-60 mb-4 border-b border-white/30 pb-2 tracking-widest uppercase italic">Hábitos (AC-AN)</h3>
                    <div className="space-y-1">
                      {datosFichaPaciente && Object.entries(datosFichaPaciente).slice(28, 40).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/10 py-1 text-[11px]">
                          <span className="font-bold opacity-70 uppercase mr-4">{key}</span>
                          <span className="text-right">{val || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA HISTORIAL */}
              {vista === 'historial' && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Columna Fechas */}
                  <div className="col-span-3 border-r pr-4">
                    <h4 className="bg-[#085162] text-white text-[10px] p-2 font-bold uppercase mb-3 text-center italic tracking-widest">Fecha Atenciones</h4>
                    <div className="flex flex-col gap-2">
                      {atencionesPaciente.map((at, idx) => (
                        <div key={idx}>
                          <button onClick={() => setAtencionSel(at)} className={`w-full p-2 text-xs font-bold rounded shadow-sm transition-all active:scale-95 ${atencionSel === at ? 'bg-[#FF7A8A] text-white ring-2 ring-pink-100' : 'bg-[#FF7A8A]/20 text-[#FF7A8A] hover:bg-[#FF7A8A]/30'}`}>
                            {at['Fecha de atención'] || at['Fecha Atenciones'] || "Sin fecha"}
                          </button>
                          {atencionSel === at && (
                            <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 text-[11px] mt-1 rounded shadow-inner italic text-slate-600">
                              <span className="font-bold text-cyan-700 block mb-1 text-[9px] uppercase">TRATAMIENTO:</span>
                              {at['Tratamiento realizado'] || "No registrado"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuadrícula Historial */}
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                    {/* Tarjetas según tu esquema */}
                    <div className="border-2 border-slate-200 p-4 relative bg-white group hover:border-[#085162] transition-all">
                      <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter shadow-sm">Biotipo (sebo)</h5>
                      <div className="mt-2 flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-800">{atencionSel?.['Biotipo (sebo)'] || '---'}</p>
                        <div className="grid grid-cols-2 gap-x-4 border-t pt-2 mt-1">
                          {['Frente', 'Mejillas', 'Nariz', 'Mentón'].map(z => (
                             <p key={z} className="text-[9px] text-slate-500 uppercase"><span className="font-bold">{z}:</span> {atencionSel?.[z] || '-'}</p>
                          ))}
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 text-3xl opacity-10">💧</span>
                    </div>

                    <div className="border-2 border-slate-200 p-4 relative bg-white group hover:border-[#085162] transition-all">
                      <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter shadow-sm">Hidratación</h5>
                      <p className="text-sm font-bold mt-2">{atencionSel?.['Hidratación'] || '---'}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic font-bold">Nivel: {atencionSel?.['Nivel de deshidratación'] || '---'}</p>
                      <span className="absolute bottom-2 right-2 text-3xl opacity-10">🌊</span>
                    </div>

                    {['Sensibilidad', 'Turgencia', 'Pigmentación', 'Textura', 'Patologías cutáneas', 'Lesiones y otros hallazgos'].map((t, i) => (
                      <div key={t} className="border-2 border-slate-200 p-4 relative bg-white group hover:border-[#085162] transition-all">
                        <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter shadow-sm">{t}</h5>
                        <p className="text-sm font-bold mt-2">{atencionSel?.[t] || '---'}</p>
                        <span className="absolute bottom-2 right-2 text-3xl opacity-10">{['⚠️','🖐️','🎨','〰️','🛡️','🔍'][i]}</span>
                      </div>
                    ))}
                    
                    {/* Info Adicional */}
                    <div className="col-span-2 bg-cyan-100 border border-cyan-200 p-4 rounded-sm shadow-inner min-h-[100px]">
                      <h5 className="text-[10px] font-bold text-cyan-600 uppercase mb-2 border-b border-cyan-200 pb-1">Información adicional (Diagnóstico y Recomendación)</h5>
                      <div className="grid grid-cols-2 gap-6 text-xs italic leading-snug">
                        <div><span className="font-bold text-cyan-800 uppercase text-[9px] not-italic">Diagnóstico:</span><p className="mt-1">{atencionSel?.['Diagnóstico'] || '---'}</p></div>
                        <div><span className="font-bold text-cyan-800 uppercase text-[9px] not-italic">Recomendación:</span><p className="mt-1">{atencionSel?.['Recomendación'] || '---'}</p></div>
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

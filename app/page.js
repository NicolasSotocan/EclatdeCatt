"use client";
import React, { useState, useEffect } from 'react';

export default function DashboardEclat() {
  const [datos, setDatos] = useState([]);
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
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setDatos(data);
    };
    reader.readAsBinaryString(file);
  };

  const listaPacientes = [...new Set(datos.map(d => d['Nombre paciente']))]
    .filter(p => p?.toString().toLowerCase().includes(busqueda.toLowerCase()));

  const atencionesDelPaciente = datos.filter(d => d['Nombre paciente'] === pacienteSel);

  return (
    <div className="min-h-screen bg-slate-200 p-4 font-sans text-slate-800">
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="max-w-5xl mx-auto bg-white min-h-[90vh] shadow-2xl rounded-sm border-t-8 border-[#085162] flex flex-col relative">
        
        {/* CABECERA */}
        <div className="p-6 border-b flex justify-between items-start bg-slate-50">
          <div className="w-1/3 relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Paciente</label>
            <div className="relative">
              <input 
                type="text" 
                value={busqueda || pacienteSel || ""}
                placeholder="Buscar por nombre..." 
                className="w-full p-2 border border-slate-300 rounded bg-white mt-1 shadow-sm focus:ring-2 focus:ring-[#085162] outline-none"
                onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPacienteSel(null); // Reset si empieza a escribir de nuevo
                }}
              />
              {/* LISTA DESPLEGABLE DE RESULTADOS */}
              {busqueda && listaPacientes.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 shadow-xl mt-1 max-h-60 overflow-y-auto rounded-md">
                  {listaPacientes.map(p => (
                    <button 
                      key={p} 
                      onClick={() => {
                          setPacienteSel(p); 
                          setBusqueda(""); 
                          setAtencionSel(null);
                      }} 
                      className="w-full text-left p-3 hover:bg-[#085162] hover:text-white border-b border-slate-100 text-sm transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
             <button className="bg-[#085162] hover:bg-[#0a404d] text-white px-5 py-2 text-xs font-bold rounded shadow-md relative transition-all active:scale-95">
                BOTÓN PARA CARGAR ARCHIVO
                <input type="file" onChange={manejarArchivo} className="absolute inset-0 opacity-0 cursor-pointer" />
             </button>
             {pacienteSel && (
                <div className="mt-4 text-right">
                    <h2 className="text-2xl font-black text-[#085162] uppercase leading-none">{pacienteSel}</h2>
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Expediente Clínico Activo</span>
                </div>
             )}
          </div>
        </div>

        {/* SELECTOR DE VISTA (BOTONES GRANDES) */}
        <div className="flex w-full px-6 mt-4 gap-2">
          <button 
            onClick={() => setVista('ficha')}
            className={`flex-1 p-4 text-xl font-black uppercase transition-all border-b-4 ${vista === 'ficha' ? 'bg-[#085162] text-white border-slate-400' : 'bg-slate-300 text-slate-500 border-transparent hover:bg-slate-400'}`}
          >
            Ficha clínica
          </button>
          <button 
            onClick={() => setVista('historial')}
            className={`flex-1 p-4 text-xl font-black uppercase transition-all border-b-4 ${vista === 'historial' ? 'bg-[#085162] text-white border-slate-400' : 'bg-slate-300 text-slate-500 border-transparent hover:bg-slate-400'}`}
          >
            Historial
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-6">
          {!pacienteSel ? (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
              <span className="text-6xl mb-4 grayscale opacity-40">📂</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Seleccione un paciente en el buscador superior</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {vista === 'ficha' ? (
                /* VISTA IZQUIERDA: FICHA */
                <div className="space-y-6">
                  <div className="bg-[#085162] text-white p-10 rounded shadow-lg min-h-[180px] flex flex-col justify-center">
                    <h3 className="text-xs font-black opacity-50 uppercase tracking-[0.3em] mb-4">Antecedentes médicos (A-AB)</h3>
                    <p className="text-lg font-light leading-relaxed italic">
                      {atencionesDelPaciente[0]?.['Antecedentes'] || 'Información no disponible en las columnas de antecedentes.'}
                    </p>
                  </div>
                  <div className="bg-[#085162] text-white p-10 rounded shadow-lg min-h-[180px] flex flex-col justify-center">
                    <h3 className="text-xs font-black opacity-50 uppercase tracking-[0.3em] mb-4">Hábitos (AC-AM)</h3>
                    <p className="text-lg font-light leading-relaxed italic">
                      {atencionesDelPaciente[0]?.['Habitos'] || 'Información no disponible en las columnas de hábitos.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* VISTA DERECHA: HISTORIAL */
                <div className="grid grid-cols-12 gap-8">
                  {/* Columna Fechas */}
                  <div className="col-span-3">
                    <div className="bg-[#085162] text-white text-[10px] p-2 font-black uppercase mb-3 tracking-widest text-center">Atenciones</div>
                    <div className="flex flex-col gap-3">
                      {atencionesDelPaciente.map((at, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <button 
                            onClick={() => setAtencionSel(at)}
                            className={`p-3 text-xs font-black rounded-sm transition-all shadow-sm active:scale-95 ${atencionSel === at ? 'bg-[#FF7A8A] text-white ring-2 ring-pink-200' : 'bg-[#FF7A8A]/20 text-[#FF7A8A] hover:bg-[#FF7A8A]/30'}`}
                          >
                            {at['Fecha de atención']}
                          </button>
                          {atencionSel === at && (
                            <div className="bg-cyan-50/80 border-l-4 border-cyan-400 p-3 text-[11px] text-slate-600 italic leading-snug rounded-r shadow-sm">
                                <span className="block font-bold text-cyan-700 not-italic mb-1 uppercase text-[9px]">Tratamiento</span>
                                {at['Tratamiento realizado']}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuadrícula de Datos */}
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                    {[
                      { t: 'Sebo', k: 'Sebo', i: '💧' },
                      { t: 'Hidratación', k: 'Hidratacion', i: '🌊' },
                      { t: 'Sensibilidad', k: 'Sensibilidad', i: '⚠️' },
                      { t: 'Turgencia', k: 'Turgencia', i: '🖐️' },
                      { t: 'Pigmentación', k: 'Pigmentacion', i: '🎨' },
                      { t: 'Textura', k: 'Textura', i: '〰️' },
                      { t: 'Patologías', k: 'Patologias', i: '🛡️' },
                      { t: 'Lesiones y otros hallazgos', k: 'Lesiones', i: '🔍' },
                    ].map(card => (
                      <div key={card.t} className="border-2 border-slate-200 bg-white p-4 min-h-[110px] flex flex-col relative group hover:border-[#085162] transition-all rounded-sm">
                        <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic shadow-sm">
                          {card.t}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-tighter">Información</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1 leading-tight">
                          {atencionSel ? atencionSel[card.k] : '---'}
                        </p>
                        <span className="absolute bottom-2 right-2 text-2xl opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all">{card.i}</span>
                      </div>
                    ))}
                    <div className="col-span-2 mt-4 bg-cyan-100 border border-cyan-200 p-5 rounded-sm shadow-inner min-h-[100px] relative">
                      <h5 className="text-[10px] font-black text-cyan-700 uppercase mb-2 tracking-widest">Información adicional / Observaciones</h5>
                      <p className="text-sm italic text-cyan-900 leading-relaxed">
                          {atencionSel ? atencionSel['Observaciones'] : 'Seleccione una atención para ver detalles.'}
                      </p>
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

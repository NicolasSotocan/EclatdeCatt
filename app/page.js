"use client";
import React, { useState, useEffect } from 'react';

export default function DashboardEclat() {
  const [datos, setDatos] = useState([]);
  const [pacienteSel, setPacienteSel] = useState(null);
  const [atencionSel, setAtencionSel] = useState(null);
  const [vista, setVista] = useState('ficha'); // 'ficha' o 'historial'
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
      // Asumimos que la data principal está en la primera hoja
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setDatos(data);
    };
    reader.readAsBinaryString(file);
  };

  // Filtrar pacientes únicos para el buscador
  const listaPacientes = [...new Set(datos.map(d => d['Nombre paciente']))]
    .filter(p => p?.toString().toLowerCase().includes(busqueda.toLowerCase()));

  // Obtener todas las atenciones del paciente seleccionado
  const atencionesDelPaciente = datos.filter(d => d['Nombre paciente'] === pacienteSel);

  return (
    <div className="min-h-screen bg-slate-200 p-4 font-sans text-slate-800">
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="max-w-5xl mx-auto bg-white min-h-[90vh] shadow-2xl rounded-sm border-t-8 border-[#085162] flex flex-col">
        
        {/* CABECERA - FILTRO Y CARGA */}
        <div className="p-6 border-b flex justify-between items-start bg-slate-50">
          <div className="w-1/3">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Filtro paciente</label>
            <input 
              type="text" 
              placeholder="Escriba nombre..." 
              className="w-full p-2 border border-slate-300 rounded bg-white mt-1 shadow-sm"
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <div className="absolute z-10 w-64 bg-white border shadow-lg max-h-40 overflow-auto">
                {listaPacientes.map(p => (
                  <div key={p} onClick={() => {setPacienteSel(p); setBusqueda("");}} className="p-2 hover:bg-indigo-50 cursor-pointer text-sm border-b">{p}</div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
             <button className="bg-[#085162] text-white px-4 py-2 text-xs rounded shadow-md relative overflow-hidden">
                Botón para cargar archivo
                <input type="file" onChange={manejarArchivo} className="absolute inset-0 opacity-0 cursor-pointer" />
             </button>
             {pacienteSel && <h2 className="mt-4 text-xl font-bold text-[#085162] uppercase tracking-wider">{pacienteSel}</h2>}
          </div>
        </div>

        {/* SELECTOR DE VISTA (TABS) */}
        <div className="flex w-full px-6 mt-4 gap-2">
          <button 
            onClick={() => setVista('ficha')}
            className={`flex-1 p-3 text-lg font-bold transition-all ${vista === 'ficha' ? 'bg-[#085162] text-white shadow-inner' : 'bg-slate-300 text-slate-500 hover:bg-slate-400'}`}
          >
            Ficha clínica
          </button>
          <button 
            onClick={() => setVista('historial')}
            className={`flex-1 p-3 text-lg font-bold transition-all ${vista === 'historial' ? 'bg-[#085162] text-white shadow-inner' : 'bg-slate-300 text-slate-500 hover:bg-slate-400'}`}
          >
            Historial
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 p-6">
          {!pacienteSel ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
              <span className="text-6xl">👤</span>
              <p className="text-xl">Seleccione un paciente para comenzar</p>
            </div>
          ) : (
            <>
              {/* VISTA FICHA CLÍNICA (IZQUIERDA EN TU ESQUEMA) */}
              {vista === 'ficha' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div className="bg-[#085162] text-white p-12 rounded shadow-md min-h-[150px] flex items-center justify-center text-center">
                    <div>
                      <h3 className="text-sm opacity-60 uppercase mb-2">Antecedentes médicos (A-AB)</h3>
                      <p className="text-lg italic font-light leading-relaxed">
                        {atencionesDelPaciente[0]?.['Antecedentes'] || 'Información cargada desde columnas A a AB'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#085162] text-white p-12 rounded shadow-md min-h-[150px] flex items-center justify-center text-center">
                    <div>
                      <h3 className="text-sm opacity-60 uppercase mb-2">Hábitos (AC-AM)</h3>
                      <p className="text-lg italic font-light leading-relaxed">
                        {atencionesDelPaciente[0]?.['Habitos'] || 'Información cargada desde columnas AC a AM'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA HISTORIAL (DERECHA EN TU ESQUEMA) */}
              {vista === 'historial' && (
                <div className="grid grid-cols-12 gap-6 animate-fadeIn">
                  
                  {/* Atenciones / Fechas */}
                  <div className="col-span-3 border-r pr-4">
                    <h4 className="bg-[#085162] text-white text-[10px] p-2 font-bold uppercase mb-2 tracking-widest">Atenciones</h4>
                    <div className="flex flex-col gap-2">
                      {atencionesDelPaciente.map((at, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <button 
                            onClick={() => setAtencionSel(at)}
                            className={`p-2 text-xs font-bold rounded ${atencionSel === at ? 'bg-[#FF7A8A] text-white' : 'bg-[#FF7A8A]/30 text-[#FF7A8A]'}`}
                          >
                            {at['Fecha de atención']}
                          </button>
                          {atencionSel === at && (
                            <div className="bg-cyan-50 border border-cyan-100 p-2 text-[10px] min-h-[100px] rounded mb-2 shadow-inner italic">
                              {at['Tratamiento realizado'] || 'Detalle del tratamiento...'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bloques de Información Médica */}
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                    {[
                      { t: 'Sebo', k: 'Sebo', i: '💧' },
                      { t: 'Hidratación', k: 'Hidratacion', i: '💧' },
                      { t: 'Sensibilidad', k: 'Sensibilidad', i: '⚠️' },
                      { t: 'Turgencia', k: 'Turgencia', i: '🖐️' },
                      { t: 'Pigmentación', k: 'Pigmentacion', i: '🎨' },
                      { t: 'Textura', k: 'Textura', i: '〰️' },
                      { t: 'Patologías', k: 'Patologias', i: '🛡️' },
                      { t: 'Lesiones y otros hallazgos', k: 'Lesiones', i: '🔍' },
                    ].map(card => (
                      <div key={card.t} className="border-2 border-slate-300 p-3 min-h-[100px] flex flex-col relative group hover:border-[#085162] transition-colors">
                        <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-2 -left-1 font-black uppercase tracking-tighter italic">
                          {card.t}
                        </h5>
                        <p className="text-[11px] mt-2 text-slate-500 italic">Información</p>
                        <p className="text-sm font-medium mt-1 leading-tight">
                          {atencionSel ? atencionSel[card.k] : 'Seleccione una fecha'}
                        </p>
                        <span className="absolute bottom-2 right-2 text-3xl opacity-20 pointer-events-none">{card.i}</span>
                      </div>
                    ))}
                    
                    {/* Información adicional */}
                    <div className="col-span-2 mt-4 bg-cyan-100 border border-cyan-200 p-4 rounded-sm shadow-inner min-h-[120px]">
                      <h5 className="text-[10px] font-bold text-cyan-600 uppercase mb-1">Información adicional</h5>
                      <p className="text-sm italic">{atencionSel ? atencionSel['Observaciones'] : '...'}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

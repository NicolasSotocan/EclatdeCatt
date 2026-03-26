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

  // Función para corregir las fechas de Excel (números a texto legible)
  const formatearFechaExcel = (valor) => {
    if (!valor) return "Sin fecha";
    if (typeof valor === 'number') {
      const fecha = new Date((valor - 25569) * 86400 * 1000);
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return valor.toString();
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      // @ts-ignore
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      const nombreFicha = wb.SheetNames.find(n => n.toLowerCase().includes("ficha")) || wb.SheetNames[0];
      const nombreHistorial = wb.SheetNames.find(n => n.toLowerCase().includes("historial")) || wb.SheetNames[1];
      
      const dataFicha = XLSX.utils.sheet_to_json(wb.Sheets[nombreFicha]);
      const dataHistorial = XLSX.utils.sheet_to_json(wb.Sheets[nombreHistorial]);

      setHojaFicha(dataFicha);
      setHojaHistorial(dataHistorial);
    };
    reader.readAsBinaryString(file);
  };

  const obtenerNombre = (obj) => obj['Nombre Paciente'] || obj['Nombre paciente'];

  const listaPacientes = [...new Set(hojaFicha.map(d => obtenerNombre(d)))]
    .filter(p => p && p.toString().toLowerCase().includes(busqueda.toLowerCase()));

  const datosFichaPaciente = hojaFicha.find(d => obtenerNombre(d) === pacienteSel);
  const atencionesPaciente = hojaHistorial.filter(d => obtenerNombre(d) === pacienteSel);

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
              placeholder="Buscar paciente..." 
              className="w-full p-2 border border-slate-300 rounded mt-1 shadow-sm focus:ring-2 focus:ring-[#085162] outline-none"
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <div className="absolute z-50 w-full bg-white border shadow-xl mt-1 max-h-60 overflow-y-auto rounded-b-md">
                {listaPacientes.map(p => (
                  <button key={p} onClick={() => { setPacienteSel(p); setBusqueda(""); setAtencionSel(null); }} className="w-full text-left p-3 hover:bg-[#085162] hover:text-white border-b text-sm font-medium">{p}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <button className="bg-[#085162] text-white px-4 py-2 text-[10px] font-bold rounded shadow hover:bg-[#0a404d] relative transition-all uppercase tracking-wider">
              Carga base de datos
              <input type="file" onChange={manejarArchivo} className="absolute inset-0 opacity-0 cursor-pointer" />
            </button>
            {pacienteSel && <h2 className="mt-4 text-xl font-black text-[#085162] uppercase tracking-tighter">{pacienteSel}</h2>}
          </div>
        </div>

        {/* TABS */}
        <div className="flex w-full px-6 mt-4 gap-2">
          <button onClick={() => setVista('ficha')} className={`flex-1 p-3 text-lg font-black uppercase transition-all ${vista === 'ficha' ? 'bg-[#085162] text-white' : 'bg-slate-300 text-slate-500'}`}>Ficha clínica</button>
          <button onClick={() => setVista('historial')} className={`flex-1 p-3 text-lg font-black uppercase transition-all ${vista === 'historial' ? 'bg-[#085162] text-white' : 'bg-slate-300 text-slate-500'}`}>Historial</button>
        </div>

        <div className="flex-1 p-6">
          {!pacienteSel ? (
            <div className="text-center mt-20 opacity-30 font-bold uppercase tracking-widest italic">Cargue la base de datos y seleccione un paciente</div>
          ) : (
            <div className="animate-in fade-in duration-500">
              
              {/* VISTA FICHA CLÍNICA */}
              {vista === 'ficha' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#085162] text-white p-6 rounded shadow-lg overflow-y-auto max-h-[550px]">
                    <h3 className="text-[10px] font-black opacity-50 mb-4 border-b border-white/20 pb-2 tracking-[0.2em] uppercase italic">Antecedentes Médicos (A-AB)</h3>
                    <div className="space-y-2">
                      {datosFichaPaciente && Object.entries(datosFichaPaciente).slice(8, 28).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/10 py-1 text-[11px]">
                          <span className="font-bold opacity-70 uppercase mr-4">{key}</span>
                          <span className="text-right font-medium">{val || "No reporta"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#085162] text-white p-6 rounded shadow-lg overflow-y-auto max-h-[550px]">
                    <h3 className="text-[10px] font-black opacity-50 mb-4 border-b border-white/20 pb-2 tracking-[0.2em] uppercase italic">Hábitos y Estilo de Vida (AC-AN)</h3>
                    <div className="space-y-2">
                      {datosFichaPaciente && Object.entries(datosFichaPaciente).slice(28, 41).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/10 py-1 text-[11px]">
                          <span className="font-bold opacity-70 uppercase mr-4">{key}</span>
                          <span className="text-right font-medium">{val || "No reporta"}</span>
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
                    <h4 className="bg-[#085162] text-white text-[9px] p-2 font-black uppercase mb-3 text-center tracking-widest italic">Fecha Atenciones</h4>
                    <div className="flex flex-col gap-2">
                      {atencionesPaciente.map((at, idx) => (
                        <div key={idx}>
                          <button onClick={() => setAtencionSel(at)} className={`w-full p-3 text-[11px] font-black rounded-sm shadow-sm transition-all ${atencionSel === at ? 'bg-[#FF7A8A] text-white ring-2 ring-pink-100' : 'bg-[#FF7A8A]/20 text-[#FF7A8A] hover:bg-[#FF7A8A]/40'}`}>
                            {formatearFechaExcel(at['Fecha atención'])}
                          </button>
                          {atencionSel === at && (
                            <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 text-[10px] mt-1 rounded-r italic text-slate-600 shadow-inner">
                              <span className="font-black text-cyan-700 block mb-1 uppercase text-[8px]">Tratamiento Realizado:</span>
                              {at['Tratamiento']}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuadrícula Historial */}
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                    <div className="border-2 border-slate-200 p-4 relative bg-white rounded shadow-sm">
                      <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter shadow-sm">Biotipo (sebo)</h5>
                      <div className="mt-2">
                        <p className="text-sm font-black text-slate-800">{atencionSel?.['Biotipo (sebo)'] || '---'}</p>
                        <div className="grid grid-cols-2 gap-x-4 border-t border-slate-100 pt-2 mt-2 font-medium">
                          {['Frente', 'Mejillas', 'Nariz', 'Mentón'].map(z => (
                             <p key={z} className="text-[9px] text-slate-500 uppercase"><span className="font-bold text-slate-400">{z}:</span> {atencionSel?.[z] || '-'}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-slate-200 p-4 relative bg-white rounded shadow-sm">
                      <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter shadow-sm">Hidratación</h5>
                      <p className="text-sm font-black mt-2 text-slate-800">{atencionSel?.['Hidratación'] || '---'}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic font-bold uppercase tracking-tighter">Nivel: {atencionSel?.['Nivel deshidratación'] || '---'}</p>
                    </div>

                    {['Sensibilidad', 'Turgencia', 'Pigmentación', 'Textura', 'Patologías cutáneas', 'Lesiones y hallazgos'].map((t, i) => (
                      <div key={t} className="border-2 border-slate-200 p-4 relative bg-white rounded shadow-sm">
                        <h5 className="bg-[#085162] text-white text-[9px] px-2 py-1 absolute -top-3 -left-1 font-black uppercase italic tracking-tighter shadow-sm">{t}</h5>
                        <p className="text-sm font-black mt-2 text-slate-800">{atencionSel?.[t] || '---'}</p>
                      </div>
                    ))}
                    
                    <div className="col-span-2 bg-cyan-100/50 border-2 border-cyan-200 p-4 rounded-sm shadow-inner min-h-[100px]">
                      <h5 className="text-[9px] font-black text-cyan-700 uppercase mb-2 tracking-widest border-b border-cyan-200 pb-1">Información adicional</h5>
                      <div className="grid grid-cols-2 gap-6 text-[11px] italic leading-relaxed">
                        <div><span className="font-black text-cyan-800 uppercase text-[8px] not-italic block mb-1 underline">Diagnóstico:</span><p>{atencionSel?.['Diagnóstico'] || '---'}</p></div>
                        <div><span className="font-black text-cyan-800 uppercase text-[8px] not-italic block mb-1 underline">Recomendaciones:</span><p>{atencionSel?.['Recomendaciones'] || '---'}</p></div>
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

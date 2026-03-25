"use client";
import React, { useState, useEffect } from 'react';

export default function DashboardEstetico() {
  const [datos, setDatos] = useState([]);
  const [atencionSel, setAtencionSel] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Carga la librería de Excel dinámicamente para que no falle
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

  const filtrados = datos.filter(d => 
    d['Nombre paciente']?.toString().toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Script de Tailwind inyectado directamente */}
      <script src="https://cdn.tailwindcss.com"></script>

      {/* COLUMNA IZQUIERDA */}
      <div className="w-1/3 bg-white border-r p-6 shadow-xl overflow-y-auto">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4 tracking-tight">Eclat de Catt</h1>
        
        <div className="mb-6 p-4 border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50">
          <p className="text-[10px] font-bold text-indigo-400 mb-2 uppercase">Subir Base Excel</p>
          <input type="file" onChange={manejarArchivo} className="text-xs w-full" />
        </div>

        <input 
          type="text" 
          placeholder="Buscar paciente..." 
          className="w-full p-3 rounded-xl border border-slate-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="space-y-2">
          {filtrados.map((item, i) => (
            <button key={i} onClick={() => setAtencionSel(item)} className="w-full text-left p-4 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              <div className="font-bold text-sm">{item['Nombre paciente']}</div>
              <div className="text-[10px] opacity-70">{item['Fecha de atención']}</div>
            </button>
          ))}
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="flex-1 p-10 flex items-center justify-center">
        {atencionSel ? (
          <div className="w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{atencionSel['Nombre paciente']}</h2>
            <p className="text-indigo-500 font-bold text-sm mb-8 italic">Cita: {atencionSel['Fecha de atención']}</p>
            
            <div className="grid grid-cols-2 gap-6">
              {['Frente', 'Nariz', 'Mejillas', 'Pera'].map(zona => (
                <div key={zona} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{zona}</p>
                  <p className="text-slate-700 font-medium">{atencionSel[zona] || '—'}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-200">
              <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Tratamiento realizado</p>
              <p className="text-xl font-semibold">{atencionSel['Tratamiento realizado']}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-300">
            <span className="text-7xl">📂</span>
            <p className="mt-4 text-lg">Carga tu Excel para visualizar la ficha</p>
          </div>
        )}
      </div>
    </div>
  );
}

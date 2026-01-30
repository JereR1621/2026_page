/**
 * Componente Cec: Información del Centro de Estudiantes.
 * 
 * Muestra los miembros del Centro de Estudiantes (CEC) con sus cargos y períodos.
 * 
 * Características:
 * - Carga datos desde /data/cec.json si está disponible
 * - Proporciona datos por defecto si el archivo no existe
 * - Muestra nombre, cargo y período de cada miembro
 * - Mensaje informativo si no hay miembros registrados
 */

import React, { useEffect, useState } from 'react'

/**
 * Componente Cec.
 * 
 * @component
 * @returns {React.ReactElement} Sección con información del Centro de Estudiantes
 */
export default function Cec() {
  const [cec, setCec] = useState(null)

  /**
   * Cargar datos del Centro de Estudiantes desde archivo JSON.
   * Se ejecuta una sola vez al montar el componente.
   * 
   * Si la carga falla, setCec(null) mantiene los datos por defecto.
   */
  useEffect(() => {
    let active = true

    // Flujo de carga de datos:
    // 1) Origen principal: API local (/api/cec).
    // 2) Respaldo: JSON local para asegurar disponibilidad en pruebas.
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    }

    const load = async () => {
      let data = null
      try {
        data = await tryFetch('/api/cec')
      } catch {
        data = null
      }

      if (!data) {
        try {
          data = await tryFetch('/data/cec.json')
        } catch {
          data = null
        }
      }

      if (active) setCec(data)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  /**
   * Miembros del Centro de Estudiantes.
   * 
   * Usa datos cargados desde JSON si están disponibles,
   * de lo contrario usa datos por defecto.
   * 
   * @type {Array<{nombre: string, cargo: string, periodo: string}>}
   */
  const miembros = cec?.miembros ?? [
    { nombre: 'Laura Muñoz', cargo: 'Presidenta', periodo: '2024-2025' },
    { nombre: 'Pedro Díaz', cargo: 'Secretario', periodo: '2024-2025' },
    { nombre: 'Carla Rojas', cargo: 'Representante Estudiantil', periodo: '2024' }
  ]

  return (
    <section className="section-cec" id="cec">
      <div className="container">
        <div className="section-header">
          <h2>Centro de Estudiantes (CEC)</h2>
          <p>Información y representantes.</p>
        </div>

        <div id="cec-content" className="cec-content">
          <div className="cec-info">
            <h3>Miembros del Centro de Estudiantes</h3>
            <div className="cec-miembros">
              {miembros?.length ? (
                miembros.map((m, idx) => (
                  <div className="cec-miembro" key={`${m.nombre}-${idx}`}>
                    <h4>{m.nombre}</h4>
                    <p>{m.cargo} ({m.periodo})</p>
                  </div>
                ))
              ) : (
                <p>No hay miembros registrados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

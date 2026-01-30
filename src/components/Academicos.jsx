/**
 * Componente Academicos: Directorio de académicos y equipo docente.
 * 
 * Carga y muestra un listado de académicos de la carrera con su información:
 * - Nombre y cargo
 * - Departamento y área de especialidad
 * - Datos de contacto (email y teléfono)
 * - Avatar con iniciales si no hay imagen disponible
 * 
 * Los datos se cargan desde /data/academicos.json.
 * Si no hay datos disponibles, muestra un mensaje informativo.
 */

/**
 * Listado de académicos.
 */
import React, { useEffect, useState } from 'react'

/**
 * Componente Academicos.
 * 
 * @component
 * @returns {React.ReactElement} Sección con grid de académicos
 */
export default function Academicos() {
  const [academicos, setAcademicos] = useState([])

  /**
   * Cargar datos de académicos desde archivo JSON.
   * Se ejecuta una sola vez al montar el componente.
   * 
   * Si la respuesta no es un array válido, establece un array vacío.
   */
  useEffect(() => {
    let active = true

    // Flujo de carga de datos:
    // 1) Origen principal: API local (/api/academicos).
    // 2) Respaldo: JSON local (/data/academicos.json) para continuidad operativa.
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    }

    const load = async () => {
      let data = null
      try {
        data = await tryFetch('/api/academicos')
      } catch {
        data = null
      }

      if (!Array.isArray(data)) {
        try {
          data = await tryFetch('/data/academicos.json')
        } catch {
          data = null
        }
      }

      if (!active) return
      // Garantiza una respuesta estable (array) para el renderizado.
      if (Array.isArray(data) && data.length) setAcademicos(data)
      else setAcademicos([])
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="section-academicos" id="academicos">
      <div className="container">
        <div className="section-header">
          <h2>Académicos</h2>
          <p>Equipo docente y directivo.</p>
        </div>

        <div className="people-grid" id="academicos-container">
          {academicos.length === 0 ? (
            <div className="no-academicos">
              <p>Información de académicos no disponible.</p>
            </div>
          ) : (
            academicos.map((a) => (
              <article className="person" key={a.id ?? a.email ?? a.nombre}>
                <div className="person__avatar" aria-label={a.nombre}>
                  {a.avatar || (a.nombre ? a.nombre.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase() : 'ULS')}
                </div>
                <div className="person__info">
                  <h3>{a.nombre}</h3>
                  <p className="person__cargo">{a.cargo}</p>
                  <p className="person__departamento">{a.departamento}</p>
                  <p className="person__area">{a.area}</p>
                  <div className="person__contacto">
                    {a.email ? <a href={`mailto:${a.email}`} className="person__email">{a.email}</a> : null}
                    {a.telefono ? <p className="person__telefono">{a.telefono}</p> : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

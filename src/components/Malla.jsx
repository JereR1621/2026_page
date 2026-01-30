/**
 * Componente Malla: Visualización interactiva del plan de estudios.
 * 
 * Presenta una malla curricular horizontal donde los usuarios pueden:
 * - Visualizar asignaturas organizadas por semestre
 * - Seleccionar una asignatura para ver sus relaciones
 * - Ver prerequisitos requeridos para cada asignatura
 * - Ver qué asignaturas se habilitan después de cursar una asignatura
 * - Descargar el plan de estudios completo en PDF
 * 
 * La malla es completamente interactiva con soporte para teclado (Enter/Espacio)
 * y accesibilidad (ARIA labels).
 */

import React, { useEffect, useMemo, useState } from 'react'

/**
 * Convierte un texto en un slug válido para URLs.
 * 
 * Elimina acentos, convierte a minúsculas, reemplaza espacios y caracteres
 * especiales por guiones, y elimina guiones al inicio y final.
 * Utilizado para generar identificadores únicos a partir de nombres de asignaturas.
 * 
 * @param {string} text - Texto a convertir
 * @returns {string} Slug normalizado (ej: 'Programación I' -> 'programacion-i')
 * 
 * @example
 * slugify('Análisis de Datos') // 'analisis-de-datos'
 */
function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Procesa datos JSON de la malla curricular y construye estructuras internas.
 * 
 * Realiza tres pasadas sobre los datos:
 * 1. Indexa asignaturas por semestre y mapea códigos a nombres
 * 2. Resuelve prerequisitos definidos por código
 * 3. Resuelve prerequisitos definidos directamente en asignaturas
 * 
 * Soporta múltiples formatos de datos para flexibilidad (nombre/name/titulo,
 * semestre/sem, código/code, etc).
 * 
 * @param {Object} data - Datos crudos de la malla curricular
 * @param {Array} data.asignaturas - Lista de asignaturas con propiedades
 * @param {Object} [data.prerequisitos_por_codigo] - Mapa de prerequisitos por código
 * @returns {Object} Objeto con:
 *   - asignaturasPorSemestre: Asignaturas agrupadas por número de semestre
 *   - prerequisitosPorNombre: Mapa de prerequisitos por nombre de asignatura
 */
function buildFromData(data) {
  const asignaturasPorSemestre = {}
  const prerequisitosPorNombre = {}

  if (Array.isArray(data?.asignaturas) && data.asignaturas.length > 0) {
    const codeToName = new Map()

    /**
     * Primera pasada: indexa asignaturas y mapea códigos a nombres.
     */
    data.asignaturas.forEach((a) => {
      const name = a.nombre || a.name || a.titulo || ''
      const sem = Number(a.semestre || a.sem || 0) || 0
      const code = a.codigo || a.code || null

      if (!asignaturasPorSemestre[sem]) asignaturasPorSemestre[sem] = []
      asignaturasPorSemestre[sem].push(name)

      if (code) codeToName.set(code, name)
    })

    /**
     * Segunda pasada: resuelve prerequisitos definidos por código.
     */
    if (data.prerequisitos_por_codigo && typeof data.prerequisitos_por_codigo === 'object') {
      Object.entries(data.prerequisitos_por_codigo).forEach(([targetCode, prereqCodes]) => {
        const targetName = codeToName.get(targetCode)
        if (!targetName) return
        const prereqNames = (prereqCodes || [])
          .map((c) => {
            if (typeof c === 'string' && c.startsWith('NIVEL_')) return c
            return codeToName.get(c) || null
          })
          .filter(Boolean)
        prerequisitosPorNombre[targetName] = prereqNames
      })
    }

    /**
     * Tercera pasada: resuelve prerequisitos definidos en asignaturas.
     */
    data.asignaturas.forEach((a) => {
      const name = a.nombre || a.name || ''
      if (!a.prerequisitos?.length) return
      const resolved = a.prerequisitos
        .map((p) => {
          if (typeof p === 'string' && p.startsWith('NIVEL_')) return p
          return codeToName.get(p) || p
        })
        .filter(Boolean)
      prerequisitosPorNombre[name] = Array.from(new Set([...(prerequisitosPorNombre[name] || []), ...resolved]))
    })
  }

  return { asignaturasPorSemestre, prerequisitosPorNombre }
}

/**
 * Construye un grafo de asignaturas con relaciones bidireccionales.
 * 
 * Crea mapas para acceso rápido a asignaturas por ID o nombre, y establece
 * relaciones bidireccionales: si A es prerequisito de B, entonces B habilita A.
 * 
 * @param {Object} asignaturasPorSemestre - Asignaturas agrupadas por semestre
 * @param {Object} prerequisitosPorNombre - Mapa de prerequisitos por nombre
 * @returns {Object} Objeto con:
 *   - courseById: Mapa de asignaturas indexadas por ID
 *   - idByName: Mapa de IDs indexados por nombre de asignatura
 */
function buildGraph(asignaturasPorSemestre, prerequisitosPorNombre) {
  const courseById = new Map()
  const idByName = new Map()

  /**
   * Crea nodos de asignaturas con IDs únicos.
   */
  Object.entries(asignaturasPorSemestre).forEach(([sem, list]) => {
    const semestre = Number(sem)
    list.forEach((name) => {
      const id = slugify(`${semestre}-${name}`)
      const course = { id, name, semestre, prereqIds: [], nextIds: [], prereqTokens: [] }
      courseById.set(id, course)
      idByName.set(name, id)
    })
  })

  /**
   * Mapea prerequisitos de nombres a IDs y separa tokens especiales (NIVEL_*).
   */
  Object.entries(prerequisitosPorNombre).forEach(([courseName, prereqNames]) => {
    const courseId = idByName.get(courseName)
    if (!courseId) return
    const course = courseById.get(courseId)

    const prereqIds = []
    const tokens = []
    for (const n of prereqNames || []) {
      if (typeof n === 'string' && n.startsWith('NIVEL_')) {
        tokens.push(n)
        continue
      }
      const id = idByName.get(n)
      if (id) prereqIds.push(id)
    }
    course.prereqIds = prereqIds
    course.prereqTokens = tokens
  })

  /**
   * Crea aristas inversas: si A es prerequisito de B, entonces B habilita A.
   */
  courseById.forEach((course) => {
    course.prereqIds.forEach((prId) => {
      const prereq = courseById.get(prId)
      if (prereq && !prereq.nextIds.includes(course.id)) prereq.nextIds.push(course.id)
    })
  })

  return { courseById, idByName }
}

/**
 * Componente Malla.
 * 
 * @component
 * @returns {React.ReactElement} Sección con malla curricular interactiva
 */
export default function Malla() {
  const [data, setData] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  /**
   * Cargar datos de la malla curricular desde archivo JSON.
   * Se ejecuta una sola vez al montar el componente.
   */
  useEffect(() => {
    let active = true

    // Flujo de carga de datos:
    // 1) Origen principal: API local (/api/malla).
    // 2) Respaldo: JSON local si la API no responde.
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    }

    const load = async () => {
      let data = null
      try {
        data = await tryFetch('/api/malla')
      } catch {
        data = null
      }

      if (!data) {
        try {
          data = await tryFetch('/data/malla.json')
        } catch {
          data = null
        }
      }

      if (active) setData(data)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  /**
   * Procesar datos crudos y construir índices de asignaturas.
   * Se recalcula solo cuando data cambia.
   */
  const { asignaturasPorSemestre, prerequisitosPorNombre } = useMemo(() => {
    if (!data) return { asignaturasPorSemestre: {}, prerequisitosPorNombre: {} }
    return buildFromData(data)
  }, [data])

  /**
   * Construir grafo de asignaturas con relaciones.
   * Se recalcula cuando asignaturasPorSemestre o prerequisitosPorNombre cambian.
   */
  const { courseById } = useMemo(() => buildGraph(asignaturasPorSemestre, prerequisitosPorNombre), [asignaturasPorSemestre, prerequisitosPorNombre])

  /**
   * Obtener lista de semestres ordenados numéricamente.
   */
  const semesters = useMemo(() => Object.keys(asignaturasPorSemestre).map(Number).sort((a,b)=>a-b), [asignaturasPorSemestre])

  /**
   * Obtener datos de la asignatura actualmente seleccionada.
   */
  const selected = selectedId ? courseById.get(selectedId) : null
  const prereqSet = useMemo(() => new Set(selected?.prereqIds || []), [selected])
  const nextSet = useMemo(() => new Set(selected?.nextIds || []), [selected])

  /**
   * Cerrar la selección cuando el usuario presiona Escape.
   * Mejora la experiencia de usuario permitiendo cerrar con teclado.
   */
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') setSelectedId(null) }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [])

  /**
   * Convierte tokens especiales (NIVEL_X_APROBADO) a texto legible.
   * 
   * @param {string} t - Token a humanizar
   * @returns {string} Texto legible (ej: 'Nivel 1 aprobado')
   */
  const humanizeToken = (t) => (t || '').replace(/^NIVEL_([0-9]+)_APROBADO$/, 'Nivel $1 aprobado').replace(/_/g, ' ')

  return (
    <section className="section-malla" id="malla">
      <div className="container">
        <div className="section-header">
          <h2>Plan de estudios</h2>
          <p>Malla horizontal interactiva: selecciona una asignatura para ver pre-requisitos y lo que habilita.</p>
        </div>

        <div className="malla-layout">
          <div className="malla-horizontal">
            <div className="malla-track" id="malla-track" role="region" aria-label="Malla curricular">
              {semesters.map((sem) => (
                <div className="semester-col" key={sem}>
                  <div className="semester-col__title"><span>Semestre {sem}</span></div>
                  {(asignaturasPorSemestre[sem] || []).map((name) => {
                    const id = slugify(`${sem}-${name}`)
                    const isSelected = selectedId === id
                    const isPrereq = prereqSet.has(id)
                    const isNext = nextSet.has(id)
                    const isRelated = !selectedId || isSelected || isPrereq || isNext

                    const cls = [
                      'course-card',
                      isSelected ? 'is-selected' : '',
                      isPrereq ? 'is-prereq' : '',
                      isNext ? 'is-next' : '',
                      selectedId && !isRelated ? 'is-dim' : ''
                    ].filter(Boolean).join(' ')

                    return (
                      <div
                        key={id}
                        className={cls}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected ? 'true' : 'false'}
                        onClick={() => setSelectedId((prev) => (prev === id ? null : id))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedId((prev) => (prev === id ? null : id))
                          }
                        }}
                      >
                        <p className="course-card__name">{name}</p>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <aside className="malla-detail" aria-label="Detalle de asignatura">
            <div className="malla-detail__head">
              <h3>Relaciones</h3>
              <button className="btn btn--sm" id="malla-clear" type="button" onClick={() => setSelectedId(null)}>
                Limpiar
              </button>
            </div>

            <p className="malla-detail__subtitle" id="malla-detail-subtitle">
              {selected ? (<><strong>{selected.name}</strong> — Semestre {selected.semestre}</>) : 'Selecciona una asignatura para ver sus relaciones.'}
            </p>

            <div className="malla-detail__cols">
              <div className="malla-detail__col">
                <h4>Pre-requisitos</h4>
                <div id="malla-prereq">
                  {selected ? (
                    (selected.prereqIds?.length || selected.prereqTokens?.length) ? (
                      <ul className="malla-list">
                        {selected.prereqIds.map((pid) => (
                          <li key={pid}>{courseById.get(pid)?.name}</li>
                        ))}
                        {selected.prereqTokens.map((t) => (
                          <li key={t} className="malla-token malla-token--prereq"><em>{humanizeToken(t)}</em></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="malla-empty">Sin pre-requisitos (o aún no definidos).</p>
                    )
                  ) : (
                    <p className="malla-empty">—</p>
                  )}
                </div>
              </div>

              <div className="malla-detail__col">
                <h4>Habilita</h4>
                <div id="malla-next">
                  {selected ? (
                    selected.nextIds?.length ? (
                      <ul className="malla-list">
                        {selected.nextIds.map((nid) => (
                          <li key={nid}>{courseById.get(nid)?.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="malla-empty">No habilita otras (o aún no definido).</p>
                    )
                  ) : (
                    <p className="malla-empty">—</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

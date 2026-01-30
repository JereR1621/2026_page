/**
 * Componente Noticias: Sección de noticias y comunicaciones.
 * 
 * Carga y muestra noticias de la carrera con un sistema de persistencia:
 * 1. Primero intenta cargar desde localStorage (para datos editables)
 * 2. Si no hay datos, carga desde /data/noticias.json (datos estáticos)
 * 3. Guarda los datos en localStorage para futuras cargas
 * 
 * Características:
 * - Filtrado de noticias públicas (sin autenticación)
 * - Límite de 4 noticias mostradas
 * - Soporte para imágenes, tipo de noticia, autor y fecha
 * - Placeholder para implementar modal de detalle
 */

import React, { useEffect, useMemo, useState } from 'react'

/**
 * Intenta parsear una cadena JSON de forma segura.
 * 
 * Si el parsing falla, retorna el valor por defecto sin lanzar error.
 * Útil para trabajar con datos de localStorage que podrían estar corruptos.
 * 
 * @param {string} json - Cadena JSON a parsear
 * @param {*} fallback - Valor por defecto si el parsing falla
 * @returns {*} Objeto parseado o fallback
 * 
 * @example
 * safeParse('{"a":1}', {}) // {a: 1}
 * safeParse('corrupted', {}) // {}
 */
function safeParse(json, fallback) {
  try { return JSON.parse(json) } catch { return fallback }
}

// Genera un resumen breve cuando el backend no provee uno.
function buildResumen(texto) {
  const value = String(texto || '').trim()
  if (!value) return ''
  return value.length > 160 ? `${value.slice(0, 160).trim()}…` : value
}

// Normaliza noticias al formato esperado por la UI,
// aceptando tanto el esquema de BD (importancia/imagenes/autor_externo) como el JSON local.
function normalizeNoticia(n) {
  const imagen = n.imagen || (Array.isArray(n.imagenes) ? n.imagenes[0]?.url : null) || ''
  const tipo = n.tipo || n.importancia?.tipo || n.importancia_tipo || 'info'
  const autor = n.autor || n.autor_externo || n.autor_usuario?.nombre || ''
  const contenido = n.contenido || n.content || ''
  const resumen = n.resumen || buildResumen(contenido)

  return {
    id: n.id ?? n.noticia_id ?? n.id_noticia,
    titulo: n.titulo || n.title || '',
    contenido,
    resumen,
    fecha: n.fecha || n.fecha_creacion || n.created_at || '',
    tipo,
    visibilidad: n.visibilidad || 'publico',
    autor,
    imagen
  }
}

/**
 * Componente Noticias.
 * 
 * @component
 * @returns {React.ReactElement} Sección con grid de noticias
 */
export default function Noticias() {
  const [noticias, setNoticias] = useState([])

  /**
   * Cargar noticias con estrategia de dos fuentes.
   * 
   * Se ejecuta una sola vez al montar el componente.
   * Prioriza datos en localStorage sobre datos estáticos.
   */
  useEffect(() => {
    let active = true

    // Flujo de carga de datos:
    // 1) Origen principal: API local (/api/noticias).
    // 2) Respaldo: localStorage (edición local previa, si existe).
    // 3) Respaldo final: JSON local para continuidad en pruebas.
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    }

    const load = async () => {
      let data = null
      try {
        data = await tryFetch('/api/noticias')
      } catch {
        data = null
      }

      if (!Array.isArray(data) || !data.length) {
        try {
          data = await tryFetch('/data/noticias.json')
        } catch {
          data = null
        }
      }

      // Normalización final para asegurar compatibilidad con la UI actual.
      const normalized = Array.isArray(data) ? data.map(normalizeNoticia) : []
      // Persistencia local para consistencia entre recargas.
      if (normalized.length) {
        localStorage.setItem('uls_news', JSON.stringify(normalized))
      }
      if (!active) return
      setNoticias(normalized)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  /**
   * Filtrar noticias públicas y limitar a 4 resultados.
   * 
   * Sin sistema de autenticación, solo se muestran noticias con
   * visibilidad 'publico' (valor por defecto si no se especifica).
   * 
   * Se recalcula cuando noticias cambia.
   */
  const visibles = useMemo(() => noticias.filter((n) => (n.visibilidad || 'publico') === 'publico').slice(0, 4), [noticias])

  return (
    <section className="section-noticias" id="noticias">
      <div className="container">
        <div className="section-header">
          <h2>Noticias</h2>
          <p>Últimas novedades, eventos y comunicaciones.</p>
        </div>

        <div className="noticias-grid" id="noticias-container">
          {visibles.length === 0 ? (
            <div className="no-noticias">
              <p>No hay noticias disponibles en este momento.</p>
            </div>
          ) : (
            visibles.map((noticia) => (
              <article className="noticia-card" key={noticia.id}>
                {noticia.imagen ? (
                  <div className="noticia-imagen">
                    <img src={noticia.imagen} alt={noticia.titulo} loading="lazy" />
                  </div>
                ) : null}

                <div className="noticia-header">
                  <span className={`noticia-tipo ${noticia.tipo || ''}`}>
                    {String(noticia.tipo || 'info').toUpperCase()}
                  </span>
                  <h3 className="noticia-titulo">{noticia.titulo}</h3>
                  <p className="noticia-fecha">
                    {noticia.fecha} {noticia.autor ? `• ${noticia.autor}` : ''}
                  </p>
                </div>

                <div className="noticia-content">
                  <p className="noticia-resumen">{noticia.resumen}</p>
                  <a 
                    href={`#noticia-${noticia.id}`} 
                    className="noticia-link" 
                    onClick={(e)=>{
                      e.preventDefault();
                      alert('Detalle de noticia: pendiente (puedes agregar modal o página)')
                    }}
                  >
                    Leer más →
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

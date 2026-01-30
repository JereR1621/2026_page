/**
 * Componente Header: Encabezado de navegación principal.
 * 
 * Renderiza el header de la aplicación con:
 * - Logo y branding de la institución
 * - Menú de navegación principal con enlaces a secciones
 * - Botón de búsqueda (placeholder)
 * - Menú móvil responsive con toggle button
 * - Gestión de estado para abrir/cerrar menú en dispositivos móviles
 * 
 * El componente maneja la navegación suave entre secciones y actualiza
 * el estado activo del menú según la sección visible.
 */

import React, { useEffect, useMemo } from 'react'

/**
 * Definición de los elementos del menú de navegación.
 * Cada elemento contiene href, etiqueta visible e icono SVG.
 * 
 * @type {Array<{href: string, label: string, icon: React.ReactElement}>}
 */
const LINKS = [
  { href: '#inicio', label: 'Inicio', icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z"/></svg>) },
  { href: '#carrera', label: 'La carrera', icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a10 10 0 100 20 10 10 0 000-20z"/></svg>) },
  { href: '#malla', label: 'Plan de estudios', icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v4H4V4zm0 6h16v10H4V10zm3 2v6h4v-6H7zm6 0v6h4v-6h-4z"/></svg>) },
  { href: '#admision', label: 'Admisión', icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4zm0 6a3 3 0 100 6 3 3 0 000-6z"/></svg>) },
  { href: '#noticias', label: 'Noticias', icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h14v16H4V4zm16 4h2v12a2 2 0 01-2 2h-2v-2h2V8zM6 6v2h10V6H6zm0 4v2h10v-2H6zm0 4v2h7v-2H6z"/></svg>) },
  { href: '#contacto', label: 'Contacto', icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>) }
]

/**
 * Componente Header.
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {string} props.activeHash - Hash actualmente activo en la URL
 * @param {boolean} props.mobileOpen - Estado del menú móvil (abierto/cerrado)
 * @param {Function} props.setMobileOpen - Función para actualizar estado del menú móvil
 * @param {Function} props.onNavigate - Callback ejecutado al navegar a una sección
 * @returns {React.ReactElement} Elemento header con navegación
 */
export default function Header({ activeHash, mobileOpen, setMobileOpen, onNavigate }) {
  /**
   * Cerrar el menú móvil cuando el usuario presiona la tecla Escape.
   * Mejora la experiencia de usuario en dispositivos móviles.
   */
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [setMobileOpen])

  return (
    <header className="site-header" role="banner">
      <div className="container container--wide site-header__inner">
        <div className="site-header__left">
          <a 
            href="#inicio" 
            className="site-header__logo" 
            aria-label="Ir al inicio" 
            onClick={(e)=>{e.preventDefault();onNavigate('#inicio')}}
          >
            <img 
              src="/assets/images/logo_vertical.png" 
              alt="Logo ULS - Ingeniería Civil en Computación e Informática" 
              className="site-header__logo-image"
            />
          </a>

          <div className="site-header__brand">
            <span className="site-header__ici">ICI</span>
            <div className="site-header__brand-text">
              <div className="site-header__brand-title">Ingeniería Civil en Computación e Informática</div>
              <div className="site-header__brand-subtitle">Universidad de La Serena</div>
            </div>
          </div>
        </div>

        
        <nav className="site-header__nav" id="main-nav" aria-label="Navegación principal">
          {LINKS.map((l) => (
            <a
              key={l.href}
              className={`navlink ${activeHash === l.href ? 'is-active' : ''}`}
              href={l.href}
              onClick={(e) => { e.preventDefault(); onNavigate(l.href) }}
            >
              {l.icon}
              <span>{l.label}</span>
            </a>
          ))}

          
          <button 
            className="navsearch" 
            type="button" 
            id="open-search" 
            aria-label="Buscar" 
            onClick={() => alert('Buscar: pendiente de implementar')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2a8 8 0 105.29 14.06l4.32 4.32 1.42-1.42-4.32-4.32A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>
          </button>
        </nav>

        
        <div className="site-header__right">
          <button
            className={`menu-toggle ${mobileOpen ? 'active' : ''}`}
            id="menu-toggle"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen ? 'true' : 'false'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      
      {!mobileOpen ? null : (
        <div className="mobile-backdrop" id="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      
      <div className="site-header__mobile" id="mobile-nav" hidden={!mobileOpen}>
        {LINKS.map((l) => (
          <a 
            key={l.href} 
            href={l.href} 
            onClick={(e)=>{e.preventDefault();onNavigate(l.href)}}
          >
            {l.label}
          </a>
        ))}
      </div>
    </header>
  )
}

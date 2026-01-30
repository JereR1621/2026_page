/**
 * App principal: navegación por hash y renderizado de secciones.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import logoVertical from './img/logo_vertical.png'
import Portal from './components/Portal.jsx'

/**
 * Gestiona el hash activo de la URL para navegación por secciones.
 * Sincroniza cambios en window.location.hash con el estado de React.
 * 
 * @param {string} defaultHash - Hash predeterminado cuando no hay uno en la URL
 * @returns {Array} [hash, setHash] - Estado actual y setter
 */
function useHashActive(defaultHash = '#inicio') {
  const [hash, setHash] = useState(() => window.location.hash || defaultHash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || defaultHash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [defaultHash])

  return [hash, setHash]
}

/**
 * Realiza scroll suave hacia una sección y actualiza la URL.
 */
function scrollToHash(href) {
  if (!href || href === '#' || href === '#!') return
  const target = document.querySelector(href)
  if (!target) return

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (history.pushState) history.pushState(null, '', href)
  else window.location.hash = href
}

/**
 * Header - Barra de navegación principal del sitio.
 * Incluye logo, menú desktop y menú móvil responsive.
 * 
 * @param {Object} props
 * @param {string} props.activeHash
 */
function Header({ activeHash }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState(null)

  
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const readSession = () => {
      const raw =
        localStorage.getItem('uls_session') ||
        localStorage.getItem('uls_user') ||
        localStorage.getItem('auth_user') ||
        localStorage.getItem('user') ||
        localStorage.getItem('usuario')

      let data = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          data = parsed?.user || parsed
        } catch {
          data = null
        }
      }

      if (!data) {
        const nombre = localStorage.getItem('uls_user_name') || localStorage.getItem('user_name') || ''
        const nivel = localStorage.getItem('uls_user_level') || localStorage.getItem('user_level') || ''
        const semestre = localStorage.getItem('uls_user_semestre') || localStorage.getItem('user_semestre') || ''
        const rol = localStorage.getItem('uls_user_rol') || localStorage.getItem('user_rol') || ''
        if (nombre || nivel || semestre || rol) {
          data = { nombre, nivel, semestre, rol }
        }
      }

      setSessionUser(data && Object.keys(data).length ? data : null)
    }

    readSession()
    window.addEventListener('storage', readSession)
    return () => window.removeEventListener('storage', readSession)
  }, [])

  
  const go = (href) => (e) => {
    e.preventDefault()
    setMobileOpen(false)
    scrollToHash(href)
  }

  const userName =
    sessionUser?.nombre ||
    sessionUser?.name ||
    sessionUser?.usuario?.nombre ||
    sessionUser?.autor_usuario?.nombre ||
    ''

  const userRole =
    sessionUser?.rol_nombre ||
    sessionUser?.rol?.nombre ||
    sessionUser?.rol ||
    sessionUser?.tipo ||
    ''

  const userLevel =
    sessionUser?.nivel ||
    sessionUser?.nivel_actual ||
    sessionUser?.nivel_academico ||
    ''

  const userSemester =
    sessionUser?.semestre ||
    sessionUser?.semestre_actual ||
    sessionUser?.nivel_semestre ||
    sessionUser?.semestre_actual_num ||
    ''

  const subtitleParts = []
  if (userRole) subtitleParts.push(userRole)
  if (!userRole && (userLevel || userSemester)) subtitleParts.push('Estudiante')
  if (userLevel) subtitleParts.push(userLevel)
  if (userSemester) subtitleParts.push(`Semestre ${userSemester}`)
  const userSubtitle = subtitleParts.join(' · ')

  const handleLogout = () => {
    const keys = [
      'uls_session',
      'uls_user',
      'auth_user',
      'user',
      'usuario',
      'uls_user_name',
      'user_name',
      'uls_user_level',
      'user_level',
      'uls_user_semestre',
      'user_semestre',
      'uls_user_rol',
      'user_rol',
    ]
    keys.forEach((k) => localStorage.removeItem(k))
    setSessionUser(null)
    window.location.hash = '#portal'
  }

  const handleOpenRolePortal = () => {
    window.location.hash = '#portal'
  }

  
  const nav = [
    { href: '#inicio', label: 'Inicio', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z"/></svg>
    ) },
    { href: '#carrera', label: 'La Carrera', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a10 10 0 100 20 10 10 0 000-20z"/></svg>
    ) },
    { href: '#malla', label: 'Plan de estudios', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v4H4V4zm0 6h16v10H4V10zm3 2v6h4v-6H7zm6 0v6h4v-6h-4z"/></svg>
    ) },
    { href: '#admision', label: 'Admisión', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4zm0 2.2L6 6.8V12c0 4.1 2.7 7.8 6 8.4 3.3-.6 6-4.3 6-8.4V6.8l-6-2.6z"/></svg>
    ) },
    { href: '#noticias', label: 'Noticias', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h14v14H4V4zm2 2v2h10V6H6zm0 4h10v2H6v-2zm0 4h6v2H6v-2zm14 0h-2V6h2v8z"/></svg>
    ) },
    { href: '#organigrama', label: 'Organigrama', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h4v4h-4V3zM4 17h4v4H4v-4zm12 0h4v4h-4v-4zM11 7h2v3h4v3h-2v-1H9v1H7v-3h4V7z"/></svg>
    ) },
    { href: '#contacto', label: 'Contacto', icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.1 22 2 13.9 2 3c0-.6.4-1 1-1h3.9c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1l-2.2 2.2z"/></svg>
    ) },
    
  ]

  return (
    <header className="site-header" role="banner">
      <div className="container container--wide site-header__inner">
        <div className="site-header__left">
          <a href="#inicio" className="site-header__logo" aria-label="Ir al inicio" onClick={go('#inicio')}>
            <img src={logoVertical} alt="Logo Universidad de La Serena" className="site-header__logo-image" />
            
          </a>

          <div className="site-header__brand">
            
            <div className="site-header__brand-text">
              <div className="site-header__brand-title">Ingeniería Civil en</div>
              <div className="site-header__brand-title">Computación e Informática</div>
              <div className="site-header__brand-subtitle">Universidad de La Serena</div>
            </div>
          </div>
        </div>

        <nav className="site-header__nav" id="main-nav" aria-label="Navegación principal">
          {nav.map((item) => (
            <a
              key={item.href}
              className={`navlink ${activeHash === item.href ? 'is-active' : ''}`}
              href={item.href}
              onClick={go(item.href)}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}

          <button className="navsearch" type="button" aria-label="Buscar" onClick={() => alert('Búsqueda: pendiente de implementar')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2a8 8 0 105.29 14.06l4.32 4.32 1.42-1.42-4.32-4.32A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>
          </button>
        </nav>

        <div className="site-header__right">
          {sessionUser && userName ? (
            <div className="site-header__user" aria-label="Usuario conectado" onClick={handleOpenRolePortal} role="button" tabIndex={0}>
              <div className="site-header__user-text">
                <span className="site-header__user-name">{userName}</span>
                {userSubtitle ? (
                  <span className="site-header__user-level">{userSubtitle}</span>
                ) : null}
              </div>
              <button className="site-header__logout" type="button" onClick={(e) => { e.stopPropagation(); handleLogout() }}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <a
              className="site-header__login"
              href="#portal"
              onClick={(e) => {
                e.preventDefault()
                window.location.hash = '#portal'
              }}
            >
              Iniciar Sesión
            </a>
          )}

          <button
            className={`menu-toggle ${mobileOpen ? 'active' : ''}`}
            id="menu-toggle"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen ? 'true' : 'false'}
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {!mobileOpen ? null : <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />}

      <div className="site-header__mobile" id="mobile-nav" hidden={!mobileOpen}>
        {nav.map((item) => (
          <a key={item.href} href={item.href} onClick={go(item.href)}>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  )
}

/**
 * Hero - Sección de bienvenida principal con título y llamados a la acción.
 */
function Hero() {
  return (
    <section className="hero hero--official" id="inicio" aria-labelledby="hero-title">
      <div className="container hero__center">
        <h1 className="hero__title" id="hero-title">Ingeniería Civil en Computación e Informática</h1>
        <p className="hero__subtitle">Construyendo el futuro digital con sólidos fundamentos en Ingenieria</p>

        <div className="hero__actions">
          <a className="btn btn--pill btn--light" href="#admision" onClick={(e)=>{e.preventDefault(); scrollToHash('#admision')}}>
            Informacion de Admisión
            <span className="btn__icon" aria-hidden="true">→</span>
          </a>

          <a className="btn btn--pill btn--ghost-dark" href="#noticias" onClick={(e)=>{e.preventDefault(); scrollToHash('#noticias')}}>
            Ver Noticias
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * HomeCards - Tarjetas destacadas con las fortalezas principales del programa.
 */
function HomeCards() {
  return (
    <section className="home-cards section section--alt" aria-label="Destacados">
      <div className="container home-cards__grid">
        <article className="home-card">
          <div className="home-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5 9-5zm0 11l7.5-4.17V17L12 22l-7.5-5V8.83L12 13z"/></svg>
          </div>
          <h3 className="home-card__title">Excelencia Académica</h3>
          <p className="home-card__text">Formación de profesionales de calidad en computación e informática</p>
        </article>

        <article className="home-card">
          <div className="home-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 1h8v2H8V9zm0 3h6v2H8v-2z"/></svg>
          </div>
          <h3 className="home-card__title">Malla Curricular Actualizada</h3>
          <p className="home-card__text">Contenidos modernos alineados con las demandas del mercado</p>
        </article>

        <article className="home-card">
          <div className="home-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10z"/></svg>
          </div>
          <h3 className="home-card__title">Eventos y Actividades</h3>
          <p className="home-card__text">Charlas, seminarios y ferias para complementar tu formación</p>
        </article>
      </div>
    </section>
  )
}

function CarreraCarousel({ images, interval = 5000 }) {
  const [index, setIndex] = useState(0)
  const count = images.length

  const next = () => setIndex((i) => (i + 1) % count)
  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const goTo = (i) => setIndex((i + count) % count)

  useEffect(() => {
    if (!count || interval <= 0) return
    const id = setInterval(next, interval)
    return () => clearInterval(id)
  }, [count, interval])

  if (!count) {
    return <div className="image-box">Imagen relacionada a la carrera</div>
  }

  return (
    <div className="carrera-carousel" role="region" aria-label="Galería de la carrera">
      <div className="carrera-carousel__viewport">
        <div
          className="carrera-carousel__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div className="carrera-carousel__slide" key={src}>
              <img
                src={src}
                alt={`Instalaciones de la carrera ${i + 1}`}
                className="carrera-carousel__img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="carrera-carousel__nav">
        <button className="carrera-carousel__btn" type="button" onClick={prev} aria-label="Foto anterior">
          ‹
        </button>
        <button className="carrera-carousel__btn" type="button" onClick={next} aria-label="Foto siguiente">
          ›
        </button>
      </div>

      <div className="carrera-carousel__dots" role="tablist" aria-label="Seleccionar foto">
        {images.map((_, i) => (
          <button
            key={`dot-${i}`}
            className={`carrera-carousel__dot ${i === index ? 'is-active' : ''}`}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a foto ${i + 1}`}
            aria-current={i === index ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Carrera - Información general del programa: descripción, estadísticas y beneficios.
 */
function Carrera() {
  const carreraImages = useMemo(() => {
    const modules = import.meta.glob('./img/carrera/*.{jpg,jpeg,png,webp}', {
      eager: true,
      import: 'default',
    })

    return Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, src]) => src)
  }, [])

  return (
    <section className="section-carrera" id="carrera">
      <div className="container">
        <div className="carrera-header">
          <h2>Sobre la carrera</h2>
          <p className="carrera-intro">La carrera de Ingeniería Civil Informática forma profesionales de excelencia capaces de diseñar, implementar y gestionar soluciones tecnológicas innovadoras</p>
        </div>

        <div className="carrera-content">
          <div className="carrera-image">
            <div className="image-box image-box--carousel">
              <CarreraCarousel images={carreraImages} interval={5000} />
            </div>
          </div>

          <div className="carrera-right">
            <div className="carrera-text">
              <h3>¿Por qué estudiar con nosotros?</h3>
              <p>Nuestra Carrera Combina una sólida formación en ciencias básicas de la ingeniería con competencias especializadas en tecnologías de la información. Formamos profesionales capaces de enfrentar los desafíos de la industria tecnológica.</p>
              <p>Contamos con laboratorios equipados con tecnología excelente, docentes con experiencia en la industria y convenios con empresas para prácticas profesionales.</p>
            </div>

            <div className="carrera-stats">
              <div className="stat-item">
                <div className="stat-value">5 años</div>
                <div className="stat-label">Acreditación vigente</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">95%</div>
                <div className="stat-label">Tasa de empleabilidad</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">$1M</div>
                <div className="stat-label">Ingreso promedio inicial</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">5+</div>
                <div className="stat-label">Empresas Convenio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Competencias - Áreas de especialización del programa y perfiles de estudiante/egresado.
 */
function Competencias() {
  return (
    <section className="section-competencias section section--alt" id="competencias">
      <div className="container">
        <h2 className="competencias-title">Áreas de Competencia</h2>

        <div className="competencias-grid">
          <div className="competencia-card">
            <div className="competencia-head">
              <div className="competencia-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 7l-4 5 4 5h3L6 12l4-5H7zm10 0h-3l4 5-4 5h3l4-5-4-5z"/></svg>
              </div>
              <h3>Desarrollo de software</h3>
            </div>
            <p>Diseño, implementación y mantención de sistemas de software complejos usando metodologías ágiles.</p>
          </div>

          <div className="competencia-card">
            <div className="competencia-head">
              <div className="competencia-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 3C7 3 3 4.79 3 7v10c0 2.21 4 4 9 4s9-1.79 9-4V7c0-2.21-4-4-9-4zm0 2c4.42 0 7 .99 7 2s-2.58 2-7 2-7-.99-7-2 2.58-2 7-2zm0 14c-4.42 0-7-.99-7-2V9.97C6.64 11.23 9.64 12 12 12s5.36-.77 7-2.03V17c0 1.01-2.58 2-7 2z"/></svg>
              </div>
              <h3>Gestión de Datos</h3>
            </div>
            <p>Administración de bases de datos, Big Data, minería de datos, y análisis de información.</p>
          </div>

          <div className="competencia-card">
            <div className="competencia-head">
              <div className="competencia-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4zm0 2.2L6 6.8V12c0 4.1 2.7 7.8 6 8.4 3.3-.6 6-4.3 6-8.4V6.8l-6-2.6z"/></svg>
              </div>
              <h3>Arquitectura Cloud</h3>
            </div>
            <p>Diseño de infraestructuras escalables en la nube y soluciones DevOps modernos.</p>
          </div>

          <div className="competencia-card">
            <div className="competencia-head">
              <div className="competencia-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm5 18a1.25 1.25 0 100-2.5A1.25 1.25 0 0012 20zM7 5h10V4H7v1z"/></svg>
              </div>
              <h3>Desarrollo Multiplataforma</h3>
            </div>
            <p>Creación de aplicaciones web, móviles y de escritorio con tecnologías actuales.</p>
          </div>

          <div className="competencia-card">
            <div className="competencia-head">
              <div className="competencia-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4zm0 2.2L6 6.8V12c0 4.1 2.7 7.8 6 8.4 3.3-.6 6-4.3 6-8.4V6.8l-6-2.6z"/></svg>
              </div>
              <h3>Ciberseguridad</h3>
            </div>
            <p>Protección de sistemas informáticos, gestión de riesgos y seguridad de la información.</p>
          </div>

          <div className="competencia-card">
            <div className="competencia-head">
              <div className="competencia-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2zM6 3h4v14H6V3zm8 6h4v8h-4V9z"/></svg>
              </div>
              <h3>Gestión de Proyectos TI</h3>
            </div>
            <p>Liderazgo de equipos, planificación estratégica y administración de recursos tecnológicos.</p>
          </div>
        </div>

        <div className="competencias-extra">
          <div className="perfil-Estudiante">
            <h3>
              <span className="perfil-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg>
              </span>
              Perfil del Estudiante
            </h3>
            <ul>
              <li>Interés por la tecnología y la innovación.</li>
              <li>Habilidades analíticas y de resolución de problemas.</li>
              <li>Capacidad para trabajar en equipo y comunicarse efectivamente.</li>
              <li>Compromiso con el aprendizaje continuo y la actualización tecnológica.</li>
            </ul>
          </div>

          <div className="perfil-egresado">
            <h3>
              <span className="perfil-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2l7 3v6c0 5-3.5 9.4-7 10-3.5-.6-7-5-7-10V5l7-3zm0 4.2L7 7.6V11c0 3.5 2.2 6.8 5 7.4 2.8-.6 5-3.9 5-7.4V7.6l-5-1.4z"/></svg>
              </span>
              Perfil del Egresado
            </h3>
            <ul>
              <li>Ingeniero con sólida formación tecnológica.</li>
              <li>Capacidad para liderar proyectos de transformación digital.</li>
              <li>Visión ética y responsabilidad social.</li>
              <li>Adaptación a nuevas tecnologías emergentes.</li>
              <li>Emprendimiento e innovación.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Convierte un texto en un slug válido para URLs.
 * 
 * Elimina acentos, convierte a minúsculas, reemplaza espacios y caracteres especiales
 * por guiones, y elimina guiones al inicio y final. Útil para generar identificadores
 * únicos a partir de nombres de asignaturas.
 * 
 * @param {string} text - Texto a convertir
 * @returns {string} Slug normalizado
 * 
 * @example
 * slugify('Programación I') // 'programacion-i'
 * slugify('Análisis de Datos') // 'analisis-de-datos'
 */
function PlanEstudiosSummary() {
  return (
    <div className="plan-summary" aria-label="Resumen plan de estudios">
      <h2 className="plan-summary__title">Plan de estudios</h2>
      <p className="plan-summary__subtitle">Un plan curricular actualizado que combina fundamentos sólidos con tecnologías emergentes</p>

      <div className="plan-summary__grid">
        <article className="info-card">
          <div className="info-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 2h10v2H7V2zm-2 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm0 4v10h14V10H5z"/></svg>
          </div>
          <div className="info-card__value">10 Semestres</div>
          <div className="info-card__text">5 años de formación integral</div>
        </article>

        <article className="info-card">
          <div className="info-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6z"/></svg>
          </div>
          <div className="info-card__value">160 Créditos</div>
          <div className="info-card__text">Sistema de créditos transferibles</div>
        </article>

        <article className="info-card">
          <div className="info-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2l4 7h-8l4-7zm-8 9h16v11H4V11zm6 2v7h4v-7h-4z"/></svg>
          </div>
          <div className="info-card__value">Título Profesional</div>
          <div className="info-card__text">Ingeniero Civil en Computación e Informática</div>
        </article>

        <article className="info-card">
          <div className="info-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
          </div>
          <div className="info-card__value">Grado Académico</div>
          <div className="info-card__text">Licenciado en Ciencias de la Ingeniería</div>
        </article>
      </div>

      <div className="plan-summary__cta">
        <a className="btn btn--pill btn--mint" href="#malla-interactiva" onClick={(e)=>{e.preventDefault(); scrollToHash('#malla-interactiva')}}>
          <span className="btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 19a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14zm4-1V6h10v12H8z"/></svg>
          </span>
          Ver Malla Curricular Completa
        </a>
      </div>
    </div>
  )
}

/**
 * Admision
 */
function Admision() {
  return (
    <section className="section section--alt" id="admision" aria-labelledby="admision-title">
      <div className="container">
        <div className="section-header">
          <h2 id="admision-title">Admisiones</h2>

          <p className="section-subtitle">Únete a una de las carreras más demandadas y mejor valoradas en el mercado laboral actual. Forma parte de la nueva generación de ingenieros que están transformando el mundo digital.</p>
        </div>

        <div className="admision-grid">
          <article className="panel-card">
            <div className="panel-card__head">
              <span className="panel-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M6 2h9l3 3v17H6V2zm9 1.5V6h2.5L15 3.5zM8 9h8v2H8V9zm0 4h8v2H8v-2z"/></svg>
              </span>
              <h3>Requisitos de Admisión</h3>
            </div>
            <ul>
              <li>Certificado de enseñanza media</li>
              <li>Puntaje PAES</li>
              <li>Ranking de notas</li>
              <li>Certificado de nacimiento</li>
              <li>Cédula de identidad</li>
            </ul>
          </article>

          <article className="panel-card">
            <div className="panel-card__head">
              <span className="panel-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M6 2h9l3 3v17H6V2zm9 1.5V6h2.5L15 3.5zM8 9h8v2H8V9zm0 4h8v2H8v-2z"/></svg>
              </span>
              <h3>Requisitos de Admisión</h3>
            </div>
            <ul>
              <li><strong>Puntaje Ponderado Mínimo:</strong> 500 puntos</li>
              <li><strong>Puntaje promedio (C. Lectora y Mat.1) Mínimo:</strong> 500 puntos</li>
              <li><strong>Último puntaje seleccionado PAES 2025:</strong> 674,65 puntos</li>
            </ul>
          </article>
        </div>

        <div className="chips" aria-label="Ponderaciones">
          <span className="chip">NEM: 20%</span>
          <span className="chip">Ranking: 10%</span>
          <span className="chip">Competencia Lectora: 15%</span>
          <span className="chip">Competencia Matemática I: 40%</span>
          <span className="chip">Ciencias: 10%</span>
          <span className="chip">Competencia Matemática II: 5%</span>
        </div>

        <div className="timeline" aria-label="Calendario postulaciones">
          <h3 className="timeline__title">Calendario Postulaciones</h3>
          <ol className="timeline__list">
            <li className="timeline__item">
              <div className="timeline__badge">1</div>
              <div className="timeline__content">
                <div className="timeline__date">5-9 Enero 2026</div>
                <div className="timeline__name">Proceso de Postulación</div>
                <div className="timeline__desc">Postulación a través del portal DEMRE y/o Universidad de La Serena (ingresos especiales)</div>
              </div>
            </li>
            <li className="timeline__item">
              <div className="timeline__badge">2</div>
              <div className="timeline__content">
                <div className="timeline__date">21-23 Enero y 24-30 Enero</div>
                <div className="timeline__name">Matrícula</div>
                <div className="timeline__desc">Proceso de matrícula para estudiantes aceptados, segundo periodo para estudiantes en lista de espera</div>
              </div>
            </li>
            <li className="timeline__item">
              <div className="timeline__badge">3</div>
              <div className="timeline__content">
                <div className="timeline__date">Marzo - Julio</div>
                <div className="timeline__name">Primer Semestre</div>
                <div className="timeline__desc">Inicio del año académico</div>
              </div>
            </li>
            <li className="timeline__item">
              <div className="timeline__badge">4</div>
              <div className="timeline__content">
                <div className="timeline__date">Agosto - Diciembre</div>
                <div className="timeline__name">Segundo Semestre</div>
                <div className="timeline__desc">Continuación del año académico</div>
              </div>
            </li>
          </ol>
        </div>

        <div className="cta-box" role="region" aria-label="Más información">
          <h3>¿Listo para Postular?</h3>
          <p>Para más información sobre el proceso de admisión, fechas específicas y ponderaciones, visita el sitio oficial de la universidad.</p>
          <a className="btn btn--dark" href="https://admision.userena.cl" target="_blank" rel="noreferrer">Más Información</a>
        </div>
      </div>
    </section>
  )
}

/**
 * Noticias - Sección de noticias con filtros por categoría.
 */
const NOTICIAS_TABS = ['Todas', 'Académicas', 'Eventos', 'Anuncios', 'Admisión', 'Galeria']

const normalizeNoticia = (n) => {
  const imagen = n.imagen || (Array.isArray(n.imagenes) ? n.imagenes[0]?.url : null) || ''
  const tipo = n.tipo || n.importancia?.tipo || n.importancia_tipo || 'informativo'
  const autor = n.autor || n.autor_externo || n.autor_usuario?.nombre || ''
  const contenido = n.contenido || n.content || ''
  const resumen = n.resumen || (contenido ? `${contenido.slice(0, 160).trim()}${contenido.length > 160 ? '…' : ''}` : '')

  return {
    id: n.id ?? n.noticia_id ?? n.id_noticia,
    titulo: n.titulo || n.title || '',
    fecha: n.fecha || n.fecha_creacion || n.created_at || '',
    tipo,
    visibilidad: n.visibilidad || 'publico',
    autor,
    resumen,
    imagen
  }
}

const mapCategoria = (tipo) => {
  const value = String(tipo || '').toLowerCase()
  if (value.includes('evento')) return 'Eventos'
  if (value.includes('academ')) return 'Académicas'
  if (value.includes('admision')) return 'Admisión'
  if (value.includes('galer')) return 'Galeria'
  if (value.includes('anuncio') || value.includes('informativo')) return 'Anuncios'
  return 'Todas'
}

function useNoticiasData() {
  const [news, setNews] = useState([])

  useEffect(() => {
    let activeReq = true

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

      const normalized = Array.isArray(data) ? data.map(normalizeNoticia) : []
      if (!activeReq) return
      setNews(normalized)
    }

    load()
    return () => {
      activeReq = false
    }
  }, [])

  return news
}

function UltimasNoticias({ news = [] }) {
  const latest = useMemo(() => {
    const visibles = news.filter((n) => (n.visibilidad || 'publico') === 'publico')
    const sorted = [...visibles].sort((a, b) => {
      const dateA = Date.parse(a.fecha) || 0
      const dateB = Date.parse(b.fecha) || 0
      return dateB - dateA
    })
    return sorted.slice(0, 3)
  }, [news])

  if (latest.length === 0) return null

  return (
    <section className="section section--alt section-ultimas" aria-labelledby="ultimas-title">
      <div className="container">
        <div className="section-ultimas__top">
          <div>
            <h2 id="ultimas-title">Últimas Noticias</h2>
          </div>
          <a
            className="section-action"
            href="#noticias"
            onClick={(e) => {
              e.preventDefault()
              scrollToHash('#noticias')
            }}
          >
            Ver todas <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="noticias-grid ultimas-grid">
          {latest.map((noticia) => (
            <article className="noticia-card" key={`ult-${noticia.id}`}>
              {noticia.imagen ? (
                <div className="noticia-imagen">
                  <img src={noticia.imagen} alt={noticia.titulo} loading="lazy" />
                </div>
              ) : null}

              <div className="noticia-content">
                <span className={`noticia-tipo ${noticia.tipo || ''}`}>
                  {String(noticia.tipo || 'info').toUpperCase()}
                </span>
                <p className="noticia-fecha">
                  {noticia.fecha} {noticia.autor ? `• ${noticia.autor}` : ''}
                </p>
                <a
                  href={`#noticia-${noticia.id}`}
                  className="noticia-titulo"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('pendiente')
                  }}
                >
                  {noticia.titulo}
                </a>
                <p className="noticia-resumen">{noticia.resumen}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Noticias({ news = [] }) {
  const [active, setActive] = useState('Todas')

  const filtered = useMemo(() => {
    const visibles = news.filter((n) => (n.visibilidad || 'publico') === 'publico')
    if (active === 'Todas') return visibles
    return visibles.filter((n) => mapCategoria(n.tipo) === active)
  }, [news, active])

  return (
    <section className="section" id="noticias" aria-labelledby="noticias-title">
      <div className="container">
        <div className="section-header section-header--left">
          <h2 id="noticias-title">Noticias</h2>
          <p className="section-subtitle">Mantente informado sobre las últimas novedades de la carrera</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Categorías de noticias">
          {NOTICIAS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`tab ${active === t ? 'is-active' : ''}`}
              role="tab"
              aria-selected={active === t ? 'true' : 'false'}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-panel" role="status" aria-live="polite">
            <div className="empty-panel__icons" aria-hidden="true">
              <span className="empty-ico" />
              <span className="empty-ico" />
              <span className="empty-ico" />
            </div>
            <p>No hay noticias disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="noticias-grid noticias-grid--scroll" id="noticias-container">
            {filtered.map((noticia) => (
              <article className="noticia-card" key={noticia.id}>
                {noticia.imagen ? (
                  <div className="noticia-imagen">
                    <img src={noticia.imagen} alt={noticia.titulo} loading="lazy" />
                  </div>
                ) : null}

                <div className="noticia-content">
                  <span className={`noticia-tipo ${noticia.tipo || ''}`}>
                    {String(noticia.tipo || 'info').toUpperCase()}
                  </span>
                  <p className="noticia-fecha">
                    {noticia.fecha} {noticia.autor ? `• ${noticia.autor}` : ''}
                  </p>
                  <a
                    href={`#noticia-${noticia.id}`}
                    className="noticia-titulo"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('pendiente')
                    }}
                  >
                    {noticia.titulo}
                  </a>
                  <p className="noticia-resumen">{noticia.resumen}</p>
                  <a
                    href={`#noticia-${noticia.id}`}
                    className="noticia-link"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('pendiente')
                    }}
                  >
                    Leer más →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Contacto
 */
function Contacto() {
  return (
    <section className="section section-contacto" id="contacto" aria-labelledby="contacto-title">
      <div className="container">
        <div className="section-header section-header--left">
          <h2 id="contacto-title">Contacto</h2>
          <p className="section-subtitle">Estamos aquí para ayudarte. Contáctanos a través de los siguientes medios</p>
        </div>

        <div className="contact-grid">
          <article className="contact-card">
            <div>
              <h3>Correo electrónico</h3>
              <a href="mailto:correo@userena.cl">correo@userena.cl</a>
            </div>
          </article>
          <article className="contact-card">
            <div>
              <h3>Teléfono</h3>
              <a href="tel:+56212345678">+56 2 1234 5678</a>
            </div>
          </article>
          <article className="contact-card">
            <div>
              <h3>Dirección</h3>
              <p>Benavente 980, 1720169 La Serena, Coquimbo</p>
            </div>
          </article>
          <article className="contact-card">
            <div>
              <h3>Horario de atención</h3>
              <p>8:30 - 12:30<br/>14:30 - 17:30</p>
            </div>
          </article>
        </div>

        <div className="map-box" aria-label="Ubicación">
          <h3>Ubicación</h3>
          <div className="map-box__frame"><iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1454.096557036093!2d-71.24588965599125!3d-29.90911903666393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9691ca64701a55f9%3A0xe29781df220771ad!2sUniversidad%20de%20La%20Serena%20Campus%20Ignacio%20Dom%C3%A9yko!5e0!3m2!1ses!2scl!4v1768837961903!5m2!1ses!2scl"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Organigrama
 */
function Organigrama() {
  const [orgData, setOrgData] = useState(null)
  const [cecData, setCecData] = useState(null)

  useEffect(() => {
    let active = true

    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    }

    const load = async () => {
      let org = null
      let cec = null

      try {
        org = await tryFetch('/api/organigrama')
      } catch {
        org = null
      }

      if (!org || Object.keys(org).length === 0) {
        try {
          org = await tryFetch('/data/organigrama.json')
        } catch {
          org = null
        }
      }

      try {
        cec = await tryFetch('/api/cec')
      } catch {
        cec = null
      }

      if (!cec) {
        try {
          cec = await tryFetch('/data/cec.json')
        } catch {
          cec = null
        }
      }

      if (!active) return
      setOrgData(org)
      setCecData(cec)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const director = orgData?.director || 'Por definir'
  const secretariaAcademica = orgData?.secretaria_academica || 'Por definir'
  const jefeCarrera = orgData?.jefe_carrera || 'Por definir'
  const coordinadorCarrera = orgData?.coordinador_carrera || 'Por definir'
  const miembrosCec = Array.isArray(cecData?.miembros) ? cecData.miembros : []

  return (
    <section className="section section--alt" id="organigrama" aria-labelledby="org-title">
      <div className="container">
        <div className="section-header section-header--left">
          <h2 id="org-title">Organigrama</h2>
          <p className="section-subtitle">Estructura organizacional de la escuela de Ingeniería Civil en Computación e Informática</p>
        </div>

        <div className="org-tree" aria-label="Organigrama">
          <div className="org-level org-level--1">
            <div className="org-node">
              <div className="org-node__icon"></div>
              <div className="org-node__title">Director de Escuela</div>
              <div className="org-name">{director}</div>
            </div>
          </div>

          <div className="org-level org-level--2">
            <div className="org-connector org-connector--vertical"></div>
            <div className="org-row">
              <div className="org-connector org-connector--horizontal"></div>
              <div className="org-node">
                <div className="org-node__icon"></div>
                <div className="org-node__title">Secretaria Académica</div>
                <div className="org-name">{secretariaAcademica}</div>
              </div>
              <div className="org-connector org-connector--horizontal"></div>
              <div className="org-node">
                <div className="org-node__icon"></div>
                <div className="org-node__title">Jefe de Carrera</div>
                <div className="org-name">{jefeCarrera}</div>
              </div>
              <div className="org-connector org-connector--horizontal"></div>
              <div className="org-node">
                <div className="org-node__icon"></div>
                <div className="org-node__title">Coordinador de Carrera</div>
                <div className="org-name">{coordinadorCarrera}</div>
              </div>
              <div className="org-connector org-connector--horizontal"></div>
            </div>
          </div>
        </div>

        <div className="cec-block" aria-label="Centro de Estudiantes">
          <div className="cec-title">Centro de Estudiantes de la Carrera ( CEC )</div>
          <div className="cec-grid">
            {miembrosCec.length ? (
              miembrosCec.map((m, idx) => (
                <div key={`${m.nombre}-${idx}`} className="cec-card">
                  <div className="cec-card__role">{m.cargo}</div>
                  <div className="cec-card__name">{m.nombre}</div>
                </div>
              ))
            ) : (
              <div className="cec-card">
                <div className="cec-card__role">Sin información</div>
                <div className="cec-card__name">Por definir</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Convierte texto a formato slug (URL-friendly).
 * Elimina acentos, convierte a minúsculas, reemplaza espacios por guiones.
 * 
 * @param {string} text - Texto a convertir
 * @returns {string} Slug normalizado
 */
function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Procesa datos de la malla curricular y construye índices para consultas rápidas.
 * Genera mapas de asignaturas por semestre y resuelve relaciones de prerequisitos.
 * 
 * @param {Object} raw - Datos JSON de la malla curricular
 * @returns {Object} Índices: {asignaturasPorSemestre, courseById, idByName}
 */
function buildMallaIndex(raw) {
  const asignaturasPorSemestre = {}
  const prerequisitosPorNombre = {}

  if (raw?.asignaturas && Array.isArray(raw.asignaturas) && raw.asignaturas.length) {
    const codeToName = new Map()

    
    raw.asignaturas.forEach((a) => {
      const name = a.nombre || a.name || a.titulo || ''
      const sem = Number(a.semestre || a.sem || 0) || 0
      const code = a.codigo || a.code || null

      if (!asignaturasPorSemestre[sem]) asignaturasPorSemestre[sem] = []
      asignaturasPorSemestre[sem].push(name)

      if (code) codeToName.set(code, name)
    })

    
    if (raw.prerequisitos_por_codigo && typeof raw.prerequisitos_por_codigo === 'object') {
      Object.entries(raw.prerequisitos_por_codigo).forEach(([targetCode, prereqCodes]) => {
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

   
    raw.asignaturas.forEach((a) => {
      const name = a.nombre || a.name || ''
      if (!a.prerequisitos || !a.prerequisitos.length) return
      const resolved = a.prerequisitos
        .map((p) => {
          if (typeof p === 'string' && p.startsWith('NIVEL_')) return p
          return codeToName.get(p) || p
        })
        .filter(Boolean)

      prerequisitosPorNombre[name] = Array.from(new Set([...(prerequisitosPorNombre[name] || []), ...resolved]))
    })
  }

  
  const courseById = new Map()
  const idByName = new Map()

  Object.entries(asignaturasPorSemestre).forEach(([sem, list]) => {
    const semestre = Number(sem)
    list.forEach((name) => {
      const id = slugify(`${semestre}-${name}`)
      const course = { id, name, semestre, prereqIds: [], nextIds: [], prereqTokens: [] }
      courseById.set(id, course)
      idByName.set(name, id)
    })
  })

  
  Object.entries(prerequisitosPorNombre).forEach(([courseName, prereqNames]) => {
    const courseId = idByName.get(courseName)
    if (!courseId) return
    const course = courseById.get(courseId)

    course.prereqTokens = []
    course.prereqIds = (prereqNames || [])
      .map((n) => {
        if (typeof n === 'string' && n.startsWith('NIVEL_')) {
          course.prereqTokens.push(n)
          return null
        }
        return idByName.get(n)
      })
      .filter(Boolean)
  })

  
  courseById.forEach((course) => {
    course.prereqIds.forEach((prId) => {
      const prereq = courseById.get(prId)
      if (prereq && !prereq.nextIds.includes(course.id)) prereq.nextIds.push(course.id)
    })
  })

  return { asignaturasPorSemestre, courseById, idByName }
}

/**
 * Malla
 */
function Malla() {
  const [raw, setRaw] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  /**
   * Carga la malla curricular desde /data/malla.json.
   */
  useEffect(() => {
    let cancelled = false
    fetch('/data/malla.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled) setRaw(j)
      })
      .catch(() => {
        if (!cancelled) setRaw(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  
  const index = useMemo(() => {
    if (!raw) return null
    return buildMallaIndex(raw)
  }, [raw])

  
  const semesters = useMemo(() => {
    if (!index) return []
    return Object.keys(index.asignaturasPorSemestre)
      .map(Number)
      .sort((a, b) => a - b)
  }, [index])

  
  const selected = useMemo(() => {
    if (!index || !selectedId) return null
    return index.courseById.get(selectedId) || null
  }, [index, selectedId])

  
  const prereqSet = useMemo(() => new Set(selected?.prereqIds || []), [selected])
  const nextSet = useMemo(() => new Set(selected?.nextIds || []), [selected])

  
  const toggleSelection = (id) => {
    if (!id) return
    setSelectedId((cur) => (cur === id ? null : id))
  }

  
  const clearSelection = () => setSelectedId(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') clearSelection()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="section section--alt" id="malla">
      <div className="container">
        <PlanEstudiosSummary />

        <div className="section-header">
          <h2 className="visually-hidden">Malla Curricular Interactiva</h2>
          <div className="malla-actions">
            <a className="btn btn--primary" href="/assets/docs/plan-estudios.pdf" target="_blank" rel="noreferrer">Descargar PDF</a>
          </div>
        </div>

        <div className="malla" id="malla-interactiva">
          <div className="malla-hint" role="region" aria-label="Leyenda de la malla">
            <div className="malla-hint__left">
              <p className="malla-hint__title">Leyenda</p>
              <p className="malla-hint__desc">Al seleccionar una asignatura, los colores indican:</p>
            </div>
            <div className="malla-legend" aria-hidden="true">
              <span><span className="malla-dot malla-dot--selected" aria-hidden="true"></span> Seleccionada</span>
              <span><span className="malla-dot malla-dot--prereq" aria-hidden="true"></span> Pre-requisito</span>
              <span><span className="malla-dot malla-dot--next" aria-hidden="true"></span> Habilita a</span>
            </div>
          </div>

          <div className="malla-track" aria-label="Malla curricular horizontal">
            {!index ? (
              <div style={{ padding: 16 }}>
                <p className="malla-empty">No se pudo cargar <code>/data/malla.json</code>.</p>
              </div>
            ) : (
              semesters.map((sem) => (
                <div key={sem} className="semester-col">
                  <div className="semester-col__title">
                    <span>Semestre {sem}</span>
                  </div>

                  {index.asignaturasPorSemestre[sem].map((name) => {
                    const id = index.idByName.get(name)
                    const course = index.courseById.get(id)

                    const isSelected = selected?.id === id
                    const isPrereq = prereqSet.has(id)
                    const isNext = nextSet.has(id)
                    const isRelated = !selected ? true : isSelected || isPrereq || isNext

                    const cls = [
                      'course-card',
                      isSelected ? 'is-selected' : '',
                      isPrereq ? 'is-prereq' : '',
                      isNext ? 'is-next' : '',
                      selected && !isRelated ? 'is-dim' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <div
                        key={id}
                        className={cls}
                        data-course-id={id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected ? 'true' : 'false'}
                        onClick={() => toggleSelection(id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleSelection(id)
                          }
                        }}
                      >
                        <p className="course-card__name">{course?.name}</p>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="malla-detail" id="malla-detail">
          <div className="malla-panel">
            <p className="malla-panel__subtitle" id="malla-detail-subtitle">
              {!selected ? (
                'Selecciona una asignatura para ver sus relaciones.'
              ) : (
                <>
                  <strong>{selected.name}</strong> — Semestre {selected.semestre}
                </>
              )}
            </p>

            <p className="malla-panel__title" style={{ marginTop: 12 }}>Pre-requisitos</p>
            <div id="malla-prereq">
              {!selected ? (
                <p className="malla-empty">—</p>
              ) : (() => {
                const prereqNames = (selected.prereqIds || [])
                  .map((id) => index?.courseById.get(id)?.name)
                  .filter(Boolean)
                const tokens = selected.prereqTokens || []

                if (!prereqNames.length && !tokens.length) return <p className="malla-empty">Sin pre-requisitos (o aún no definidos).</p>

                return (
                  <ul className="malla-list">
                    {prereqNames.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                    {tokens.map((t) => {
                      const human = (t || '')
                        .replace(/^NIVEL_([0-9]+)_APROBADO$/, 'Nivel $1 aprobado')
                        .replace(/_/g, ' ')
                      return (
                        <li key={t} className="malla-token malla-token--prereq">
                          <em>{human}</em>
                        </li>
                      )
                    })}
                  </ul>
                )
              })()}
            </div>

            <p className="malla-panel__title" style={{ marginTop: 12 }}>Habilita a</p>
            <div id="malla-next">
              {!selected ? (
                <p className="malla-empty">—</p>
              ) : (() => {
                const nextNames = (selected.nextIds || [])
                  .map((id) => index?.courseById.get(id)?.name)
                  .filter(Boolean)

                if (!nextNames.length) return <p className="malla-empty">No habilita otras (o aún no definido).</p>

                return (
                  <ul className="malla-list">
                    {nextNames.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )
              })()}
            </div>

            <div className="malla-actions-row">
              <button className="btn btn--ghost btn--small" id="malla-clear" type="button" onClick={clearSelection}>
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Footer
 */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; 2026 Universidad de La Serena. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

/**
 * App
 * Gestiona navegación por hash, detección de scroll y renderizado de secciones.
 */

export default function App() {
  const [activeHash, setActiveHash] = useHashActive('#inicio')
  const noticiasData = useNoticiasData()

  const isPortal = activeHash.startsWith('#portal')

  
  const didInitialScroll = useRef(false)
  useEffect(() => {
    if (isPortal) return
    if (didInitialScroll.current) return
    didInitialScroll.current = true
    const h = window.location.hash
    if (h) {
      setTimeout(() => scrollToHash(h), 0)
    }
  }, [])

    /**
     * Scrollspy: marca la sección visible y sincroniza el hash para resaltar el menú.
     */
  useEffect(() => {
    if (isPortal) return
    const sections = ['#inicio', '#carrera', '#malla', '#admision', '#noticias', '#organigrama', '#contacto']
    let ticking = false
    
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 150
      let currentSection = '#inicio'
      
      for (const hash of sections) {
        const element = document.querySelector(hash)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          
          if (scrollPosition >= elementTop - 200) {
            currentSection = hash
          }
        }
      }
      
      if (currentSection !== activeHash) {
        setActiveHash(currentSection)
        if (history.replaceState) {
          history.replaceState(null, '', currentSection)
        }
      }
      
      ticking = false
    }
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection)
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    updateActiveSection()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [activeHash, setActiveHash])

  if (isPortal) return <Portal />

  return (
    <>
      <Header activeHash={activeHash} />
      <main>
        <Hero />
        <HomeCards />
        <UltimasNoticias news={noticiasData} />
        <Carrera />

        <Competencias />
        <Malla />
        <Admision />
        <Noticias news={noticiasData} />
        <Organigrama />
      </main>
      <Contacto />
      <Footer />
      
    </>
  )
}

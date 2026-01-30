/**
 * Portal de acceso y vistas por rol.
 */
import React, { useEffect, useMemo, useState } from 'react'

export default function Portal() {
  const [view, setView] = useState('role')
  const [selectedRole, setSelectedRole] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [sessionUser, setSessionUser] = useState(null)
  const [studentSection, setStudentSection] = useState('area')
  const [academicSection, setAcademicSection] = useState('area')

  const DEMO_CREDENTIALS = {
    estudiante: {
      email: 'juan.perez@userena.cl',
      password: 'Uls2026!',
      user: {
        nombre: 'Juan Pérez',
        rol: 'Estudiante',
        nivel: 'Nivel I/II',
        semestre: '1'
      }
    },
    academico: {
      email: 'maria.lopez@userena.cl',
      password: 'Uls2026!',
      user: {
        nombre: 'María López',
        rol: 'Académico',
        nivel: 'Docente',
        semestre: ''
      }
    },
    administrador: {
      email: 'admin@userena.cl',
      password: 'Uls2026!',
      user: {
        nombre: 'Administrador',
        rol: 'Administrador',
        nivel: 'Plataforma',
        semestre: ''
      }
    }
  }

  useEffect(() => {
    document.body.classList.add('portal-active')
    return () => document.body.classList.remove('portal-active')
  }, [])

  const showTabs = useMemo(() => view === 'login' || view === 'register', [view])
  const isLoginActive = view !== 'register'

  useEffect(() => {
    const normalizeRole = (value) => {
      const role = String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')

      if (role.includes('admin')) return 'administrador'
      if (role.includes('academ')) return 'academico'
      return 'estudiante'
    }

    const syncFromSession = () => {
      const raw = localStorage.getItem('uls_session')
      if (!raw) {
        setSessionUser(null)
        setSelectedRole('')
        setView('role')
        return
      }

      try {
        const parsed = JSON.parse(raw)
        setSessionUser(parsed)
        const roleKey = normalizeRole(parsed?.rol || parsed?.rol_nombre || parsed?.rol?.nombre)
        setSelectedRole(roleKey)
        if (roleKey === 'estudiante') {
          setView('student')
        } else if (roleKey === 'academico') {
          setView('academic')
        } else {
          setView('role-home')
        }
      } catch {
        setSessionUser(null)
        setSelectedRole('')
        setView('role')
      }
    }

    if ((window.location.hash || '') !== '#portal') {
      window.location.hash = '#portal'
    }

    syncFromSession()
    window.addEventListener('storage', syncFromSession)
    return () => window.removeEventListener('storage', syncFromSession)
  }, [])

  const handleSelectRole = (role) => {
    setSelectedRole(role)
    setLoginError(false)
    setLoginEmail('')
    setLoginPass('')
    setView('login')
  }

  const handleLogin = () => {
    if (!selectedRole || !DEMO_CREDENTIALS[selectedRole]) {
      setLoginError(true)
      return
    }

    const creds = DEMO_CREDENTIALS[selectedRole]
    const ok =
      loginEmail.trim().toLowerCase() === creds.email &&
      loginPass === creds.password

    if (!ok) {
      setLoginError(true)
      return
    }

    localStorage.setItem('uls_session', JSON.stringify(creds.user))
    setSessionUser(creds.user)
    setLoginError(false)
    window.location.hash = '#portal'
    if (selectedRole === 'estudiante') {
      setView('student')
    } else if (selectedRole === 'academico') {
      setView('academic')
    } else {
      setView('role-home')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('uls_session')
    setLoginEmail('')
    setLoginPass('')
    setLoginError(false)
    setSelectedRole('')
    setSessionUser(null)
    window.location.hash = '#portal'
    setView('role')
  }

  const roleLabel =
    selectedRole === 'administrador'
      ? 'Administrador'
      : selectedRole === 'academico'
        ? 'Académico'
        : 'Estudiante'

  const studentName = sessionUser?.nombre || 'Estudiante'
  const studentLevel = sessionUser?.nivel || ''
  const studentSemester = sessionUser?.semestre || ''
  const studentSubtitle = [sessionUser?.rol || 'Estudiante', studentLevel, studentSemester ? `Semestre ${studentSemester}` : '']
    .filter(Boolean)
    .join(' · ')

  const academicName = sessionUser?.nombre || 'Académico'
  const academicSubtitle = [sessionUser?.rol || 'Académico', sessionUser?.nivel || 'Profesor']
    .filter(Boolean)
    .join(' · ')

  const goStudentSection = (next) => {
    setStudentSection(next)
    if (history.pushState) {
      history.pushState({ portalRole: 'estudiante', section: next }, '', '#portal')
    }
  }

  const goAcademicSection = (next) => {
    setAcademicSection(next)
    if (history.pushState) {
      history.pushState({ portalRole: 'academico', section: next }, '', '#portal')
    }
  }

  useEffect(() => {
    if (view !== 'student' && view !== 'academic') return

    const roleKey = view === 'student' ? 'estudiante' : 'academico'

    if (history.replaceState) {
      history.replaceState({ portalRole: roleKey, section: 'area' }, '', '#portal')
    }

    if (history.pushState) {
      history.pushState({ portalRole: roleKey, section: 'area' }, '', '#portal')
    }

    const onPop = () => {
      if (view === 'student') setStudentSection('area')
      if (view === 'academic') setAcademicSection('area')
      if (history.pushState) {
        history.pushState({ portalRole: roleKey, section: 'area' }, '', '#portal')
      } else {
        window.location.hash = '#portal'
      }
    }

    const onHash = () => {
      if ((window.location.hash || '') !== '#portal') {
        if (history.replaceState) {
          history.replaceState({ portalRole: roleKey, section: 'area' }, '', '#portal')
        } else {
          window.location.hash = '#portal'
        }
      }
    }

    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onHash)
    }
  }, [view])

  if (view === 'student') {
    return (
      <main className="portal-student-page">
        <header className="portal-student-header">
          <div className="portal-student-header__left">
            <a
              className="portal-student-logo-btn"
              href="#inicio"
              onClick={(e) => {
                e.preventDefault()
                if (history.replaceState) {
                  history.replaceState(null, '', '#inicio')
                } else {
                  window.location.hash = '#inicio'
                }
                window.dispatchEvent(new HashChangeEvent('hashchange'))
              }}
              aria-label="Ir a página principal"
            >
              <img src="/assets/images/logo_vertical.png" alt="Logo ULS" className="portal-student-logo" />
            </a>
            <div className="portal-student-brand">
              <div className="portal-student-title">Ingeniería en Computación</div>
              <div className="portal-student-subtitle">Universidad de La Serena</div>
            </div>
          </div>

          <nav className="portal-student-nav" aria-label="Navegación estudiante" hidden>
            <span>Inicio</span>
            <span>La Carrera</span>
            <span>Plan de estudios</span>
            <span>Admisión</span>
            <span>Noticias</span>
            <span>Contacto</span>
            <span>Organigrama</span>
          </nav>

          <div className="portal-student-user">
            <div className="portal-student-user__text">
              <span className="portal-student-user__name">{studentName}</span>
              <span className="portal-student-user__meta">{studentSubtitle}</span>
            </div>
            <button className="portal-student-logout" type="button" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        <section className="portal-student-body">
          {studentSection === 'area' ? (
            <>
              <h2>Área Personal</h2>
              <div className="portal-student-panel">
                <button className="portal-student-link" type="button" onClick={() => goStudentSection('datos')}>
                  <span className="portal-student-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5C20 16 16.4 14 12 14z"/></svg>
                  </span>
                  Mis Datos
                </button>
                <button className="portal-student-link" type="button" onClick={() => goStudentSection('cursos')}>
                  <span className="portal-student-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1.5V8h4.5"/></svg>
                  </span>
                  Cursos
                </button>
                <button className="portal-student-link" type="button" onClick={() => goStudentSection('academicos')}>
                  <span className="portal-student-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10v2H7V7zm0 4h10v2H7v-2z"/></svg>
                  </span>
                  Datos Académicos
                </button>
              </div>
            </>
          ) : null}

          {studentSection === 'datos' ? (
            <>
              <h2>Mis Datos</h2>
              <div className="portal-student-card">
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Nombre</div>
                    <div className="portal-student-field">{studentName}</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Dirección de correo</div>
                    <div className="portal-student-field">estudiante@userena.cl</div>
                  </div>
                </div>
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Estado académico</div>
                    <div className="portal-student-field">Regular / Egresado / abandono o suspendido</div>
                  </div>
                </div>
                <div className="portal-student-row portal-student-row--split">
                  <div>
                    <div className="portal-student-label">Primer acceso al sitio</div>
                    <div className="portal-student-field">Jueves 1 de enero 2026</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Último acceso al sitio</div>
                    <div className="portal-student-field">Viernes 2 de enero 2026</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {studentSection === 'cursos' ? (
            <>
              <h2>Cursos</h2>
              <div className="portal-student-card">
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Cursando</div>
                    <div className="portal-student-field">"Cursos"</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Aprobados</div>
                    <div className="portal-student-field">"Aprobados"</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Reprobados</div>
                    <div className="portal-student-field">"Reprobados"</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {studentSection === 'academicos' ? (
            <>
              <h2>Datos Académicos</h2>
              <div className="portal-student-card">
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Año de ingreso</div>
                    <div className="portal-student-field">2022</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Nivel Actual</div>
                    <div className="portal-student-field">VI Nivel</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Carrera</div>
                    <div className="portal-student-field">Ingeniería en computación</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Año de egreso</div>
                    <div className="portal-student-field">2027</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
    )
  }

  if (view === 'academic') {
    return (
      <main className="portal-student-page portal-academic-page">
        <header className="portal-student-header">
          <div className="portal-student-header__left">
            <a
              className="portal-student-logo-btn"
              href="#inicio"
              onClick={(e) => {
                e.preventDefault()
                if (history.replaceState) {
                  history.replaceState(null, '', '#inicio')
                } else {
                  window.location.hash = '#inicio'
                }
                window.dispatchEvent(new HashChangeEvent('hashchange'))
              }}
              aria-label="Ir a página principal"
            >
              <img src="/assets/images/logo_vertical.png" alt="Logo ULS" className="portal-student-logo" />
            </a>
            <div className="portal-student-brand">
              <div className="portal-student-title">Ingeniería en Computación</div>
              <div className="portal-student-subtitle">Universidad de La Serena</div>
            </div>
          </div>

          <nav className="portal-student-nav" aria-label="Navegación académica">
            <span>Inicio</span>
            <span>La Carrera</span>
            <span>Plan de estudios</span>
            <span>Apoyo Estudiantil</span>
            <span>Noticias</span>
            <span>Contacto</span>
            <span>Organigrama</span>
          </nav>

          <div className="portal-student-user">
            <div className="portal-student-user__text">
              <span className="portal-student-user__name">{academicName}</span>
              <span className="portal-student-user__meta">{academicSubtitle}</span>
            </div>
            <button className="portal-student-logout" type="button" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        <section className="portal-student-body">
          {academicSection === 'area' ? (
            <>
              <h2>Área Personal</h2>
              <div className="portal-student-panel">
                <button className="portal-student-link" type="button" onClick={() => goAcademicSection('datos')}>
                  <span className="portal-student-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5C20 16 16.4 14 12 14z"/></svg>
                  </span>
                  Mis Datos
                </button>
                <button className="portal-student-link" type="button" onClick={() => goAcademicSection('cursos')}>
                  <span className="portal-student-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1.5V8h4.5"/></svg>
                  </span>
                  Mis Cursos
                </button>
                <button className="portal-student-link" type="button" onClick={() => goAcademicSection('academicos')}>
                  <span className="portal-student-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10v2H7V7zm0 4h10v2H7v-2z"/></svg>
                  </span>
                  Datos Académicos
                </button>
              </div>
            </>
          ) : null}

          {academicSection === 'datos' ? (
            <>
              <h2>Mis Datos</h2>
              <div className="portal-student-card">
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Nombre</div>
                    <div className="portal-student-field">{academicName}</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Dirección de correo</div>
                    <div className="portal-student-field">estudiante@userena.cl</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Departamento</div>
                    <div className="portal-student-field">****************</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {academicSection === 'cursos' ? (
            <>
              <h2>Mis Cursos</h2>
              <div className="portal-student-card">
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Cursos Asignados</div>
                    <div className="portal-student-field">Cursos</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Estudiantes Asignados</div>
                    <div className="portal-student-field">El total</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {academicSection === 'academicos' ? (
            <>
              <h2>Datos Académicos</h2>
              <div className="portal-student-card">
                <div className="portal-student-row">
                  <div>
                    <div className="portal-student-label">Primer año de servicio</div>
                    <div className="portal-student-field">2000</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Título profesional</div>
                    <div className="portal-student-field">....................</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Carreras</div>
                    <div className="portal-student-field">Ingeniería en computación</div>
                  </div>
                  <div>
                    <div className="portal-student-label">Departamento</div>
                    <div className="portal-student-field">....................</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
    )
  }

  return (
    <main className="portal-page">
      <div className="portal-top">
        <img src="/assets/images/logo_vertical.png" alt="Logo ULS" className="portal-top__logo" />
      </div>

      <section className={`portal-card ${view === 'role' ? 'portal-card--role' : ''}`} aria-label="Portal de inicio de sesión">
        <button
          className="portal-link portal-link--top"
          type="button"
          onClick={() => {
            if (history.replaceState) {
              history.replaceState(null, '', '#inicio')
            } else {
              window.location.hash = '#inicio'
            }
            window.dispatchEvent(new HashChangeEvent('hashchange'))
          }}
        >
          Volver al inicio
        </button>
        <h1 className="portal-card__title">Portal de ingenieria civil en<br />computacion e informatica</h1>

        {showTabs ? (
          <div className="portal-tabs" role="tablist" aria-label="Acceso al portal">
            <button
              className={`portal-tab ${isLoginActive ? 'is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={isLoginActive ? 'true' : 'false'}
              onClick={() => setView('login')}
            >
              Iniciar Sesión
            </button>
            <button
              className={`portal-tab ${view === 'register' ? 'is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={view === 'register' ? 'true' : 'false'}
              onClick={() => setView('register')}
            >
              Registrarse
            </button>
          </div>
        ) : null}

        {view === 'login' ? (
          <div className="portal-view">
            <p className="portal-subtitle">Acceso {selectedRole || 'usuario'}</p>
            <label className="portal-label" htmlFor="login-email">Correo institucional</label>
            <input
              className="portal-input"
              id="login-email"
              type="email"
              placeholder="user@correoinstitucional.cl"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <label className="portal-label" htmlFor="login-pass">Contraseña</label>
            <input
              className="portal-input"
              id="login-pass"
              type="password"
              placeholder="••••"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
            />

            <p className={`portal-error ${loginError ? '' : 'is-hidden'}`}>Correo y/o Contraseña no coinciden</p>

            <button className="portal-submit" type="button" onClick={handleLogin}>INGRESAR</button>
            <button className="portal-link" type="button" onClick={() => setView('recover-rut')}>Recuperar Contraseña</button>
            <button className="portal-link" type="button" onClick={() => setView('role')}>Cambiar rol</button>
          </div>
        ) : null}

        {view === 'register' ? (
          <div className="portal-view">
            <label className="portal-label" htmlFor="reg-name">Nombre</label>
            <input className="portal-input" id="reg-name" type="text" placeholder="Juan Pérez" />

            <label className="portal-label" htmlFor="reg-email">Correo institucional</label>
            <input className="portal-input" id="reg-email" type="email" placeholder="user@correoinstitucional.cl" />

            <label className="portal-label" htmlFor="reg-pass">Contraseña</label>
            <input className="portal-input" id="reg-pass" type="password" placeholder="••••" />

            <p className="portal-error is-hidden">Por favor, completa los campos de forma válida</p>

            <div className="portal-help">
              <p>Requisitos Contraseña:</p>
              <ul>
                <li>Mínimo 8 caracteres</li>
                <li>Debe incluir al menos 1 número</li>
                <li>Debe incluir al menos 1 carácter especial (@, #, _)</li>
                <li>Debe incluir al menos 1 mayúscula</li>
              </ul>
            </div>

            <button className="portal-submit" type="button" onClick={() => setView('success')}>Crear Cuenta</button>
          </div>
        ) : null}

        {view === 'success' ? (
          <div className="portal-view">
            <p className="portal-success">¡Registro Exitoso!</p>
            <button className="portal-submit portal-submit--small" type="button" onClick={() => setView('login')}>Iniciar Sesión</button>
          </div>
        ) : null}

        {view === 'recover-rut' ? (
          <div className="portal-view">
            <p className="portal-subtitle">Recuperación de contraseña</p>
            <label className="portal-label" htmlFor="recover-rut">Por favor ingrese su RUT o numero de pasaporte extranjero:</label>
            <input className="portal-input" id="recover-rut" type="text" placeholder="11.111.111-1" />
            <button className="portal-submit portal-submit--small" type="button" onClick={() => setView('recover-email')}>Siguiente</button>
          </div>
        ) : null}

        {view === 'recover-email' ? (
          <div className="portal-view">
            <p className="portal-subtitle">Recuperación de contraseña</p>
            <label className="portal-label" htmlFor="recover-email">Por favor ingrese su Correo Institucional:</label>
            <input className="portal-input" id="recover-email" type="email" placeholder="user@correoinstitucional.cl" />
            <button className="portal-submit portal-submit--small" type="button" onClick={() => setView('login')}>Siguiente</button>
          </div>
        ) : null}

        {view === 'role' ? (
          <div className="portal-role">
            <div className="portal-role__actions">
              <button className="portal-role__btn" type="button" onClick={() => handleSelectRole('estudiante')}>Estudiante</button>
              <button className="portal-role__btn" type="button" onClick={() => handleSelectRole('academico')}>Académico</button>
              <button className="portal-role__btn" type="button" onClick={() => handleSelectRole('administrador')}>Administrador</button>
            </div>
          </div>
        ) : null}

        {view === 'role-home' ? (
          <div className="portal-role portal-role--single">
            <p className="portal-subtitle">Acceso {roleLabel}</p>
            <div className="portal-role__actions">
              <button className="portal-role__btn is-active" type="button">{roleLabel}</button>
            </div>
            <div className="portal-role__footer">
              <button className="portal-role__link" type="button" onClick={() => setView('role')}>Cambiar rol</button>
              <button className="portal-role__link" type="button" onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

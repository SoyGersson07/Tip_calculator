/**
 * AppContext.js — Contexto React global: idioma, tema, sesión local e hidratación inicial.
 */
// React y hooks: estado, memoización de callbacks, efecto al montar.
import React, { createContext, useState, useCallback, useEffect } from "react";
// Funciones de lectura/escritura en AsyncStorage vía settingsStorage.
import {
  obtenerIdioma,
  guardarIdioma,
  obtenerTemaOscuro,
  guardarTemaOscuro,
} from "../storage/settingsStorage";
import {
  obtenerUsuarioSesion,
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
} from "../storage/authStorage";
import { migrarHistorialLegacySiCorresponde } from "../storage/historialStorage";

// Contexto sin valor por defecto tipado (se rellena en el Provider).
export const AppContext = createContext();

/**
 * Proveedor: carga idioma, tema y sesión al iniciar; expone auth y persistencia.
 */
export function AppProvider({ children }) {
  // Idioma activo de la UI (código corto, ej. "es").
  const [idioma, setIdiomaState] = useState("es");
  // Booleano: true = tema oscuro aplicado en getColors().
  const [temaOscuro, setTemaOscuroState] = useState(false);
  // Usuario con sesión local { id, username } o null.
  const [usuario, setUsuario] = useState(null);
  const [authCargando, setAuthCargando] = useState(true);

  // Al montar el proveedor, hidrata estado desde almacenamiento local.
  useEffect(() => {
    (async () => {
      try {
        const [idiomaGuardado, temaGuardado, sesion] = await Promise.all([
          obtenerIdioma(),
          obtenerTemaOscuro(),
          obtenerUsuarioSesion(),
        ]);
        setIdiomaState(idiomaGuardado);
        setTemaOscuroState(temaGuardado);
        if (sesion) await migrarHistorialLegacySiCorresponde(sesion.id);
        setUsuario(sesion);
      } catch (error) {
        console.error("Error cargando configuración:", error);
      } finally {
        setAuthCargando(false);
      }
    })();
  }, []);

  // Cambia idioma en memoria y lo persiste en AsyncStorage.
  const cambiarIdioma = useCallback(async (nuevoIdioma) => {
    try {
      setIdiomaState(nuevoIdioma);
      await guardarIdioma(nuevoIdioma);
    } catch (error) {
      console.error("Error guardando idioma:", error);
    }
  }, []);

  // Cambia tema en memoria y lo persiste.
  const cambiarTema = useCallback(async (nuevoTema) => {
    try {
      setTemaOscuroState(nuevoTema);
      await guardarTemaOscuro(nuevoTema);
    } catch (error) {
      console.error("Error guardando tema:", error);
    }
  }, []);

  const authRegistrar = useCallback(async (name, pwd, pwd2) => {
    if (pwd !== pwd2) {
      return { ok: false, code: "AUTH_PASSWORD_MISMATCH" };
    }
    const r = await registrarUsuario(name, pwd);
    if (!r.ok) return r;
    await migrarHistorialLegacySiCorresponde(r.user.id);
    setUsuario(r.user);
    return { ok: true, user: r.user };
  }, []);

  const authIniciarSesion = useCallback(async (name, pwd) => {
    const r = await iniciarSesion(name, pwd);
    if (!r.ok) return r;
    await migrarHistorialLegacySiCorresponde(r.user.id);
    setUsuario(r.user);
    return { ok: true, user: r.user };
  }, []);

  const authCerrarSesion = useCallback(async () => {
    await cerrarSesion();
    setUsuario(null);
  }, []);

  // Objeto expuesto a los consumidores del contexto.
  const value = {
    idioma,
    temaOscuro,
    cambiarIdioma,
    cambiarTema,
    usuario,
    authCargando,
    authRegistrar,
    authIniciarSesion,
    authCerrarSesion,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook obligatorio para leer el contexto; lanza si se usa fuera del Provider.
 */
export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de AppProvider");
  }
  return context;
}

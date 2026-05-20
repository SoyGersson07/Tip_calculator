/**
 * authStorage.js — Cuentas locales (usuario + contraseña con hash SHA-256), sesión en AsyncStorage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const KEY_USERS = "local_auth_users_v1";
const KEY_SESSION = "local_auth_session_user_id_v1";

function normalizeUsernameKey(name) {
  return name.trim().toLowerCase();
}

async function readUsers() {
  const raw = await AsyncStorage.getItem(KEY_USERS);
  return raw ? JSON.parse(raw) : [];
}

async function digest(val) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, val);
}

async function hashPassword(password, salt) {
  return digest(`${salt}:${password}`);
}

async function saltNew() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Usuario actual sin datos sensibles, o null. */
export async function obtenerUsuarioSesion() {
  const uid = await AsyncStorage.getItem(KEY_SESSION);
  if (!uid) return null;
  const users = await readUsers();
  const u = users.find((x) => x.id === uid);
  if (!u) {
    await AsyncStorage.removeItem(KEY_SESSION);
    return null;
  }
  return { id: u.id, username: u.username };
}

/**
 * Registro local. Persiste usuarios y fija sesión si va bien.
 * @returns {{ ok: true, user: { id, username } } | { ok: false, code: string }}
 */
export async function registrarUsuario(usernameRaw, password) {
  const username = usernameRaw.trim();
  const key = normalizeUsernameKey(username);
  if (username.length < 2 || username.length > 28) {
    return { ok: false, code: "AUTH_INVALID_USERNAME" };
  }
  if (password.length < 4) {
    return { ok: false, code: "AUTH_WEAK_PASSWORD" };
  }

  const users = await readUsers();
  if (users.some((u) => u.usernameKey === key)) {
    return { ok: false, code: "AUTH_USER_EXISTS" };
  }

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const salt = await saltNew();
  const passwordHash = await hashPassword(password, salt);

  users.push({
    id,
    username,
    usernameKey: key,
    salt,
    passwordHash,
  });
  await AsyncStorage.setItem(KEY_USERS, JSON.stringify(users));

  await AsyncStorage.setItem(KEY_SESSION, id);

  return { ok: true, user: { id, username } };
}

/**
 * Login local.
 */
export async function iniciarSesion(usernameRaw, password) {
  const key = normalizeUsernameKey(usernameRaw);
  if (!key || password.length < 1) {
    return { ok: false, code: "AUTH_CREDENTIALS" };
  }

  const users = await readUsers();
  const u = users.find((x) => x.usernameKey === key);
  if (!u) {
    return { ok: false, code: "AUTH_CREDENTIALS" };
  }

  const h = await hashPassword(password, u.salt);
  if (h !== u.passwordHash) {
    return { ok: false, code: "AUTH_CREDENTIALS" };
  }

  await AsyncStorage.setItem(KEY_SESSION, u.id);
  return { ok: true, user: { id: u.id, username: u.username } };
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(KEY_SESSION);
}

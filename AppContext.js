import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const MONEDAS = [
  { codigo: "USD", simbolo: "$",  nombre: "Dólar estadounidense" },
  { codigo: "EUR", simbolo: "€",  nombre: "Euro" },
  { codigo: "GBP", simbolo: "£",  nombre: "Libra esterlina" },
  { codigo: "JPY", simbolo: "¥",  nombre: "Yen japonés" },
  { codigo: "MXN", simbolo: "$",  nombre: "Peso mexicano" },
  { codigo: "COP", simbolo: "$",  nombre: "Peso colombiano" },
  { codigo: "ARS", simbolo: "$",  nombre: "Peso argentino" },
  { codigo: "CLP", simbolo: "$",  nombre: "Peso chileno" },
  { codigo: "BRL", simbolo: "R$", nombre: "Real brasileño" },
  { codigo: "CAD", simbolo: "$",  nombre: "Dólar canadiense" },
  { codigo: "AUD", simbolo: "$",  nombre: "Dólar australiano" },
  { codigo: "CHF", simbolo: "Fr", nombre: "Franco suizo" },
  { codigo: "CNY", simbolo: "¥",  nombre: "Yuan chino" },
  { codigo: "INR", simbolo: "₹",  nombre: "Rupia india" },
  { codigo: "KRW", simbolo: "₩",  nombre: "Won surcoreano" },
  { codigo: "PEN", simbolo: "S/", nombre: "Sol peruano" },
  { codigo: "UYU", simbolo: "$",  nombre: "Peso uruguayo" },
  { codigo: "BOB", simbolo: "Bs", nombre: "Boliviano" },
  { codigo: "PYG", simbolo: "₲",  nombre: "Guaraní paraguayo" },
  { codigo: "VES", simbolo: "Bs", nombre: "Bolívar venezolano" },
];

// ── Paletas de colores ────────────────────────────────────────────────────
export const COLORES_CLARO = {
  primary:      "#E2725B",
  primaryLight: "#FDF0ED",
  primaryBg:    "#FAE8E3",
  bgMain:       "#F6F4F0",
  bgCard:       "#FFFFFF",
  white:        "#FFFFFF",
  darkText:     "#1C1C1E",
  gray500:      "#8E8E93",
  gray200:      "#E5E5EA",
  gray100:      "#F2F2F7",
  headerBg:     "#FFFFFF",
  tabBarBg:     "#FFFFFF",
  tabBarBorder: "#E5E5EA",
};

export const COLORES_OSCURO = {
  primary:      "#E2725B",
  primaryLight: "#3A2220",
  primaryBg:    "#3A2220",
  bgMain:       "#121212",
  bgCard:       "#1E1E1E",
  white:        "#1E1E1E",
  darkText:     "#F2F2F7",
  gray500:      "#AEAEB2",
  gray200:      "#3A3A3C",
  gray100:      "#2C2C2E",
  headerBg:     "#1C1C1E",
  tabBarBg:     "#1C1C1E",
  tabBarBorder: "#3A3A3C",
};

export function AppProvider({ children }) {
  const [cuentas, setCuentas]     = useState([]);
  const [moneda, setMoneda]       = useState(MONEDAS[0]);
  const [temaOscuro, setTemaOscuro] = useState(false);

  const C = temaOscuro ? COLORES_OSCURO : COLORES_CLARO;

  function agregarCuenta(cuenta) {
    setCuentas((prev) => [cuenta, ...prev]);
  }

  return (
    <AppContext.Provider value={{ cuentas, agregarCuenta, moneda, setMoneda, temaOscuro, setTemaOscuro, C }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
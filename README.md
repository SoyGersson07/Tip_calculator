# PropinaPlus

## Descripción

**PropinaPlus** es una aplicación móvil diseñada para calcular propinas de forma rápida, equitativa y transparente. Perfecta para dividir cuentas en restaurantes entre amigos, permitiendo:

- ✅ Agregar múltiples participantes
- ✅ Registrar el consumo individual de cada persona
- ✅ Excluir invitados (cuyo consumo será repartido entre los demás)
- ✅ Calcular automáticamente la propina por persona
- ✅ Ver un desglose detallado de quién paga qué
- ✅ Guardar historial de cuentas
- ✅ Ajustes de la app
- ✅ Compartir el resultado por WhatsApp, email, etc.
- ✅ Ruleta rusa especial

**Tecnología:** 
React Native + Expo
JavaScript
StyleSheet API

---

## Integrantes

- Jonathan Rosas ID 408094
- Gersson Valencia ID 408158

---

## Instalación y Uso

### Requisitos previos
- Node.js y npm instalados
- Expo CLI (se instala con las dependencias)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <URL-del-repositorio>
cd Tip_calculator
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar la aplicación**
```bash
npx expo start
```

4. **Abrir en el dispositivo**
   - **iOS**: Presiona `i` en la terminal
   - **Android**: Presiona `a` en la terminal
   - **Web**: Presiona `w` en la terminal
   - **Escanear QR**: Abre la app Expo Go en tu móvil y escanea el código QR

---

## Características principales

### 1. **Pantalla de Inicio**
- Saludo personalizado
- Botón para crear una nueva cuenta
- Estadísticas del mes (total gastado y propinas)
- Historial de cuentas recientes (próximamente)

### 2. **Calculadora**
- Agregar participantes con nombre y consumo
- Cambiar consumos en tiempo real
- Opción para excluir del pago (invitados)
- Resumen automático de totales
- Detalles de cómo se distribuye la propina

### 3. **Desglose**
- Vista detallada de lo que paga cada persona
- Información diferenciada para invitados
- Tarjeta resumen con el total final
- Botón para compartir el resultado

---

## Estructura del proyecto

```
Tip_calculator/
├── App.js                 # Configuración principal y navegación
├── screens/
│   ├── HomeScreen.js      # Pantalla de inicio
│   ├── CalculatorScreen.js # Pantalla de calculadora
│   └── DesglosScreen.js   # Pantalla de desglose
├── assets/               # Imágenes y recursos
├── package.json          # Dependencias
└── README.md            # Este archivo
```

---

## Tecnologías utilizadas

- **React Native** - Framework para aplicaciones móviles
- **Expo** - Plataforma para desarrollar apps React Native
- **React Navigation** - Navegación entre pantallas
- **React Hooks** - Manejo de estado (useState)

## Pantallas

Pantalla 1 — Principal

<img width="400" height="880" alt="image" src="https://github.com/user-attachments/assets/3a48a381-a007-4708-8724-48d5b087da9d" />


Pantalla 2 — Calculadora

<img width="416" height="886" alt="image" src="https://github.com/user-attachments/assets/5068f48e-ef54-41ae-9dcd-0ee1a322d5e4" />

Pantalla 3 — Desgloce

<img width="408" height="890" alt="image" src="https://github.com/user-attachments/assets/9d1fe275-01d5-463b-adfa-0a05df5e1874" />


## Implementaciones futuras
- Impletacion de historial
- Ajuste y modificacion a la app
- Ruleta rusa para una persona pague toda la cuenta

## Conclusion
En conclusión, PropinaPlus es una aplicación móvil que busca facilitar el cálculo y 
la división de cuentas en restaurantes de manera rápida, clara y justa entre varias personas. 
A través de una interfaz sencilla y funcionalidades como el registro de consumos individuales, 
la exclusión de invitados y el desglose detallado de pagos, la aplicación permite evitar confusiones al momento de repartir una cuenta 
y calcular la propina correspondiente.

El desarrollo del proyecto utilizando React Native y Expo permitió crear una solución multiplataforma eficiente, 
aplicando conceptos de desarrollo móvil, manejo de estados y organización de componentes. 
Además, el trabajo colaborativo permitió integrar distintas ideas y funcionalidades que mejoran la experiencia del usuario.

Finalmente, PropinaPlus establece una base sólida para futuras mejoras, como la implementación de un historial de cuentas, 
optimización de la interfaz y nuevas funciones interactivas. 
Esto demuestra que el proyecto puede seguir evolucionando para ofrecer una herramienta cada vez más útil y completa para los usuarios.







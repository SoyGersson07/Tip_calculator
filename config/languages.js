/**
 * languages.js — Tabla de textos por idioma para Ajustes y otras pantallas que usan getAllTranslations().
 *
 * Estructura: translations.es y translations.en son objetos planos "clave" → "texto visible".
 * Las líneas "// NombrePantalla" agrupan claves usadas en esa parte de la app.
 * Cada par "clave": "valor" define un literal de interfaz; la clave es estable (no traducir la clave).
 */
const translations = {
  es: {
    // AuthScreen / cuenta local
    "auth_sub_login": "Inicia sesión para ver tu historial en este dispositivo.",
    "auth_sub_register": "Crea una cuenta solo en este teléfono; tus datos no salen del dispositivo.",
    "auth_username": "Nombre de usuario",
    "auth_password": "Contraseña",
    "auth_password_repeat": "Repetir contraseña",
    "auth_btn_login": "Entrar",
    "auth_btn_register": "Crear cuenta",
    "auth_go_register": "¿No tienes cuenta? Regístrate",
    "auth_go_login": "¿Ya tienes cuenta? Inicia sesión",
    "auth_local_hint": "La cuenta es local: si desinstalas la app o cambias de móvil, no se recuperará en la nube.",
    "auth_invalid_username": "Usa entre 2 y 28 caracteres en el nombre.",
    "auth_weak_password": "La contraseña debe tener al menos 4 caracteres.",
    "auth_user_exists": "Ese usuario ya existe en este dispositivo.",
    "auth_credentials": "Usuario o contraseña incorrectos.",
    "auth_password_mismatch": "Las contraseñas no coinciden.",
    "auth_error_generic": "Algo salió mal. Inténtalo de nuevo.",
    "auth_section_account": "CUENTA",
    "auth_logged_as": "Sesión iniciada como",
    "auth_logout": "Cerrar sesión",
    "auth_logout_sub": "Tus datos se guardan en este dispositivo",
    "auth_logout_confirm": "¿Cerrar sesión? Otro usuario podrá entrar desde aquí.",
    "generic_cancel": "Cancelar",

    // HomeScreen
    "hello_named": "¡Hola, {{name}}!",
    "hello_user": "¡Hola, Usuario!",
    "hello_subtitle": "Calcula tus propinas de forma rápida y equitativa.",
    "new_account": "Nueva Cuenta",
    "russian_roulette": "Ruleta Rusa",
    "total_month": "Total Mes",
    "tips": "Propinas",
    "recent_history": "Historial Reciente",
    "no_accounts": "Sin cuentas aún",
    "no_accounts_sub": 'Toca "Nueva Cuenta" para empezar a calcular',

    // CalculatorScreen
    "add_participants": "Agregar Participantes",
    "participant_name": "Nombre del participante",
    "consumption": "Consumo",
    "add": "Agregar",
    "guest": "Invitado",
    "active": "Activos",
    "excluded": "Excluidos",
    "total_consumption": "Total de Consumo",
    "guests_consumption": "Consumo de Invitados",
    "tip_per_person": "Propina por Persona",
    "breakdown": "Desglose",
    "custom_tip": "Propina Personalizada",
    "subtotal": "Subtotal",
    "total_to_pay": "Total a Pagar",

    // DesglosScreen
    "participants": "Participantes",
    "person": "Persona",
    "people": "Personas",
    "share_result": "Compartir Resultado",
    "original_amount": "Monto Original",
    "tip_percentage": "Porcentaje Propina",
    "total": "TOTAL",
    "per_person": "Por persona",

    // ShareModal
    "share_result_title": "Compartir Resultado",
    "preview": "Vista Previa",
    "copied": "¡Copiado!",
    "copied_clipboard": "El texto se copió al portapapeles",
    "whatsapp_not_installed": "WhatsApp no instalado",
    "whatsapp_install": "Por favor instala WhatsApp para compartir por este medio",
    "error": "Error",
    "error_whatsapp": "No se pudo abrir WhatsApp",
    "error_email": "No se pudo abrir el cliente de email",
    "error_share": "No se pudo compartir",
    "breakdown_title": "Desglose de Cuenta",

    // AjustesScreen
    "settings": "Ajustes",
    "calculation_preferences": "PREFERENCIAS DE CÁLCULO",
    "default_currency": "Moneda predeterminada",
    "select_local_symbol": "Selecciona el símbolo local",
    "automatic_rounding": "Redondeo automático",
    "round_to_nearest": "Ajustar al entero más cercano",
    "customization": "PERSONALIZACIÓN",
    "dark_theme": "Tema Oscuro",
    "change_visual_appearance": "Cambiar la apariencia visual",
    "language": "Idioma",
    "native_language": "App en tu lengua nativa",
    "support": "SOPORTE",
    "help_questions": "Ayuda y Preguntas",
    "support_center": "Centro de soporte al usuario",
    "contact_us": "Contáctanos",
    "report_error": "Reporta un error o sugiere algo",
    "select_currency": "Seleccionar Moneda",

    // RuletaScreen
    "russian_roulette_title": "Ruleta Rusa",
    "add_participants_title": "Agregar Participantes",
    "participants_count": "Participantes",
    "the_roulette": "La Ruleta",
    "spin_roulette": "GIRAR RULETA",
    "spinning": "Girando...",
    "winner": "¡Ganador!",
    "has_to_pay": "¡Tiene que pagar la cuenta!",
    "new_game": "Juego Nuevo",
    "no_participants": "Sin participantes",
    "add_names_above": "Agrega nombres arriba para comenzar",
    "need_two_participants": "Necesitas al menos 2 participantes",
    "participant_exists": "Este participante ya existe",

    // TipScreen
    "configure_tip": "Configurar Propina",
    "consumption_subtotal": "SUBTOTAL DE CONSUMO",
    "tip_value": "Valor de la Propina",
    "equals_percentage": "Equivale al",
    "of_total": "% del total",

    // Historial
    "date": "Fecha",
    "amount": "Monto",
    "history_delete": "Eliminar cuenta",
    "history_delete_confirm": "¿Eliminar esta cuenta del historial? Esta acción no se puede deshacer.",
    "history_delete_error": "No se pudo eliminar. Inténtalo de nuevo.",

    // Emails
    "email_support": "soporte@propina-plus.com",
    "email_suggestions": "sugerencias@propina-plus.com",
  },
  en: {
    // Auth / local account
    "auth_sub_login": "Sign in to view your bill history on this device.",
    "auth_sub_register": "Create an account stored only on this phone; nothing is sent to the cloud.",
    "auth_username": "Username",
    "auth_password": "Password",
    "auth_password_repeat": "Confirm password",
    "auth_btn_login": "Sign in",
    "auth_btn_register": "Create account",
    "auth_go_register": "No account? Register",
    "auth_go_login": "Already have an account? Sign in",
    "auth_local_hint": "This account is local: reinstalling or changing phones will not restore it from the cloud.",
    "auth_invalid_username": "Use 2–28 characters for the username.",
    "auth_weak_password": "Password must be at least 4 characters.",
    "auth_user_exists": "That username already exists on this device.",
    "auth_credentials": "Wrong username or password.",
    "auth_password_mismatch": "Passwords do not match.",
    "auth_error_generic": "Something went wrong. Try again.",
    "auth_section_account": "ACCOUNT",
    "auth_logged_as": "Signed in as",
    "auth_logout": "Log out",
    "auth_logout_sub": "Your data stays on this device",
    "auth_logout_confirm": "Log out? Another user can sign in from here.",
    "generic_cancel": "Cancel",

    // HomeScreen
    "hello_named": "Hello, {{name}}!",
    "hello_user": "Hello, User!",
    "hello_subtitle": "Calculate your tips quickly and fairly.",
    "new_account": "New Account",
    "russian_roulette": "Russian Roulette",
    "total_month": "Month Total",
    "tips": "Tips",
    "recent_history": "Recent History",
    "no_accounts": "No accounts yet",
    "no_accounts_sub": 'Tap "New Account" to start calculating',

    // CalculatorScreen
    "add_participants": "Add Participants",
    "participant_name": "Participant Name",
    "consumption": "Consumption",
    "add": "Add",
    "guest": "Guest",
    "active": "Active",
    "excluded": "Excluded",
    "total_consumption": "Total Consumption",
    "guests_consumption": "Guests Consumption",
    "tip_per_person": "Tip per Person",
    "breakdown": "Breakdown",
    "custom_tip": "Custom Tip",
    "subtotal": "Subtotal",
    "total_to_pay": "Total to Pay",

    // DesglosScreen
    "participants": "Participants",
    "person": "Person",
    "people": "People",
    "share_result": "Share Result",
    "original_amount": "Original Amount",
    "tip_percentage": "Tip Percentage",
    "total": "TOTAL",
    "per_person": "Per person",

    // ShareModal
    "share_result_title": "Share Result",
    "preview": "Preview",
    "copied": "Copied!",
    "copied_clipboard": "Text copied to clipboard",
    "whatsapp_not_installed": "WhatsApp not installed",
    "whatsapp_install": "Please install WhatsApp to share",
    "error": "Error",
    "error_whatsapp": "Could not open WhatsApp",
    "error_email": "Could not open email client",
    "error_share": "Could not share",
    "breakdown_title": "Account Breakdown",

    // AjustesScreen
    "settings": "Settings",
    "calculation_preferences": "CALCULATION PREFERENCES",
    "default_currency": "Default Currency",
    "select_local_symbol": "Select local symbol",
    "automatic_rounding": "Automatic Rounding",
    "round_to_nearest": "Round to nearest integer",
    "customization": "CUSTOMIZATION",
    "dark_theme": "Dark Theme",
    "change_visual_appearance": "Change visual appearance",
    "language": "Language",
    "native_language": "App in your native language",
    "support": "SUPPORT",
    "help_questions": "Help & Questions",
    "support_center": "User support center",
    "contact_us": "Contact Us",
    "report_error": "Report an error or suggest something",
    "select_currency": "Select Currency",

    // RuletaScreen
    "russian_roulette_title": "Russian Roulette",
    "add_participants_title": "Add Participants",
    "participants_count": "Participants",
    "the_roulette": "The Roulette",
    "spin_roulette": "SPIN ROULETTE",
    "spinning": "Spinning...",
    "winner": "Winner!",
    "has_to_pay": "Has to pay the bill!",
    "new_game": "New Game",
    "no_participants": "No participants",
    "add_names_above": "Add names above to begin",
    "need_two_participants": "You need at least 2 participants",
    "participant_exists": "This participant already exists",

    // TipScreen
    "configure_tip": "Configure Tip",
    "consumption_subtotal": "CONSUMPTION SUBTOTAL",
    "tip_value": "Tip Value",
    "equals_percentage": "Equals",
    "of_total": "% of total",

    // Historial
    "date": "Date",
    "amount": "Amount",
    "history_delete": "Delete entry",
    "history_delete_confirm": "Remove this bill from history? This cannot be undone.",
    "history_delete_error": "Could not delete. Try again.",

    // Emails
    "email_support": "support@propina-plus.com",
    "email_suggestions": "suggestions@propina-plus.com",
  },
};

/**
 * Devuelve el objeto completo de textos para un idioma; si no existe, cae a español.
 * @param {string} language — código ("es", "en", …).
 */
export const getAllTranslations = (language = "es") => {
  return translations[language] || translations["es"];
};

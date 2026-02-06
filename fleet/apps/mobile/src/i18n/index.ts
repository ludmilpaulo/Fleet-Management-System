import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = '@fleetia-language';

const resources = {
  en: {
    translation: {
      language: {
        en: 'English',
        pt: 'Portuguese',
        es: 'Spanish',
        fr: 'French',
      },
      tabs: {
        dashboard: 'Home',
        vehicles: 'Vehicles',
        inspections: 'Inspections',
        camera: 'Camera',
        keys: 'Keys',
        location: 'Location',
        notifications: 'Alerts',
        settings: 'Settings',
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        done: 'Done',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        refresh: 'Refresh',
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account?',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        overview: 'Overview',
        vehicles: 'Vehicles',
        drivers: 'Drivers',
        inspections: 'Inspections',
        maintenance: 'Maintenance',
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        notifications: 'Notifications',
        account: 'Account',
        privacy: 'Privacy',
        about: 'About',
        preferences: 'Manage your preferences',
        failedToChangeLanguage: 'Failed to change language',
      },
      inspections: {
        title: 'Inspections',
        newInspection: 'New Inspection',
        inspectionDetails: 'Inspection Details',
        inspectionType: 'Inspection Type',
        scheduledDate: 'Scheduled Date',
        completedDate: 'Completed Date',
        status: 'Status',
        pending: 'Pending',
        completed: 'Completed',
        failed: 'Failed',
        notes: 'Notes',
        takePhoto: 'Take Photo',
        addNote: 'Add Note',
        submit: 'Submit Inspection',
      },
      vehicles: {
        title: 'Vehicles',
        addVehicle: 'Add Vehicle',
        noVehicles: 'No vehicles found',
        vehicleDetails: 'Vehicle Details',
        licensePlate: 'License Plate',
        make: 'Make',
        model: 'Model',
        year: 'Year',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        maintenance: 'In Maintenance',
      },
      drivers: {
        title: 'Drivers',
        addDriver: 'Add Driver',
        driverDetails: 'Driver Details',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        licenseNumber: 'License Number',
        status: 'Status',
      },
      notifications: {
        title: 'Notifications',
        noNotifications: 'No notifications',
        markAsRead: 'Mark as Read',
        markAllAsRead: 'Mark All as Read',
        delete: 'Delete',
      },
      camera: {
        title: 'Camera',
        takePhoto: 'Take Photo',
        retake: 'Retake',
        usePhoto: 'Use Photo',
        permissionDenied: 'Camera permission denied',
        requestPermission: 'Please grant camera permission',
      },
      location: {
        title: 'Location',
        currentLocation: 'Current Location',
        permissionDenied: 'Location permission denied',
        requestPermission: 'Please grant location permission',
        tracking: 'Location Tracking',
      },
      keys: {
        title: 'Keys',
        scanKey: 'Scan Key',
        keyDetails: 'Key Details',
        assignKey: 'Assign Key',
        returnKey: 'Return Key',
      },
    },
  },
  pt: {
    translation: {
      language: {
        en: 'Inglês',
        pt: 'Português',
        es: 'Espanhol',
        fr: 'Francês',
      },
      tabs: {
        dashboard: 'Início',
        vehicles: 'Veículos',
        inspections: 'Inspeções',
        camera: 'Câmera',
        keys: 'Chaves',
        location: 'Localização',
        notifications: 'Alertas',
        settings: 'Configurações',
      },
      common: {
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        cancel: 'Cancelar',
        save: 'Salvar',
        delete: 'Excluir',
        edit: 'Editar',
        back: 'Voltar',
        next: 'Próximo',
        done: 'Concluído',
        search: 'Pesquisar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        refresh: 'Atualizar',
      },
      auth: {
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        signOut: 'Sair',
        email: 'E-mail',
        password: 'Senha',
        forgotPassword: 'Esqueceu a senha?',
        rememberMe: 'Lembrar-me',
        createAccount: 'Criar conta',
        alreadyHaveAccount: 'Já tem uma conta?',
      },
      dashboard: {
        title: 'Painel',
        welcome: 'Bem-vindo',
        overview: 'Visão geral',
        vehicles: 'Veículos',
        drivers: 'Motoristas',
        inspections: 'Inspeções',
        maintenance: 'Manutenção',
      },
      settings: {
        title: 'Configurações',
        language: 'Idioma',
        notifications: 'Notificações',
        account: 'Conta',
        privacy: 'Privacidade',
        about: 'Sobre',
        preferences: 'Gerencie suas preferências',
        failedToChangeLanguage: 'Falha ao alterar o idioma',
      },
      inspections: {
        title: 'Inspeções',
        newInspection: 'Nova Inspeção',
        inspectionDetails: 'Detalhes da Inspeção',
        inspectionType: 'Tipo de Inspeção',
        scheduledDate: 'Data Agendada',
        completedDate: 'Data de Conclusão',
        status: 'Status',
        pending: 'Pendente',
        completed: 'Concluída',
        failed: 'Falhou',
        notes: 'Observações',
        takePhoto: 'Tirar Foto',
        addNote: 'Adicionar Observação',
        submit: 'Enviar Inspeção',
      },
      vehicles: {
        title: 'Veículos',
        addVehicle: 'Adicionar Veículo',
        vehicleDetails: 'Detalhes do Veículo',
        licensePlate: 'Placa',
        make: 'Marca',
        model: 'Modelo',
        year: 'Ano',
        status: 'Status',
        active: 'Ativo',
        inactive: 'Inativo',
        maintenance: 'Em Manutenção',
      },
      drivers: {
        title: 'Motoristas',
        addDriver: 'Adicionar Motorista',
        driverDetails: 'Detalhes do Motorista',
        name: 'Nome',
        email: 'E-mail',
        phone: 'Telefone',
        licenseNumber: 'Número da CNH',
        status: 'Status',
      },
      notifications: {
        title: 'Notificações',
        noNotifications: 'Nenhuma notificação',
        markAsRead: 'Marcar como Lida',
        markAllAsRead: 'Marcar Todas como Lidas',
        delete: 'Excluir',
      },
      camera: {
        title: 'Câmera',
        takePhoto: 'Tirar Foto',
        retake: 'Refazer',
        usePhoto: 'Usar Foto',
        permissionDenied: 'Permissão de câmera negada',
        requestPermission: 'Por favor, conceda permissão de câmera',
      },
      location: {
        title: 'Localização',
        currentLocation: 'Localização Atual',
        permissionDenied: 'Permissão de localização negada',
        requestPermission: 'Por favor, conceda permissão de localização',
        tracking: 'Rastreamento de Localização',
      },
      keys: {
        title: 'Chaves',
        scanKey: 'Escanear Chave',
        keyDetails: 'Detalhes da Chave',
        assignKey: 'Atribuir Chave',
        returnKey: 'Devolver Chave',
      },
    },
  },
  es: {
    translation: {
      language: {
        en: 'Inglés',
        pt: 'Portugués',
        es: 'Español',
        fr: 'Francés',
      },
      tabs: {
        dashboard: 'Inicio',
        vehicles: 'Vehículos',
        inspections: 'Inspecciones',
        camera: 'Cámara',
        keys: 'Llaves',
        location: 'Ubicación',
        notifications: 'Alertas',
        settings: 'Ajustes',
      },
      common: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        back: 'Atrás',
        next: 'Siguiente',
        done: 'Hecho',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        refresh: 'Actualizar',
      },
      auth: {
        signIn: 'Iniciar sesión',
        signUp: 'Registrarse',
        signOut: 'Cerrar sesión',
        email: 'Correo electrónico',
        password: 'Contraseña',
        forgotPassword: '¿Olvidaste la contraseña?',
        rememberMe: 'Recordarme',
        createAccount: 'Crear cuenta',
        alreadyHaveAccount: '¿Ya tienes una cuenta?',
      },
      dashboard: {
        title: 'Panel',
        welcome: 'Bienvenido',
        overview: 'Resumen',
        vehicles: 'Vehículos',
        drivers: 'Conductores',
        inspections: 'Inspecciones',
        maintenance: 'Mantenimiento',
      },
      settings: {
        title: 'Ajustes',
        language: 'Idioma',
        notifications: 'Notificaciones',
        account: 'Cuenta',
        privacy: 'Privacidad',
        about: 'Acerca de',
        preferences: 'Gestiona tus preferencias',
        failedToChangeLanguage: 'Error al cambiar el idioma',
      },
      inspections: {
        title: 'Inspecciones',
        newInspection: 'Nueva Inspección',
        inspectionDetails: 'Detalles de la Inspección',
        inspectionType: 'Tipo de Inspección',
        scheduledDate: 'Fecha Programada',
        completedDate: 'Fecha de Finalización',
        status: 'Estado',
        pending: 'Pendiente',
        completed: 'Completada',
        failed: 'Fallida',
        notes: 'Notas',
        takePhoto: 'Tomar Foto',
        addNote: 'Agregar Nota',
        submit: 'Enviar Inspección',
      },
      vehicles: {
        title: 'Vehículos',
        addVehicle: 'Agregar Vehículo',
        noVehicles: 'No se encontraron vehículos',
        vehicleDetails: 'Detalles del Vehículo',
        licensePlate: 'Placa',
        make: 'Marca',
        model: 'Modelo',
        year: 'Año',
        status: 'Estado',
        active: 'Activo',
        inactive: 'Inactivo',
        maintenance: 'En Mantenimiento',
      },
      drivers: {
        title: 'Conductores',
        addDriver: 'Agregar Conductor',
        driverDetails: 'Detalles del Conductor',
        name: 'Nombre',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        licenseNumber: 'Número de Licencia',
        status: 'Estado',
      },
      notifications: {
        title: 'Notificaciones',
        noNotifications: 'No hay notificaciones',
        markAsRead: 'Marcar como Leída',
        markAllAsRead: 'Marcar Todas como Leídas',
        delete: 'Eliminar',
      },
      camera: {
        title: 'Cámara',
        takePhoto: 'Tomar Foto',
        retake: 'Volver a Tomar',
        usePhoto: 'Usar Foto',
        permissionDenied: 'Permiso de cámara denegado',
        requestPermission: 'Por favor, concede permiso de cámara',
      },
      location: {
        title: 'Ubicación',
        currentLocation: 'Ubicación Actual',
        permissionDenied: 'Permiso de ubicación denegado',
        requestPermission: 'Por favor, concede permiso de ubicación',
        tracking: 'Rastreo de Ubicación',
      },
      keys: {
        title: 'Llaves',
        scanKey: 'Escanear Llave',
        keyDetails: 'Detalles de la Llave',
        assignKey: 'Asignar Llave',
        returnKey: 'Devolver Llave',
      },
    },
  },
  fr: {
    translation: {
      language: {
        en: 'Anglais',
        pt: 'Portugais',
        es: 'Espagnol',
        fr: 'Français',
      },
      tabs: {
        dashboard: 'Accueil',
        vehicles: 'Véhicules',
        inspections: 'Inspections',
        camera: 'Appareil photo',
        keys: 'Clés',
        location: 'Localisation',
        notifications: 'Alertes',
        settings: 'Paramètres',
      },
      common: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        back: 'Retour',
        next: 'Suivant',
        done: 'Terminé',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        refresh: 'Actualiser',
      },
      auth: {
        signIn: 'Connexion',
        signUp: "S'inscrire",
        signOut: 'Déconnexion',
        email: 'E-mail',
        password: 'Mot de passe',
        forgotPassword: 'Mot de passe oublié ?',
        rememberMe: 'Se souvenir de moi',
        createAccount: 'Créer un compte',
        alreadyHaveAccount: 'Vous avez déjà un compte ?',
      },
      dashboard: {
        title: 'Tableau de bord',
        welcome: 'Bienvenue',
        overview: 'Aperçu',
        vehicles: 'Véhicules',
        drivers: 'Chauffeurs',
        inspections: 'Inspections',
        maintenance: 'Maintenance',
      },
      settings: {
        title: 'Paramètres',
        language: 'Langue',
        notifications: 'Notifications',
        account: 'Compte',
        privacy: 'Confidentialité',
        about: 'À propos',
        preferences: 'Gérez vos préférences',
        failedToChangeLanguage: 'Impossible de changer la langue',
      },
      inspections: {
        title: 'Inspections',
        newInspection: 'Nouvelle inspection',
        inspectionDetails: "Détails de l'inspection",
        inspectionType: "Type d'inspection",
        scheduledDate: 'Date prévue',
        completedDate: 'Date de fin',
        status: 'Statut',
        pending: 'En attente',
        completed: 'Terminée',
        failed: 'Échouée',
        notes: 'Notes',
        takePhoto: 'Prendre une photo',
        addNote: 'Ajouter une note',
        submit: 'Soumettre l\'inspection',
      },
      vehicles: {
        title: 'Véhicules',
        addVehicle: 'Ajouter un véhicule',
        noVehicles: 'Aucun véhicule trouvé',
        vehicleDetails: 'Détails du véhicule',
        licensePlate: 'Plaque',
        make: 'Marque',
        model: 'Modèle',
        year: 'Année',
        status: 'Statut',
        active: 'Actif',
        inactive: 'Inactif',
        maintenance: 'En maintenance',
      },
      drivers: {
        title: 'Chauffeurs',
        addDriver: 'Ajouter un chauffeur',
        driverDetails: 'Détails du chauffeur',
        name: 'Nom',
        email: 'E-mail',
        phone: 'Téléphone',
        licenseNumber: 'Numéro de permis',
        status: 'Statut',
      },
      notifications: {
        title: 'Notifications',
        noNotifications: 'Aucune notification',
        markAsRead: 'Marquer comme lu',
        markAllAsRead: 'Tout marquer comme lu',
        delete: 'Supprimer',
      },
      camera: {
        title: 'Appareil photo',
        takePhoto: 'Prendre une photo',
        retake: 'Reprendre',
        usePhoto: 'Utiliser la photo',
        permissionDenied: 'Permission de la caméra refusée',
        requestPermission: 'Veuillez autoriser l\'accès à la caméra',
      },
      location: {
        title: 'Localisation',
        currentLocation: 'Position actuelle',
        permissionDenied: 'Permission de localisation refusée',
        requestPermission: 'Veuillez autoriser l\'accès à la localisation',
        tracking: 'Suivi de localisation',
      },
      keys: {
        title: 'Clés',
        scanKey: 'Scanner la clé',
        keyDetails: 'Détails de la clé',
        assignKey: 'Attribuer la clé',
        returnKey: 'Rendre la clé',
      },
    },
  },
};

// Supported app languages (device language is used when no preference is saved)
const SUPPORTED_LANGS = ['en', 'pt', 'es', 'fr'];

/** Get device preferred language code (e.g. 'en', 'pt', 'fr') from system. */
function getDeviceLanguageCode(): string {
  try {
    const locales = Localization.getLocales?.() ?? [];
    const lang = locales[0]?.languageCode ?? Localization.locale ?? '';
    const code = (lang && lang.split('-')[0]) || 'en';
    return SUPPORTED_LANGS.includes(code) ? code : 'en';
  } catch {
    const locale = Localization.locale?.split('-')[0] || 'en';
    return SUPPORTED_LANGS.includes(locale) ? locale : 'en';
  }
}

// Initialize language: use system/device language when no saved preference
const initializeLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const deviceLang = getDeviceLanguageCode();

    // Use saved preference if valid; otherwise follow device language (Portuguese → pt, English → en, French → fr, etc.)
    const initialLang =
      savedLang && SUPPORTED_LANGS.includes(savedLang)
        ? savedLang
        : deviceLang;

    if (!savedLang && deviceLang) {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, deviceLang);
    }

    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        resources,
        lng: initialLang,
        fallbackLng: 'en',
        supportedLngs: SUPPORTED_LANGS,
        interpolation: { escapeValue: false },
        returnObjects: true,
      });

      i18n.on('languageChanged', async (lng) => {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      });
    }
  } catch (error) {
    console.error('i18n initialization error:', error);
    if (!i18n.isInitialized) {
      const deviceLang = getDeviceLanguageCode();
      i18n.use(initReactI18next).init({
        resources,
        lng: deviceLang,
        fallbackLng: 'en',
        supportedLngs: SUPPORTED_LANGS,
        interpolation: { escapeValue: false },
        returnObjects: true,
      });
    }
  }
};

// Initialize immediately
initializeLanguage();

export default i18n;


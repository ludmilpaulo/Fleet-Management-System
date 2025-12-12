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
      },
      tabs: {
        dashboard: 'Home',
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
      },
      tabs: {
        dashboard: 'Início',
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
      },
      tabs: {
        dashboard: 'Inicio',
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
};

// Initialize language with persistence
const initializeLanguage = async () => {
  try {
    // Try to load saved language preference
    const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const deviceLang = Localization.locale?.split('-')[0] || 'en';
    const supportedLngs = ['en', 'pt', 'es'];
    
    let initialLang = 'en';
    
    if (savedLang && supportedLngs.includes(savedLang)) {
      initialLang = savedLang;
    } else if (deviceLang && supportedLngs.includes(deviceLang)) {
      initialLang = deviceLang;
      // Save device language as preference
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, deviceLang);
    }

    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        resources,
        lng: initialLang,
        fallbackLng: 'en',
        supportedLngs: ['en', 'pt', 'es'],
        interpolation: { escapeValue: false },
        returnObjects: true,
      });

      // Listen for language changes and persist them
      i18n.on('languageChanged', async (lng) => {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      });
    }
  } catch (error) {
    console.error('i18n initialization error:', error);
    // Fallback initialization
    if (!i18n.isInitialized) {
      const deviceLang = Localization.locale?.split('-')[0] || 'en';
      i18n.use(initReactI18next).init({
        resources,
        lng: ['en', 'pt', 'es'].includes(deviceLang) ? deviceLang : 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'pt', 'es'],
        interpolation: { escapeValue: false },
        returnObjects: true,
      });
    }
  }
};

// Initialize immediately
initializeLanguage();

export default i18n;


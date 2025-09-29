'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'pt' | 'es' | 'en';

type Translations = {
    [key: string]: any;
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
}

const translationsData: { [key in Language]: Translations } = {
  pt: {
    mainHeader: {
        welcomeMessage: 'Boa tarde, [Usuario]. Você está em',
        inicio: 'Início',
        agence: 'Agence',
        projetos: 'Projetos',
        administrativo: 'Administrativo',
        comercial: 'Comercial',
        financeiro: 'Financeiro',
        usuario: 'Usuário',
        sair: 'Sair'
    },
    landingPage: {
        performancePanel: 'Painel de Desempenho',
        login: 'Login',
        welcomeTitle: 'Bem-vindo ao Painel de Desempenho',
        welcomeSubtitle: 'Uma solução completa para visualizar e analisar o desempenho comercial dos seus consultores em tempo real.',
        accessPanel: 'Acessar o Painel',
        footerRights: 'Todos os direitos reservados.'
    },
    loginPage: {
        title: 'Login',
        description: 'Digite seu email e senha para acessar sua conta.',
        password: 'Senha',
        loginButton: 'Entrar',
        noAccount: 'Não tem uma conta?',
        registerLink: 'Registrar-se',
        backToHome: 'Voltar para a página inicial'
    },
    registerPage: {
        title: 'Registrar',
        description: 'Crie sua conta preenchendo os campos abaixo.',
        nameLabel: 'Nome',
        namePlaceholder: 'Seu Nome',
        passwordLabel: 'Senha',
        submitButton: 'Criar Conta',
        loadingButton: 'Criando Conta...',
        alreadyHaveAccount: 'Já tem uma conta?',
        loginLink: 'Login',
        toastSuccessTitle: 'Verificação Necessária',
        toastSuccessDescription: 'Um código de verificação foi enviado para',
        toastErrorTitle: 'Erro',
        toastErrorDescription: 'Houve um problema ao tentar se registrar. Tente novamente.'
    },
    verifyPage: {
        title: 'Verifique sua Conta',
        description: (email: string) => `Enviamos um código de 6 dígitos para ${email}. Insira-o abaixo. (Dica: é 123456)`,
        codeLabel: 'Código de Verificação',
        submitButton: 'Verificar',
        loadingButton: 'Verificando...',
        loadingFallback: 'Carregando...',
        errorTitle: 'Erro',
        errorDescription: 'Não foi possível encontrar o e-mail para verificação.',
        backToRegister: 'Voltar ao Registro',
        toastSuccessTitle: 'Conta Verificada!',
        toastSuccessDescription: 'Sua conta foi verificada com sucesso. Agora você pode iniciar sessão.',
        toastErrorTitle: 'Código Inválido',
        toastErrorDescription: 'O código de verificação é incorreto. Por favor, tente de novo.',
        toastInvalidCode: 'Código incorreto.'
    },
    performancePage: {
        title: 'Performance Comercial',
        filtersTitle: 'Filtros',
        reportTypeLabel: 'Tipo de Relatório',
        byConsultant: 'Por Consultores',
        byClient: 'Por Clientes',
        periodLabel: 'Período',
        datePlaceholder: 'Selecione um período',
        consultantsLabel: 'Consultores',
        clientsLabel: 'Clientes',
        reportButton: 'Relatório',
        loadingButton: 'Buscando...',
        chartButton: 'Gráfico',
        pieButton: 'Pizza',
        loadingData: 'Carregando dados...',
        welcomeMessage: "Por favor, selecione consultores e/ou clientes e um período, e depois clique em 'Relatório' para ver os resultados.",
        noDataMessage: 'Não foram encontrados dados para os filtros selecionados.',
        barChartTitleConsultant: 'Desempenho dos Consultores',
        barChartTitleClient: 'Desempenho por Cliente',
        pieChartTitle: 'Participação na Receita Líquida',
        selectAll: 'Selecionar Todos',
        clearSelection: 'Limpar Seleção',
        table: {
            consultant: 'Consultor',
            client: 'Cliente',
            period: 'Período',
            netRevenue: 'Receita Líquida',
            fixedCost: 'Custo Fixo',
            commission: 'Comissão',
            profit: 'Lucro'
        },
        toastSelectionRequiredTitle: 'Seleção requerida',
        toastSelectionRequiredDescription: 'Por favor, selecione ao menos um consultor ou cliente e um período de datas.',
        toastNoResultsTitle: 'Sem resultados',
        toastNoResultsDescription: 'Não se encontraram dados para os filtros selecionados.',
        toastFetchError: 'Ocorreu um erro ao buscar os dados.',
        toastActionRequiredTitle: 'Ação requerida',
        toastActionRequiredDescription: 'Por favor, gere um relatório com dados antes de mostrar um gráfico.',
        chartTranslations: {
            netRevenue: 'Receita Líquida',
            fixedCost: 'Custo Fixo',
            commission: 'Comissão',
            averageFixedCost: 'Custo Fixo Médio',
        }
    }
  },
  es: {
    mainHeader: {
        welcomeMessage: 'Buenas tardes, [Usuario]. Usted está en',
        inicio: 'Inicio',
        agence: 'Agence',
        projetos: 'Proyectos',
        administrativo: 'Administrativo',
        comercial: 'Comercial',
        financeiro: 'Financiero',
        usuario: 'Usuario',
        sair: 'Salir'
    },
    landingPage: {
        performancePanel: 'Panel de Desempeño',
        login: 'Login',
        welcomeTitle: 'Bienvenido al Panel de Desempeño',
        welcomeSubtitle: 'Una solución completa para visualizar y analizar el desempeño comercial de sus consultores en tiempo real.',
        accessPanel: 'Acceder al Panel',
        footerRights: 'Todos los derechos reservados.'
    },
    loginPage: {
        title: 'Login',
        description: 'Ingrese su email y contraseña para acceder a su cuenta.',
        password: 'Contraseña',
        loginButton: 'Entrar',
        noAccount: '¿No tiene una cuenta?',
        registerLink: 'Registrarse',
        backToHome: 'Volver a la página de inicio'
    },
    registerPage: {
        title: 'Registrarse',
        description: 'Cree su cuenta completando los campos a continuación.',
        nameLabel: 'Nombre',
        namePlaceholder: 'Su Nombre',
        passwordLabel: 'Contraseña',
        submitButton: 'Crear Cuenta',
        loadingButton: 'Creando Cuenta...',
        alreadyHaveAccount: '¿Ya tiene una cuenta?',
        loginLink: 'Login',
        toastSuccessTitle: 'Verificación Necesaria',
        toastSuccessDescription: 'Se ha enviado un código de verificación a',
        toastErrorTitle: 'Error',
        toastErrorDescription: 'Hubo un problema al intentar registrarse. Intente de nuevo.'
    },
    verifyPage: {
        title: 'Verifique su Cuenta',
        description: (email: string) => `Enviamos un código de 6 dígitos a ${email}. Ingréselo a continuación. (Pista: es 123456)`,
        codeLabel: 'Código de Verificación',
        submitButton: 'Verificar',
        loadingButton: 'Verificando...',
        loadingFallback: 'Cargando...',
        errorTitle: 'Error',
        errorDescription: 'No se pudo encontrar el correo electrónico para la verificación.',
        backToRegister: 'Volver al Registro',
        toastSuccessTitle: '¡Cuenta Verificada!',
        toastSuccessDescription: 'Su cuenta ha sido verificada con éxito. Ahora puede iniciar sesión.',
        toastErrorTitle: 'Código Inválido',
        toastErrorDescription: 'El código de verificación es incorrecto. Por favor, intente de nuevo.',
        toastInvalidCode: 'Código incorrecto.'
    },
    performancePage: {
        title: 'Desempeño Comercial',
        filtersTitle: 'Filtros',
        reportTypeLabel: 'Tipo de Reporte',
        byConsultant: 'Por Consultor',
        byClient: 'Por Cliente',
        periodLabel: 'Período',
        datePlaceholder: 'Seleccione un período',
        consultantsLabel: 'Consultores',
        clientsLabel: 'Clientes',
        reportButton: 'Relatorio',
        loadingButton: 'Buscando...',
        chartButton: 'Gráfico',
        pieButton: 'Torta',
        loadingData: 'Cargando datos...',
        welcomeMessage: 'Por favor, seleccione consultores y/o clientes y un período, y luego haga clic en "Relatorio" para ver los resultados.',
        noDataMessage: 'No se encontraron datos para los filtros seleccionados.',
        barChartTitleConsultant: 'Desempeño de los Consultores',
        barChartTitleClient: 'Desempeño por Cliente',
        pieChartTitle: 'Participación en los Ingresos Netos',
        selectAll: 'Seleccionar Todos',
        clearSelection: 'Limpiar Selección',
        table: {
            consultant: 'Consultor',
            client: 'Cliente',
            period: 'Período',
            netRevenue: 'Ingresos Netos',
            fixedCost: 'Costo Fijo',
            commission: 'Comisión',
            profit: 'Ganancia'
        },
        toastSelectionRequiredTitle: 'Selección requerida',
        toastSelectionRequiredDescription: 'Por favor, seleccione al menos un consultor o cliente y un período de fechas.',
        toastNoResultsTitle: 'Sin resultados',
        toastNoResultsDescription: 'No se encontraron datos para los filtros seleccionados.',
        toastFetchError: 'Ocurrió un error al buscar los datos.',
        toastActionRequiredTitle: 'Acción requerida',
        toastActionRequiredDescription: 'Por favor, genere un reporte con datos antes de mostrar un gráfico.',
        chartTranslations: {
            netRevenue: 'Ingresos Netos',
            fixedCost: 'Costo Fijo',
            commission: 'Comisión',
            averageFixedCost: 'Costo Fijo Promedio',
        }
    }
  },
  en: {
    mainHeader: {
        welcomeMessage: 'Good afternoon, [User]. You are in',
        inicio: 'Home',
        agence: 'Agence',
        projetos: 'Projects',
        administrativo: 'Administrative',
        comercial: 'Commercial',
        financeiro: 'Financial',
        usuario: 'User',
        sair: 'Logout'
    },
    landingPage: {
        performancePanel: 'Performance Panel',
        login: 'Login',
        welcomeTitle: 'Welcome to the Performance Panel',
        welcomeSubtitle: 'A complete solution to visualize and analyze the commercial performance of your consultants in real time.',
        accessPanel: 'Access Panel',
        footerRights: 'All rights reserved.'
    },
    loginPage: {
        title: 'Login',
        description: 'Enter your email and password to access your account.',
        password: 'Password',
        loginButton: 'Login',
        noAccount: "Don't have an account?",
        registerLink: 'Sign up',
        backToHome: 'Back to Home'
    },
    registerPage: {
        title: 'Register',
        description: 'Create your account by filling out the fields below.',
        nameLabel: 'Name',
        namePlaceholder: 'Your Name',
        passwordLabel: 'Password',
        submitButton: 'Create Account',
        loadingButton: 'Creating Account...',
        alreadyHaveAccount: 'Already have an account?',
        loginLink: 'Login',
        toastSuccessTitle: 'Verification Required',
        toastSuccessDescription: 'A verification code has been sent to',
        toastErrorTitle: 'Error',
        toastErrorDescription: 'There was a problem trying to register. Please try again.'
    },
    verifyPage: {
        title: 'Verify Your Account',
        description: (email: string) => `We sent a 6-digit code to ${email}. Please enter it below. (Hint: it's 123456)`,
        codeLabel: 'Verification Code',
        submitButton: 'Verify',
        loadingButton: 'Verifying...',
        loadingFallback: 'Loading...',
        errorTitle: 'Error',
        errorDescription: 'Could not find the email for verification.',
        backToRegister: 'Back to Register',
        toastSuccessTitle: 'Account Verified!',
        toastSuccessDescription: 'Your account has been successfully verified. You can now log in.',
        toastErrorTitle: 'Invalid Code',
        toastErrorDescription: 'The verification code is incorrect. Please try again.',
        toastInvalidCode: 'Incorrect code.'
    },
    performancePage: {
        title: 'Commercial Performance',
        filtersTitle: 'Filters',
        reportTypeLabel: 'Report Type',
        byConsultant: 'By Consultant',
        byClient: 'By Client',
        periodLabel: 'Period',
        datePlaceholder: 'Select a period',
        consultantsLabel: 'Consultants',
        clientsLabel: 'Clients',
        reportButton: 'Report',
        loadingButton: 'Fetching...',
        chartButton: 'Chart',
        pieButton: 'Pie',
        loadingData: 'Loading data...',
        welcomeMessage: "Please select consultants and/or clients and a period, then click 'Report' to see the results.",
        noDataMessage: 'No data found for the selected filters.',
        barChartTitleConsultant: 'Consultant Performance',
        barChartTitleClient: 'Performance by Client',
        pieChartTitle: 'Net Revenue Share',
        selectAll: 'Select All',
        clearSelection: 'Clear Selection',
        table: {
            consultant: 'Consultant',
            client: 'Client',
            period: 'Period',
            netRevenue: 'Net Revenue',
            fixedCost: 'Fixed Cost',
            commission: 'Commission',
            profit: 'Profit'
        },
        toastSelectionRequiredTitle: 'Selection Required',
        toastSelectionRequiredDescription: 'Please select at least one consultant or client and a date range.',
        toastNoResultsTitle: 'No Results',
        toastNoResultsDescription: 'No data was found for the selected filters.',
        toastFetchError: 'An error occurred while fetching the data.',
        toastActionRequiredTitle: 'Action Required',
        toastActionRequiredDescription: 'Please generate a report with data before showing a chart.',
        chartTranslations: {
            netRevenue: 'Net Revenue',
            fixedCost: 'Fixed Cost',
            commission: 'Commission',
            averageFixedCost: 'Average Fixed Cost',
        }
    }
  },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang && translationsData[storedLang]) {
      setLanguage(storedLang);
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);


  const setLanguageWrapper = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const translations = translationsData[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageWrapper, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

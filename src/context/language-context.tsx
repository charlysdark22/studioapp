'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'pt' | 'es';

type Translations = {
    [key: string]: any;
};

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
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
        errorTitle: 'Erro',
        errorDescription: 'No fue posible encontrar el e-mail para verificación.',
        backToRegister: 'Voltar ao Registro',
        toastSuccessTitle: 'Conta Verificada!',
        toastSuccessDescription: 'Sua conta foi verificada com sucesso. Agora você pode iniciar sessão.',
        toastErrorTitle: 'Código Inválido',
        toastErrorDescription: 'O código de verificação é incorreto. Por favor, tente de novo.',
        toastInvalidCode: 'Código incorreto.'
    },
    performancePage: {
        title: 'Performance Comercial',
        periodLabel: 'Período',
        datePlaceholder: 'Selecione um período',
        consultantsLabel: 'Consultores',
        reportButton: 'Relatório',
        loadingButton: 'Buscando...',
        chartButton: 'Gráfico',
        pieButton: 'Pizza',
        loadingData: 'Carregando dados...',
        welcomeMessage: "Por favor, selecione um ou mais consultores e um período, e depois clique em 'Relatório' para ver os resultados.",
        noDataMessage: 'Não foram encontrados dados para os filtros selecionados.',
        barChartTitle: 'Desempenho dos Consultores',
        pieChartTitle: 'Participação na Receita Líquida',
        table: {
            consultant: 'Consultor',
            period: 'Período',
            netRevenue: 'Receita Líquida',
            fixedCost: 'Custo Fixo',
            commission: 'Comissão',
            profit: 'Lucro'
        },
        toastSelectionRequiredTitle: 'Seleção requerida',
        toastSelectionRequiredDescription: 'Por favor, selecione ao menos um consultor e um período de datas.',
        toastNoResultsTitle: 'Sem resultados',
        toastNoResultsDescription: 'Não se encontraram dados para os filtros selecionados.',
        toastFetchError: 'Ocorreu um erro ao buscar os dados.',
        toastActionRequiredTitle: 'Ação requerida',
        toastActionRequiredDescription: 'Por favor, gere um relatório com dados antes de mostrar um gráfico.',
        multiSelect: {
            selectSomeItems: 'Selecione...',
            allItemsAreSelected: 'Todos selecionados',
            selectAll: 'Selecionar todos',
            search: 'Buscar',
        },
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
        periodLabel: 'Período',
        datePlaceholder: 'Seleccione un período',
        consultantsLabel: 'Consultores',
        reportButton: 'Relatório',
        loadingButton: 'Buscando...',
        chartButton: 'Gráfico',
        pieButton: 'Pizza',
        loadingData: 'Cargando datos...',
        welcomeMessage: 'Por favor, seleccione uno o más consultores y un período, y luego haga clic en "Relatório" para ver los resultados.',
        noDataMessage: 'No se encontraron datos para los filtros seleccionados.',
        barChartTitle: 'Desempeño de los Consultores',
        pieChartTitle: 'Participación en la Receta Líquida',
        table: {
            consultant: 'Consultor',
            period: 'Período',
            netRevenue: 'Ingresos Netos',
            fixedCost: 'Costo Fijo',
            commission: 'Comisión',
            profit: 'Ganancia'
        },
        toastSelectionRequiredTitle: 'Selección requerida',
        toastSelectionRequiredDescription: 'Por favor, seleccione al menos un consultor y un período de fechas.',
        toastNoResultsTitle: 'Sin resultados',
        toastNoResultsDescription: 'No se encontraron datos para los filtros seleccionados.',
        toastFetchError: 'Ocurrió un error al buscar los datos.',
        toastActionRequiredTitle: 'Acción requerida',
        toastActionRequiredDescription: 'Por favor, genere un reporte con datos antes de mostrar un gráfico.',
        multiSelect: {
            selectSomeItems: 'Seleccione...',
            allItemsAreSelected: 'Todos seleccionados',
            selectAll: 'Seleccionar todos',
            search: 'Buscar',
        },
        chartTranslations: {
            netRevenue: 'Ingresos Netos',
            fixedCost: 'Costo Fijo',
            commission: 'Comisión',
            averageFixedCost: 'Costo Fijo Promedio',
        }
    }
  },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'pt' ? 'es' : 'pt'));
  };

  const translations = translationsData[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
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

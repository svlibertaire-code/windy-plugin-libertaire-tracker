import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-libertaire-tracker',
    version: '0.1.0',
    icon: '⛵',
    title: 'Libertaire Tracker',
    description: 'Import and display GPX tracks for Libertaire sailing voyages. Edit track names and colors.',
    author: 'Damien Feneon',
    repository: 'https://github.com/svlibertaire-code/windy-plugin-libertaire-tracker',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/libertaire-tracker',
    private: false,
};

export default config;

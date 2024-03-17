import { MainView } from './views/main/main';

class App {
    routes = [{ path: '', view: MainView }];
    appState = {
        favorites: [],
    };
    constructor() {
        window.addEventListener('hashchange', this.route.bind(this));
        this.route();
    }

    route() {
        if (this.currentView) {
            this.currentView.destroy();
        }
        let view = this.routes.find((r) => r.path == location.hash);
        if (!view) {
            console.warn('No Such Page');
        } else {
            view = view.view;
            this.currentView = new view(this.appState);
            this.currentView.render();
        }
    }
}

new App();

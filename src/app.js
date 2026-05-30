import { MainView } from './views/main/main.js';
import { FavoritesView } from './views/favorites/favorites.js';
import { BookDetailsView } from './views/book-details/book-details.js';

class App {
    routes = [
        { path: '', view: MainView },
        { path: 'favorites', view: FavoritesView },
        { path: 'book', view: BookDetailsView },  // детали по ID
    ];

    appState = {
        favorites: [],
    };

    constructor() {
        this.loadFavoritesFromStorage();
        window.addEventListener('hashchange', this.route.bind(this));
        this.route();
    }

    loadFavoritesFromStorage() {
        const saved = localStorage.getItem('bookshop_favorites');
        if (saved) {
            this.appState.favorites = JSON.parse(saved);
        }
    }

    saveFavoritesToStorage() {
        localStorage.setItem('bookshop_favorites', JSON.stringify(this.appState.favorites));
    }

    route() {
        if (this.currentView) {
            this.currentView.destroy();
        }
        const hash = location.hash.slice(1); // убираем #
        let view = this.routes.find(r => r.path === hash);

        // Если есть параметры (например, #book/OL123M)
        if (!view && hash.startsWith('book/')) {
            view = this.routes.find(r => r.path === 'book');
            const bookKey = hash.slice(5); // убираем 'book/'
            this.currentView = new view.view(this.appState, this.saveFavoritesToStorage.bind(this), bookKey);
        }
        // Если нет, идём на главную
        else if (!view) {
            view = this.routes.find(r => r.path === '');
            this.currentView = new view.view(this.appState, this.saveFavoritesToStorage.bind(this));
        }
        else {
            this.currentView = new view.view(this.appState, this.saveFavoritesToStorage.bind(this));
        }

        this.currentView.render();
    }
}

new App();
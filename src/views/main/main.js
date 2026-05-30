import { AbstractView } from '../../common/view.js';
import onChange from 'on-change';
import { Header } from '../../components/header/header.js';
import { Search } from '../../components/search/search.js';
import { BookCard } from '../../components/book-card/book-card.js';

export class MainView extends AbstractView {
    state = {
        list: [],
        loading: false,
        searchQuery: '',
        offset: 0,
    };

    constructor(appState, onUpdate) {
        super();
        this.appState = appState;
        this.onUpdate = onUpdate;
        this.appState = onChange(this.appState, this.appStateHook.bind(this));
        this.setTitle('Поиск книг');
    }

    appStateHook(path) {
        if (path === 'favorites') {
            this.renderHeader();
            this.renderBookList();
            if (this.onUpdate) this.onUpdate();
        }
    }

    async render() {
        this.app.innerHTML = '';
        this.renderHeader();

        const mainContainer = document.createElement('div');
        mainContainer.classList.add('main-container');
        this.app.append(mainContainer);

        const search = new Search(this.state, () => this.loadBooks());
        mainContainer.append(search.render());

        this.resultsContainer = document.createElement('div');
        this.resultsContainer.classList.add('results-container');
        mainContainer.append(this.resultsContainer);

        await this.loadBooks();
    }

    renderHeader() {
        const header = new Header(this.appState).render();
        const oldHeader = this.app.querySelector('.header');
        if (oldHeader) oldHeader.remove();
        this.app.prepend(header);
    }

    async loadBooks() {
        const query = this.state.searchQuery?.trim();
        if (!query) {
            await this.loadPopularBooks();
            return;
        }
        if (query.length < 3) {
            this.state.list = [];
            this.renderBookList();
            return;
        }

        this.state.loading = true;
        this.renderLoading();
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&lang=ru`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.state.list = data.docs || [];
            this.renderBookList();
        } catch (err) {
            console.error(err);
            this.renderError();
        } finally {
            this.state.loading = false;
        }
    }

    async loadPopularBooks() {
        this.state.loading = true;
        this.renderLoading();
        const url = `https://openlibrary.org/search.json?q=best+books&limit=20&sort=rating`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.state.list = data.docs || [];
            this.renderBookList();
        } catch (err) {
            console.error(err);
            this.renderError();
        } finally {
            this.state.loading = false;
        }
    }

    renderLoading() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '<div class="loading">📚 Загрузка книг...</div>';
        }
    }

    renderError() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '<div class="error">⚠️ Ошибка загрузки. Попробуйте позже.</div>';
        }
    }

    renderBookList() {
        if (!this.resultsContainer) return;
        if (this.state.list.length === 0 && !this.state.loading) {
            this.resultsContainer.innerHTML = '<div class="no-results">😕 Ничего не найдено</div>';
            return;
        }

        const booksGrid = document.createElement('div');
        booksGrid.classList.add('books-grid');
        for (let book of this.state.list) {
            const card = new BookCard(book, this.appState, (book) => this.toggleFavorite(book));
            booksGrid.append(card.render());
        }
        this.resultsContainer.innerHTML = '';
        this.resultsContainer.append(booksGrid);
    }

    toggleFavorite(book) {
        const exists = this.appState.favorites.some(fav => fav.key === book.key);
        if (exists) {
            this.appState.favorites = this.appState.favorites.filter(fav => fav.key !== book.key);
        } else {
            this.appState.favorites.push(book);
        }
    }
}
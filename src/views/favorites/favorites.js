import { AbstractView } from '../../common/view.js';
import { Header } from '../../components/header/header.js';
import { BookCard } from '../../components/book-card/book-card.js';

export class FavoritesView extends AbstractView {
    constructor(appState, onUpdate) {
        super();
        this.appState = appState;
        this.onUpdate = onUpdate;
        this.setTitle('Избранное');
    }

    render() {
        this.app.innerHTML = '';
        this.renderHeader();

        const container = document.createElement('div');
        container.classList.add('favorites-container');
        this.app.append(container);

        const title = document.createElement('h1');
        title.textContent = '📖 Мои любимые книги';
        title.classList.add('favorites-title');
        container.append(title);

        if (this.appState.favorites.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.innerHTML = '✨ Пока нет избранных книг. Добавьте их на <a href="#/">главной странице</a>.';
            emptyMsg.classList.add('empty-favorites');
            container.append(emptyMsg);
        } else {
            const booksGrid = document.createElement('div');
            booksGrid.classList.add('books-grid');
            for (let book of this.appState.favorites) {
                const card = new BookCard(book, this.appState, (book) => this.toggleFavorite(book));
                booksGrid.append(card.render());
            }
            container.append(booksGrid);
        }
    }

    renderHeader() {
        const header = new Header(this.appState).render();
        this.app.prepend(header);
    }

    toggleFavorite(book) {
        const exists = this.appState.favorites.some(fav => fav.key === book.key);
        if (exists) {
            this.appState.favorites = this.appState.favorites.filter(fav => fav.key !== book.key);
        } else {
            this.appState.favorites.push(book);
        }
        if (this.onUpdate) this.onUpdate();
        this.render(); // обновить страницу
    }
}
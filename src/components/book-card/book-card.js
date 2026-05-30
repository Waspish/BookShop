import { DivComponent } from '../../common/div-components.js';

export class BookCard extends DivComponent {
    constructor(book, appState, onToggleFavorite, isCompact = false) {
        super();
        this.book = book;
        this.appState = appState;
        this.onToggleFavorite = onToggleFavorite;
        this.isCompact = isCompact;
    }

    render() {
        const bookId = this.book.key || `${this.book.title}_${this.book.first_publish_year}`;
        const isFavorite = this.appState.favorites.some(fav => fav.key === this.book.key);

        const title = this.book.title || 'Без названия';
        const authors = this.book.author_name?.join(', ') || 'Автор не указан';
        const year = this.book.first_publish_year ? `, ${this.book.first_publish_year}` : '';
        const coverUrl = this.book.cover_i
            ? `https://covers.openlibrary.org/b/id/${this.book.cover_i}-M.jpg`
            : '/static/no-cover.png';
        const detailLink = `#book/${this.book.key}`;

        this.el.classList.add('book-card');
        if (this.isCompact) this.el.classList.add('book-card--compact');

        this.el.innerHTML = `
            <a href="${detailLink}" class="book-card__link">
                <div class="book-card__cover">
                    <img src="${coverUrl}" alt="Обложка">
                </div>
                <div class="book-card__info">
                    <h3 class="book-card__title">${title}</h3>
                    <p class="book-card__authors">${authors}${year}</p>
                </div>
            </a>
            <button class="book-card__favorite ${isFavorite ? 'active' : ''}">
                ${isFavorite ? '❤️ В избранном' : '🤍 В избранное'}
            </button>
        `;

        const favBtn = this.el.querySelector('.book-card__favorite');
        favBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onToggleFavorite({ ...this.book, id: bookId });
        });

        return this.el;
    }
}
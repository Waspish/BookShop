import { AbstractView } from '../../common/view.js';
import { Header } from '../../components/header/header.js';

export class BookDetailsView extends AbstractView {
    constructor(appState, onUpdate, bookKey) {
        super();
        this.appState = appState;
        this.onUpdate = onUpdate;
        this.bookKey = bookKey;
        this.bookData = null;
        this.setTitle('Загрузка...');
    }

    async render() {
        this.app.innerHTML = '';
        this.renderHeader();

        const container = document.createElement('div');
        container.classList.add('details-container');
        this.app.append(container);
        container.innerHTML = '<div class="loading">📖 Загрузка информации о книге...</div>';

        try {
            const url = `https://openlibrary.org${this.bookKey}.json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.bookData = await res.json();
            this.setTitle(this.bookData.title || 'Книга');
            this.renderDetails(container);
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div class="error">❌ Не удалось загрузить информацию о книге.</div>';
        }
    }

    renderDetails(container) {
        const data = this.bookData;
        const coverId = data.covers ? data.covers[0] : null;
        const coverUrl = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : '/static/no-cover.png';

        const isFavorite = this.appState.favorites.some(fav => fav.key === this.bookKey);

        // Обработка описания
        let description = 'Нет описания';
        if (data.description) {
            if (typeof data.description === 'string') {
                description = data.description;
            } else if (data.description.value) {
                description = data.description.value;
            } else {
                description = JSON.stringify(data.description);
            }
        }

        // Заглушка для авторов, потом заменим
        const html = `
            <div class="details-card">
                <div class="details-cover">
                    <img src="${coverUrl}" alt="Обложка">
                </div>
                <div class="details-info">
                    <h1>${this.escapeHtml(data.title) || 'Без названия'}</h1>
                    <p><strong>Авторы:</strong> <span class="details-authors-value">Загрузка...</span></p>
                    <p><strong>Дата публикации:</strong> ${data.publish_date || 'Не указана'}</p>
                    <p><strong>Страниц:</strong> ${data.number_of_pages || '—'}</p>
                    <p><strong>Темы:</strong> ${data.subjects ? data.subjects.slice(0, 5).join(', ') : '—'}</p>
                    <p><strong>Описание:</strong> ${this.escapeHtml(description)}</p>
                    <button class="details-favorite ${isFavorite ? 'active' : ''}">
                        ${isFavorite ? '❤️ В избранном' : '🤍 Добавить в избранное'}
                    </button>
                    <a href="#/" class="back-button">← На главную</a>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Асинхронно загружаем имена авторов
        this.loadAuthorNames(data.authors).then(authorNames => {
            const authorsSpan = container.querySelector('.details-authors-value');
            if (authorsSpan) {
                authorsSpan.textContent = authorNames.join(', ') || 'Неизвестен';
            }
        }).catch(() => {
            const authorsSpan = container.querySelector('.details-authors-value');
            if (authorsSpan) authorsSpan.textContent = 'Не удалось загрузить';
        });

        const favBtn = container.querySelector('.details-favorite');
        favBtn.addEventListener('click', () => this.toggleFavorite());
    }

    async loadAuthorNames(authors) {
        if (!authors || authors.length === 0) return [];
        const names = [];
        for (const authorRef of authors) {
            const authorKey = authorRef.author.key;
            try {
                const res = await fetch(`https://openlibrary.org${authorKey}.json`);
                if (res.ok) {
                    const authorData = await res.json();
                    names.push(authorData.name || authorKey);
                } else {
                    names.push(authorKey);
                }
            } catch {
                names.push(authorKey);
            }
        }
        return names;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    toggleFavorite() {
        const exists = this.appState.favorites.some(fav => fav.key === this.bookKey);
        const bookToSave = {
            key: this.bookKey,
            title: this.bookData.title,
            author_name: this.bookData.authors ? this.bookData.authors.map(a => a.author.key) : [],
            cover_i: this.bookData.covers ? this.bookData.covers[0] : null,
            first_publish_year: this.bookData.publish_date ? parseInt(this.bookData.publish_date) : null,
        };
        if (exists) {
            this.appState.favorites = this.appState.favorites.filter(fav => fav.key !== this.bookKey);
        } else {
            this.appState.favorites.push(bookToSave);
        }
        if (this.onUpdate) this.onUpdate();
        this.render();
    }

    renderHeader() {
        const header = new Header(this.appState).render();
        this.app.prepend(header);
    }
}
import { DivComponent } from '../../common/div-components.js';

export class Search extends DivComponent {
    constructor(state, onSearch) {
        super();
        this.state = state;
        this.onSearch = onSearch;
        this.debounceTimer = null;
    }

    render() {
        this.el.classList.add('search');
        this.el.innerHTML = `
            <input type="text" class="search__input" placeholder="Название книги, автор..." value="${this.state.searchQuery || ''}">
            <button class="search__button">🔍 Найти</button>
        `;
        const input = this.el.querySelector('.search__input');
        const button = this.el.querySelector('.search__button');

        button.addEventListener('click', () => {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.state.searchQuery = input.value;
            this.onSearch();
        });

        input.addEventListener('input', (e) => {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.state.searchQuery = e.target.value;
                this.onSearch();
            }, 500);
        });

        return this.el;
    }
}
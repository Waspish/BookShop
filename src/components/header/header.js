import { DivComponent } from '../../common/div-components.js';

export class Header extends DivComponent {
    constructor(appState) {
        super();
        this.appState = appState;
    }

    render() {
        this.el.classList.add('header');
        this.el.innerHTML = `
            <div class="header__logo">
                <a href="#/"><img src="/static/logo.svg" alt="логотип"></a>
            </div>
            <div class="header__nav">
                <a href="#/" class="nav-link">🔍 Поиск</a>
                <a href="#favorites" class="nav-link">⭐ Избранное</a>
                <div class="header__favorites">
                    ❤️ ${this.appState.favorites.length}
                </div>
            </div>
        `;
        return this.el;
    }
}
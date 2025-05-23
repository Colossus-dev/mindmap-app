import React, { useState } from 'react';
import MindMap from './components/MindMap';
import './components/MindMap.css';
import './App.css';

function App() {
    const [showMindMap, setShowMindMap] = useState(false);

    return (
        <div className="app">
            {/* Навигация */}
            <nav className="navbar">
                <div className="navbar-logo"><a href="/">🌟 MindMap </a> </div>
                <ul className="navbar-links">
                    <li><a href="/">Главная</a></li>
                    {showMindMap && <li><a href="#mindmap">Карта</a></li>}
                    <li><a href="#faq">FAQ</a></li>
                </ul>
            </nav>

            {/* Hero */}
            <section id="hero" className="hero-section">
                <div className="hero-content">
                    <h1>Добро пожаловать в Мир Идей 💡</h1>
                    <p>Создавайте, соединяйте и визуализируйте свои мысли в интерактивной ментальной карте.</p>
                    <a
                        href="#mindmap"
                        className="hero-button"
                        onClick={() => setShowMindMap(true)}
                    >
                        🚀 Начать
                    </a>
                </div>
            </section>

            {/* Показываем только после клика */}
            {showMindMap && (
                <section id="mindmap" className="mindmap-section">
                    <h2 className="section-title">🧠 Ваша Ментальная Карта</h2>
                    <MindMap />
                </section>
            )}

            {/* FAQ */}
            <section id="faq" className="faq-section">
                <h2 className="faq-title">❓ Часто задаваемые вопросы</h2>
                <div className="faq-list">
                    <div className="faq-item">
                        <h3>Как добавить новую идею?</h3>
                        <p>Нажмите на кнопку «Добавить идею» в панели и начните вводить текст.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Как соединить идеи?</h3>
                        <p>Дважды кликните на два узла, чтобы выбрать их, а затем нажмите «Связать».</p>
                    </div>
                    <div className="faq-item">
                        <h3>Можно ли сохранить карту?</h3>
                        <p>Да, вы можете экспортировать её в PNG для использования в отчётах.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="footer">
                <div className="footer-content">
                    <p>© {new Date().getFullYear()} NARXOZ Digital | Дипломный проект — Ментальная карта</p>
                    <p>Связь: <a href="mailto:contact@narxoz.kz">contact@narxoz.kz</a></p>
                </div>
            </footer>
        </div>
    );
}

export default App;

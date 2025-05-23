// components/Navbar.jsx
import React from 'react';
import '../styles/Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">🌟 MindMap</div>
            <ul className="navbar-links">
                <li><a href="#mindmap">Карта</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#footer">Контакты</a></li>
            </ul>
        </nav>
    );
}

export default Navbar;

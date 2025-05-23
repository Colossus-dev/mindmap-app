import React, { useState, useEffect } from 'react';
import './MindMap.css';
import html2canvas from 'html2canvas';

function MindMap() {
    const [nodes, setNodes] = useState([]);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [showPanel, setShowPanel] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNodeStyle, setNewNodeStyle] = useState({
        shape: 'rounded',
        cardColor: '#fff3e0',
        textColor: '#333',
        lineColor: '#7b1fa2',
        fontFamily: 'Arial',
        fontSize: 16,
    });

    useEffect(() => {
        const saved = localStorage.getItem('mindmap_nodes');
        if (saved) setNodes(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('mindmap_nodes', JSON.stringify(nodes));
    }, [nodes]);

    const handleMouseDown = (id, e) => {
        const node = nodes.find((n) => n.id === id);
        if (!node) return;
        setOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
        setDraggingNodeId(id);
    };

    const handleMouseMove = (e) => {
        if (!draggingNodeId) return;
        setNodes(nodes.map(node =>
            node.id === draggingNodeId
                ? { ...node, x: e.clientX - offset.x, y: e.clientY - offset.y }
                : node
        ));
    };

    const handleMouseUp = () => setDraggingNodeId(null);

    const handleTextChange = (id, text) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
    };

    const deleteNode = (id) => {
        const updated = nodes.filter(n => n.id !== id).map(n => ({
            ...n,
            connections: n.connections.filter(cid => cid !== id),
        }));
        setNodes(updated);
    };

    const toggleSelect = (id) => {
        setSelectedNodes((prev) =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 2)
        );
    };

    const connectNodes = () => {
        if (selectedNodes.length === 2) {
            const [id1, id2] = selectedNodes;
            setNodes(nodes.map(node => {
                if (node.id === id1 && !node.connections.includes(id2)) {
                    return { ...node, connections: [...node.connections, id2] };
                }
                if (node.id === id2 && !node.connections.includes(id1)) {
                    return { ...node, connections: [...node.connections, id1] };
                }
                return node;
            }));
            setSelectedNodes([]);
        }
    };

    const exportAsPNG = () => {
        const area = document.getElementById('mindmap-area');
        if (!area) return;

        // Клонируем всю зону
        const clone = area.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.zIndex = '-1';
        clone.style.opacity = '1';
        clone.style.background = '#ffffff';

        // Удаляем стили, создающие прозрачность
        clone.querySelectorAll('*').forEach(el => {
            el.style.opacity = '1';
            el.style.filter = 'none';
            el.style.backdropFilter = 'none';

            // заменим rgba на rgb
            const bg = window.getComputedStyle(el).backgroundColor;
            if (bg.includes('rgba')) {
                const rgb = bg.replace(/rgba\\(([^,]+),([^,]+),([^,]+),[^)]+\\)/, 'rgb($1,$2,$3)');
                el.style.backgroundColor = rgb;
            }
        });

        document.body.appendChild(clone);

        setTimeout(() => {
            html2canvas(clone, {
                backgroundColor: '#ffffff',
                scale:2,
                useCORS: true,
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = 'mindmap.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                document.body.removeChild(clone);
            });
        }, 100);
    };








    const getNodeDOMCenter = (id) => {
        const el = document.getElementById(`node-${id}`);
        const container = document.querySelector('.mindmap-container');
        if (!el || !container) return { x: 0, y: 0 };
        const rect1 = el.getBoundingClientRect();
        const rect2 = container.getBoundingClientRect();
        return {
            x: rect1.left - rect2.left + el.offsetWidth / 2,
            y: rect1.top - rect2.top + el.offsetHeight / 2,
        };
    };

    const createNodeWithStyle = () => {
        const newNode = {
            id: Date.now(),
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            text: 'Новая идея',
            connections: [],
            style: newNodeStyle,
        };
        setNodes([...nodes, newNode]);
        setShowCreateModal(false);
    };

    return (
        <div className="mindmap-container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <h1 className="header-banner">✨ Добро пожаловать в Мир Идей! ✨</h1>
            <button className="burger-toggle" onClick={() => setShowPanel(!showPanel)}>≡</button>

            {showPanel && (
                <div className="button-panel">
                    <button className="add-button" onClick={() => setShowCreateModal(true)}>➕ Добавить идею</button>
                    <button className="connect-button" onClick={connectNodes}>🔗 Связать</button>
                    <button className="export-btn" onClick={exportAsPNG}>🖼 Сохранить</button>
                </div>
            )}
            <div id="mindmap-area">

                <svg className="lines" width="100%" height="100%">
                    {nodes.map((node) =>
                        node.connections.map((connId) => {
                            const start = getNodeDOMCenter(node.id);
                            const end = getNodeDOMCenter(connId);
                            return (
                                <line
                                    key={`${node.id}-${connId}`}
                                    x1={start.x}
                                    y1={start.y}
                                    x2={end.x}
                                    y2={end.y}
                                    stroke={node.style.lineColor}
                                    strokeWidth="2"
                                />
                            );
                        })
                    )}
                </svg>

                {nodes.map((node) => (
                    <div
                        key={node.id}
                        id={`node-${node.id}`}
                        className={`node ${selectedNodes.includes(node.id) ? 'selected' : ''}`}
                        style={{
                            left: node.x,
                            top: node.y,
                            backgroundColor: node.style.cardColor,
                            color: node.style.textColor,
                            fontFamily: node.style.fontFamily,
                            fontSize: `${node.style.fontSize}px`,
                            borderRadius: node.style.shape === 'rounded' ? '50%' : node.style.shape === 'square' ? '0' : '12px',
                            boxShadow: node.style.shape === 'shadowed' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                            padding: '10px',
                            minWidth: '80px',
                            minHeight: '40px'
                        }}
                        onMouseDown={(e) => handleMouseDown(node.id, e)}
                        onDoubleClick={() => toggleSelect(node.id)}
                    >
          <textarea
              value={node.text}
              onChange={(e) => handleTextChange(node.id, e.target.value)}
              style={{
                  fontFamily: node.style.fontFamily,
                  fontSize: `${node.style.fontSize}px`,
                  background: 'transparent',
                  color: node.style.textColor,
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  height: '100%',
                  resize: 'none',
                  textAlign: 'center',
                  paddingTop: '15px'
              }}
          />

                        <button className="delete-btn" onClick={() => deleteNode(node.id)}>✖</button>
                    </div>
                ))}

                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>🆕 Создать новую идею</h3>

                            <label>Форма:
                                <select value={newNodeStyle.shape}
                                        onChange={e => setNewNodeStyle({...newNodeStyle, shape: e.target.value})}>
                                    <option value="rounded">Круглая</option>
                                    <option value="square">Квадратная</option>
                                    <option value="shadowed">С тенью</option>
                                </select>
                            </label>

                            <label>Цвет карточки:
                                <input type="color" value={newNodeStyle.cardColor}
                                       onChange={e => setNewNodeStyle({...newNodeStyle, cardColor: e.target.value})}/>
                            </label>

                            <label>Цвет текста:
                                <input type="color" value={newNodeStyle.textColor}
                                       onChange={e => setNewNodeStyle({...newNodeStyle, textColor: e.target.value})}/>
                            </label>

                            <label>Цвет линий:
                                <input type="color" value={newNodeStyle.lineColor}
                                       onChange={e => setNewNodeStyle({...newNodeStyle, lineColor: e.target.value})}/>
                            </label>

                            <label>Шрифт:
                                <select value={newNodeStyle.fontFamily}
                                        onChange={e => setNewNodeStyle({...newNodeStyle, fontFamily: e.target.value})}>
                                    <option value="Arial">Arial</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                </select>
                            </label>

                            <label>Размер текста:
                                <input type="range" min="12" max="32" value={newNodeStyle.fontSize}
                                       onChange={e => setNewNodeStyle({
                                           ...newNodeStyle,
                                           fontSize: parseInt(e.target.value)
                                       })}/>
                                <span>{newNodeStyle.fontSize}px</span>
                            </label>

                            <div className="modal-actions">
                                <button onClick={() => setShowCreateModal(false)}>❌ Отмена</button>
                                <button onClick={createNodeWithStyle}>✅ Создать</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
            );
            }

            export default MindMap;

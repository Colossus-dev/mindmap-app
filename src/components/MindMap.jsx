import React, { useState, useEffect } from 'react';
import './MindMap.css';
import html2canvas from 'html2canvas';

function MindMap() {
    const [nodes, setNodes] = useState([]);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [showPanel, setShowPanel] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [images, setImages] = useState([]);
    const [draggingImageId, setDraggingImageId] = useState(null);
    const [imageOffset, setImageOffset] = useState({x: 0, y: 0});
    const [stickers, setStickers] = useState([]);
    const [draggingStickerId, setDraggingStickerId] = useState(null);
    const [stickerOffset, setStickerOffset] = useState({x: 0, y: 0});

    const availableStickers = [
        'https://cdn-icons-png.flaticon.com/256/7273/7273762.png',
        'https://res.cloudinary.com/teepublic/image/private/s--XRIwl-vh--/t_Resized%20Artwork/c_fit,g_north_west,h_1054,w_1054/co_ffffff,e_outline:53/co_ffffff,e_outline:inner_fill:53/co_bbbbbb,e_outline:3:1000/c_mpad,g_center,h_1260,w_1260/b_rgb:eeeeee/c_limit,f_auto,h_630,q_auto:good:420,w_630/v1598252879/production/designs/13351748_0.jpg',
        'https://cdn-icons-png.flaticon.com/256/7183/7183462.png',
        'https://cdn-icons-png.flaticon.com/256/7273/7273746.png',
        'https://cdn-icons-png.flaticon.com/256/11946/11946426.png',
        'https://cdn-icons-png.flaticon.com/256/9394/9394714.png',
        'https://cdn-icons-png.flaticon.com/512/7279/7279895.png',
        'https://cdn-icons-png.flaticon.com/256/5721/5721099.png',
        'https://cdn-icons-png.flaticon.com/256/4861/4861842.png',
        'https://cdn-icons-png.flaticon.com/256/5965/5965452.png',
    ];

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
        setOffset({x: e.clientX - node.x, y: e.clientY - node.y});
        setDraggingNodeId(id);
    };

    const handleMouseMove = (e) => {
        if (!draggingNodeId) return;
        setNodes(nodes.map(node =>
            node.id === draggingNodeId
                ? {...node, x: e.clientX - offset.x, y: e.clientY - offset.y}
                : node
        ));
    };

    const handleMouseUp = () => setDraggingNodeId(null);

    const handleTextChange = (id, text) => {
        setNodes(nodes.map(n => n.id === id ? {...n, text} : n));
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
                    return {...node, connections: [...node.connections, id2]};
                }
                if (node.id === id2 && !node.connections.includes(id1)) {
                    return {...node, connections: [...node.connections, id1]};
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
                backgroundColor: '#FFFASS',
                scale: 2,
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
        if (!el || !container) return {x: 0, y: 0};
        const rect1 = el.getBoundingClientRect();
        const rect2 = container.getBoundingClientRect();
        return {
            x: rect1.left - rect2.left + el.offsetWidth / 2,
            y: rect1.top - rect2.top + el.offsetHeight / 2,
        };
    };

    const handleImageMouseDown = (id, e) => {
        const image = images.find(img => img.id === id);
        if (!image) return;
        setImageOffset({x: e.clientX - image.x, y: e.clientY - image.y});
        setDraggingImageId(id);
    };

    const handleImageMouseMove = (e) => {
        if (!draggingImageId) return;
        setImages(images.map(img =>
            img.id === draggingImageId
                ? {...img, x: e.clientX - imageOffset.x, y: e.clientY - imageOffset.y}
                : img
        ));
    };

    const handleImageMouseUp = () => setDraggingImageId(null);

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

    const handleStickerMouseDown = (id, e) => {
        const sticker = stickers.find(st => st.id === id);
        if (!sticker) return;
        setStickerOffset({x: e.clientX - sticker.x, y: e.clientY - sticker.y});
        setDraggingStickerId(id);
    };

    const handleStickerMouseMove = (e) => {
        if (!draggingStickerId) return;
        setStickers(stickers.map(st =>
            st.id === draggingStickerId
                ? {...st, x: e.clientX - stickerOffset.x, y: e.clientY - stickerOffset.y}
                : st
        ));
    };

    const handleStickerMouseUp = () => setDraggingStickerId(null);

    return (
        <div
            className="mindmap-container"
            onMouseMove={(e) => {
                handleMouseMove(e);
                handleImageMouseMove(e);
                handleStickerMouseMove(e);
            }}
            onMouseUp={() => {
                handleMouseUp();
                handleImageMouseUp();
                handleStickerMouseUp();
            }}
        >
            <h1 className="header-banner">✨ Добро пожаловать в Мир Идей! ✨</h1>
            <button className="burger-toggle" onClick={() => setShowPanel(!showPanel)}>≡</button>

            {showPanel && (
                <div className="button-panel">
                    <button className="add-button" onClick={() => setShowCreateModal(true)}>➕ Добавить идею</button>
                    <button className="connect-button" onClick={connectNodes}>🔗 Связать</button>
                    <button className="export-btn" onClick={exportAsPNG}>🖼 Сохранить</button>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        maxWidth: `${5 * (50 + 12)}px`,
                        marginTop: '12px'
                    }}>
                        {availableStickers.map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt={`sticker-${idx}`}
                                style={{
                                    width: 50,
                                    height: 50,
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    border: '2px solid transparent',
                                    transition: 'transform 0.2s ease'
                                }}
                                onClick={() => {
                                    const newSticker = {
                                        id: Date.now(),
                                        x: 100 + Math.random() * 200,
                                        y: 100 + Math.random() * 200,
                                        src
                                    };
                                    setStickers(prev => [...prev, newSticker]);
                                }}
                            />
                        ))}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        style={{display: 'none'}}
                        id="image-upload"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const img = {
                                        id: Date.now(),
                                        x: 100 + Math.random() * 200,
                                        y: 100 + Math.random() * 200,
                                        src: reader.result,
                                    };
                                    setImages(prev => [...prev, img]);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <label htmlFor="image-upload" className="add-button">🖼 Добавить фото</label>
                </div>
            )}

            <div id="mindmap-area">

                {/* Images */}
                {images.map((img) => (
                    <div
                        key={img.id}
                        style={{
                            position: 'absolute',
                            top: img.y,
                            left: img.x,
                            width: '250px',
                            height: '200px',
                            zIndex: 3,
                            cursor: 'move'
                        }}
                        onMouseDown={(e) => handleImageMouseDown(img.id, e)}
                    >
                        <img
                            src={img.src}
                            alt=""
                            style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}}
                        />
                    </div>
                ))}

                {/* Stickers */}
                {stickers.map((sticker) => (
                    <div
                        key={sticker.id}
                        style={{
                            position: 'absolute',
                            top: sticker.y,
                            left: sticker.x,
                            width: '80px',
                            height: '80px',
                            zIndex: 3,
                            cursor: 'move'
                        }}
                        onMouseDown={(e) => handleStickerMouseDown(sticker.id, e)}
                    >
                        <img
                            src={sticker.src}
                            alt=""
                            style={{width: '100%', height: '100%', objectFit: 'contain'}}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setStickers(prev => prev.filter(s => s.id !== sticker.id));
                            }}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                zIndex: 5
                            }}
                        >✖
                        </button>
                    </div>
                ))}

                {/* Lines (svg) */}
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

                {/* Nodes */}
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
                            minHeight: '40px',
                            position: 'absolute',
                            zIndex: 3
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

                {/* Modal */}
                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            {/* настройки */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MindMap;
import React from 'react';

const Background = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            backgroundImage: 'url(/img/bckg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            overflow: 'hidden'
        }}>
        </div>
    );
}

export default Background;

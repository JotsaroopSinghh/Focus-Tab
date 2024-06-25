document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.display = 'block';
});

document.addEventListener('click', () => {
    document.getElementById('contextMenu').style.display = 'none';
    document.getElementById('backgroundOptions').style.display = 'none';
    document.getElementById('colorBoxes').style.display = 'none';
});

document.getElementById('changeBackground').addEventListener('click', (event) => {
    event.stopPropagation();
    const backgroundOptions = document.getElementById('backgroundOptions');
    backgroundOptions.style.top = `${event.pageY}px`;
    backgroundOptions.style.left = `${event.pageX}px`;
    backgroundOptions.style.display = 'block';
});

document.getElementById('solidColor').addEventListener('click', (event) => {
    event.stopPropagation();
    showColorBoxes('solid', event.pageY, event.pageX);
});

document.getElementById('gradientColor').addEventListener('click', (event) => {
    event.stopPropagation();
    showColorBoxes('gradient', event.pageY, event.pageX);
});

document.getElementById('yourChoice').addEventListener('click', (event) => {
    event.stopPropagation();
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const backgroundImage = `url(${e.target.result})`;
            document.body.style.backgroundImage = backgroundImage;
            document.body.style.backgroundColor = '';
            localStorage.setItem('background', JSON.stringify({ type: 'image', value: backgroundImage }));
        };
        reader.readAsDataURL(file);
    }
});

function showColorBoxes(type, top, left) {
    const colorBoxes = document.getElementById('colorBoxes');
    colorBoxes.innerHTML = '';
    const colors = type === 'solid'
        ? ['#FF6F61', '#191919', '#FF69B4', '#25223F', '#000', '#00CED1', '#1E90FF', '#9370DB']
        : ['linear-gradient(to right, #ff7e5f, #feb47b)', 'linear-gradient(to right, #43cea2, #185a9d)', 'linear-gradient(to right, #4568dc, #b06ab3)', 'linear-gradient(to right, #ff5f6d, #ffc371)', 'linear-gradient(to right, #00c6ff, #0072ff)', 'linear-gradient(to right, #f77062, #fe5196)', 'linear-gradient(to right, #00c9ff, #92fe9d)', 'linear-gradient(to right, #fc00ff, #00dbde)'];
    colors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'color-box';
        div.style.background = color;
        div.addEventListener('click', () => {
            if (type === 'solid') {
                document.body.style.backgroundColor = color;
                document.body.style.backgroundImage = '';
                localStorage.setItem('background', JSON.stringify({ type: 'color', value: color }));
            } else {
                document.body.style.backgroundImage = color;
                document.body.style.backgroundColor = '';
                localStorage.setItem('background', JSON.stringify({ type: 'gradient', value: color }));
            }
        });
        colorBoxes.appendChild(div);
    });
    colorBoxes.style.display = 'flex';
    colorBoxes.style.flexWrap = 'wrap';
    colorBoxes.style.top = `${top}px`;
    colorBoxes.style.left = `${left}px`;
}

window.addEventListener('load', () => {
    const background = JSON.parse(localStorage.getItem('background'));
    if (background) {
        if (background.type === 'image') {
            document.body.style.backgroundImage = background.value;
            document.body.style.backgroundColor = '';
        } else if (background.type === 'color') {
            document.body.style.backgroundColor = background.value;
            document.body.style.backgroundImage = '';
        } else if (background.type === 'gradient') {
            document.body.style.backgroundImage = background.value;
            document.body.style.backgroundColor = '';
        }
    }
});

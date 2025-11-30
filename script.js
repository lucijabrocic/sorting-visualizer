const ARRAY_SIZE = 10;
const DELAY = 200; // brzina animacije u ms

// --- Algoritmi ---
async function bubbleSort(array, draw) {
    const start = performance.now();
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            if (array[j] > array[j + 1]) [array[j], array[j + 1]] = [array[j + 1], array[j]];
            draw([j, j+1]);
            await sleep(DELAY);
        }
    }
    return (performance.now() - start)/1000;
}

async function selectionSort(array, draw) {
    const start = performance.now();
    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[minIndex]) minIndex = j;
            draw([i,j,minIndex]);
            await sleep(DELAY);
        }
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        draw([i,minIndex]);
        await sleep(DELAY);
    }
    return (performance.now() - start)/1000;
}

async function insertionSort(array, draw) {
    const start = performance.now();
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            array[j+1] = array[j];
            draw([j,j+1]);
            await sleep(DELAY);
            j--;
        }
        array[j+1] = key;
        draw([j+1]);
        await sleep(DELAY);
    }
    return (performance.now() - start)/1000;
}

async function quickSort(array, draw, start=0, end=array.length-1) {
    const t0 = performance.now();
    await quickSortRecursive(array, draw, start, end);
    return (performance.now() - t0)/1000;
}

async function quickSortRecursive(array, draw, start, end) {
    if (start >= end) return;
    let index = await partition(array, draw, start, end);
    await quickSortRecursive(array, draw, start, index-1);
    await quickSortRecursive(array, draw, index+1, end);
}

async function partition(array, draw, start, end) {
    let pivot = array[end];
    let i = start - 1;
    for (let j = start; j < end; j++) {
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
        }
        draw([i,j,end]);
        await sleep(DELAY);
    }
    [array[i+1], array[end]] = [array[end], array[i+1]];
    draw([i+1,end]);
    await sleep(DELAY);
    return i+1;
}

// --- Pomoćne funkcije ---
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function drawArray(ctx, array, highlight=[]) {
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    const barWidth = ctx.canvas.width / array.length;

    for (let i=0;i<array.length;i++) {
        const x = i*barWidth;
        const y = ctx.canvas.height - array[i];
        ctx.fillStyle = highlight.includes(i) ? "#ff4c4c" : "#00adef";
        ctx.fillRect(x, y, barWidth-2, array[i]);

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(array[i], x+barWidth/2, ctx.canvas.height-5);
    }
}

// --- Inicijalni niz i canvasi ---
const originalArray = [];
for (let i=0;i<ARRAY_SIZE;i++) originalArray.push(Math.floor(Math.random()*150)+50);

const canvases = {
    bubble: {ctx: document.getElementById("canvasBubble").getContext("2d"), array: [...originalArray], message: document.getElementById("messageBubble")},
    quick: {ctx: document.getElementById("canvasQuick").getContext("2d"), array: [...originalArray], message: document.getElementById("messageQuick")},
    selection: {ctx: document.getElementById("canvasSelection").getContext("2d"), array: [...originalArray], message: document.getElementById("messageSelection")},
    insertion: {ctx: document.getElementById("canvasInsertion").getContext("2d"), array: [...originalArray], message: document.getElementById("messageInsertion")},
};

// Crtaj inicijalne nizove
for (let key in canvases) drawArray(canvases[key].ctx, canvases[key].array);

// --- Generiranje nizova ---
function generateRandomArray() {
    const newArray = [];
    for (let i = 0; i < ARRAY_SIZE; i++) {
        newArray.push(Math.floor(Math.random() * 150) + 50);
    }
    for (let key in canvases) {
        canvases[key].array = [...newArray]; // svaka vizualizacija dobiva kopiju istog niza
        drawArray(canvases[key].ctx, canvases[key].array);
        canvases[key].message.textContent = "";
    }
}


function generateSortedArray() {
    const newArray = [];
    for (let i = 0; i < ARRAY_SIZE; i++) {
        newArray.push(Math.floor(Math.random() * 150) + 50);
    }
    newArray.sort((a, b) => a - b);
    for (let key in canvases) {
        canvases[key].array = [...newArray]; // svaka vizualizacija dobiva kopiju istog niza
        drawArray(canvases[key].ctx, canvases[key].array);
        canvases[key].message.textContent = "";
    }
}


function generateReversedArray() {
    const newArray = [];
    for (let i = 0; i < ARRAY_SIZE; i++) {
        newArray.push(Math.floor(Math.random() * 150) + 50);
    }
    newArray.sort((a,b) => a - b).reverse();
    for (let key in canvases) {
        canvases[key].array = [...newArray]; // svaka vizualizacija dobiva kopiju istog niza
        drawArray(canvases[key].ctx, canvases[key].array);
        canvases[key].message.textContent = "";
    }
}


// --- Event listeneri ---
document.getElementById("generateRandom").addEventListener("click", generateRandomArray);
document.getElementById("generateSorted").addEventListener("click", generateSortedArray);
document.getElementById("generateReversed").addEventListener("click", generateReversedArray);

document.getElementById("startAll").addEventListener("click", async () => {
    const promises = [
        bubbleSort(canvases.bubble.array, h=>drawArray(canvases.bubble.ctx, canvases.bubble.array, h)).then(t=>{
            canvases.bubble.message.textContent = `Sortiranje gotovo u ${t.toFixed(2)} s`;
        }),
        quickSort(canvases.quick.array, h=>drawArray(canvases.quick.ctx, canvases.quick.array, h)).then(t=>{
            canvases.quick.message.textContent = `Sortiranje gotovo u ${t.toFixed(2)} s`;
        }),
        selectionSort(canvases.selection.array, h=>drawArray(canvases.selection.ctx, canvases.selection.array, h)).then(t=>{
            canvases.selection.message.textContent = `Sortiranje gotovo u ${t.toFixed(2)} s`;
        }),
        insertionSort(canvases.insertion.array, h=>drawArray(canvases.insertion.ctx, canvases.insertion.array, h)).then(t=>{
            canvases.insertion.message.textContent = `Sortiranje gotovo u ${t.toFixed(2)} s`;
        })
    ];
});

// --- Pojedinačni gumbi ---
document.querySelectorAll("button.single").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
        const algo = btn.dataset.algo;
        const c = canvases[algo];
        c.message.textContent = "";
        let time;
        switch(algo){
            case "bubble": time = await bubbleSort(c.array, h=>drawArray(c.ctx, c.array, h)); break;
            case "quick": time = await quickSort(c.array, h=>drawArray(c.ctx, c.array, h)); break;
            case "selection": time = await selectionSort(c.array, h=>drawArray(c.ctx, c.array, h)); break;
            case "insertion": time = await insertionSort(c.array, h=>drawArray(c.ctx, c.array, h)); break;
        }
        c.message.textContent = `Sortiranje gotovo u ${time.toFixed(2)} s`;
    });
});

// --- Pojedinačni gumbi za generiranje niza ---
document.querySelectorAll("button.generate").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const algo = btn.dataset.algo;
        const c = canvases[algo];
        c.array = [];
        for (let i=0;i<ARRAY_SIZE;i++) c.array.push(Math.floor(Math.random()*150)+50);
        drawArray(c.ctx, c.array);
        c.message.textContent = "";
    });
});

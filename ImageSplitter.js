export class ImageSplitter {
    constructor() {
        this.chunks = [];
    }

    loadImage(imagePath, callback) {
        this.image = new Image();
        this.image.onload = () => {
            this.splitImage();
            if (callback) callback();
        };
        this.image.src = imagePath;
    }

    splitImage() {
        const width = this.image.width;
        const height = this.image.height;
        const chunkSize = 112;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        for (let y = 0; y < height; y += chunkSize) {
            for (let x = 0; x < width; x += chunkSize) {
                canvas.width = chunkSize;
                canvas.height = chunkSize;
                context.clearRect(0, 0, chunkSize, chunkSize);
                context.drawImage(this.image, x, y, chunkSize, chunkSize, 0, 0, chunkSize, chunkSize);
                const chunk = new Image();
                chunk.src = canvas.toDataURL();
                this.chunks.push(chunk);
            }
        }
    }

    getChunk(index) {
        return this.chunks[index];
    }
}
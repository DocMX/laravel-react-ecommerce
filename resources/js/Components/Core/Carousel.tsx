import { useState, useEffect, useCallback } from 'react';
import { Image } from '@/types';

interface CarouselProps {
    images: Image[];
}

function Carousel({ images }: CarouselProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Asegurar que el índice siempre sea válido si las imágenes cambian
    useEffect(() => {
        if (selectedIndex >= images.length) {
            setSelectedIndex(0);
        }
    }, [images, selectedIndex]);

    const handleSelect = useCallback((i: number) => {
        setSelectedIndex(i);
    }, []);

    // Si no hay imágenes, mostramos un mensaje
    if (!images || images.length === 0) {
        return <div className="text-gray-500">No hay imágenes para mostrar.</div>;
    }

    const selectedImage = images[selectedIndex];

    return (
        <div className="flex items-start gap-8">
            {/* Miniaturas */}
            <div className="flex flex-col items-center gap-2 py-2">
                {images.map((image, i) => (
                    <button
                        key={image.id}
                        onClick={() => handleSelect(i)}
                        className={`border-2 rounded focus:outline-none ${
                            selectedIndex === i
                                ? 'border-blue-500 ring-2 ring-blue-300'
                                : 'border-transparent'
                        } hover:border-blue-500`}
                        aria-selected={selectedIndex === i}
                    >
                        <img
                            src={image.thumb}
                            alt={image.alt || `Miniatura ${i + 1}`}
                            className="w-[50px] h-[50px] object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Imagen grande */}
            <div className="w-full">
                {selectedImage ? (
                    <img
                        src={selectedImage.large}
                        alt={selectedImage.alt || `Imagen ${selectedIndex + 1}`}
                        className="w-[500px] h-[400px] object-contain rounded shadow bg-gray-100"
                    />
                ) : (
                    <div className="text-gray-400">Imagen no disponible</div>
                )}
            </div>
        </div>
    );
}

export default Carousel;

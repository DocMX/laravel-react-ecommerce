import { useState } from 'react';
import { Image } from '@/types';

function Carousel({ images }: { images: Image[] }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="flex items-start gap-8">
            {/* Miniaturas */}
            <div className="flex flex-col items-center gap-2 py-2">
                {images.map((image, i) => (
                    <button
                        key={image.id}
                        onClick={() => setSelectedIndex(i)}
                        className={`border-2 ${selectedIndex === i ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                    >
                        <img src={image.thumb} alt="" className='w-[50px]' />
                    </button>
                ))}
            </div>

            {/* Imagen grande */}
            <div className='carousel w-full'>
                <img src={images[selectedIndex].large} className='w-full' />
            </div>
        </div>
    );
}

export default Carousel;

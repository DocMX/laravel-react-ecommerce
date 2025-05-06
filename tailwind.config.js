import themes from 'daisyui/theme/object';
import defaultTheme from 'tailwindcss/defaultTheme';
//import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    daisyui: {
        themes: [
            "light", // Usa el tema 'light' directamente sin necesidad de importar nada
            {
                mytheme: {
                    "primary": "#6936FS", // Personaliza los colores
                    "secondary": "#ff00ff",
                },
            },
        ],
    },

    plugins: [require('daisyui')],
};

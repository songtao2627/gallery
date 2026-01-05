/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "fresh-lime": "#84fab0",
                "fresh-lemon": "#fccb90",
                "fresh-cyan": "#8fd3f4",
                "fresh-teal": "#0093E9",
                "fresh-dark": "#1e293b",
            },
            fontFamily: {
                display: ["Plus Jakarta Sans", "sans-serif"],
                body: ["Outfit", "sans-serif"],
            },
            animation: {
                "scroll-left": "scroll-left 60s linear infinite",
            },
            keyframes: {
                "scroll-left": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
        },
    },
    plugins: [],
}

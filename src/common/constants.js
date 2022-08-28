module.exports = {
    PATH: {
        ROOT: process.env.PWD,
        IMAGE_TEMP: "/results/image/temp",
        IMAGE_RESULTS: "/results/image"
    },

    ERROR: {
        "GENERAL": "GENERAL_ERROR",
        "API_EXTERNAL": "API_EXTERNAL_CALL_ERROR",
    },

    PRESENTATION: {
        WIDTH_DEFAULT: 700,
        HEIGHT_DEFAULT: 700,
        NAME_DEFAULT: "Presentation"
    },

    AWS_API: {
        REKOGNITION: {
            QUADRANTS: {
                Q0: { Left: 0.0, Top: 0.00, Width: 1.0, Height: 0.10, },
                Q1: { Left: 0.0, Top: 0.10, Width: 1.0, Height: 0.10, },
                Q2: { Left: 0.0, Top: 0.20, Width: 1.0, Height: 0.10, },
                Q3: { Left: 0.0, Top: 0.30, Width: 1.0, Height: 0.10, },
                Q4: { Left: 0.0, Top: 0.40, Width: 1.0, Height: 0.10, },
                Q5: { Left: 0.0, Top: 0.50, Width: 1.0, Height: 0.10, },
                Q6: { Left: 0.0, Top: 0.60, Width: 1.0, Height: 0.10, },
                Q7: { Left: 0.0, Top: 0.70, Width: 1.0, Height: 0.10, },
                Q8: { Left: 0.0, Top: 0.80, Width: 1.0, Height: 0.10, },
                Q9: { Left: 0.0, Top: 0.90, Width: 1.0, Height: 0.10, }
            },
            TYPES_IMAGE: {
                BYTES: "BYTES"
            }
        }

    },

    IMAGE: {
        TYPES: {
            PNG: "png",
            JPG: "jpg"
        },
        CONTOURS: {
            MODES: {
                LIST: "LIST",
                EXTERNAL: "EXTERNAL"
            }
        }
    }

} 
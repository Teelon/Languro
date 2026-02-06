import { ImageResponse } from "next/og";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: "hsl(221.2, 83.2%, 53.3%)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    borderRadius: "8px", // Rounded corners for the icon shape
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                }}
            >
                L
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}

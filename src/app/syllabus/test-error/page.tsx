"use client";

import { useEffect } from "react";

export default function ErrorTester() {
    useEffect(() => {
        throw new Error("This is a manually triggered test error!");
    }, []);

    return <div>Loading Crash Test...</div>;
}

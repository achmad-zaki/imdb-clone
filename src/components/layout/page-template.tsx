"use client";

import { motion } from "framer-motion";

export default function PageTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="flex-1 w-full min-w-0 max-w-full flex flex-col"
        >
            {children}
        </motion.div>
    );
}

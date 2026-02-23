import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ImageProps extends React.ComponentPropsWithoutRef<typeof motion.img> {
    containerClassName?: string
}

export const Image = ({
    src,
    alt,
    className,
    containerClassName,
    initial,
    animate,
    transition,
    onLoad,
    ...props
}: ImageProps) => {
    const [isLoaded, setIsLoaded] = React.useState(false)

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            <AnimatePresence mode="wait">
                {!isLoaded && (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse"
                    />
                )}
            </AnimatePresence>
            <motion.img
                src={src}
                alt={alt}
                initial={initial || { opacity: 0, scale: 1.05 }}
                animate={animate || {
                    opacity: isLoaded ? 1 : 0,
                    scale: isLoaded ? 1 : 1.05
                }}
                transition={transition || { duration: 0.4, ease: "easeOut" }}
                onLoad={(e) => {
                    setIsLoaded(true)
                    if (onLoad) {
                        // @ts-ignore
                        onLoad(e)
                    }
                }}
                className={cn("w-full h-full object-cover", className)}
                {...props}
            />
        </div>
    )
}

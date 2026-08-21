import { motion } from "framer-motion";
import "./BrandShowcase.css";

/**
 * Animated brand panel for auth screens (Login / Register right side).
 * Pure SVG + CSS/motion — no external video/gif assets needed.
 *
 * Usage:
 * <BrandShowcase eyebrow="NEW DROP" heading="Hello" subtext="...">
 *   <motion.button className="registerBtn" onClick={...}>Register</motion.button>
 *   <motion.button className="continueShoppingBtn" onClick={...}>Continue Shopping</motion.button>
 * </BrandShowcase>
 */
const BrandShowcase = ({ eyebrow, heading, subtext, children }) => {
    return (
        <div className="brandShowcase">

            <div className="brandGlowA" />
            <div className="brandGlowB" />

            <div className="brandParticles" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className={`spark spark-${i}`} />
                ))}
            </div>

            <motion.div
                className="brandGarment"
                animate={{ y: [0, -14, 0], rotate: [-2.5, 2.5, -2.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <svg viewBox="0 0 200 220" className="tshirtSvg" aria-hidden="true">

                    <defs>

                        <linearGradient id="tshirtFill" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f3f1ff" />
                            <stop offset="55%" stopColor="#cdc4ff" />
                            <stop offset="100%" stopColor="#948bf0" />
                        </linearGradient>

                        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.6" />
                            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>

                        <clipPath id="tshirtClip">
                            <path d="M60 20 L80 8 Q100 24 120 8 L140 20 L172 48 L150 78 L134 66 L134 202 Q100 213 66 202 L66 66 L50 78 L28 48 Z" />
                        </clipPath>

                        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
                            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.35" />
                        </filter>

                    </defs>

                    <path
                        d="M60 20 L80 8 Q100 24 120 8 L140 20 L172 48 L150 78 L134 66 L134 202 Q100 213 66 202 L66 66 L50 78 L28 48 Z"
                        fill="url(#tshirtFill)"
                        stroke="#0c0c0e"
                        strokeWidth="2.5"
                        filter="url(#softShadow)"
                    />

                    <text x="100" y="128" textAnchor="middle" className="tshirtLogoText">
                        ZX
                    </text>

                    <g clipPath="url(#tshirtClip)">
                        <motion.rect
                            x="-70"
                            y="0"
                            width="70"
                            height="220"
                            fill="url(#sheen)"
                            animate={{ x: [-70, 230] }}
                            transition={{
                                duration: 2.4,
                                repeat: Infinity,
                                repeatDelay: 1.6,
                                ease: "easeInOut",
                            }}
                        />
                    </g>

                </svg>
            </motion.div>

            <div className="brandMarquee" aria-hidden="true">
                <div className="brandMarqueeTrack">
                    {Array.from({ length: 2 }).map((_, loop) => (
                        <span className="brandMarqueeGroup" key={loop}>
                            <span>WE CREATE ATTITUDE</span>
                            <span className="brandMarqueeDot">•</span>
                            <span>ZENVYX</span>
                            <span className="brandMarqueeDot">•</span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="brandCopy">

                {eyebrow && <span className="brandEyebrow">{eyebrow}</span>}

                {heading && <h2 className="rightTitle">{heading}</h2>}

                {subtext && <p className="rightText">{subtext}</p>}

                <div className="brandActions">
                    {children}
                </div>

            </div>

        </div>
    );
};

export default BrandShowcase;
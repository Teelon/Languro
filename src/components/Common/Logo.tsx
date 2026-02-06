"use client";
import Link from "next/link";

interface LogoProps {
    className?: string;
    sticky?: boolean;
}

const Logo = ({ className = "", sticky = false }: LogoProps) => {
    return (
        <Link
            href="/"
            className={`navbar-logo block w-full ${className}`}
        >
            <div className={`flex items-center gap-1 ${sticky ? "py-2" : "py-5"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                    <span className="text-xl font-bold text-white leading-none mt-0.5">L</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    AN<span className="text-primary">GURO</span>
                </span>
            </div>
        </Link>
    );
};

export default Logo;

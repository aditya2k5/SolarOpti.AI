import React from "react";
import logo from "../../assets/SolarOpti-logo.png";
import { Link } from "react-router-dom";

const Footer = () => {

  return (

    <footer className="bg-transparent border-t border-[var(--border-emerald)] pt-16 pb-8 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left">

          {/* Brand */}
          <div className="md:col-span-2">

            <Link
              to="/Index"
              className="flex items-center gap-2 mb-4"
            >
              <img
                src={logo}
                alt="SolarOpti.AI Logo"
                className="h-8 w-auto"
              />

              <span className="text-2xl font-bold gradient-text">
                SolarOpti.AI
              </span>
            </Link>

            <p className="text-[var(--text-muted)] max-w-md leading-relaxed">
              Design, simulate, and optimize solar
              installations with AI precision,
              intelligent analytics, and
              professional proposal reports.
            </p>

          </div>

          {/* Product */}
          <div>

            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
              Product
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  to="/Index"
                  className="text-[var(--text-muted)] hover:text-[#10B981] transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <a
                  href="#features"
                  className="text-[var(--text-muted)] hover:text-[#10B981] transition-colors"
                >
                  Features
                </a>
              </li>

              <li>
                <Link
                  to="/GetStarted"
                  className="text-[var(--text-muted)] hover:text-[#10B981] transition-colors"
                >
                  Get Started
                </Link>
              </li>

            </ul>

          </div>

          {/* Company */}
          <div>

            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
              Company
            </h3>

            <ul className="space-y-3">

              <li>
                <a
                  href="#about"
                  className="text-[var(--text-muted)] hover:text-[#10B981] transition-colors"
                >
                  About
                </a>
              </li>

              <li>
                <a
                  href="#contact"
                  className="text-[var(--text-muted)] hover:text-[#10B981] transition-colors"
                >
                  Contact
                </a>
              </li>

            </ul>

          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--border-emerald)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)] opacity-70">

          <p>
            © {new Date().getFullYear()} SolarOpti.AI.
            All rights reserved.
          </p>

          <p>
            Built with AI • Powered by Solar Intelligence
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;
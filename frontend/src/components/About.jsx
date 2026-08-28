import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sun, Target, Users, Cpu, LineChart, FileText } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-transparent transition-colors duration-300">
            <main className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <header className="text-center max-w-3xl mx-auto mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
                            About{" "}
                            <span className="gradient-text">
                                SolarOpti.AI
                            </span>
                        </h1>
                        <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
                            SolarOpti.AI is a web-based solar energy optimization dashboard
                            built to help people design, simulate, and optimize solar
                            installations using AI-powered forecasting and location-specific
                            data—so solar decisions become easier, faster, and more accurate.
                        </p>
                    </header>

                    {/* Grid cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Use the .card class from your index.css to handle theme logic automatically */}
                        
                        {/* Problem statement */}
                        <section className="card p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 grid place-items-center">
                                    <LineChart className="h-5 w-5 text-[#10B981]" />
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                                    Problem Statement
                                </h2>
                            </div>

                            <p className="text-[var(--text-muted)] leading-relaxed">
                                Many solar calculators and quotes suffer from inaccurate
                                forecasting, missing optimization guidance, poor accessibility,
                                and unclear ROI—often leading to efficiency losses and delayed
                                adoption.
                            </p>

                            <ul className="mt-4 space-y-2 text-[var(--text-muted)]">
                                <li>• Generic estimates ignore local weather patterns.</li>
                                <li>• Users don’t get tilt/azimuth and component suggestions.</li>
                                <li>• ROI is not clear, so payback feels uncertain.</li>
                            </ul>
                        </section>

                        {/* Aims */}
                        <section className="card p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 grid place-items-center">
                                    <Target className="h-5 w-5 text-[#10B981]" />
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Our Aim</h2>
                            </div>

                            <p className="text-[var(--text-muted)] leading-relaxed">
                                Our aim is to democratize solar planning by providing accurate,
                                AI-driven optimization tools that are accessible to everyone—from
                                homeowners to professional installers.
                            </p>

                            <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
                                Instead of relying on generic calculators, SolarOpti.AI gives
                                location-specific yield predictions and optimized recommendations.
                            </p>
                        </section>

           
                        <section className="card p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 grid place-items-center">
                                    <Cpu className="h-5 w-5 text-[#10B981]" />
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                                    How It Works
                                </h2>
                            </div>

                            <p className="text-[var(--text-muted)] leading-relaxed">
                                You enter your location and system details, and the platform runs a simulation pipeline to compute yield, savings, and payback.
                            </p>

                            <ol className="mt-4 space-y-2 text-[var(--text-muted)] text-sm">
                                <li>1) Fetch location-based irradiance (GHI).</li>
                                <li>2) AI forecasting (SARIMAX) predicts patterns.</li>
                                <li>3) Physics-based energy yield conversion.</li>
                                <li>4) Tilt/orientation optimization.</li>
                                <li>5) ROI metrics and AI recommendations.</li>
                            </ol>
                        </section>

             
                        <section className="card p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 grid place-items-center">
                                    <Users className="h-5 w-5 text-[#10B981]" />
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                                    Target Audience
                                </h2>
                            </div>

                            <p className="text-[var(--text-muted)] leading-relaxed">
                                SolarOpti.AI is designed for Indian homeowners, engineers, installers, and NGOs working on rural electrification.
                            </p>

                            <ul className="mt-4 space-y-2 text-[var(--text-muted)]">
                                <li>• Homeowners needing savings clarity.</li>
                                <li>• Engineers wanting standardized reports.</li>
                                <li>• Students building practical tools.</li>
                            </ul>
                        </section>
                    </div>

                  
                    <section className="mt-10 rounded-2xl border border-[var(--border-emerald)] bg-gradient-to-r from-emerald-500/10 to-green-500/5 p-8ri ">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 grid place-items-center">
                                <Sun className="h-5 w-5 text-[#10B981]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Why Solar?</h2>
                        </div>

                        <p className="text-[var(--text-muted)] leading-relaxed">
                            Solar energy reduces dependence on grid electricity and lower
                            long-term costs, while supporting cleaner energy adoption.
                        </p>
                    </section>

                  
                    <section className="card mt-8 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 grid place-items-center">
                                <FileText className="h-5 w-5 text-[#10B981]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                                What You Get
                            </h2>
                        </div>

                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--text-muted)]">
                            <li>• Yield forecasting projections.</li>
                            <li>• ROI and payback analysis.</li>
                            <li>• Optimization suggestions.</li>
                            <li>• Exportable PDF reports.</li>
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default About;
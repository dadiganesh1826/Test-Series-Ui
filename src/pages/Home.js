import React, { useEffect } from 'react';
import Hero from '../components/LandingPage/Hero';
import Features from '../components/LandingPage/Features';
import Testimonials from '../components/LandingPage/Testimonials';
import Footer from '../components/LandingPage/Footer';
import './Home.css'; // We might not need this anymore if using LandingPage.css, but safely keep for container

const Home = () => {

    useEffect(() => {
        // SEO Meta Tags
        document.title = "TestSeries - Master Your Competitive Exams";

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Join TestSeries for the best online mock tests, real-time analytics, and guaranteed success in SSC, Banking, and UPSC exams.');
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = 'Join TestSeries for the best online mock tests, real-time analytics, and guaranteed success in SSC, Banking, and UPSC exams.';
            document.head.appendChild(meta);
        }
    }, []);

    return (
        <div className="landing-page-wrapper">
            <Hero />
            <Features />
            <Testimonials />
            <Footer />
        </div>
    );
};

export default Home;

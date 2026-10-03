import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-stone-200/90 dark:border-stone-800 bg-[#F4EFE6] dark:bg-[#0E0F12] text-stone-700 dark:text-stone-300 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center sm:items-start">
          <img
            src="/logo.png"
            alt="HADI BOOKS STORE Logo"
            className="w-24 h-24 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
          />
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-serif italic text-center sm:text-left leading-relaxed">
            Your trusted sanctuary for timeless literature, rare knowledge, and inspiring stories.
          </p>
        </div>

        {/* Company Section */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Navigation
          </h3>
          <ul className="space-y-2.5 text-center sm:text-left">
            {[
              { path: '/', text: 'Home' },
              { path: '/collections', text: 'Catalog' },
              { path: '/about', text: 'Our Story' },
              { path: '/delivery', text: 'Shipping & Delivery' },
              { path: '/privacy-policy', text: 'Privacy Policy' }
            ].map(({ path, text }, index) => (
              <li key={index}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `text-xs sm:text-sm transition-colors duration-150 ${
                      isActive
                        ? 'text-amber-800 dark:text-amber-400 font-semibold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`
                  }
                >
                  {text}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in Touch Section */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Inquiries
          </h3>
          <ul className="space-y-2.5 text-center sm:text-left w-full text-xs sm:text-sm">
            <li className="text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-900 dark:text-stone-200">Email:</span>{' '}
              <a
                href="mailto:hadibooksstore01@gmail.com"
                className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                hadibooksstore01@gmail.com
              </a>
            </li>
            <li className="text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-900 dark:text-stone-200">Phone:</span>{' '}
              <a
                href="tel:03090005634"
                className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                0309 0005634
              </a>
            </li>
            <li className="text-stone-600 dark:text-stone-400 flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <span className="font-semibold text-stone-900 dark:text-stone-200">Store:</span>
              <span>Sarwar Market Main Urdu Bazaar, Lahore</span>
              <a
                href="https://maps.app.goo.gl/c9aXiLstVma81ytg8"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="View store location on map"
              >
                <img
                  src={assets.location}
                  alt="Location"
                  className="w-4 h-4"
                />
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Connect
          </h3>
          <ul className="flex items-center gap-3">
            {[
              { href: 'https://facebook.com', icon: assets.fb_icon, label: 'Facebook' },
              { href: 'https://instagram.com', icon: assets.insta_icon, label: 'Instagram' },
              { href: 'https://wa.me/923090005634', icon: assets.whatsapp_icon, label: 'WhatsApp' },
              { href: 'https://x.com', icon: assets.x_icon, label: 'X' },
            ].map(({ href, icon, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                  aria-label={label}
                >
                  <img src={icon} alt={label} className="w-4 h-4 object-contain" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-stone-200/80 dark:border-stone-800/80 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          &copy; {new Date().getFullYear()} Hadi Books Store. Crafted for literature lovers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 ">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          
          {/* Left: Contact */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
            <div className="space-y-2">
              <a href="mailto:support@example.com" className="flex items-center gap-2 hover:text-white transition">
                <FaEnvelope /> support@flashumi.cloud
              </a>
               <Link to="/contact" className="flex items-center gap-2 hover:text-white transition">
                <FaEnvelope /> Contact Us
              </Link>
            </div>
          </div>

          {/* Middle: Links */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Information</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Socials */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Follow Us</h2>
            <div className="flex gap-4 text-xl">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom row */}
        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Super Ultras. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;

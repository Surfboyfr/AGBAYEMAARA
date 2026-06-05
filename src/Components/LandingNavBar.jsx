import React from 'react'
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0A0B0F] text-white font-bold lg:fixed w-full z-50">
      <div className="flex justify-between items-center px-6 py-4 ">
        {/* Logo */}
        <div className="text-xl font-semibold">
          <p>Agbayemaara</p>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-16 mr-9">
          <Link
            to="/"
            className="hover:text-gray-400 transition-colors duration-300"
          >
            Home
          </Link>

          <a
            href="#about"
            className="hover:text-gray-400 transition-colors duration-300"
          >
            About
          </a>

          <a
            href="#contact"
            className="hover:text-gray-400 transition-colors duration-300"
          >
            Contact
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-60 py-4" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="hover:text-gray-400"
          >
            Home
          </Link>

          <a
            href="#about"
            onClick={() => setIsOpen(false)}
            className="hover:text-gray-400"
          >
            About
          </a>

          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="hover:text-gray-400"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};


export default NavBar
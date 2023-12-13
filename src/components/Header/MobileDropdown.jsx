import { Squash as Hamburger } from "hamburger-react";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiFillFileText as Resume } from "react-icons/ai";

const useClickOutside = (ref, callback) => {
  const handleClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  });
};

export const MobileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menu = useRef();

  useClickOutside(menu, () => setIsOpen(false));

  const highlightButton = isOpen ? "bg-neutral-700 shadow-3xl" : "";

  return (
    <div ref={menu} className="lg:hidden">
      <Menu>
        <Menu.Button>
          <div
            className={
              "rounded-xl transition-colors duration-100 " + highlightButton
            }
          >
            <Hamburger
              toggled={isOpen}
              toggle={setIsOpen}
              color="white"
              size={25}
            />
          </div>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={
              "shadow-3xl absolute left-4 flex h-1/3 w-5/12 origin-top-left flex-col items-center justify-evenly rounded-xl bg-neutral-700 md:w-1/3"
            }
          >
            <Menu.Item>
              <a
                onClick={() => {
                  setIsOpen(false);
                }}
                className="header-link"
                href="#aboutme"
              >
                About Me
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                onClick={() => {
                  setIsOpen(false);
                }}
                className="header-link"
                href="#experiences"
              >
                Experiences
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                onClick={() => {
                  setIsOpen(false);
                }}
                className="header-link"
                href="#projects"
              >
                Projects
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                onClick={() => {
                  setIsOpen(false);
                }}
                className="header-link"
                target="_blank"
                href="./justinlui_resume.pdf"
              >
                <Resume className="text-md mr-2 lg:text-2xl" />
                Resume
              </a>
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
      <nav></nav>
    </div>
  );
};

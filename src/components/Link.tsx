import React from "react";

export const Link = (props: {
  href: string;
  children: JSX.Element;
}): JSX.Element => {
  return (
    <a
      target="_blank"
      href={props.href}
      rel="noopener noreferrer"
      className="mr-3 mt-3 flex items-center justify-around rounded-xl bg-orange-200 px-3 py-3 font-heading font-medium text-gray-900 transition-colors ease-linear last:mr-0 hover:bg-orange-300"
    >
      {props.children}
    </a>
  );
};

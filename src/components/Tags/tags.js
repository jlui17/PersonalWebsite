import {
  DiReact as React,
  DiPython as Python,
  DiJava as Java,
  DiRor as RubyOnRails,
} from "react-icons/di";

import {
  SiTypescript as TypeScript,
  SiAmazonaws as AWS,
  SiTerraform as Terraform,
  SiGooglesheets as GoogleSheets,
  SiGoogledrive as GoogleDrive,
  SiMicrosoftexcel as Excel,
  SiR as R,
} from "react-icons/si";

export const Tags = {
  Java: (
    <>
      <Java className="text-md mr-1 text-white lg:text-xl" />
      <p>Java</p>
    </>
  ),
  React: (
    <>
      <React className="text-md mr-1 text-white lg:text-2xl" />
      <p>React</p>
    </>
  ),
  Aws: (
    <>
      <AWS className="text-md mr-2 text-white lg:text-2xl" />
      <p>AWS</p>
    </>
  ),
  TypeScript: (
    <>
      <TypeScript className="text-md mr-2 rounded-sm text-white lg:text-lg" />
      <p>TypeScript</p>
    </>
  ),
  RubyOnRails: (
    <>
      <RubyOnRails className="text-md mr-1 text-white lg:text-2xl" />
      <p>Ruby on Rails</p>
    </>
  ),
  GoogleSheets: (
    <>
      <GoogleSheets className="text-md mr-1 text-white lg:text-2xl" />
      <p>Google Sheets</p>
    </>
  ),
  GoogleDrive: (
    <>
      <GoogleDrive className="text-md mr-1 text-white lg:text-2xl" />
      <p>Google Drive</p>
    </>
  ),
  Excel: (
    <>
      <Excel className="text-md mr-2 text-white lg:text-2xl" />
      <p>Excel</p>
    </>
  ),
  R: (
    <>
      <R className="text-md text-white lg:text-2xl" />
    </>
  ),
  AwsCdk: (
    <>
      <AWS className="text-md mr-2 text-white lg:text-2xl" />
      <p>AWS CDK</p>
    </>
  ),
  Python: (
    <>
      <Python className="text-md mr-1 text-white lg:text-2xl" />
      <p>Python</p>
    </>
  ),
  Agile: (
    <>
      <p>Agile & Scrum</p>
    </>
  ),
  Terraform: (
    <>
      <Terraform className="text-md mr-2 text-white lg:text-lg" />
      <p>Terraform</p>
    </>
  ),
};

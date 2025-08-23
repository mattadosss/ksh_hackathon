import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Scholary",
  description: "Scholary for your Plannings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="bg-gray-100 text-black"
      >
        {children}
        <footer>
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <hr className="my-6 sm:mx-auto border-gray-700 lg:my-8" />

                <div className="flex flex-col md:flex-row md:justify-between md:items-start">                    
                    <div className="mb-6 md:mb-0">
                        <a className="flex items-center">
                            <span className="self-center text-2xl font-bold whitespace-nowrap">
                                Scholary
                            </span>
                        </a>
                    </div>

                    <div className="mb-6 md:mb-0 md:ml-auto">
                        <h2 className="mb-6 text-2xl font-bold ">Team</h2>
                        <ul className=" font-medium">
                            <li className="mb-4">
                                <a
                                    href="https://github.com/Hari-42"
                                    className="hover:text-blue-500 transition-colors duration-300"
                                >
                                    Github - Hari-42
                                </a>
                            </li>
                            <li className="mb-4">
                                <a
                                    href="https://github.com/mattadosss"
                                    className="hover:text-blue-500 transition-colors duration-300"
                                >
                                    Github - matadosss
                                </a>
                            </li>
                            <li className="mb-4">
                                <a
                                    href="https://github.com/koskogo"
                                    className="hover:text-blue-500 transition-colors duration-300"
                                >
                                    Github - koskogo
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-6 sm:mx-auto border-gray-700 lg:my-8" />

                <div className="flex items-center justify-center flex-wrap">
                    <span className="text-sm text-gray-500 text-center">
                        © 2025 All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>

      </body>
    </html>
  );
}

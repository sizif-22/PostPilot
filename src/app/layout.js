import "./globals.css";
import RootLayout2 from "./layout2";

export const metadata = {
  title: "Post Pilot",
  description: "post pilot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <RootLayout2 child={children}/>
      </body>
    </html>
  );
}

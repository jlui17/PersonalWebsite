import {useEffect, useState} from "react";

function Header() {
    const [showHeader, setShowHeader] = useState(true);

    useEffect(() => {
        const onScroll = (event) => {
            if (event.wheelDelta > 0) {
                setShowHeader(true);
            }
            else {
                setShowHeader(false);
            }
        };
        window.addEventListener('mousewheel', onScroll);
        return () => window.removeEventListener('mousewheel', onScroll);
    })

    return (
        <header id="top" className={showHeader ? "header" : "header-hide"}>
            <div className="header-align">
                <div className="header-content">
                    <a href="#top"><img src="../images/truffle.png" alt="trufflebday"></img></a>
                    <nav className="header-content-nav">
                        <a className="header-content-nav-link" href="#aboutme">About Me</a>
                        <a className="header-content-nav-link" href="#experiences">Experiences</a>
                        <a className="header-content-nav-link" href="#projects">Projects</a>
                        <a className="header-content-nav-link" href="#blogs">Blogs</a>
                        <a className="header-content-nav-link" href="#contact">Contact</a>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
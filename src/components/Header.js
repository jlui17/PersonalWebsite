function Header(props) {
    return (
        <header id="top" className="header">
            <div className="header-align">
                <div className="header-content">
                    <a href="#top"><img src="../images/truffle.png" alt="trufflebday"></img></a>
                    <nav className="header-content-nav">
                        <a className="header-content-nav-link" href="#aboutme">About Me</a>
                        <a className="header-content-nav-link" href="#experiences">Experiences</a>
                        <a className="header-content-nav-link" href="#">Projects</a>
                        <a className="header-content-nav-link" href="#">Blogs</a>
                        <a className="header-content-nav-link" href="#">Contact</a>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
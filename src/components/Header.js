function Header(props) {
    return (
        <header className="header">
            <div className="header-content">
                <a href="#">Truffle</a>
                <nav className="header-content-nav">
                    <a className="header-content-nav-link" href="#">About Me</a>
                    <a className="header-content-nav-link" href="#">Experiences</a>
                    <a className="header-content-nav-link" href="#">Projects</a>
                    <a className="header-content-nav-link" href="#">Blogs</a>
                    <a className="header-content-nav-link" href="#">Contact</a>
                </nav>
            </div>
        </header>
    );
}

export default Header;
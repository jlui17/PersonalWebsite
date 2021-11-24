import {useState} from 'react';

function Header() {
    const [mobileHide, setMobileHide] = useState(true);

    return (
        window.innerWidth < 825 ?
        (
            <header id="top" className={mobileHide ? 'header' : "header-mobile"}>
                <div className={mobileHide ? 'header-align' : "header-align-mobile"}>
                    <div className={mobileHide ? 'header-content' : "header-content-mobile"}>
                        <a href="#top" style={mobileHide ? null : {display:'none'}}><img src="../images/truffle.png" alt="trufflebday"></img></a>
                        <button className={mobileHide ? "header-button" : "header-button-hide"} onClick={() => {setMobileHide(!mobileHide)}}>
                            <div className={mobileHide ? '' : 'header-button-x-1'}></div>
                            <div className={mobileHide ? '' : 'header-button-x-2'}></div>
                            <div style={mobileHide ? {marginBottom:"0px"} : {display:'none'}}></div>
                        </button>
                    </div>
                    <nav className={mobileHide ? "header-content-nav" : "header-content-nav-show"}>
                        <button className={mobileHide ? "header-button-hide" : "header-button-x"} onClick={() => {setMobileHide(!mobileHide)}}>
                            <div className={mobileHide ? '' : 'header-button-x-1'}></div>
                            <div className={mobileHide ? '' : 'header-button-x-2'}></div>
                            <div style={mobileHide ? {marginBottom:"0px"} : {display:'none'}}></div>
                        </button>
                        <a onClick={() => {setMobileHide(!mobileHide)}} className="header-content-nav-link" href="#aboutme">About Me</a>
                        <a onClick={() => {setMobileHide(!mobileHide)}} className="header-content-nav-link" href="#experiences">Experiences</a>
                        <a onClick={() => {setMobileHide(!mobileHide)}} className="header-content-nav-link" href="#projects">Projects</a>
                        <a onClick={() => {setMobileHide(!mobileHide)}} className="header-content-nav-link" href="#blogs">Blogs</a>
                        <a onClick={() => {setMobileHide(!mobileHide)}} className="header-content-nav-link" href="#contact">Contact</a>
                    </nav>
                </div>
            </header>
        ) :
        (
            <header id="top" className="header">
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
        )
    );
}

export default Header;